from sqlalchemy import Column, Integer, String, ForeignKey, Time, Text, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from app.core.database import Base

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
    created_at = Column(DateTime, default=func.now(), server_default=func.now(), nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="schedules")
