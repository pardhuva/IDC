from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    objectives: Optional[str] = None
    required_skills: Optional[str] = None


class ProjectOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    objectives: Optional[str] = None
    required_skills: Optional[str] = None
    guide_id: int
    intern_id: Optional[int] = None
    status: str = "open"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
