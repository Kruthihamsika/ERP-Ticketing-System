"""add resolution fields to tickets

Revision ID: 20260619_0003
Revises: 20260616_0002
Create Date: 2026-06-19
"""

from alembic import op
import sqlalchemy as sa


revision = "20260619_0003"
down_revision = "20260616_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tickets",
        sa.Column(
            "resolution_notes",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "tickets",
        sa.Column(
            "resolved_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("tickets", "resolved_at")
    op.drop_column("tickets", "resolution_notes")