# app/schemas.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import date, time
from typing import List

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

class JurorEnum(str, Enum):    
    J1 = "Hội thẩm số 1"
    J2 = "Hội thẩm số 2"
    J3 = "Hội thẩm số 3"
    J4 = "Hội thẩm số 4"
    J5 = "Hội thẩm số 5"
    J6 = "Hội thẩm số 6"
    J7 = "Hội thẩm số 7"
    J8 = "Hội thẩm số 8"
    J9 = "Hội thẩm số 9"
    J10 = "Hội thẩm số 10"
    J11 = "Hội thẩm số 11"
    J12 = "Hội thẩm số 12"
    J13 = "Hội thẩm số 13"
    J14 = "Hội thẩm số 14"
    J15 = "Hội thẩm số 15"
    J16 = "Hội thẩm số 16"
    J17 = "Hội thẩm số 17"
    J18 = "Hội thẩm số 18"
    J19 = "Hội thẩm số 19"
    J20 = "Hội thẩm số 20"
    J21 = "Hội thẩm số 21"
    J22 = "Hội thẩm số 22"
    J23 = "Hội thẩm số 23"
    J24 = "Hội thẩm số 24"
    J25 = "Hội thẩm số 25"
    J26 = "Hội thẩm số 26"
    J27 = "Hội thẩm số 27"
    J28 = "Hội thẩm số 28"
    J29 = "Hội thẩm số 29"
    J30 = "Hội thẩm số 30"
    J31 = "Hội thẩm số 31"
    J32 = "Hội thẩm số 32"
    J33 = "Hội thẩm số 33"
    J34 = "Hội thẩm số 34"
    J35 = "Hội thẩm số 35"
    J36 = "Hội thẩm số 36"
    J37 = "Hội thẩm số 37"
    J38 = "Hội thẩm số 38"
    J39 = "Hội thẩm số 39"
    J40 = "Hội thẩm số 40"
    J41 = "Hội thẩm số 41"
    J42 = "Hội thẩm số 42"
    J43 = "Hội thẩm số 43"
    J44 = "Hội thẩm số 44"
    J45 = "Hội thẩm số 45"
    J46 = "Hội thẩm số 46"
    J47 = "Hội thẩm số 47"
    J48 = "Hội thẩm số 48"
    J49 = "Hội thẩm số 49"
    J50 = "Hội thẩm số 50"
    J51 = "Hội thẩm số 51"
    J52 = "Hội thẩm số 52"
    J53 = "Hội thẩm số 53"
    J54 = "Hội thẩm số 54"
    J55 = "Hội thẩm số 55"
    J56 = "Hội thẩm số 56"
    J57 = "Hội thẩm số 57"
    J58 = "Hội thẩm số 58"
    J59 = "Hội thẩm số 59"
    J60 = "Hội thẩm số 60"

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
    dispute_relationship: Optional[str] = None
    litigant: Optional[str] = None
    note: Optional[str] = None


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
    user: UserOut                


    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
