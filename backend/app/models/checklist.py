from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey

from app.core.database import Base


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=False)
    step_key = Column(String, nullable=False)  # accept_offer | upload_documents | verify_identity | read_guidelines | complete_profile | report_joining | collect_temp_id | guide_assignment
    title = Column(String, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime, nullable=True)
