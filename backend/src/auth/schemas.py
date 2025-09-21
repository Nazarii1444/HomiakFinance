from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, constr, ConfigDict, Field

from src.models import UserStatus


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(min_length=8)
    default_currency: Optional[str] = None
    timezone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserLoginResponse(BaseModel):
    access_token: str
    refresh_token: str

class UserEmail(BaseModel):
    email: EmailStr


class UserUsername(BaseModel):
    username: str


class UserResponse(BaseModel):
    username: str
    email: EmailStr
    is_admin: UserStatus
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(BaseModel):
    username: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    username: Optional[constr(min_length=5)] = None
    email: Optional[EmailStr] = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

