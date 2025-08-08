# app/schemas.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import date, time

class SessionEnum(str, Enum):
    morning = "Sáng"
    afternoon = "Chiều"

class RoomEnum(str, Enum):
    A = "Hội trường 1"
    B = "Hội trường 2"
    C = "Hội trường 3"
    D = "Hội trường 4"
    E = "Hội trường 5"
    F = "Hội trường 6"
    G = "Hội trường 7"
    H = "Hội trường 8"
    I = "Hội trường 9"
    K = "Hội trường 10"
class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    model_config = {
        "from_attributes": True
    }

class ScheduleCreate(BaseModel):
    date: str                     # YYYY-MM-DD
    room: RoomEnum                # 1-5
    shift: SessionEnum          # sáng hoặc chiều
    description: Optional[str] = None  # Mô tả tùy chọn
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    note: Optional[str] = None

class ScheduleOut(BaseModel):
    id: int
    date: str
    room: str
    shift: SessionEnum
    description: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    note: Optional[str] = None
    user: UserOut                 # người đã tạo lịch


    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
