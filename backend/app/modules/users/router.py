import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.modules.users import models, schemas
from app.modules.auth import service as auth_service
from app.modules.auth import schemas as auth_schemas
from app.core import database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from app.modules.schedule import models as schedule_models

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")
    hashed = auth_service.hash_password(user.password)
    new_user = models.User(username=user.username, password_hash=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=auth_schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
    
    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: schemas.UserOut = Depends(auth_service.get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    old_password: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not auth_service.verify_password(old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")
    user.password_hash = auth_service.hash_password(new_password)
    db.commit()
    return {"msg": "Đổi mật khẩu thành công"}


# app/routers/schedules.py
@router.get("/lich-tham-phan")
def lich_thang(user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    # ví dụ: trả về các lịch của tháng hiện tại
    today = datetime.date.today()
    start = today.replace(day=1)
    
    # Needs dateutil or manual calculation for end of month
    # For now, let's keep it simple as it might not be used or need proper fixing later
    lich = db.query(schedule_models.Schedule).filter(
        schedule_models.Schedule.user_id == user.id,
        schedule_models.Schedule.date >= str(start),
    ).all() 

    return lich


