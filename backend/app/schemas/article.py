from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArticleCreate(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None


class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    summary: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    author: Optional[str] = None
    is_published: bool
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
