from sqlalchemy import Column, DateTime, Integer, String, func

from app.core.database import Base


DEFAULT_COUNCIL_MEMBERS = [
    "Lê Thị Tú Anh",
    "Ngụy Mộng Cầm",
    "Nguyễn Tùng Châu",
    "Nguyễn Thị Lệ Hoa",
    "Lê Minh Hoàng",
    "Nguyễn Thị Kim Hường",
    "Trần Thị Minh Hường",
    "Trần Thị Đức Nghiêm",
    "Võ Thị Bích Ngọc",
    "Võ Thị Mỹ Ngọc",
    "Lê Thị Kiều Oanh",
    "Nguyễn Thị Lan Phương",
    "Nguyễn Tấn Tài",
    "Châu Thanh Tân",
    "Nguyễn Thị Thanh Thảo",
    "Đặng Ngọc Thu",
    "Huỳnh Thị Thu Vân",
    "Quách Tử Điệc",
    "Trần Thanh Khen",
    "Huỳnh Anh Dũng",
    "Hồ Minh Hùng",
    "Quách Thái Vạn Thuận",
    "Huỳnh Kim Phượng",
    "Trần Văn Thanh",
    "Võ Hữu Phước",
    "Nguyễn Thanh Phúc",
    "Phạm Công Toàn",
    "Trần Trung Nghĩa",
    "Trần Thị Tuyết Nga",
    "Nguyễn Thị Út",
    "Trương Hữu Phước",
    "Trần Thanh Hùng",
    "Lê Thị Hồng Vân",
    "Phạm Hữu Hiệp",
    "Trần Mỹ Huyền",
    "Nguyễn Thị Ngọc Tuyết",
    "Nguyễn Quế Hào",
    "Nguyễn Thị Hồng Phương",
    "Lê Minh Mẫn",
    "Nguyễn Trọng Trí",
    "Mai Văn Trí",
    "Nguyễn Minh Trí",
    "Nguyễn Thành Tài",
    "Nguyễn Thị Diệu Phước",
    "Lê Anh Vũ",
    "Huỳnh Hữu Phi",
]


class CouncilMember(Base):
    __tablename__ = "council_members"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False, unique=True, index=True)
    created_at = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        server_default=func.now(),
    )
