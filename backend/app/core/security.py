from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash


# -------------------------------------------------
# Password hashing
# -------------------------------------------------

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using Argon2.
    """
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its hash.
    """
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


# -------------------------------------------------
# JWT configuration
# -------------------------------------------------

from app.core.config import settings

SECRET_KEY = settings.secret_key

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(
    user_id: str,
    role: str,
) -> str:
    """
    Create a JWT access token for an authenticated user.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.
    """

    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )
    