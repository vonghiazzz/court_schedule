# app/routers/users.py
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, auth, database
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")
    hashed = auth.hash_password(user.password)
    new_user = models.User(username=user.username, password_hash=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: schemas.UserOut = Depends(auth.get_current_user)):
    return current_user

# app/routers/schedules.py
@router.get("/lich-tham-phan")
def lich_thang(user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # ví dụ: trả về các lịch của tháng hiện tại
    today = datetime.date.today()
    start = today.replace(day=1)
    end = (start + relativedelta(months=1)) - datetime.timedelta(days=1)

    lich = db.query(models.Schedule).filter(
        models.Schedule.user_id == user.id,
        models.Schedule.date >= start,
        models.Schedule.date <= end
    ).all() 

    return lich


