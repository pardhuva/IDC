"""Router for Sentiment Analysis on Diary Entries."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.diary import DiaryEntry

router = APIRouter(prefix="/ai/sentiment", tags=["AI - Sentiment"])


def _get_intern_sentiment(db: Session, intern_id: int):
    from app.ai.sentiment_analyzer import analyze_sentiment, get_sentiment_trend

    entries = (
        db.query(DiaryEntry)
        .filter(DiaryEntry.intern_id == intern_id)
        .order_by(DiaryEntry.date)
        .all()
    )
    if not entries:
        return {"entries": [], "trend": {}, "message": "No diary entries found."}

    scored_entries = []
    for entry in entries:
        parts = []
        if entry.activities:
            parts.append(entry.activities)
        if entry.learning_outcomes:
            parts.append(entry.learning_outcomes)
        if entry.challenges:
            parts.append(entry.challenges)
        text = " ".join(parts)
        if text.strip():
            result = analyze_sentiment(text)
            scored_entries.append({
                "id": entry.id,
                "date": str(entry.date),
                "polarity": result["polarity"],
                "subjectivity": result["subjectivity"],
                "mood": result["mood"],
            })

    trend = get_sentiment_trend(entries)

    return {
        "intern_id": intern_id,
        "entries": scored_entries,
        "trend": trend,
    }


@router.get("/me")
def my_sentiment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get sentiment analysis of the logged-in intern's diary entries."""
    profile = db.query(InternProfile).filter(InternProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return _get_intern_sentiment(db, profile.id)


@router.get("/{intern_id}")
def intern_sentiment(
    intern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coordinator", "guide")),
):
    """Coordinator/guide can view an intern's sentiment trend."""
    profile = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern not found")
    return _get_intern_sentiment(db, intern_id)
