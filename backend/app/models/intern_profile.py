from sqlalchemy import Column, Integer, String, DateTime, Date, func, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class InternProfile(Base):
    __tablename__ = "intern_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    user = relationship("User", lazy="joined")
    phone = Column(String, nullable=True)
    college = Column(String, nullable=True)
    department = Column(String, nullable=True)
    joining_date = Column(Date, nullable=True)
    internship_duration_months = Column(Integer, nullable=True)
    current_stage = Column(
        String, nullable=False, default="registered"
    )  # registered | documents_uploaded | verified | guide_assigned | project_allocated | active | presentation | evaluation | completed
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    accommodation_type = Column(String, nullable=True)
    profile_photo_path = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
