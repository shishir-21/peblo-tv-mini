from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models import User


def require_roles(*allowed_roles: str) -> Callable:
    """
    Require the authenticated user to have one of the allowed roles.
    """

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

        return current_user

    return role_checker


require_editor = require_roles("editor", "admin")

require_admin = require_roles("admin")
