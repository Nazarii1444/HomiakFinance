from typing import Optional
from pydantic import BaseModel, Field

class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    summ: float = Field(gt=0)
    saved: float = Field(ge=0, default=0.0)

class GoalUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    summ: Optional[float] = Field(default=None, gt=0)
    saved: Optional[float] = Field(default=None, ge=0)

class GoalOut(BaseModel):
    id_: int
    name: str
    summ: float
    saved: float

    class Config:
        from_attributes = True
        orm_mode = True
