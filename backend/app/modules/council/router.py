from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core import database
from app.modules.auth import service as auth_service
from app.modules.council import models, schemas
from app.modules.users import models as user_models


router = APIRouter(prefix="/council-members", tags=["Council members"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_member_or_404(member_id: int, db: Session) -> models.CouncilMember:
    member = (
        db.query(models.CouncilMember)
        .filter(models.CouncilMember.id == member_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên")
    return member


def ensure_unique_name(full_name: str, db: Session, exclude_id: int = None) -> None:
    query = db.query(models.CouncilMember).filter(
        func.lower(models.CouncilMember.full_name) == full_name.lower()
    )
    if exclude_id is not None:
        query = query.filter(models.CouncilMember.id != exclude_id)
    if query.first():
        raise HTTPException(status_code=400, detail="Thành viên này đã có trong danh sách")


@router.get("", response_model=List[schemas.CouncilMemberOut])
def get_council_members(
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(auth_service.get_current_user),
):
    return db.query(models.CouncilMember).order_by(models.CouncilMember.full_name.asc()).all()


@router.post(
    "",
    response_model=schemas.CouncilMemberOut,
    status_code=status.HTTP_201_CREATED,
)
def create_council_member(
    member_data: schemas.CouncilMemberCreate,
    db: Session = Depends(get_db),
    current_admin: user_models.User = Depends(auth_service.get_current_admin),
):
    ensure_unique_name(member_data.full_name, db)
    member = models.CouncilMember(full_name=member_data.full_name)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.patch("/{member_id}", response_model=schemas.CouncilMemberOut)
def update_council_member(
    member_id: int,
    member_data: schemas.CouncilMemberUpdate,
    db: Session = Depends(get_db),
    current_admin: user_models.User = Depends(auth_service.get_current_admin),
):
    member = get_member_or_404(member_id, db)
    ensure_unique_name(member_data.full_name, db, exclude_id=member_id)
    member.full_name = member_data.full_name
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_council_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_admin: user_models.User = Depends(auth_service.get_current_admin),
):
    member = get_member_or_404(member_id, db)
    db.delete(member)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
