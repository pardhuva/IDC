"""
Intern Performance Scorer Module
Calculates a weighted performance score (0-100) from multiple factors
and generates AI-driven recommendations for improvement.
"""

from datetime import datetime, timedelta

# Lazy import for sentiment
_sentiment_analyzer = None


def _get_sentiment_analyzer():
    global _sentiment_analyzer
    if _sentiment_analyzer is None:
        from app.ai import sentiment_analyzer as sa
        _sentiment_analyzer = sa
    return _sentiment_analyzer


# Weight configuration
WEIGHTS = {
    "task_completion": 0.30,
    "document_timeliness": 0.20,
    "diary_consistency": 0.20,
    "sentiment_trend": 0.15,
    "checklist_progress": 0.15,
}


def _score_task_completion(db, intern_id: int) -> tuple[float, dict]:
    """Score based on completed vs total tasks."""
    from app.models.task import Task
    from app.models.intern_profile import InternProfile

    profile = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not profile:
        return 0.0, {"total": 0, "completed": 0, "rate": 0}

    # Tasks are linked via projects; get projects for this intern
    from app.models.project import Project
    projects = db.query(Project).filter(Project.intern_id == intern_id).all()
    project_ids = [p.id for p in projects]

    if not project_ids:
        return 0.0, {"total": 0, "completed": 0, "rate": 0}

    total = db.query(Task).filter(Task.project_id.in_(project_ids)).count()
    completed = db.query(Task).filter(
        Task.project_id.in_(project_ids), Task.status == "completed"
    ).count()

    rate = (completed / total) if total > 0 else 0
    return rate * 100, {"total": total, "completed": completed, "rate": round(rate, 2)}


def _score_document_timeliness(db, intern_id: int) -> tuple[float, dict]:
    """Score based on document submission and verification status."""
    from app.models.document import Document

    docs = db.query(Document).filter(Document.intern_id == intern_id).all()
    if not docs:
        return 0.0, {"total": 0, "verified": 0, "pending": 0, "rejected": 0}

    verified = sum(1 for d in docs if d.status == "verified")
    pending = sum(1 for d in docs if d.status == "pending")
    rejected = sum(1 for d in docs if d.status == "rejected")
    total = len(docs)

    # Verified docs get full credit, pending gets half, rejected gets none
    score = ((verified * 1.0 + pending * 0.5) / total) * 100 if total else 0
    return score, {
        "total": total,
        "verified": verified,
        "pending": pending,
        "rejected": rejected,
    }


def _score_diary_consistency(db, intern_id: int) -> tuple[float, dict]:
    """Score based on how consistently the intern writes diary entries."""
    from app.models.diary import DiaryEntry
    from app.models.intern_profile import InternProfile

    profile = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not profile or not profile.joining_date:
        entries = db.query(DiaryEntry).filter(DiaryEntry.intern_id == intern_id).all()
        total_days = 30  # fallback
    else:
        entries = db.query(DiaryEntry).filter(DiaryEntry.intern_id == intern_id).all()
        delta = datetime.utcnow().date() - profile.joining_date
        total_days = max(delta.days, 1)

    # Only count weekdays
    weekdays = max(total_days * 5 / 7, 1)
    entry_count = len(entries)
    rate = min(entry_count / weekdays, 1.0)
    return rate * 100, {
        "entries_written": entry_count,
        "expected_days": int(weekdays),
        "rate": round(rate, 2),
    }


def _score_sentiment_trend(db, intern_id: int) -> tuple[float, dict]:
    """Score based on overall sentiment of diary entries."""
    from app.models.diary import DiaryEntry

    entries = (
        db.query(DiaryEntry)
        .filter(DiaryEntry.intern_id == intern_id)
        .order_by(DiaryEntry.date)
        .all()
    )
    if not entries:
        return 50.0, {"mood": "neutral", "direction": "stable"}

    try:
        sa = _get_sentiment_analyzer()
        trend = sa.get_sentiment_trend(entries)
        if not trend:
            return 50.0, {"mood": "neutral", "direction": "stable"}

        # Map polarity (-1..1) to 0..100
        overall_polarity = sum(
            w["avg_polarity"] for w in trend["weekly_averages"]
        ) / len(trend["weekly_averages"])
        score = (overall_polarity + 1) / 2 * 100  # normalize to 0-100
        # Bonus for improving trend
        if trend["trend_direction"] == "improving":
            score = min(score + 10, 100)
        elif trend["trend_direction"] == "declining":
            score = max(score - 10, 0)

        return round(score, 2), {
            "mood": trend["overall_mood"],
            "direction": trend["trend_direction"],
        }
    except Exception:
        return 50.0, {"mood": "neutral", "direction": "stable"}


def _score_checklist_progress(db, intern_id: int) -> tuple[float, dict]:
    """Score based on onboarding checklist completion."""
    from app.models.checklist import ChecklistItem

    items = db.query(ChecklistItem).filter(ChecklistItem.intern_id == intern_id).all()
    if not items:
        return 0.0, {"total": 0, "completed": 0}

    completed = sum(1 for item in items if item.is_completed)
    total = len(items)
    score = (completed / total) * 100 if total else 0
    return score, {"total": total, "completed": completed}


def _generate_recommendations(breakdown: dict) -> list[str]:
    """Generate actionable recommendations based on weak areas."""
    recs = []
    threshold = 60

    if breakdown["task_completion"]["score"] < threshold:
        recs.append(
            "Your task completion rate is low. Focus on finishing assigned tasks "
            "before taking new ones. Break large tasks into smaller steps."
        )
    if breakdown["document_timeliness"]["score"] < threshold:
        recs.append(
            "Some documents are still pending or rejected. Upload required "
            "documents promptly to keep your profile up to date."
        )
    if breakdown["diary_consistency"]["score"] < threshold:
        recs.append(
            "Your diary consistency is low. Try writing a brief diary entry "
            "every working day to build a habit and track your progress."
        )
    if breakdown["sentiment_trend"]["score"] < threshold:
        recs.append(
            "Your recent sentiment trend suggests some challenges. Consider "
            "discussing any blockers with your guide or coordinator."
        )
    if breakdown["checklist_progress"]["score"] < threshold:
        recs.append(
            "Your onboarding checklist is incomplete. Complete remaining "
            "checklist items to ensure a smooth internship experience."
        )
    if not recs:
        recs.append("Great job! Keep up the consistent performance.")

    return recs


def calculate_performance_score(db, intern_id: int) -> dict:
    """
    Calculate a weighted performance score (0-100) for an intern.

    Returns:
        dict with total score, per-factor breakdown, and recommendations.
    """
    scorers = {
        "task_completion": _score_task_completion,
        "document_timeliness": _score_document_timeliness,
        "diary_consistency": _score_diary_consistency,
        "sentiment_trend": _score_sentiment_trend,
        "checklist_progress": _score_checklist_progress,
    }

    breakdown = {}
    total_score = 0.0

    for factor, scorer_fn in scorers.items():
        raw_score, details = scorer_fn(db, intern_id)
        weighted = raw_score * WEIGHTS[factor]
        total_score += weighted
        breakdown[factor] = {
            "score": round(raw_score, 2),
            "weight": WEIGHTS[factor],
            "weighted_score": round(weighted, 2),
            "details": details,
        }

    recommendations = _generate_recommendations(breakdown)

    return {
        "intern_id": intern_id,
        "total_score": round(total_score, 2),
        "grade": (
            "A" if total_score >= 85 else
            "B" if total_score >= 70 else
            "C" if total_score >= 55 else
            "D" if total_score >= 40 else "F"
        ),
        "breakdown": breakdown,
        "recommendations": recommendations,
    }
