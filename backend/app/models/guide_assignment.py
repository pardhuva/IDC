from sqlalchemy import Column, Integer, DateTime, func, ForeignKey

from app.core.database import Base


class GuideAssignment(Base):
    __tablename__ = "guide_assignments"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), unique=True, nullable=False)
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, server_default=func.now())
