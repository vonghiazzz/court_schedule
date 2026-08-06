from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        username = value.strip()
        if not username:
            raise ValueError("Tên đăng nhập không được để trống")
        return username


class AdminUserCreate(UserCreate):
    is_admin: bool = False


class AdminUserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=2, max_length=100)
    is_admin: Optional[bool] = None

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        username = value.strip()
        if not username:
            raise ValueError("Tên đăng nhập không được để trống")
        return username


class AdminPasswordReset(BaseModel):
    new_password: str = Field(min_length=6, max_length=128)

class UserOut(BaseModel):
    id: int
    username: str
    is_admin: bool = False

    model_config = ConfigDict(from_attributes=True)
