from sqlalchemy import Column, Integer, String, Boolean

from app.core.database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    category = Column(String, nullable=False)  # coordinator | hr | helpdesk | it_support | security
    is_active = Column(Boolean, nullable=False, default=True)
