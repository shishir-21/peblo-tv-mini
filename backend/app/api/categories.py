from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_editor_user
from app.models import Category
from app.schemas.category import CategoryOut


router = APIRouter(
    prefix="/api/v1/categories",
    tags=["Categories"],
    dependencies=[Depends(get_editor_user)],
)


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    result = db.scalars(select(Category).order_by(Category.name.asc())).all()
    return result
