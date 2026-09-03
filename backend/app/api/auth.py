from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth import authenticate_user, register_user


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=dict,
    status_code=201,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    user = register_user(db, data)

    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
    }


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    access_token = authenticate_user(db, data)

    return TokenResponse(
        access_token=access_token,
    )


@router.get(
    "/me",
    response_model=dict,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }
    