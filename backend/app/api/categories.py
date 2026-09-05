from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_editor_user
from app.models import Category
from app.schemas.category import CategoryOut, CategoryCreate
import uuid


router = APIRouter(
    prefix="/api/v1/categories",
    tags=["Categories"],
    dependencies=[Depends(get_editor_user)],
)


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    result = db.scalars(select(Category).order_by(Category.name.asc())).all()
    return result

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    db_obj = Category(id=uuid.uuid4(), name=category_in.name)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
