from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, func, ForeignKey

from app.core.database import Base


class OfficeLocation(Base):
    __tablename__ = "office_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)  # office | facility | service
    building = Column(String, nullable=True)
    floor = Column(String, nullable=True)
    purpose = Column(Text, nullable=True)
    timings = Column(String, nullable=True)
    required_documents = Column(Text, nullable=True)
    entry_rules = Column(Text, nullable=True)
    restrictions = Column(Text, nullable=True)
    contact_phone = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    nearby_locations = Column(Text, nullable=True)  # JSON string
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # general | orientation | workshop | holiday | notice
    target_role = Column(String, nullable=False, default="all")  # all | intern | guide
    is_active = Column(Boolean, nullable=False, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)
