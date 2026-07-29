from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func

from app.core.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String, nullable=True)
    category = Column(String, nullable=False)  # news | research | achievement | general
    image_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
