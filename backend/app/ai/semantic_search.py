"""
AI Semantic Search using Sentence-Transformers + FAISS.

Encodes all campus data (offices, FAQs, contacts, announcements) into
dense vectors and serves cosine-similarity search over them.
"""

import time
from typing import Optional

import numpy as np
from sqlalchemy.orm import Session

from app.models.campus import OfficeLocation, Announcement
from app.models.faq import FAQ
from app.models.contact import Contact

# ---------------------------------------------------------------------------
# Module-level cache
# ---------------------------------------------------------------------------
_model = None
_index = None
_metadata: list[dict] = []
_index_built_at: float = 0.0
_INDEX_TTL_SECONDS: int = 10 * 60  # rebuild every 10 minutes at most


def _get_model():
    """Lazy-load and cache the sentence-transformer model."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_faiss():
    """Lazy-import faiss."""
    import faiss
    return faiss


# ---------------------------------------------------------------------------
# Text representations
# ---------------------------------------------------------------------------

def _office_text(o: OfficeLocation) -> str:
    return (
        f"{o.name}. {o.purpose or ''}. "
        f"Building: {o.building or 'N/A'}, Floor: {o.floor or 'N/A'}. "
        f"Timings: {o.timings or 'N/A'}. "
        f"Required: {o.required_documents or 'None'}. "
        f"Rules: {o.entry_rules or 'None'}"
    )


def _faq_text(f: FAQ) -> str:
    return f"{f.question}. {f.answer}"


def _contact_text(c: Contact) -> str:
    return (
        f"{c.name}, {c.designation or ''}, {c.department or ''}. "
        f"Phone: {c.phone or 'N/A'}, Email: {c.email or 'N/A'}"
    )


def _announcement_text(a: Announcement) -> str:
    return f"{a.title}. {a.content or ''}"


# ---------------------------------------------------------------------------
# Index building
# ---------------------------------------------------------------------------

def build_index(db: Session) -> tuple:
    """
    Fetch all searchable records, encode them, and build a FAISS index.
    Returns (index, metadata_list).
    """
    model = _get_model()

    texts: list[str] = []
    metadata: list[dict] = []

    # Office locations
    for o in db.query(OfficeLocation).filter(OfficeLocation.is_active == True).all():
        texts.append(_office_text(o))
        metadata.append({
            "type": "office",
            "id": o.id,
            "title": o.name,
            "snippet": _office_text(o),
        })

    # FAQs
    for f in db.query(FAQ).filter(FAQ.is_active == True).all():
        texts.append(_faq_text(f))
        metadata.append({
            "type": "faq",
            "id": f.id,
            "title": f.question,
            "snippet": _faq_text(f),
        })

    # Contacts
    for c in db.query(Contact).filter(Contact.is_active == True).all():
        texts.append(_contact_text(c))
        metadata.append({
            "type": "contact",
            "id": c.id,
            "title": c.name,
            "snippet": _contact_text(c),
        })

    # Announcements
    for a in db.query(Announcement).filter(Announcement.is_active == True).all():
        texts.append(_announcement_text(a))
        metadata.append({
            "type": "announcement",
            "id": a.id,
            "title": a.title,
            "snippet": _announcement_text(a),
        })

    if not texts:
        # Return an empty index if no data
        faiss = _get_faiss()
        dim = model.get_sentence_embedding_dimension()
        index = faiss.IndexFlatIP(dim)
        return index, []

    faiss = _get_faiss()
    # Encode and normalise so inner product == cosine similarity
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    embeddings = embeddings.astype(np.float32)
    faiss.normalize_L2(embeddings)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    return index, metadata


def rebuild_index(db: Session) -> None:
    """Force an immediate rebuild of the cached index."""
    global _index, _metadata, _index_built_at
    _index, _metadata = build_index(db)
    _index_built_at = time.time()


def _ensure_index(db: Session) -> None:
    """Build the index if it doesn't exist or if it has expired."""
    global _index, _metadata, _index_built_at
    now = time.time()
    if _index is None or (now - _index_built_at) > _INDEX_TTL_SECONDS:
        rebuild_index(db)


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

def search(query: str, db: Session, top_k: int = 5) -> list[dict]:
    """
    Semantic search across all campus data.
    Returns a list of dicts: {type, id, title, snippet, score}.
    """
    _ensure_index(db)

    if _index is None or _index.ntotal == 0:
        return []

    model = _get_model()
    q_emb = model.encode([query], convert_to_numpy=True, show_progress_bar=False)
    faiss = _get_faiss()
    q_emb = q_emb.astype(np.float32)
    faiss.normalize_L2(q_emb)

    k = min(top_k, _index.ntotal)
    scores, indices = _index.search(q_emb, k)

    results: list[dict] = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        entry = _metadata[idx].copy()
        entry["score"] = float(score)
        results.append(entry)

    return results
