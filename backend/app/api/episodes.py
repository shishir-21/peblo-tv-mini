from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_editor_user
from app.models import Episode, Season
from app.schemas.episode import EpisodeCreate, EpisodeUpdate, EpisodeOut


router = APIRouter(
    prefix="/api/v1/episodes",
    tags=["Episodes"],
    dependencies=[Depends(get_editor_user)],
)


@router.post("", response_model=EpisodeOut, status_code=status.HTTP_201_CREATED)
def create_episode(data: EpisodeCreate, db: Session = Depends(get_db)):
    season = db.scalar(select(Season).where(Season.id == data.season_id))
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
        
    if data.status == "published":
        raise HTTPException(
            status_code=400, 
            detail="Cannot publish a new episode directly because required artwork must be uploaded first."
        )
        
    episode = Episode(
        episode_id=data.episode_id,
        season_id=data.season_id,
        episode_number=data.episode_number,
        title=data.title,
        synopsis=data.synopsis,
        duration_seconds=data.duration_seconds,
        language=data.language,
        content_group=data.content_group,
        status=data.status,
    )
    db.add(episode)
    try:
        db.commit()
        db.refresh(episode)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating episode (possibly duplicate episode_id or content_group/language).")
    return episode


@router.get("", response_model=List[EpisodeOut])
def list_episodes(season_id: UUID = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = select(Episode).order_by(Episode.episode_number.asc())
    if season_id:
        query = query.where(Episode.season_id == season_id)
        
    result = db.scalars(query.offset(skip).limit(limit)).all()
    return result


@router.get("/{episode_id}", response_model=EpisodeOut)
def get_episode(episode_id: UUID, db: Session = Depends(get_db)):
    episode = db.scalar(select(Episode).where(Episode.id == episode_id))
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episode


@router.put("/{episode_id}", response_model=EpisodeOut)
def update_episode(episode_id: UUID, data: EpisodeUpdate, db: Session = Depends(get_db)):
    episode = db.scalar(select(Episode).where(Episode.id == episode_id))
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(episode, key, value)
        
    if episode.status == "published":
        if not episode.duration_seconds or episode.duration_seconds <= 0:
            raise HTTPException(status_code=400, detail="Duration is required for published episodes.")
            
        from app.models import Artwork
        artworks = db.scalars(select(Artwork).where(Artwork.episode_id == episode.id)).all()
        types = {aw.artwork_type for aw in artworks}
        required = {"poster", "banner", "thumbnail"}
        missing = required - types
        if missing:
            raise HTTPException(status_code=400, detail=f"Cannot publish. Missing artwork: {', '.join(missing)}")

    try:
        db.commit()
        db.refresh(episode)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error updating episode.")
    return episode


@router.delete("/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode(episode_id: UUID, db: Session = Depends(get_db)):
    episode = db.scalar(select(Episode).where(Episode.id == episode_id))
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
        
    db.delete(episode)
    db.commit()
    return None
