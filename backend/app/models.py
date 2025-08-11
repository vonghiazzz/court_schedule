# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint,Time, Text
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.postgresql import ARRAY


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
    date = Column(String,nullable=False)
    room = Column(String, nullable=False)  
    shift = Column(String, nullable=False) 
    jurors = Column(ARRAY(String), nullable=False) 
    start_time = Column(Time, nullable=False) 
    end_time = Column(Time, nullable=False)   
    note = Column(Text, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="schedules")

