from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CouncilMemberCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        full_name = " ".join(value.split())
        if not full_name:
            raise ValueError("Họ tên không được để trống")
        return full_name


class CouncilMemberUpdate(CouncilMemberCreate):
    pass


class CouncilMemberOut(BaseModel):
    id: int
    full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
