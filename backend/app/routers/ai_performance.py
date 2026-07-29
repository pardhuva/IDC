"""Router for Intern Performance Scorer."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile

router = APIRouter(prefix="/ai/performance", tags=["AI - Performance"])


@router.get("/leaderboard")
def leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coordinator")),
):
    """Coordinator sees ranked interns by performance score."""
    from app.ai.performance_scorer import calculate_performance_score

    profiles = db.query(InternProfile).all()
    results = []
    for profile in profiles:
        score_data = calculate_performance_score(db, profile.id)
        results.append({
            "intern_id": profile.id,
            "user_id": profile.user_id,
            "total_score": score_data["total_score"],
            "grade": score_data["grade"],
        })

    results.sort(key=lambda x: x["total_score"], reverse=True)
    for rank, item in enumerate(results, 1):
        item["rank"] = rank

    return {"leaderboard": results}


@router.get("/me")
def my_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Intern sees their own performance score."""
    from app.ai.performance_scorer import calculate_performance_score

    profile = db.query(InternProfile).filter(InternProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    return calculate_performance_score(db, profile.id)


@router.get("/{intern_id}")
def intern_performance(
    intern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coordinator", "guide")),
):
    """Coordinator/guide views an intern's performance score."""
    from app.ai.performance_scorer import calculate_performance_score

    profile = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern not found")

    return calculate_performance_score(db, intern_id)
