"""add department to users

Revision ID: 67dcddca8b65
Revises: 20260619_0003
Create Date: 2026-06-21 16:51:45.237039
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa



revision: str = '67dcddca8b65'
down_revision: str | None = '20260619_0003'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "department",
            sa.Enum(
                "IT",
                "HR",
                "FINANCE",
                "ADMINISTRATION",
                name="department_enum",
            ),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "department")