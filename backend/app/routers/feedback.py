from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != "intern":
        raise HTTPException(status_code=403, detail="Only interns can submit feedback")

    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    existing = db.query(Feedback).filter(Feedback.intern_id == profile.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted")

    feedback = Feedback(**payload.model_dump(), intern_id=profile.id)
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/me", response_model=FeedbackOut)
def get_my_feedback(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    feedback = db.query(Feedback).filter(Feedback.intern_id == profile.id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="No feedback found")
    return feedback


@router.get("/tips")
def get_intern_tips(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return anonymized feedback from previous interns, ranked by rating."""
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.would_recommend == True)
        .order_by(Feedback.rating.desc())
        .all()
    )

    tips = []
    for f in feedbacks:
        tip = {
            "rating": f.rating,
            "best_part": f.best_part,
            "suggestions": f.suggestions,
            "experience_summary": (
                f.experience_feedback[:200] + "..."
                if f.experience_feedback and len(f.experience_feedback) > 200
                else f.experience_feedback
            ),
            "would_recommend": f.would_recommend,
        }
        tips.append(tip)

    themes = {}
    for f in feedbacks:
        if f.best_part:
            key = f.best_part.strip().lower()
            themes[key] = themes.get(key, 0) + 1
        if f.suggestions:
            for word in f.suggestions.lower().split():
                if len(word) > 5:
                    themes[word] = themes.get(word, 0) + 1

    try:
        from app.ai.report_summarizer import extract_keywords
        all_text = " ".join(
            (f.experience_feedback or "") + " " + (f.suggestions or "")
            for f in feedbacks
        )
        if all_text.strip():
            keywords = extract_keywords(all_text)
        else:
            keywords = []
    except Exception:
        keywords = []

    return {
        "tips": tips,
        "total": len(tips),
        "avg_rating": round(sum(f.rating for f in feedbacks) / len(feedbacks), 1) if feedbacks else 0,
        "keywords": keywords,
    }


@router.get("/", response_model=List[FeedbackOut])
def list_all_feedback(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    return db.query(Feedback).all()
