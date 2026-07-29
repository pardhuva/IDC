from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class DiaryEntryCreate(BaseModel):
    date: date
    activities: str
    learning_outcomes: Optional[str] = None
    challenges: Optional[str] = None
    hours_worked: float = 0.0


class DiaryCommentUpdate(BaseModel):
    guide_comment: Optional[str] = None
    is_approved: Optional[bool] = None


class DiaryEntryOut(BaseModel):
    id: int
    intern_id: int
    date: date
    activities: str
    learning_outcomes: Optional[str] = None
    challenges: Optional[str] = None
    hours_worked: float
    guide_comment: Optional[str] = None
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
