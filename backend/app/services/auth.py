from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models import User
from app.schemas.auth import LoginRequest, RegisterRequest


def register_user(
    db: Session,
    data: RegisterRequest,
) -> User:
    """
    Create a new editor account.
    """

    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="editor",
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    data: LoginRequest,
) -> str:
    """
    Verify login credentials and return a JWT access token.
    """

    user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_access_token(
        user_id=str(user.id),
        role=user.role,
    )
    