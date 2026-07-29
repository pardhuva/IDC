from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OfficeLocationCreate(BaseModel):
    name: str
    slug: str
    category: str
    building: str
    floor: Optional[str] = None
    purpose: Optional[str] = None
    timings: Optional[str] = None
    required_documents: Optional[str] = None
    entry_rules: Optional[str] = None
    restrictions: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    nearby_locations: Optional[str] = None


class OfficeLocationOut(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    building: str
    floor: Optional[str] = None
    purpose: Optional[str] = None
    timings: Optional[str] = None
    required_documents: Optional[str] = None
    entry_rules: Optional[str] = None
    restrictions: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    nearby_locations: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = None
    target_role: Optional[str] = None
    expires_at: Optional[datetime] = None


class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    category: Optional[str] = None
    target_role: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True
