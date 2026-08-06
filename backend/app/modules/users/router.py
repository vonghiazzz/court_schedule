import datetime
from fastapi import APIRouter, Depends, HTTPException, Body, Response, Cookie, Request, status
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


def get_user_or_404(user_id: int, db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản")
    return user

@router.post("/register", response_model=schemas.UserOut)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_service.get_current_admin),
):
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
def login(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
    
    access_token = auth_service.create_access_token(data={"sub": user.username})
    refresh_token = auth_service.create_refresh_token(data={"sub": user.username})
    
    # Tự động xác định secure và samesite dựa trên giao thức (HTTP hay HTTPS) của request
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_https,
        samesite="none" if is_https else "lax",
        max_age=7 * 24 * 3600,
        path="/"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=auth_schemas.Token)
def refresh(request: Request, response: Response, refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Không tìm thấy token làm mới")
        
    username = auth_service.verify_refresh_token(refresh_token)
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Không xác thực được người dùng")
    
    access_token = auth_service.create_access_token(data={"sub": user.username})
    new_refresh_token = auth_service.create_refresh_token(data={"sub": user.username})
    
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=is_https,
        samesite="none" if is_https else "lax",
        max_age=7 * 24 * 3600,
        path="/"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout(request: Request, response: Response):
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=is_https,
        samesite="none" if is_https else "lax",
        path="/"
    )
    return {"msg": "Đăng xuất thành công"}


from typing import List

@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: schemas.UserOut = Depends(auth_service.get_current_user)):
    return current_user

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    return db.query(models.User).order_by(models.User.username.asc()).all()


@router.get("/admin/users", response_model=List[schemas.UserOut])
def admin_get_users(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_service.get_current_admin),
):
    return db.query(models.User).order_by(models.User.username.asc()).all()


@router.post(
    "/admin/users",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED,
)
def admin_create_user(
    user_data: schemas.AdminUserCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_service.get_current_admin),
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.username == user_data.username)
        .first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")

    user = models.User(
        username=user_data.username,
        password_hash=auth_service.hash_password(user_data.password),
        is_admin=1 if user_data.is_admin else 0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/admin/users/{user_id}", response_model=schemas.UserOut)
def admin_update_user(
    user_id: int,
    user_data: schemas.AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_service.get_current_admin),
):
    user = get_user_or_404(user_id, db)

    if user_data.username is not None and user_data.username != user.username:
        if user.id == current_admin.id:
            raise HTTPException(
                status_code=400,
                detail="Bạn không thể đổi tên tài khoản đang đăng nhập",
            )
        duplicate = (
            db.query(models.User)
            .filter(
                models.User.username == user_data.username,
                models.User.id != user_id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")
        user.username = user_data.username

    if user_data.is_admin is not None:
        if user.id == current_admin.id and not user_data.is_admin:
            raise HTTPException(
                status_code=400,
                detail="Bạn không thể tự thu hồi quyền quản trị của mình",
            )
        user.is_admin = 1 if user_data.is_admin else 0

    db.commit()
    db.refresh(user)
    return user


@router.post("/admin/users/{user_id}/reset-password")
def admin_reset_user_password(
    user_id: int,
    password_data: schemas.AdminPasswordReset,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_service.get_current_admin),
):
    user = get_user_or_404(user_id, db)
    user.password_hash = auth_service.hash_password(password_data.new_password)
    db.commit()
    return {"msg": "Đặt lại mật khẩu thành công"}


@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_service.get_current_admin),
):
    user = get_user_or_404(user_id, db)
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Bạn không thể tự xóa tài khoản đang đăng nhập",
        )

    schedule_count = (
        db.query(schedule_models.Schedule)
        .filter(schedule_models.Schedule.user_id == user.id)
        .count()
    )
    if schedule_count:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Tài khoản đang có {schedule_count} lịch xét xử. "
                "Hãy xử lý các lịch liên quan trước khi xóa."
            ),
        )

    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

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


