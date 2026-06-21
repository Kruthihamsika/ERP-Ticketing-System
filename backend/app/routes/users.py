from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.database.connection import get_db
from app.models.enums import Role
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/agents",
    response_model=list[UserResponse],
)
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    agents = db.scalars(
        select(User).where(
            User.role == Role.AGENT
        )
    ).all()

    return list(agents)