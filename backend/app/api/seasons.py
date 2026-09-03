from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_editor_user
from app.models import Season, Show
from app.schemas.season import SeasonCreate, SeasonUpdate, SeasonOut


router = APIRouter(
    prefix="/api/v1/seasons",
    tags=["Seasons"],
    dependencies=[Depends(get_editor_user)],
)


@router.post("", response_model=SeasonOut, status_code=status.HTTP_201_CREATED)
def create_season(data: SeasonCreate, db: Session = Depends(get_db)):
    show = db.scalar(select(Show).where(Show.id == data.show_id))
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
        
    season = Season(
        show_id=data.show_id,
        season_number=data.season_number
    )
    db.add(season)
    try:
        db.commit()
        db.refresh(season)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating season. Season number may already exist for this show.")
    return season


@router.get("", response_model=List[SeasonOut])
def list_seasons(show_id: UUID = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = select(Season).order_by(Season.season_number.asc())
    if show_id:
        query = query.where(Season.show_id == show_id)
    
    result = db.scalars(query.offset(skip).limit(limit)).all()
    return result


@router.get("/{season_id}", response_model=SeasonOut)
def get_season(season_id: UUID, db: Session = Depends(get_db)):
    season = db.scalar(select(Season).where(Season.id == season_id))
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season


@router.put("/{season_id}", response_model=SeasonOut)
def update_season(season_id: UUID, data: SeasonUpdate, db: Session = Depends(get_db)):
    season = db.scalar(select(Season).where(Season.id == season_id))
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(season, key, value)
        
    try:
        db.commit()
        db.refresh(season)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error updating season.")
    return season


@router.delete("/{season_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_season(season_id: UUID, db: Session = Depends(get_db)):
    season = db.scalar(select(Season).where(Season.id == season_id))
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
        
    db.delete(season)
    db.commit()
    return None
