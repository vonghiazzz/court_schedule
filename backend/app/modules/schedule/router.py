from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.modules.schedule import models, schemas
from app.modules.users import models as users_models
from app.core import database
from app.modules.auth.service import get_current_user
from sqlalchemy import or_

router = APIRouter(prefix="/schedule", tags=["Schedule"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ScheduleOut)
def create_schedule(
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: users_models.User = Depends(get_current_user)
):
    # Kiểm tra đã có 2 người đăng ký buổi này chưa
    same_slot = db.query(models.Schedule).filter(
        models.Schedule.date == schedule.date,
        models.Schedule.room == schedule.room,
        models.Schedule.shift == schedule.shift,
        
    ).all()

    if len(same_slot) >= 2:
        raise HTTPException(status_code=400, detail="Mỗi buổi chỉ được đăng ký 2 hội trường!")
    
    # Kiểm tra có lịch trùng không
    conflict = db.query(models.Schedule).filter(
        models.Schedule.date == schedule.date,
        models.Schedule.room == schedule.room,
        models.Schedule.start_time < schedule.end_time,
        models.Schedule.end_time > schedule.start_time
    ).all()

    if conflict:
        raise HTTPException(status_code=400, detail="Hội trường này đã có lịch trong khoảng thời gian này!")

    # Kiểm tra trùng giờ cho cùng 1 thẩm phán/hội thẩm ở bất kỳ hội trường nào
    conflicts = db.query(models.Schedule).filter(
        models.Schedule.date == schedule.date,
    or_(
        models.Schedule.user_id == current_user.id,   # trùng thẩm phán
        models.Schedule.jurors.op("&&")(schedule.jurors)  # overlap operator của Postgres
    ),        
        models.Schedule.start_time < schedule.end_time,
        models.Schedule.end_time > schedule.start_time
    ).all()

    if conflicts:
        raise HTTPException(
            status_code=400,
            detail="Thẩm phán/Hội thẩm này đã có lịch trong khoảng thời gian này ở hội trường khác!"
        )

    

    new_schedule = models.Schedule(
        date=schedule.date,
        room=schedule.room,
        shift=schedule.shift,
        jurors=[j.value for j in schedule.jurors], 
        note=schedule.note,
        dispute_relationship=schedule.dispute_relationship,
        litigant=schedule.litigant,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        user_id=current_user.id
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@router.get("", response_model=List[schemas.ScheduleOut])
def get_all_schedules(db: Session = Depends(get_db)):
    return db.query(models.Schedule).all()

@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: users_models.User = Depends(get_current_user)
):
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch")

    if schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa lịch này")

    db.delete(schedule)
    db.commit()
    return {"message": "Đã xóa thành công"}

@router.put("/{schedule_id}", response_model=schemas.ScheduleOut)
def update_schedule(
    schedule_id: int,
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: users_models.User = Depends(get_current_user)
):
    db_schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch")
    if db_schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền sửa lịch này")

    # Cập nhật các trường
    db_schedule.date = schedule.date
    db_schedule.room = schedule.room
    db_schedule.shift = schedule.shift
    db_schedule.jurors = [j.value for j in schedule.jurors]
    db_schedule.note = schedule.note
    db_schedule.dispute_relationship = schedule.dispute_relationship
    db_schedule.litigant = schedule.litigant
    db_schedule.start_time = schedule.start_time
    db_schedule.end_time = schedule.end_time

    db.commit()
    db.refresh(db_schedule)
    return db_schedule