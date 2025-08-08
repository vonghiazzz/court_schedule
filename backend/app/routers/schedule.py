from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database, auth
from typing import List
from app.auth import get_current_user

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
    current_user: models.User = Depends(get_current_user)
):
    # Kiểm tra đã có 2 người đăng ký buổi này chưa
    same_slot = db.query(models.Schedule).filter(
        models.Schedule.date == schedule.date,
        models.Schedule.room == schedule.room,
        models.Schedule.shift == schedule.shift,
        
    ).all()

    if len(same_slot) >= 2:
        raise HTTPException(status_code=400, detail="Buổi này đã đủ thẩm phán")
    # Kiểm tra có lịch trùng không
    conflicts = db.query(models.Schedule).filter(
        models.Schedule.date == schedule.date,
        models.Schedule.room == schedule.room,
        models.Schedule.start_time < schedule.end_time,
        models.Schedule.end_time > schedule.start_time
    ).all()

    if conflicts:
        raise HTTPException(status_code=400, detail="Hội trường này đã có lịch trong khoảng thời gian này!")


    new_schedule = models.Schedule(
        date=schedule.date,
        room=schedule.room,
        shift=schedule.shift,
        description=schedule.description,
        note=schedule.note,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        user_id=current_user.id
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@router.get("/", response_model=List[schemas.ScheduleOut])
def get_all_schedules(db: Session = Depends(get_db)):
    return db.query(models.Schedule).all()

@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch")

    if schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa lịch này")

    db.delete(schedule)
    db.commit()
    return {"message": "Đã xóa thành công"}
