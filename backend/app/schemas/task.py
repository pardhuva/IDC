from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
