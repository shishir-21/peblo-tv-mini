from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_admin_user
from app.models import User, PublishRun
from app.services.publish import execute_publish
from sqlalchemy import select
from typing import List
from app.schemas.publish_run import PublishRunOut

router = APIRouter(
    prefix="/api/v1/publish",
    tags=["Publishing"],
)


@router.post("")
def publish_catalogue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    publish_run = execute_publish(
        db=db,
        triggered_by=str(current_user.id),
    )

    return {
        "id": str(publish_run.id),
        "status": publish_run.status,
        "shows_count": publish_run.shows_count,
        "episodes_count": publish_run.episodes_count,
        "catalogue_hash": publish_run.catalogue_hash,
        "completed_at": publish_run.completed_at,
    }


@router.get("/runs", response_model=List[PublishRunOut])
def list_publish_runs(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    runs = db.scalars(select(PublishRun).order_by(PublishRun.started_at.desc()).offset(skip).limit(limit)).all()
    return runs


@router.get("/runs/{run_id}", response_model=PublishRunOut)
def get_publish_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    from fastapi import HTTPException
    run = db.scalar(select(PublishRun).where(PublishRun.id == run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Publish run not found")
    return run
    