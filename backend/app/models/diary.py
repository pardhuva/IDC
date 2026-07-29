from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, Date, func, ForeignKey

from app.core.database import Base


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=False)
    date = Column(Date, nullable=False)
    activities = Column(Text, nullable=True)
    learning_outcomes = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    hours_worked = Column(Float, nullable=True)
    guide_comment = Column(Text, nullable=True)
    is_approved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())
