from datetime import datetime, time, timezone
from enum import Enum
from typing import List, Optional
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.users.schemas import UserOut


VIETNAM_TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


class SessionEnum(str, Enum):
    morning = "Sáng"
    afternoon = "Chiều"
    full_day = "Cả ngày"

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

class ScheduleCreate(BaseModel):
    date: str                   
    room: RoomEnum             
    shift: SessionEnum         
    jurors: List[str] = Field(min_length=2, max_length=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    dispute_relationship: Optional[str] = None
    litigant: Optional[str] = None
    note: Optional[str] = None

    @field_validator("jurors")
    @classmethod
    def normalize_jurors(cls, values: List[str]) -> List[str]:
        normalized = [" ".join(value.split()) for value in values]
        if any(not value for value in normalized):
            raise ValueError("Tên hội thẩm không được để trống")
        if len(set(normalized)) != len(normalized):
            raise ValueError("Danh sách hội thẩm không được trùng lặp")
        return normalized

class ScheduleOut(BaseModel):
    id: int
    date: str
    room: str
    shift: SessionEnum
    jurors: List[str] 
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    dispute_relationship: Optional[str] = None
    litigant: Optional[str] = None
    note: Optional[str] = None
    created_at: Optional[datetime] = None
    user: UserOut                

    @field_validator("created_at", mode="before")
    @classmethod
    def convert_created_at_to_vietnam(
        cls,
        value: Optional[datetime],
    ) -> Optional[datetime]:
        if value is None:
            return None

        # The old column stored UTC values without timezone information.
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)

        return value.astimezone(VIETNAM_TIMEZONE)

    model_config = ConfigDict(from_attributes=True)
