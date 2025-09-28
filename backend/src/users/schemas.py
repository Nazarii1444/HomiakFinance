from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from src.models import UserStatus

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_: int
    username: str
    email: EmailStr
    default_currency: str
    timezone: Optional[str] = None
    capital: float
    role: UserStatus


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: Optional[str] = Field(default=None, min_length=3, max_length=64)
    email: Optional[EmailStr] = None
    default_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    timezone: Optional[str] = Field(default=None, max_length=64)
    capital: Optional[float] = None
