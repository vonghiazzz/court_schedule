"""add council members

Revision ID: c41f7b9a2d10
Revises: e6478c924e32
Create Date: 2026-08-06 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import context, op
import sqlalchemy as sa


revision: str = "c41f7b9a2d10"
down_revision: Union[str, Sequence[str], None] = "e6478c924e32"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


DEFAULT_MEMBERS = [
    "Lê Thị Tú Anh", "Ngụy Mộng Cầm", "Nguyễn Tùng Châu",
    "Nguyễn Thị Lệ Hoa", "Lê Minh Hoàng", "Nguyễn Thị Kim Hường",
    "Trần Thị Minh Hường", "Trần Thị Đức Nghiêm", "Võ Thị Bích Ngọc",
    "Võ Thị Mỹ Ngọc", "Lê Thị Kiều Oanh", "Nguyễn Thị Lan Phương",
    "Nguyễn Tấn Tài", "Châu Thanh Tân", "Nguyễn Thị Thanh Thảo",
    "Đặng Ngọc Thu", "Huỳnh Thị Thu Vân", "Quách Tử Điệc",
    "Trần Thanh Khen", "Huỳnh Anh Dũng", "Hồ Minh Hùng",
    "Quách Thái Vạn Thuận", "Huỳnh Kim Phượng", "Trần Văn Thanh",
    "Võ Hữu Phước", "Nguyễn Thanh Phúc", "Phạm Công Toàn",
    "Trần Trung Nghĩa", "Trần Thị Tuyết Nga", "Nguyễn Thị Út",
    "Trương Hữu Phước", "Trần Thanh Hùng", "Lê Thị Hồng Vân",
    "Phạm Hữu Hiệp", "Trần Mỹ Huyền", "Nguyễn Thị Ngọc Tuyết",
    "Nguyễn Quế Hào", "Nguyễn Thị Hồng Phương", "Lê Minh Mẫn",
    "Nguyễn Trọng Trí", "Mai Văn Trí", "Nguyễn Minh Trí",
    "Nguyễn Thành Tài", "Nguyễn Thị Diệu Phước", "Lê Anh Vũ",
    "Huỳnh Hữu Phi",
]


def upgrade() -> None:
    if context.is_offline_mode():
        council_members = op.create_table(
            "council_members",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("full_name", sa.String(length=150), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_council_members_id"), "council_members", ["id"], unique=False)
        op.create_index(op.f("ix_council_members_full_name"), "council_members", ["full_name"], unique=True)
        op.bulk_insert(council_members, [{"full_name": name} for name in DEFAULT_MEMBERS])
        return

    connection = op.get_bind()
    inspector = sa.inspect(connection)

    if not inspector.has_table("council_members"):
        council_members = op.create_table(
            "council_members",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("full_name", sa.String(length=150), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_council_members_id"), "council_members", ["id"], unique=False)
        op.create_index(op.f("ix_council_members_full_name"), "council_members", ["full_name"], unique=True)
    else:
        council_members = sa.Table(
            "council_members",
            sa.MetaData(),
            autoload_with=connection,
        )

    existing_count = connection.execute(
        sa.select(sa.func.count()).select_from(council_members)
    ).scalar_one()
    if existing_count == 0:
        op.bulk_insert(council_members, [{"full_name": name} for name in DEFAULT_MEMBERS])


def downgrade() -> None:
    op.drop_index(op.f("ix_council_members_full_name"), table_name="council_members")
    op.drop_index(op.f("ix_council_members_id"), table_name="council_members")
    op.drop_table("council_members")
