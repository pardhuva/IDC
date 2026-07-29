from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class LeaveRequestCreate(BaseModel):
    leave_type: str
    from_date: date
    to_date: date
    reason: str


class LeaveRequestReview(BaseModel):
    status: str  # approved | rejected
    reviewer_comment: Optional[str] = None


class LeaveRequestOut(BaseModel):
    id: int
    intern_id: int
    leave_type: str
    from_date: date
    to_date: date
    reason: str
    status: str
    reviewer_id: Optional[int] = None
    reviewer_comment: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    intern_name: Optional[str] = None

    class Config:
        from_attributes = True
