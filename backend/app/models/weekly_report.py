from sqlalchemy import Column, Integer, String, Text, DateTime, Date, func, ForeignKey

from app.core.database import Base


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    summary = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="draft")  # draft | submitted | reviewed
    guide_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    submitted_at = Column(DateTime, nullable=True)
