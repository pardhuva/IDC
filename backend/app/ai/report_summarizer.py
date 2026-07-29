"""
Smart Report Summarizer Module
Extractive summarization using TF-IDF sentence scoring.
Also provides keyword extraction from TF-IDF top terms.
"""

import re
import math
from collections import Counter

# ---------------------------------------------------------------------------
# Text utilities
# ---------------------------------------------------------------------------

_STOP_WORDS = set(
    "i me my myself we our ours ourselves you your yours yourself yourselves "
    "he him his himself she her hers herself it its itself they them their "
    "theirs themselves what which who whom this that these those am is are was "
    "were be been being have has had having do does did doing a an the and but "
    "if or because as until while of at by for with about against between "
    "through during before after above below to from up down in out on off "
    "over under again further then once here there when where why how all both "
    "each few more most other some such no nor not only own same so than too "
    "very s t can will just don should now d ll m o re ve y ain aren couldn "
    "didn doesn hadn hasn haven isn ma mightn mustn needn shan shouldn wasn "
    "weren won wouldn".split()
)


def _tokenize_sentences(text: str) -> list[str]:
    """Split text into sentences using regex."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 10]


def _tokenize_words(text: str) -> list[str]:
    """Lowercase word tokenization, filtering stop words and short tokens."""
    words = re.findall(r'[a-zA-Z]{2,}', text.lower())
    return [w for w in words if w not in _STOP_WORDS]


# ---------------------------------------------------------------------------
# TF-IDF helpers
# ---------------------------------------------------------------------------

def _compute_tf(words: list[str]) -> dict[str, float]:
    counts = Counter(words)
    total = len(words)
    return {w: c / total for w, c in counts.items()} if total else {}


def _compute_idf(sentence_word_lists: list[list[str]]) -> dict[str, float]:
    n = len(sentence_word_lists)
    doc_freq: Counter = Counter()
    for wl in sentence_word_lists:
        doc_freq.update(set(wl))
    return {w: math.log((n + 1) / (df + 1)) + 1 for w, df in doc_freq.items()}


def _score_sentences(sentences: list[str]) -> list[tuple[int, float, str]]:
    """Return (index, score, sentence) tuples sorted by score descending."""
    word_lists = [_tokenize_words(s) for s in sentences]
    idf = _compute_idf(word_lists)
    scored = []
    for idx, (sent, words) in enumerate(zip(sentences, word_lists)):
        tf = _compute_tf(words)
        score = sum(tf.get(w, 0) * idf.get(w, 0) for w in set(words))
        scored.append((idx, score, sent))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def summarize_text(text: str, num_sentences: int = 3) -> str:
    """
    Extractive summarization: pick the top-N TF-IDF scored sentences
    and return them in their original order.
    """
    sentences = _tokenize_sentences(text)
    if len(sentences) <= num_sentences:
        return text.strip()

    scored = _score_sentences(sentences)
    top_indices = sorted([s[0] for s in scored[:num_sentences]])
    return " ".join(sentences[i] for i in top_indices)


def extract_keywords(text: str, top_n: int = 8) -> list[str]:
    """Extract the top-N keywords from text using TF-IDF."""
    sentences = _tokenize_sentences(text)
    if not sentences:
        return []
    word_lists = [_tokenize_words(s) for s in sentences]
    idf = _compute_idf(word_lists)
    all_words = [w for wl in word_lists for w in wl]
    tf = _compute_tf(all_words)
    tfidf = {w: tf[w] * idf.get(w, 0) for w in tf}
    ranked = sorted(tfidf.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in ranked[:top_n]]


def summarize_weekly_reports(reports: list) -> dict:
    """
    Summarize a list of WeeklyReport model objects.

    Returns dict with per-report summaries, combined summary, and keywords.
    """
    per_report = []
    combined_text_parts = []

    for report in reports:
        text = report.summary or ""
        if not text.strip():
            continue
        summary = summarize_text(text, num_sentences=2)
        keywords = extract_keywords(text, top_n=5)
        per_report.append({
            "week_start": str(report.week_start),
            "week_end": str(report.week_end),
            "summary": summary,
            "keywords": keywords,
            "status": report.status,
        })
        combined_text_parts.append(text)

    combined_text = " ".join(combined_text_parts)
    overall_summary = summarize_text(combined_text, num_sentences=3) if combined_text.strip() else ""
    overall_keywords = extract_keywords(combined_text, top_n=10) if combined_text.strip() else []

    return {
        "report_count": len(per_report),
        "per_report": per_report,
        "overall_summary": overall_summary,
        "overall_keywords": overall_keywords,
    }
