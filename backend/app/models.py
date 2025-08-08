# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint,Time, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class Period(str, enum.Enum):
    morning = "morning"
    afternoon = "afternoon"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_admin = Column(Integer, default=0)
    schedules = relationship("Schedule", back_populates="user")

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    room = Column(String)  # Đổi từ room => room
    shift = Column(String)  # Đổi từ session => shift
    description = Column(String)
    start_time = Column(Time)  # ⏰ Bắt đầu
    end_time = Column(Time)    # ⏰ Kết thúc
    note = Column(Text, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="schedules")

