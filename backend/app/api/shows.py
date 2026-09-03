from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_db, get_editor_user
from app.models import Show, Category
from app.schemas.show import ShowCreate, ShowUpdate, ShowOut


router = APIRouter(
    prefix="/api/v1/shows",
    tags=["Shows"],
    dependencies=[Depends(get_editor_user)],
)


@router.post("", response_model=ShowOut, status_code=status.HTTP_201_CREATED)
def create_show(data: ShowCreate, db: Session = Depends(get_db)):
    show = Show(
        title=data.title,
        slug=data.slug,
        section=data.section,
        synopsis=data.synopsis,
        status=data.status,
    )
    if data.category_ids:
        categories = db.scalars(select(Category).where(Category.id.in_(data.category_ids))).all()
        show.categories = list(categories)
        
    db.add(show)
    try:
        db.commit()
        db.refresh(show)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating show (possibly duplicate slug).")
    return show


@router.get("", response_model=List[ShowOut])
def list_shows(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    result = db.scalars(
        select(Show)
        .options(selectinload(Show.categories))
        .order_by(Show.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return result


@router.get("/{show_id}", response_model=ShowOut)
def get_show(show_id: UUID, db: Session = Depends(get_db)):
    show = db.scalar(
        select(Show)
        .options(selectinload(Show.categories))
        .where(Show.id == show_id)
    )
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show


@router.put("/{show_id}", response_model=ShowOut)
def update_show(show_id: UUID, data: ShowUpdate, db: Session = Depends(get_db)):
    show = db.scalar(select(Show).options(selectinload(Show.categories)).where(Show.id == show_id))
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
        
    update_data = data.model_dump(exclude_unset=True)
    category_ids = update_data.pop("category_ids", None)
    
    for key, value in update_data.items():
        setattr(show, key, value)
        
    if category_ids is not None:
        categories = db.scalars(select(Category).where(Category.id.in_(category_ids))).all()
        show.categories = list(categories)
        
    try:
        db.commit()
        db.refresh(show)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error updating show.")
    return show


@router.delete("/{show_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_show(show_id: UUID, db: Session = Depends(get_db)):
    show = db.scalar(select(Show).where(Show.id == show_id))
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
        
    db.delete(show)
    db.commit()
    return None
