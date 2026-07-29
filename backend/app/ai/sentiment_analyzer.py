"""
Sentiment Analysis Module for Intern Diary Entries
Uses TextBlob for polarity/subjectivity scoring and mood classification.
Tracks sentiment trends over time with weekly averages.
"""

from datetime import datetime, timedelta
from collections import defaultdict

# Lazy imports
_textblob = None


def _get_textblob():
    global _textblob
    if _textblob is None:
        from textblob import TextBlob
        _textblob = TextBlob
    return _textblob


def _classify_mood(polarity: float) -> str:
    """Map polarity score to a mood label."""
    if polarity <= -0.6:
        return "very_negative"
    elif polarity <= -0.2:
        return "negative"
    elif polarity <= 0.2:
        return "neutral"
    elif polarity <= 0.6:
        return "positive"
    else:
        return "very_positive"


def analyze_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of a text string.

    Returns:
        dict with polarity (-1 to 1), subjectivity (0 to 1), and mood label.
    """
    TextBlob = _get_textblob()
    blob = TextBlob(text)
    polarity = round(blob.sentiment.polarity, 4)
    subjectivity = round(blob.sentiment.subjectivity, 4)
    mood = _classify_mood(polarity)
    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "mood": mood,
    }


def get_sentiment_trend(diary_entries: list) -> list[dict]:
    """
    Compute weekly sentiment averages from a list of diary entry objects.

    Each entry must have `.date`, `.activities`, `.learning_outcomes`, `.challenges`.

    Returns:
        List of weekly summary dicts sorted by week_start, plus an overall
        trend direction string appended as metadata in the last element.
    """
    if not diary_entries:
        return []

    # Analyse each entry
    scored_entries = []
    for entry in diary_entries:
        parts = []
        if entry.activities:
            parts.append(entry.activities)
        if entry.learning_outcomes:
            parts.append(entry.learning_outcomes)
        if entry.challenges:
            parts.append(entry.challenges)
        text = " ".join(parts) if parts else ""
        if not text.strip():
            continue
        result = analyze_sentiment(text)
        scored_entries.append({
            "date": entry.date,
            "polarity": result["polarity"],
            "subjectivity": result["subjectivity"],
            "mood": result["mood"],
        })

    if not scored_entries:
        return []

    # Group by ISO week
    weekly: dict[str, list] = defaultdict(list)
    for se in scored_entries:
        d = se["date"] if isinstance(se["date"], datetime) else datetime.combine(se["date"], datetime.min.time())
        # Monday of that week
        week_start = d - timedelta(days=d.weekday())
        key = week_start.strftime("%Y-%m-%d")
        weekly[key].append(se)

    trend_data = []
    for week_key in sorted(weekly.keys()):
        entries = weekly[week_key]
        avg_polarity = round(sum(e["polarity"] for e in entries) / len(entries), 4)
        avg_subjectivity = round(sum(e["subjectivity"] for e in entries) / len(entries), 4)
        trend_data.append({
            "week_start": week_key,
            "avg_polarity": avg_polarity,
            "avg_subjectivity": avg_subjectivity,
            "mood": _classify_mood(avg_polarity),
            "entry_count": len(entries),
        })

    # Determine overall trend direction
    if len(trend_data) >= 2:
        first_half = trend_data[: len(trend_data) // 2]
        second_half = trend_data[len(trend_data) // 2:]
        avg_first = sum(w["avg_polarity"] for w in first_half) / len(first_half)
        avg_second = sum(w["avg_polarity"] for w in second_half) / len(second_half)
        diff = avg_second - avg_first
        if diff > 0.1:
            direction = "improving"
        elif diff < -0.1:
            direction = "declining"
        else:
            direction = "stable"
    else:
        direction = "stable"

    return {
        "weekly_averages": trend_data,
        "trend_direction": direction,
        "overall_mood": _classify_mood(
            sum(w["avg_polarity"] for w in trend_data) / len(trend_data)
        ),
        "total_entries_analyzed": sum(w["entry_count"] for w in trend_data),
    }
