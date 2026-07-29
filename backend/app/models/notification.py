from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
