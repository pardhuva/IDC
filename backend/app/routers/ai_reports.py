"""Router for Smart Report Summarizer."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.weekly_report import WeeklyReport

router = APIRouter(prefix="/ai", tags=["AI - Reports"])


class SummarizeRequest(BaseModel):
    text: str
    num_sentences: int = 3


@router.post("/summarize")
def summarize(
    body: SummarizeRequest,
    current_user: User = Depends(get_current_user),
):
    """Summarize arbitrary text and extract keywords."""
    from app.ai.report_summarizer import summarize_text, extract_keywords

    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    summary = summarize_text(body.text, num_sentences=body.num_sentences)
    keywords = extract_keywords(body.text)
    return {"summary": summary, "keywords": keywords}


@router.get("/weekly-summary/me")
def my_weekly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Auto-summarize the intern's weekly reports into a brief overview."""
    from app.ai.report_summarizer import summarize_weekly_reports

    profile = db.query(InternProfile).filter(InternProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    reports = (
        db.query(WeeklyReport)
        .filter(WeeklyReport.intern_id == profile.id)
        .order_by(WeeklyReport.week_start)
        .all()
    )
    if not reports:
        return {"message": "No weekly reports found.", "data": {}}

    result = summarize_weekly_reports(reports)
    return {"intern_id": profile.id, "data": result}
