from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class WeeklyReportCreate(BaseModel):
    week_start: date
    week_end: date
    summary: str


class WeeklyReportOut(BaseModel):
    id: int
    intern_id: int
    week_start: date
    week_end: date
    summary: str
    guide_feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
