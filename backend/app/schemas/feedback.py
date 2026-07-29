from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    rating: int
    experience_feedback: str
    suggestions: Optional[str] = None
    best_part: Optional[str] = None
    worst_part: Optional[str] = None
    would_recommend: Optional[bool] = True


class FeedbackOut(BaseModel):
    id: int
    intern_id: int
    rating: int
    experience_feedback: str
    suggestions: Optional[str] = None
    best_part: Optional[str] = None
    worst_part: Optional[str] = None
    would_recommend: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
