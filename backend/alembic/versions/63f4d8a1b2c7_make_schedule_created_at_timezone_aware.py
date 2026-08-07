"""make schedule created_at timezone aware

Revision ID: 63f4d8a1b2c7
Revises: c41f7b9a2d10
Create Date: 2026-08-07 09:15:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "63f4d8a1b2c7"
down_revision: Union[str, Sequence[str], None] = "c41f7b9a2d10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Existing values were produced by PostgreSQL/Supabase in UTC but stored in
    # a timestamp-without-time-zone column. Attach UTC before changing the type.
    op.alter_column(
        "schedules",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    op.alter_column(
        "schedules",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=True,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
