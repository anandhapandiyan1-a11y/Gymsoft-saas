from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceCreate(BaseModel):
    member_id: int

class InjuryFeedbackCreate(BaseModel):
    member_id: int
    trainer_id: int
    exercise_name: Optional[str] = None
    message: str

class InjuryFeedbackResponse(BaseModel):
    id: int
    member_id: int
    trainer_id: int
    exercise_name: Optional[str] = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True