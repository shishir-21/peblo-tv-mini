from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.permissions import require_admin
from app.models import User
from app.services.publish import execute_publish

router = APIRouter(
    prefix="/api/v1/publish",
    tags=["Publishing"],
)


@router.post("")
def publish_catalogue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
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
    