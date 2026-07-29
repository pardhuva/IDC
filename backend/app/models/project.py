from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    required_skills = Column(Text, nullable=True)
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=True)
    status = Column(String, nullable=False, default="open")  # open | assigned | in_progress | completed
    created_at = Column(DateTime, server_default=func.now())
