from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: str
    event_date: datetime
    event_type: str
    location: str
    image_url: Optional[str] = None
    is_featured: Optional[bool] = False


class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    event_type: str
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
