import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.permissions import require_editor
from app.models import Artwork, Episode
from app.services.artwork import validate_artwork
from app.storage import LocalStorage


router = APIRouter(
    prefix="/api/v1/episodes",
    tags=["Artwork"],
)


BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"

storage = LocalStorage(STORAGE_DIR)


@router.post("/{episode_id}/artwork")
async def upload_artwork(
    episode_id: uuid.UUID,
    artwork_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_editor),
):
    episode = db.scalar(
        select(Episode).where(Episode.id == episode_id)
    )

    if episode is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episode not found",
        )

    file_bytes = await file.read()

    try:
        validate_artwork(
            artwork_type=artwork_type,
            file_bytes=file_bytes,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    existing_artwork = db.scalar(
        select(Artwork).where(
            Artwork.episode_id == episode.id,
            Artwork.artwork_type == artwork_type,
        )
    )

    if existing_artwork is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"{artwork_type} artwork already exists "
                "for this episode"
            ),
        )

    extension = Path(file.filename or "").suffix.lower()

    if not extension:
        extension = ".jpg"

    storage_key = (
        f"artwork/{episode.episode_id}/"
        f"{artwork_type}{extension}"
    )

    temporary_file = STORAGE_DIR / "_tmp" / f"{uuid.uuid4()}{extension}"
    temporary_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    temporary_file.write_bytes(file_bytes)

    try:
        storage.save(
            file_path=temporary_file,
            storage_key=storage_key,
        )
    finally:
        temporary_file.unlink(missing_ok=True)

    from PIL import Image
    from io import BytesIO

    image = Image.open(BytesIO(file_bytes))
    width, height = image.size

    artwork = Artwork(
        episode_id=episode.id,
        artwork_type=artwork_type,
        storage_key=storage_key,
        width=width,
        height=height,
        size_bytes=len(file_bytes),
    )

    db.add(artwork)
    db.commit()
    db.refresh(artwork)

    return {
        "id": str(artwork.id),
        "episode_id": str(episode.id),
        "artwork_type": artwork.artwork_type,
        "storage_key": artwork.storage_key,
        "width": artwork.width,
        "height": artwork.height,
        "size_bytes": artwork.size_bytes,
    }
    