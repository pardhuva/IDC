from sqlalchemy import Column, Integer, String, DateTime, Text, func, ForeignKey

from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=False)
    doc_type = Column(String, nullable=False)  # offer_letter | id_proof | college_letter
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending | verified | rejected
    reviewer_notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, server_default=func.now())
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
