import sys

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import User


def create_admin(email: str, password: str) -> None:
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user is not None:
            existing_user.role = "admin"
            existing_user.is_active = True
            existing_user.password_hash = hash_password(password)

            db.commit()

            print(f"Admin user updated: {email}")
            return

        admin = User(
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print(f"Admin user created: {email}")

    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(
            "Usage: python -m app.scripts.create_admin "
            "<email> <password>"
        )
        raise SystemExit(1)

    create_admin(
        email=sys.argv[1],
        password=sys.argv[2],
    )
    