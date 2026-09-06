from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse

from app.core.dependencies import get_db
from app.models import PublishRun
from app.storage import storage as media_storage


router = APIRouter(
    prefix="/api/v1/catalogue",
    tags=["Catalogue"],
)


@router.get("")
def get_catalogue(db: Session = Depends(get_db)):
    latest_run = db.scalar(
        select(PublishRun)
        .where(PublishRun.status == "completed")
        .order_by(PublishRun.completed_at.desc())
        .limit(1)
    )

    if not latest_run:
        raise HTTPException(
            status_code=404,
            detail="Catalogue has not been published yet.",
        )

    storage_key = f"catalogues/catalogue-{latest_run.id}.json"

    catalogue_url = media_storage.get_url(
        storage_key,
        resource_type="raw",
    )

    return RedirectResponse(
        url=catalogue_url,
        status_code=307,
        headers={"Cache-Control": "no-store"},
    )
    