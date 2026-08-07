from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from app.core.database import Base


VIETNAM_TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def vietnam_now() -> datetime:
    """Return an aware timestamp for the Vietnam timezone."""

    return datetime.now(VIETNAM_TIMEZONE)


class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, index=True)
    room = Column(String, nullable=False)  
    shift = Column(String, nullable=False) 
    dispute_relationship = Column(String, nullable=False) 
    litigant = Column(String, nullable=False) 
    jurors = Column(ARRAY(String), nullable=False) 
    start_time = Column(Time, nullable=False) 
    end_time = Column(Time, nullable=False)   
    note = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=vietnam_now,
        server_default=func.now(),
        nullable=True,
    )

    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="schedules")
