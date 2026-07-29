from sqlalchemy import Column, Integer, String, Text, DateTime, Date, func, ForeignKey

from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, nullable=False, default="medium")  # low | medium | high
    status = Column(String, nullable=False, default="pending")  # pending | in_progress | completed
    due_date = Column(Date, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    assigned_to = Column(Integer, ForeignKey("intern_profiles.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
