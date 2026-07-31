from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.diary import DiaryEntry
from app.models.weekly_report import WeeklyReport
from app.schemas.weekly_report import WeeklyReportCreate, WeeklyReportOut

router = APIRouter(prefix="/reports", tags=["weekly-reports"])


class GenerateReportPayload(BaseModel):
    week_start: date
    week_end: date


class GuideFeedbackPayload(BaseModel):
    guide_feedback: str


@router.post("/", response_model=WeeklyReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: WeeklyReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    report = WeeklyReport(
        intern_id=profile.id,
        **payload.model_dump(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/me", response_model=List[WeeklyReportOut])
def list_own_reports(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return db.query(WeeklyReport).filter(WeeklyReport.intern_id == profile.id).order_by(WeeklyReport.week_start.desc()).all()


@router.get("/", response_model=List[WeeklyReportOut])
def list_all_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    from app.models.guide_assignment import GuideAssignment
    assignments = db.query(GuideAssignment).filter(GuideAssignment.guide_id == user.id).all()
    intern_ids = [a.intern_id for a in assignments]
    if not intern_ids:
        return []
    reports = db.query(WeeklyReport).filter(WeeklyReport.intern_id.in_(intern_ids)).order_by(WeeklyReport.week_start.desc()).all()
    result = []
    for r in reports:
        profile = db.query(InternProfile).filter(InternProfile.id == r.intern_id).first()
        name = "Intern"
        if profile:
            u = db.query(User).filter(User.id == profile.user_id).first()
            if u:
                name = u.name
        out = WeeklyReportOut.model_validate(r)
        out.intern_name = name
        result.append(out)
    return result


@router.put("/{report_id}/submit", response_model=WeeklyReportOut)
def submit_report(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    report = db.query(WeeklyReport).filter(WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "submitted"
    from datetime import datetime
    report.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(report)
    return report


@router.post("/generate", response_model=WeeklyReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    payload: GenerateReportPayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    entries = (
        db.query(DiaryEntry)
        .filter(
            DiaryEntry.intern_id == profile.id,
            DiaryEntry.date >= payload.week_start,
            DiaryEntry.date <= payload.week_end,
        )
        .order_by(DiaryEntry.date)
        .all()
    )

    if not entries:
        raise HTTPException(status_code=400, detail="No diary entries found for this date range")

    # Auto-generate summary from diary entries
    summary_parts = []
    for entry in entries:
        summary_parts.append(f"[{entry.date}] {entry.activities}")
        if entry.learning_outcomes:
            summary_parts.append(f"  Learnings: {entry.learning_outcomes}")

    summary = "\n".join(summary_parts)

    report = WeeklyReport(
        intern_id=profile.id,
        week_start=payload.week_start,
        week_end=payload.week_end,
        summary=summary,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.post("/auto-generate", response_model=WeeklyReportOut, status_code=status.HTTP_201_CREATED)
def auto_generate_report(
    payload: GenerateReportPayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Auto-generate a weekly report from diary entries using TF-IDF summarization.
    Fetches all diary entries for the given date range, combines their text,
    and produces an AI-summarized report.
    """
    try:
        from app.ai.report_summarizer import summarize_text, extract_keywords
    except ImportError:
        raise HTTPException(status_code=503, detail="AI summarization module not available. Install scikit-learn.")

    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    entries = (
        db.query(DiaryEntry)
        .filter(
            DiaryEntry.intern_id == profile.id,
            DiaryEntry.date >= payload.week_start,
            DiaryEntry.date <= payload.week_end,
        )
        .order_by(DiaryEntry.date)
        .all()
    )

    if not entries:
        raise HTTPException(status_code=400, detail="No diary entries found for this date range")

    # Combine all diary text fields into one document
    text_parts = []
    for entry in entries:
        if entry.activities:
            text_parts.append(entry.activities)
        if entry.learning_outcomes:
            text_parts.append(entry.learning_outcomes)
        if entry.challenges:
            text_parts.append(entry.challenges)

    combined_text = " ".join(text_parts)

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="Diary entries have no text content to summarize")

    summary = summarize_text(combined_text, num_sentences=5)
    keywords = extract_keywords(combined_text, top_n=8)
    keyword_line = "Keywords: " + ", ".join(keywords) if keywords else ""
    full_summary = f"{summary}\n\n{keyword_line}".strip() if keyword_line else summary

    report = WeeklyReport(
        intern_id=profile.id,
        week_start=payload.week_start,
        week_end=payload.week_end,
        summary=full_summary,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.put("/{report_id}/feedback", response_model=WeeklyReportOut)
def add_feedback(
    report_id: int,
    payload: GuideFeedbackPayload,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    report = db.query(WeeklyReport).filter(WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.guide_feedback = payload.guide_feedback
    db.commit()
    db.refresh(report)
    return report
