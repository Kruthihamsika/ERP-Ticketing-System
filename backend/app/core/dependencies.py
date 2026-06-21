import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.connection import get_db
from app.models.enums import Role
from app.models.user import User


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the authenticated user from a valid bearer token."""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")

        if not isinstance(user_id, str):
            raise credentials_exception

        parsed_user_id = uuid.UUID(user_id)

    except (JWTError, ValueError) as exc:
        raise credentials_exception from exc

    user = db.scalar(select(User).where(User.id == parsed_user_id))

    if user is None:
        raise credentials_exception

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require an authenticated administrator."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


def require_agent(current_user: User = Depends(get_current_user)) -> User:
    """Require an authenticated administrator or agent."""
    if current_user.role not in {Role.ADMIN, Role.AGENT}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent access required",
        )
    return current_user


def require_employee(current_user: User = Depends(get_current_user)) -> User:
    """Require an authenticated administrator or employee."""
    if current_user.role not in {Role.ADMIN, Role.EMPLOYEE}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required",
        )
    return current_user
