from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import time
from app.modules.users.schemas import UserOut

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
    J1 = "Lê Thị Tú Anh"
    J2 = "Ngụy Mộng Cầm"
    J3 = "Nguyễn Tùng Châu"
    J4 = "Huỳnh Thị Chi"
    J5 = "Nguyễn Văn Cường"
    J6 = "Trần Quang Đông"
    J7 = "Nguyễn Thị Lệ Hoa"
    J8 = "Lê Minh Hoàng"
    J9 = "Nguyễn Văn Hoàng"
    J10 = "Đoàn Văn Huệ"
    J11 = "Nguyễn Thị Kim Hường"
    J12 = "Trần Thị Minh Hường"
    J13 = "Trần Thị Đức Nghiêm"
    J14 = "Võ Thị Bích Ngọc"
    J15 = "Võ Thị Mỹ Ngọc"
    J16 = "Lê Thị Kiều Oanh"
    J17 = "Trần Văn Mỹ Phúc"
    J18 = "Dương Thị Phụng"
    J19 = "Nguyễn Thị Lan Phương"
    J20 = "Nguyễn Tấn Tài"
    J21 = "Châu Thanh Tân"
    J22 = "Nguyễn Thị Thanh Thảo"
    J23 = "Lê Văn Thới"
    J24 = "Đặng Ngọc Thu"
    J25 = "Huỳnh Đặng Anh Thư"
    J26 = "Phạm Văn Tư"
    J27 = "Huỳnh Thị Thu Vân"
    J28 = "Nguyễn Phương Thanh"
    J29 = "Quách Tử Điệc"
    J30 = "Nguyễn Văn Phước"
    J31 = "Nguyễn Văn Trước"
    J32 = "Trần Thanh Khen"
    J33 = "Huỳnh Anh Dũng"
    J34 = "Hồ Minh Hùng"
    J35 = "Lê Minh Toàn"
    J36 = "Trần Thanh Hiếu"
    J37 = "Nguyễn Thị Hương"
    J38 = "Quách Thái Vạn Thuận"
    J39 = "Trần Văn Kiệt"
    J40 = "Huỳnh Kim Phượng"
    J41 = "Võ Thế Khoa"
    J42 = "Nguyễn Văn Nghĩa"
    J43 = "Trần Văn Thanh"
    J44 = "Võ Hữu Phước"
    J45 = "Nguyễn Thanh Phúc"
    J46 = "Nguyễn Thị Tuyết Trang"
    J47 = "Phạm Công Toàn"
    J48 = "Trần Bích Trang"
    J49 = "Trần Trung Nghĩa"
    J50 = "Nguyễn Thị Hằng"
    J51 = "Trần Thị Tuyết Nga"
    J52 = "Nguyễn Thị Út"
    J53 = "Trương Hữu Phước"
    J54 = "Trần Thanh Hùng"
    J55 = "Lê Thị Hồng Vân"
    J56 = "Phạm Hữu Hiệp"
    J57 = "Trần Mỹ Huyền"
    J58 = "Nguyễn Thị Ngọc Tuyết"
    J59 = "Nguyễn Quế Hào"
    J60 = "Nguyễn Thị Hồng Phượng"
    J61 = "Lê Minh Mẫn"
    J62 = "Nguyễn Trọng Trí"
    J63 = "Mai Văn Trí"
    J64 = "Nguyễn Minh Trí"
    J65 = "Nguyễn Thành Tài"
    J66 = "Nguyễn Thị Diệu Phước"
    J67 = "Lê Anh Vũ"
    J68 = "Huỳnh Hữu Phi"
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
