from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.dependencies import get_db, get_editor_user
from app.services.validation import validate_content


router = APIRouter(
    prefix="/api/v1/validation",
    tags=["Validation"],
    dependencies=[Depends(get_editor_user)],
)


@router.get("", response_model=Dict[str, Any])
def get_validation_report(db: Session = Depends(get_db)):
    """
    Returns the current validation report for all published content.
    Used by the CMS Validation Dashboard.
    """
    return validate_content(db)
