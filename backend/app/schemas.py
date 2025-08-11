# app/schemas.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import date, time
from typing import List

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

class JurorEnum(str, Enum):
    A = "Nguyen Văn A"
    B = "Nguyen Văn B"
    C = "Nguyen Văn C"
    D = "Nguyen Văn D"
    E = "Nguyen Văn E"
    F = "Nguyen Văn F"
    G = "Nguyen Văn G"
    H = "Nguyen Văn H"
    I = "Nguyen Văn I"
    K = "Nguyen Văn K"
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
    date: str                   
    room: RoomEnum             
    shift: SessionEnum         
    jurors: List[JurorEnum]     
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    note: Optional[str] = None

class ScheduleOut(BaseModel):
    id: int
    date: str
    room: str
    shift: SessionEnum
    jurors: List[str] 
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    note: Optional[str] = None
    user: UserOut                


    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
