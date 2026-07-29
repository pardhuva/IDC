from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class InternProfileCreate(BaseModel):
    phone: Optional[str] = None
    college: str
    department: str
    joining_date: date
    internship_duration_months: Optional[int] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_group: Optional[str] = None
    accommodation_type: Optional[str] = None


class UserBrief(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class InternProfileOut(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    joining_date: Optional[date] = None
    internship_duration_months: Optional[int] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_group: Optional[str] = None
    accommodation_type: Optional[str] = None
    current_stage: str
    created_at: Optional[datetime] = None
    user: Optional[UserBrief] = None

    class Config:
        from_attributes = True


class InternProfileUpdate(BaseModel):
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    joining_date: Optional[date] = None
    internship_duration_months: Optional[int] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_group: Optional[str] = None
    accommodation_type: Optional[str] = None
