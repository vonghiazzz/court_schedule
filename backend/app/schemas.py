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
    from enum import Enum

class JurorEnum(str, Enum):
    J1 = "Người số 1"
    J2 = "Người số 2"
    J3 = "Người số 3"
    J4 = "Người số 4"
    J5 = "Người số 5"
    J6 = "Người số 6"
    J7 = "Người số 7"
    J8 = "Người số 8"
    J9 = "Người số 9"
    J10 = "Người số 10"
    J11 = "Người số 11"
    J12 = "Người số 12"
    J13 = "Người số 13"
    J14 = "Người số 14"
    J15 = "Người số 15"
    J16 = "Người số 16"
    J17 = "Người số 17"
    J18 = "Người số 18"
    J19 = "Người số 19"
    J20 = "Người số 20"
    J21 = "Người số 21"
    J22 = "Người số 22"
    J23 = "Người số 23"
    J24 = "Người số 24"
    J25 = "Người số 25"
    J26 = "Người số 26"
    J27 = "Người số 27"
    J28 = "Người số 28"
    J29 = "Người số 29"
    J30 = "Người số 30"
    J31 = "Người số 31"
    J32 = "Người số 32"
    J33 = "Người số 33"
    J34 = "Người số 34"
    J35 = "Người số 35"
    J36 = "Người số 36"
    J37 = "Người số 37"
    J38 = "Người số 38"
    J39 = "Người số 39"
    J40 = "Người số 40"
    J41 = "Người số 41"
    J42 = "Người số 42"
    J43 = "Người số 43"
    J44 = "Người số 44"
    J45 = "Người số 45"
    J46 = "Người số 46"
    J47 = "Người số 47"
    J48 = "Người số 48"
    J49 = "Người số 49"
    J50 = "Người số 50"
    J51 = "Người số 51"
    J52 = "Người số 52"
    J53 = "Người số 53"
    J54 = "Người số 54"
    J55 = "Người số 55"
    J56 = "Người số 56"
    J57 = "Người số 57"
    J58 = "Người số 58"
    J59 = "Người số 59"
    J60 = "Người số 60"


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
