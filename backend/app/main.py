import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.core.config import settings

# Import all models so they are registered before create_all
from app.models import user  # noqa: F401
from app.models import intern_profile  # noqa: F401
from app.models import document  # noqa: F401
from app.models import checklist  # noqa: F401
from app.models import campus  # noqa: F401
from app.models import faq  # noqa: F401
from app.models import guide_assignment  # noqa: F401
from app.models import project  # noqa: F401
from app.models import task  # noqa: F401
from app.models import diary  # noqa: F401
from app.models import weekly_report  # noqa: F401
from app.models import notification  # noqa: F401
from app.models import contact  # noqa: F401
from app.models import event  # noqa: F401
from app.models import article  # noqa: F401
from app.models import feedback
from app.models import leave_request  # noqa: F401
from app.models import message  # noqa: F401  # noqa: F401

from app.routers import (
    auth,
    intern,
    documents,
    checklist as checklist_router,
    campus,
    faq,
    guide,
    projects,
    tasks,
    diary,
    weekly_reports,
    notifications,
    ai_intent,
    ai_search,
    ai_sentiment,
    ai_reports,
    ai_performance,
    ai_predictor,
    events,
    articles,
    feedback,
    certificate,
    leave_requests,
    messages,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intern Digital Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(intern.router)
app.include_router(documents.router)
app.include_router(checklist_router.router)
app.include_router(campus.router)
app.include_router(faq.router)
app.include_router(guide.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(diary.router)
app.include_router(weekly_reports.router)
app.include_router(notifications.router)
app.include_router(ai_intent.router)
app.include_router(ai_search.router)
app.include_router(ai_sentiment.router)
app.include_router(ai_reports.router)
app.include_router(ai_performance.router)
app.include_router(ai_predictor.router)
app.include_router(events.router)
app.include_router(articles.router)
app.include_router(feedback.router)
app.include_router(certificate.router)
app.include_router(leave_requests.router)
app.include_router(messages.router)


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve ML evaluation charts as static files
_charts_dir = Path(__file__).resolve().parent.parent / "report_charts"
if _charts_dir.is_dir():
    app.mount("/charts", StaticFiles(directory=str(_charts_dir)), name="charts")


@app.get("/api/ml-metrics")
def get_ml_metrics():
    """Return all ML evaluation metrics for the charts page."""
    import os
    charts_dir = Path(__file__).resolve().parent.parent / "report_charts"
    metrics = {}
    for txt_file in ["intent_classification_report.txt", "semantic_search_evaluation.txt",
                     "sentiment_analysis_evaluation.txt", "workload_predictor_evaluation.txt",
                     "tfidf_summarizer_example.txt"]:
        fp = charts_dir / txt_file
        if fp.exists():
            metrics[txt_file.replace(".txt", "")] = fp.read_text(encoding="utf-8")
    charts = []
    if charts_dir.is_dir():
        for f in sorted(os.listdir(charts_dir)):
            if f.endswith(".png"):
                charts.append(f"/charts/{f}")
    return {"metrics": metrics, "charts": charts}


# Serve built frontend in production
_frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if _frontend_dist.is_dir():
    from fastapi.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=str(_frontend_dist / "assets")), name="static")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = _frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(
            str(_frontend_dist / "index.html"),
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
        )
