"""
Generate all ML evaluation charts and metrics for the BTP report.

Run:
    cd backend
    venv\\Scripts\\python.exe generate_report_charts.py

Output: backend/report_charts/ folder with all PNG charts and metrics.txt
"""

import sys, os, warnings
sys.path.insert(0, ".")
os.environ.setdefault("DATABASE_URL", "sqlite:///./idc.db")
warnings.filterwarnings("ignore")

import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "report_charts")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def save(fig, name):
    path = os.path.join(OUTPUT_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="white")
    print(f"  Saved: {path}")
    import matplotlib.pyplot as plt
    plt.close(fig)


# ══════════════════════════════════════════════════════════════════════════════
# 1. INTENT CLASSIFICATION — Confusion Matrix + Classification Report
# ══════════════════════════════════════════════════════════════════════════════
def chart_intent_classification():
    print("\n[1/7] Intent Classification Evaluation...")
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import cross_val_predict, cross_val_score
    from sklearn.metrics import classification_report, confusion_matrix
    import matplotlib.pyplot as plt
    import seaborn as sns

    from app.ai.intent_classifier import INTENT_DATA

    texts, labels = [], []
    for intent, examples in INTENT_DATA.items():
        for ex in examples:
            texts.append(ex)
            labels.append(intent)

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    X = vectorizer.fit_transform(texts)

    clf = LogisticRegression(max_iter=1000, random_state=42)

    # 5-fold cross-validation
    cv_scores = cross_val_score(clf, X, labels, cv=5, scoring="accuracy")
    y_pred = cross_val_predict(clf, X, labels, cv=5)

    # Full training for feature analysis
    clf.fit(X, labels)
    class_names = list(clf.classes_)

    # Classification report
    report = classification_report(y_pred=y_pred, y_true=labels, output_dict=True)
    report_text = classification_report(y_pred=y_pred, y_true=labels)

    with open(os.path.join(OUTPUT_DIR, "intent_classification_report.txt"), "w", encoding="utf-8") as f:
        f.write("INTENT CLASSIFICATION — 5-Fold Cross-Validation Results\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Model: TF-IDF (ngram 1-2, max 5000 features) + Logistic Regression\n")
        f.write(f"Dataset: {len(texts)} samples across {len(INTENT_DATA)} intent classes\n")
        f.write(f"Samples per class: {len(texts) // len(INTENT_DATA)}\n\n")
        f.write(f"Cross-Validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})\n")
        f.write(f"Per-fold scores: {[f'{s:.4f}' for s in cv_scores]}\n\n")
        f.write("Classification Report:\n")
        f.write(report_text)
    print(f"  CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # Confusion Matrix
    cm = confusion_matrix(labels, y_pred, labels=class_names)
    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=class_names,
                yticklabels=class_names, ax=ax, linewidths=0.5)
    ax.set_xlabel("Predicted Intent", fontsize=12, fontweight="bold")
    ax.set_ylabel("True Intent", fontsize=12, fontweight="bold")
    ax.set_title(f"Intent Classification — Confusion Matrix\n5-Fold CV Accuracy: {cv_scores.mean():.2%}", fontsize=14, fontweight="bold")
    plt.xticks(rotation=45, ha="right", fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    save(fig, "1_intent_confusion_matrix.png")

    # Per-class accuracy bar chart
    fig, ax = plt.subplots(figsize=(12, 5))
    precisions = [report[c]["precision"] for c in class_names]
    recalls = [report[c]["recall"] for c in class_names]
    f1s = [report[c]["f1-score"] for c in class_names]
    x = np.arange(len(class_names))
    w = 0.25
    ax.bar(x - w, precisions, w, label="Precision", color="#2a7de1")
    ax.bar(x, recalls, w, label="Recall", color="#f6a821")
    ax.bar(x + w, f1s, w, label="F1-Score", color="#38a169")
    ax.set_xticks(x)
    ax.set_xticklabels(class_names, rotation=45, ha="right", fontsize=9)
    ax.set_ylabel("Score")
    ax.set_ylim(0, 1.1)
    ax.set_title("Intent Classification — Per-Class Precision / Recall / F1", fontsize=13, fontweight="bold")
    ax.legend()
    for i in range(len(class_names)):
        ax.text(i, f1s[i] + 0.02, f"{f1s[i]:.2f}", ha="center", fontsize=8)
    save(fig, "1_intent_per_class_metrics.png")

    # TF-IDF Feature importance (top words per intent)
    feature_names = vectorizer.get_feature_names_out()
    fig, axes = plt.subplots(2, 5, figsize=(20, 8))
    for idx, (intent, ax) in enumerate(zip(class_names, axes.flat)):
        coef = clf.coef_[idx]
        top_idx = np.argsort(coef)[-10:]
        top_words = [feature_names[i] for i in top_idx]
        top_vals = coef[top_idx]
        ax.barh(top_words, top_vals, color="#003580")
        ax.set_title(intent.replace("_", " ").title(), fontsize=9, fontweight="bold")
        ax.tick_params(labelsize=7)
    fig.suptitle("Top 10 TF-IDF Features Per Intent Class (Logistic Regression Coefficients)", fontsize=14, fontweight="bold")
    plt.tight_layout()
    save(fig, "1_intent_top_features.png")


# ══════════════════════════════════════════════════════════════════════════════
# 2. SEMANTIC SEARCH — Embedding Visualization + Retrieval Accuracy
# ══════════════════════════════════════════════════════════════════════════════
def chart_semantic_search():
    print("\n[2/7] Semantic Search Evaluation...")
    import matplotlib.pyplot as plt
    from sklearn.manifold import TSNE
    from app.core.database import SessionLocal
    from app.models.campus import OfficeLocation, Announcement
    from app.models.faq import FAQ
    from app.models.contact import Contact

    db = SessionLocal()

    # Collect all texts and their types
    texts, types, labels = [], [], []
    for o in db.query(OfficeLocation).filter(OfficeLocation.is_active == True).all():
        texts.append(f"{o.name}. {o.purpose or ''}")
        types.append("Office")
        labels.append(o.name[:20])
    for f in db.query(FAQ).filter(FAQ.is_active == True).all():
        texts.append(f"{f.question}. {f.answer}")
        types.append("FAQ")
        labels.append(f.question[:20])
    for c in db.query(Contact).filter(Contact.is_active == True).all():
        texts.append(f"{c.name}, {c.designation or ''}")
        types.append("Contact")
        labels.append(c.name[:20])
    for a in db.query(Announcement).filter(Announcement.is_active == True).all():
        texts.append(f"{a.title}. {a.content or ''}")
        types.append("Announcement")
        labels.append(a.title[:20])

    print(f"  Total documents: {len(texts)} (Offices: {types.count('Office')}, FAQs: {types.count('FAQ')}, Contacts: {types.count('Contact')}, Announcements: {types.count('Announcement')})")

    # Generate embeddings
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(texts, show_progress_bar=False)

    # t-SNE visualization
    perplexity = min(5, len(texts) - 1)
    tsne = TSNE(n_components=2, random_state=42, perplexity=perplexity)
    coords = tsne.fit_transform(embeddings)

    type_colors = {"Office": "#003580", "FAQ": "#FF671F", "Contact": "#38a169", "Announcement": "#d69e2e"}
    fig, ax = plt.subplots(figsize=(12, 8))
    for t in ["Office", "FAQ", "Contact", "Announcement"]:
        mask = [i for i, tp in enumerate(types) if tp == t]
        if mask:
            ax.scatter(coords[mask, 0], coords[mask, 1], label=f"{t} ({len(mask)})",
                      color=type_colors[t], s=80, alpha=0.8, edgecolors="white", linewidth=0.5)
    ax.set_title("Semantic Search — t-SNE Embedding Visualization\nall-MiniLM-L6-v2 (384-dim) -> 2D", fontsize=14, fontweight="bold")
    ax.set_xlabel("t-SNE Dimension 1")
    ax.set_ylabel("t-SNE Dimension 2")
    ax.legend(fontsize=11, loc="best")
    ax.grid(True, alpha=0.3)
    save(fig, "2_semantic_tsne_embeddings.png")

    # Retrieval accuracy test
    test_queries = {
        "where is the launch pad": "First Launch Pad (FLP)",
        "canteen food timings": "Mess / Canteen",
        "wifi password": "IT / Computer Centre",
        "medical help emergency": "Medical Centre",
        "library books borrow": "SHAR Library",
        "how to get ID card": "Main Gate & Security",
        "vehicle assembly building": "Vehicle Assembly Building (VAB)",
        "mission control centre": "Mission Control Centre (MCC)",
    }

    import faiss
    emb = embeddings.astype(np.float32)
    faiss.normalize_L2(emb)
    dim = emb.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(emb)

    results_log = []
    correct_top1, correct_top3, correct_top5 = 0, 0, 0
    for query, expected in test_queries.items():
        q_emb = model.encode([query]).astype(np.float32)
        faiss.normalize_L2(q_emb)
        scores, indices = index.search(q_emb, 5)
        top_results = [labels[i] for i in indices[0] if i != -1]
        top_scores = [float(scores[0][j]) for j in range(len(indices[0])) if indices[0][j] != -1]

        hit1 = expected[:20] in top_results[0] if top_results else False
        hit3 = any(expected[:20] in r for r in top_results[:3])
        hit5 = any(expected[:20] in r for r in top_results[:5])
        correct_top1 += int(hit1)
        correct_top3 += int(hit3)
        correct_top5 += int(hit5)
        results_log.append(f"  Q: '{query}' -> Top1: '{top_results[0] if top_results else 'N/A'}' (score: {top_scores[0]:.3f}) | Expected: '{expected[:20]}' | Hit@1: {'YES' if hit1 else 'NO'}")

    n = len(test_queries)
    with open(os.path.join(OUTPUT_DIR, "semantic_search_evaluation.txt"), "w", encoding="utf-8") as f:
        f.write("SEMANTIC SEARCH — Retrieval Accuracy Evaluation\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Model: all-MiniLM-L6-v2 (22M params, 384-dim embeddings)\n")
        f.write(f"Index: FAISS IndexFlatIP (cosine similarity via normalized inner product)\n")
        f.write(f"Corpus: {len(texts)} documents ({types.count('Office')} offices, {types.count('FAQ')} FAQs, {types.count('Contact')} contacts, {types.count('Announcement')} announcements)\n\n")
        f.write(f"Test queries: {n}\n")
        f.write(f"Hit@1 (Top-1 Accuracy): {correct_top1}/{n} = {correct_top1/n:.2%}\n")
        f.write(f"Hit@3 (Top-3 Accuracy): {correct_top3}/{n} = {correct_top3/n:.2%}\n")
        f.write(f"Hit@5 (Top-5 Accuracy): {correct_top5}/{n} = {correct_top5/n:.2%}\n\n")
        f.write("Detailed Results:\n")
        for line in results_log:
            f.write(line + "\n")
    print(f"  Hit@1: {correct_top1/n:.2%}, Hit@3: {correct_top3/n:.2%}, Hit@5: {correct_top5/n:.2%}")

    # Bar chart for retrieval accuracy
    fig, ax = plt.subplots(figsize=(8, 5))
    metrics = ["Hit@1", "Hit@3", "Hit@5"]
    values = [correct_top1/n*100, correct_top3/n*100, correct_top5/n*100]
    bars = ax.bar(metrics, values, color=["#003580", "#FF671F", "#38a169"], width=0.5)
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(0, 110)
    ax.set_title("Semantic Search — Retrieval Accuracy\n(FAISS Cosine Similarity on 8 Test Queries)", fontsize=13, fontweight="bold")
    for bar, v in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, v + 2, f"{v:.1f}%", ha="center", fontweight="bold")
    save(fig, "2_semantic_retrieval_accuracy.png")

    db.close()


# ══════════════════════════════════════════════════════════════════════════════
# 3. SENTIMENT ANALYSIS — Polarity Distribution + Validation
# ══════════════════════════════════════════════════════════════════════════════
def chart_sentiment_analysis():
    print("\n[3/7] Sentiment Analysis Evaluation...")
    import matplotlib.pyplot as plt
    from app.ai.sentiment_analyzer import analyze_sentiment, _classify_mood

    # Validation dataset: text + expected mood
    validation_data = [
        ("Today was an amazing day, learned so much about PSLV systems. Very exciting!", "positive"),
        ("Great progress on the telemetry parser. Guide was very helpful and encouraging.", "positive"),
        ("Incredible experience at the launch pad. I feel so grateful to be here!", "very_positive"),
        ("The canteen food was good, had a productive meeting with my team.", "positive"),
        ("Wonderful day! Successfully completed the data pipeline ahead of schedule.", "very_positive"),
        ("Normal day, attended some meetings and worked on documentation.", "neutral"),
        ("Routine work today, nothing special happened. Read some papers.", "neutral"),
        ("Average day at the office. Did some coding and testing.", "neutral"),
        ("Had a regular day, attended orientation session about safety protocols.", "neutral"),
        ("Today was okay, worked on the assigned tasks as planned.", "neutral"),
        ("Struggled with the code today, spent hours debugging a single issue.", "negative"),
        ("Feeling a bit overwhelmed with the workload. Too many tasks pending.", "negative"),
        ("The project requirements changed again, very frustrating experience.", "negative"),
        ("Not a great day, my code kept failing and I couldn't figure out why.", "negative"),
        ("Terrible day. Nothing worked, internet was down, couldn't access any resources.", "very_negative"),
    ]

    results = []
    for text, expected in validation_data:
        pred = analyze_sentiment(text)
        results.append({
            "text": text[:60],
            "expected": expected,
            "predicted": pred["mood"],
            "polarity": pred["polarity"],
            "subjectivity": pred["subjectivity"],
            "correct": pred["mood"] == expected or (
                # Allow adjacent categories as "close"
                abs(["very_negative", "negative", "neutral", "positive", "very_positive"].index(pred["mood"]) -
                    ["very_negative", "negative", "neutral", "positive", "very_positive"].index(expected)) <= 1
            )
        })

    exact_match = sum(1 for r in results if r["predicted"] == r["expected"])
    close_match = sum(1 for r in results if r["correct"])

    with open(os.path.join(OUTPUT_DIR, "sentiment_analysis_evaluation.txt"), "w", encoding="utf-8") as f:
        f.write("SENTIMENT ANALYSIS — Validation Results\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Model: TextBlob (rule-based + pattern-based NLP)\n")
        f.write(f"Output: Polarity (-1 to +1), Subjectivity (0 to 1), Mood classification\n")
        f.write(f"Mood categories: very_negative, negative, neutral, positive, very_positive\n\n")
        f.write(f"Test samples: {len(results)}\n")
        f.write(f"Exact match accuracy: {exact_match}/{len(results)} = {exact_match/len(results):.2%}\n")
        f.write(f"Adjacent match accuracy (±1 class): {close_match}/{len(results)} = {close_match/len(results):.2%}\n\n")
        f.write(f"{'Text':<62} {'Expected':<16} {'Predicted':<16} {'Polarity':>8} {'Match'}\n")
        f.write("-" * 110 + "\n")
        for r in results:
            match = "EXACT" if r["predicted"] == r["expected"] else ("CLOSE" if r["correct"] else "MISS")
            f.write(f"{r['text']:<62} {r['expected']:<16} {r['predicted']:<16} {r['polarity']:>8.3f} {match}\n")
    print(f"  Exact: {exact_match/len(results):.2%}, Adjacent: {close_match/len(results):.2%}")

    # Polarity distribution scatter plot
    fig, ax = plt.subplots(figsize=(10, 6))
    mood_colors = {"very_positive": "#38a169", "positive": "#68d391", "neutral": "#d69e2e",
                   "negative": "#fc8181", "very_negative": "#e53e3e"}
    for r in results:
        ax.scatter(r["polarity"], r["subjectivity"],
                  c=mood_colors.get(r["predicted"], "#718096"), s=120,
                  edgecolors="black", linewidth=0.5, zorder=5)
    # Add mood zones
    ax.axvspan(-1, -0.6, alpha=0.08, color="#e53e3e", label="Very Negative")
    ax.axvspan(-0.6, -0.2, alpha=0.08, color="#fc8181", label="Negative")
    ax.axvspan(-0.2, 0.2, alpha=0.08, color="#d69e2e", label="Neutral")
    ax.axvspan(0.2, 0.6, alpha=0.08, color="#68d391", label="Positive")
    ax.axvspan(0.6, 1, alpha=0.08, color="#38a169", label="Very Positive")
    ax.set_xlabel("Polarity Score (-1 to +1)", fontsize=12)
    ax.set_ylabel("Subjectivity Score (0 to 1)", fontsize=12)
    ax.set_title(f"Sentiment Analysis — Polarity vs Subjectivity Distribution\nTextBlob NLP | Accuracy: Exact {exact_match/len(results):.0%}, Adjacent {close_match/len(results):.0%}", fontsize=13, fontweight="bold")
    ax.legend(fontsize=9, loc="upper left")
    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-0.1, 1.1)
    ax.grid(True, alpha=0.3)
    save(fig, "3_sentiment_polarity_distribution.png")

    # Accuracy comparison bar chart
    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.bar(["Exact Match", "Adjacent Match (±1)"],
                 [exact_match/len(results)*100, close_match/len(results)*100],
                 color=["#003580", "#FF671F"], width=0.4)
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(0, 110)
    ax.set_title("Sentiment Analysis — Classification Accuracy", fontsize=13, fontweight="bold")
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 2,
               f"{bar.get_height():.1f}%", ha="center", fontweight="bold")
    save(fig, "3_sentiment_accuracy.png")


# ══════════════════════════════════════════════════════════════════════════════
# 4. PERFORMANCE SCORING — Weight Distribution + Formula Visualization
# ══════════════════════════════════════════════════════════════════════════════
def chart_performance_scoring():
    print("\n[4/7] Performance Scoring Visualization...")
    import matplotlib.pyplot as plt
    from app.ai.performance_scorer import WEIGHTS

    # Pie chart of weight distribution
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    labels = [k.replace("_", " ").title() for k in WEIGHTS.keys()]
    sizes = list(WEIGHTS.values())
    colors = ["#003580", "#FF671F", "#38a169", "#d69e2e", "#e53e3e"]
    explode = [0.05] * len(sizes)
    wedges, texts, autotexts = ax1.pie(sizes, labels=labels, autopct="%1.0f%%",
                                        colors=colors, explode=explode,
                                        textprops={"fontsize": 10}, startangle=90)
    ax1.set_title("Performance Score — Factor Weights", fontsize=13, fontweight="bold")

    # Scoring formula table visualization
    formulas = [
        ("Task Completion", "completed_tasks / total_tasks × 100", "30%"),
        ("Document Timeliness", "(verified×1 + pending×0.5) / total × 100", "20%"),
        ("Diary Consistency", "entries_written / expected_weekdays × 100", "20%"),
        ("Sentiment Trend", "(polarity + 1) / 2 × 100 ± trend_bonus", "15%"),
        ("Checklist Progress", "completed_items / total_items × 100", "15%"),
    ]
    ax2.axis("off")
    table = ax2.table(
        cellText=formulas,
        colLabels=["Factor", "Formula", "Weight"],
        cellLoc="center",
        loc="center",
        colWidths=[0.28, 0.52, 0.12],
    )
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.8)
    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_facecolor("#003580")
            cell.set_text_props(color="white", fontweight="bold")
        else:
            cell.set_facecolor("#f7fafc" if row % 2 == 0 else "white")
    ax2.set_title("Performance Score — Factor Formulas", fontsize=13, fontweight="bold", pad=20)
    plt.tight_layout()
    save(fig, "4_performance_scoring_weights.png")

    # Grade distribution chart
    fig, ax = plt.subplots(figsize=(8, 4))
    grades = ["A (85-100)", "B (70-84)", "C (55-69)", "D (40-54)", "F (0-39)"]
    ranges = [15, 15, 15, 15, 40]
    bars = ax.barh(grades[::-1], ranges[::-1], color=["#e53e3e", "#d69e2e", "#d69e2e", "#38a169", "#003580"])
    ax.set_xlabel("Score Range Width")
    ax.set_title("Performance Grade Distribution", fontsize=13, fontweight="bold")
    save(fig, "4_performance_grade_distribution.png")


# ══════════════════════════════════════════════════════════════════════════════
# 5. WORKLOAD PREDICTOR — Decision Boundary + Feature Importance
# ══════════════════════════════════════════════════════════════════════════════
def chart_workload_predictor():
    print("\n[5/7] Workload Predictor Evaluation...")
    import matplotlib.pyplot as plt
    from app.ai.workload_predictor import _get_model

    model = _get_model()
    feature_names = ["Task Rate", "Diary Rate", "Doc Score", "Checklist Rate",
                     "Time Remaining", "Velocity"]

    # Feature importance (coefficients)
    coefs = model.coef_[0]
    fig, ax = plt.subplots(figsize=(10, 5))
    colors = ["#003580" if c > 0 else "#e53e3e" for c in coefs]
    bars = ax.barh(feature_names, coefs, color=colors)
    ax.set_xlabel("Logistic Regression Coefficient", fontsize=12)
    ax.set_title("Workload Predictor — Feature Importance\n(Logistic Regression Coefficients)", fontsize=13, fontweight="bold")
    ax.axvline(x=0, color="black", linewidth=0.5)
    for bar, v in zip(bars, coefs):
        ax.text(v + (0.1 if v > 0 else -0.3), bar.get_y() + bar.get_height()/2,
               f"{v:.2f}", va="center", fontweight="bold", fontsize=10)
    ax.grid(True, alpha=0.3, axis="x")
    save(fig, "5_workload_feature_importance.png")

    # Training data visualization
    X = np.array([
        [1.0, 1.0, 1.0, 1.0, 0.5, 1.0],
        [0.8, 0.9, 0.9, 0.8, 0.4, 0.8],
        [0.7, 0.8, 0.8, 0.7, 0.6, 0.7],
        [0.5, 0.5, 0.5, 0.5, 0.3, 0.5],
        [0.4, 0.6, 0.6, 0.4, 0.2, 0.4],
        [0.2, 0.3, 0.3, 0.2, 0.1, 0.2],
        [0.1, 0.1, 0.2, 0.1, 0.05, 0.1],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    ])
    y = np.array([1, 1, 1, 1, 0, 0, 0, 0])
    labels_pred = ["On Track" if p == 1 else "Behind" for p in y]

    # Prediction probability curve
    test_points = np.linspace(0, 1, 50)
    probs = []
    for t in test_points:
        vec = np.array([[t, t, t, t, 0.5, t]])
        prob = model.predict_proba(vec)[0][1] * 100
        probs.append(prob)

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(test_points * 100, probs, color="#003580", linewidth=2.5, label="Completion Probability")
    ax.axhline(y=70, color="#38a169", linestyle="--", label="On Track threshold (70%)", alpha=0.7)
    ax.axhline(y=40, color="#e53e3e", linestyle="--", label="Behind Schedule threshold (40%)", alpha=0.7)
    ax.fill_between(test_points * 100, 70, 100, alpha=0.1, color="#38a169")
    ax.fill_between(test_points * 100, 0, 40, alpha=0.1, color="#e53e3e")
    ax.set_xlabel("Overall Progress (%)", fontsize=12)
    ax.set_ylabel("Completion Probability (%)", fontsize=12)
    ax.set_title("Workload Predictor — Completion Probability Curve\nLogistic Regression (6 features, 8 anchor points)", fontsize=13, fontweight="bold")
    ax.legend()
    ax.grid(True, alpha=0.3)
    save(fig, "5_workload_probability_curve.png")

    with open(os.path.join(OUTPUT_DIR, "workload_predictor_evaluation.txt"), "w", encoding="utf-8") as f:
        f.write("WORKLOAD PREDICTOR — Model Details\n")
        f.write("=" * 60 + "\n\n")
        f.write("Model: Logistic Regression (sklearn)\n")
        f.write("Training data: 8 synthetic anchor points (4 positive, 4 negative)\n")
        f.write("Features (6):\n")
        for i, name in enumerate(feature_names):
            f.write(f"  {i+1}. {name}: coefficient = {coefs[i]:.4f}\n")
        f.write(f"\nIntercept: {model.intercept_[0]:.4f}\n")
        f.write(f"\nStatus thresholds:\n")
        f.write(f"  - On Track: probability >= 70%\n")
        f.write(f"  - At Risk: 40% <= probability < 70%\n")
        f.write(f"  - Behind Schedule: probability < 40%\n")


# ══════════════════════════════════════════════════════════════════════════════
# 6. TF-IDF SUMMARIZER — Example Output + Scoring Visualization
# ══════════════════════════════════════════════════════════════════════════════
def chart_tfidf_summarizer():
    print("\n[6/7] TF-IDF Summarizer Evaluation...")
    import matplotlib.pyplot as plt
    from app.ai.report_summarizer import _score_sentences, _tokenize_sentences, extract_keywords

    sample_text = """
    Today I worked on parsing the PSLV-C58 telemetry data files. The raw data format uses CCSDS packets
    which needed to be decoded using the standard specification. I successfully extracted housekeeping
    parameters from the stage-1 solid motor telemetry. The data showed nominal temperature and pressure
    readings throughout the burn phase. I also attended a safety orientation session at the SPROB facility
    where I learned about the solid propellant handling procedures. My guide Dr. Rao explained the importance
    of maintaining clean room standards during motor integration. The highlight of the day was visiting the
    Vehicle Assembly Building where I saw the LVM3 vehicle being integrated for the upcoming Gaganyaan mission.
    I need to complete the data visualization module by next week. The Python scripts for automated parsing
    are almost ready but need more testing with edge cases. Overall it was a very productive and exciting day
    at SDSC SHAR Sriharikota.
    """

    sentences = _tokenize_sentences(sample_text)
    scored = _score_sentences(sentences)
    keywords = extract_keywords(sample_text, top_n=10)

    # Sentence importance bar chart
    fig, ax = plt.subplots(figsize=(12, 6))
    sent_labels = [f"S{s[0]+1}: {s[2][:50]}..." for s in scored]
    sent_scores = [s[1] for s in scored]
    colors = ["#FF671F" if i < 3 else "#003580" for i in range(len(scored))]
    bars = ax.barh(sent_labels[::-1], sent_scores[::-1], color=colors[::-1])
    ax.set_xlabel("TF-IDF Importance Score")
    ax.set_title("TF-IDF Extractive Summarization — Sentence Ranking\n(Orange = selected for summary, Blue = not selected)", fontsize=13, fontweight="bold")
    ax.tick_params(labelsize=8)
    save(fig, "6_tfidf_sentence_ranking.png")

    # Keyword importance
    fig, ax = plt.subplots(figsize=(10, 4))
    kw_scores = []
    from app.ai.report_summarizer import _tokenize_words, _compute_tf, _compute_idf
    word_lists = [_tokenize_words(s) for s in sentences]
    idf = _compute_idf(word_lists)
    all_words = [w for wl in word_lists for w in wl]
    tf = _compute_tf(all_words)
    tfidf = {w: tf[w] * idf.get(w, 0) for w in tf}
    for kw in keywords:
        kw_scores.append(tfidf.get(kw, 0))
    ax.bar(keywords, kw_scores, color="#003580")
    ax.set_ylabel("TF-IDF Score")
    ax.set_title("TF-IDF Keyword Extraction — Top 10 Keywords", fontsize=13, fontweight="bold")
    plt.xticks(rotation=45, ha="right")
    save(fig, "6_tfidf_keywords.png")

    with open(os.path.join(OUTPUT_DIR, "tfidf_summarizer_example.txt"), "w", encoding="utf-8") as f:
        f.write("TF-IDF EXTRACTIVE SUMMARIZER — Example Output\n")
        f.write("=" * 60 + "\n\n")
        f.write("INPUT TEXT:\n" + sample_text.strip() + "\n\n")
        f.write("EXTRACTED SUMMARY (top 3 sentences):\n")
        top3 = sorted(scored[:3], key=lambda x: x[0])
        for s in top3:
            f.write(f"  [{s[1]:.3f}] {s[2]}\n")
        f.write(f"\nEXTRACTED KEYWORDS: {', '.join(keywords)}\n")
        f.write(f"\nALL SENTENCE SCORES:\n")
        for s in scored:
            f.write(f"  S{s[0]+1} (score: {s[1]:.4f}): {s[2][:80]}...\n")


# ══════════════════════════════════════════════════════════════════════════════
# 7. OVERALL MODEL COMPARISON TABLE
# ══════════════════════════════════════════════════════════════════════════════
def chart_model_comparison():
    print("\n[7/7] Overall Model Comparison...")
    import matplotlib.pyplot as plt

    models = [
        ("Semantic Search", "Sentence-Transformers\n+ FAISS", "all-MiniLM-L6-v2\n(22M params)", "384-dim embeddings\n-> cosine similarity"),
        ("Intent Classification", "TF-IDF + Logistic\nRegression", "200 samples\n10 classes", "Multi-class\nclassification"),
        ("Sentiment Analysis", "TextBlob\n(Rule-based NLP)", "Pattern-based\nlexicon", "Polarity &\nSubjectivity"),
        ("Performance Score", "Weighted\nMulti-factor", "5 factors\n5 weights", "Score 0-100\nGrade A-F"),
        ("Workload Predictor", "Logistic\nRegression", "8 anchor points\n6 features", "Probability\n0-100%"),
        ("Report Summarizer", "TF-IDF\nExtractive", "Sentence-level\nscoring", "Top-N sentence\nextraction"),
    ]

    fig, ax = plt.subplots(figsize=(16, 6))
    ax.axis("off")
    table = ax.table(
        cellText=models,
        colLabels=["AI/ML Feature", "Algorithm", "Model / Data", "Output"],
        cellLoc="center",
        loc="center",
        colWidths=[0.22, 0.22, 0.28, 0.22],
    )
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 2.5)
    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_facecolor("#002147")
            cell.set_text_props(color="white", fontweight="bold", fontsize=10)
        else:
            cell.set_facecolor("#f0f4f8" if row % 2 == 0 else "white")
    fig.suptitle("IDC — AI/ML Model Comparison Summary", fontsize=16, fontweight="bold", y=0.98)
    save(fig, "7_model_comparison_table.png")

    # System architecture diagram (text-based)
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.axis("off")
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)

    # Frontend box
    ax.add_patch(plt.Rectangle((0.5, 6), 4, 1.5, facecolor="#FF671F", edgecolor="black", linewidth=2, alpha=0.9, zorder=5))
    ax.text(2.5, 6.75, "FRONTEND\nReact + Vite + React Router", ha="center", va="center", fontsize=10, fontweight="bold", color="white", zorder=10)

    # Backend box
    ax.add_patch(plt.Rectangle((5.5, 6), 4, 1.5, facecolor="#003580", edgecolor="black", linewidth=2, alpha=0.9, zorder=5))
    ax.text(7.5, 6.75, "BACKEND\nFastAPI + SQLAlchemy + SQLite", ha="center", va="center", fontsize=10, fontweight="bold", color="white", zorder=10)

    # AI/ML box
    ax.add_patch(plt.Rectangle((10.5, 6), 3, 1.5, facecolor="#38a169", edgecolor="black", linewidth=2, alpha=0.9, zorder=5))
    ax.text(12, 6.75, "AI/ML ENGINE\nscikit-learn + FAISS\n+ TextBlob", ha="center", va="center", fontsize=9, fontweight="bold", color="white", zorder=10)

    # Arrows
    ax.annotate("", xy=(5.5, 6.75), xytext=(4.5, 6.75), arrowprops=dict(arrowstyle="->", lw=2, color="black"))
    ax.annotate("", xy=(10.5, 6.75), xytext=(9.5, 6.75), arrowprops=dict(arrowstyle="->", lw=2, color="black"))
    ax.text(5, 7.0, "REST API", ha="center", fontsize=8, style="italic")
    ax.text(10, 7.0, "Python\nmodules", ha="center", fontsize=7, style="italic")

    # AI modules
    modules = [
        (1, 4, 2.5, 1, "Sentence-Transformers\n+ FAISS\nSemantic Search", "#1a5276"),
        (4, 4, 2.5, 1, "TF-IDF + LogReg\nIntent Classification", "#1a5276"),
        (7, 4, 2.5, 1, "TextBlob NLP\nSentiment Analysis", "#1a5276"),
        (10, 4, 2.5, 1, "Weighted Scoring\nPerformance + Workload", "#1a5276"),
        (1, 2.5, 2.5, 1, "TF-IDF Extractive\nSummarizer", "#1a5276"),
        (4, 2.5, 2.5, 1, "Logistic Regression\nWorkload Predictor", "#1a5276"),
        (7, 2.5, 2.5, 1, "Knowledge Transfer\nSenior Intern Tips", "#1a5276"),
        (10, 2.5, 2.5, 1, "Auto Report\nDiary -> Summary", "#1a5276"),
    ]
    for x, y, w, h, label, color in modules:
        ax.add_patch(plt.Rectangle((x, y), w, h, facecolor=color, edgecolor="black", linewidth=1, alpha=0.85, zorder=5))
        ax.text(x + w/2, y + h/2, label, ha="center", va="center", fontsize=7.5, color="white", fontweight="bold", zorder=10)

    # Connecting lines from backend to AI modules
    for x, y, w, h, _, _ in modules:
        ax.plot([x + w/2, x + w/2], [y + h, 6], color="#718096", linewidth=0.8, alpha=0.5, linestyle="--")

    # Database
    ax.add_patch(plt.Rectangle((5, 0.5), 4, 1, facecolor="#d69e2e", edgecolor="black", linewidth=2, alpha=0.9, zorder=5))
    ax.text(7, 1, "SQLite Database\nUsers | Profiles | Tasks | Diary | FAQs | Contacts", ha="center", va="center", fontsize=9, fontweight="bold", zorder=10)
    ax.plot([7, 7], [1.5, 2.5], color="black", linewidth=1.5)

    fig.suptitle("IDC — System Architecture", fontsize=16, fontweight="bold")
    save(fig, "7_system_architecture.png")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 60)
    print("IDC — Generating Report Charts and Metrics")
    print("=" * 60)

    chart_intent_classification()
    chart_semantic_search()
    chart_sentiment_analysis()
    chart_performance_scoring()
    chart_workload_predictor()
    chart_tfidf_summarizer()
    chart_model_comparison()

    print("\n" + "=" * 60)
    print(f"All charts saved to: {OUTPUT_DIR}")
    print("=" * 60)
