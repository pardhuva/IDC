from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func

from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    experience_feedback = Column(Text, nullable=False)
    suggestions = Column(Text, nullable=True)
    best_part = Column(String, nullable=True)
    worst_part = Column(String, nullable=True)
    would_recommend = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
