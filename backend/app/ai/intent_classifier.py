"""
FAQ Intent Classification using TF-IDF + Logistic Regression.

Trains a lightweight classifier on predefined intent examples and maps
recognised intents to actionable navigation / info responses.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Training data: intent -> list of example utterances
# ---------------------------------------------------------------------------

INTENT_DATA: dict[str, list[str]] = {
    "identity_issue": [
        "I forgot my ID",
        "I lost my temporary ID",
        "Where do I get a new ID card",
        "My utility card is not working",
        "How to replace my ID",
        "I don't have my identity card",
        "Need a duplicate ID card",
        "My access card stopped working",
        "How to get a replacement badge",
        "Temporary ID expired",
        "ID card is damaged",
        "I need a new identity card",
        "Lost my badge yesterday",
        "Badge is not scanning",
        "Where is the ID card office",
        "Can I get a temporary badge",
        "My ID photo is wrong",
        "Utility card replacement process",
        "How long does ID replacement take",
        "ID card application form",
    ],
    "reporting_process": [
        "When should I report",
        "What time do I come on first day",
        "Where do I report on joining day",
        "What is the reporting time",
        "Where should I go on day one",
        "First day reporting location",
        "Morning reporting time",
        "Where to go when I arrive",
        "What building do I report to",
        "Joining day instructions",
        "What time should I reach on day one",
        "First day of internship where to go",
        "Reporting instructions for new joiners",
        "Do I report to reception first",
        "What floor should I go to on day one",
        "Entry gate for first day",
        "Who do I meet on joining day",
        "What time does orientation start",
        "Day one schedule",
        "Induction timing",
    ],
    "document_query": [
        "What documents should I bring",
        "Which papers are needed",
        "Do I need my college letter",
        "Documents required for joining",
        "What ID proof is accepted",
        "Should I bring passport photos",
        "Documents for verification",
        "What certificates are needed",
        "Do I need originals or copies",
        "Address proof requirements",
        "Do I need Aadhaar card",
        "Is PAN card required",
        "How many photo copies needed",
        "College bonafide certificate needed",
        "Offer letter printout required",
        "Bank details document needed",
        "Marksheet copies needed",
        "Medical fitness certificate",
        "Character certificate required",
        "List of mandatory documents",
    ],
    "canteen_food": [
        "Where is the canteen",
        "How to book meals",
        "Lunch timings",
        "Is breakfast available",
        "Food options on campus",
        "Meal booking deadline",
        "Where can I eat",
        "Cafeteria location",
        "What time is lunch served",
        "Vegetarian food options",
        "Is non-veg available in canteen",
        "Tea and coffee available",
        "Snack options on campus",
        "Can I order food online",
        "Mess menu for today",
        "Dinner timings in canteen",
        "Food court location",
        "How much does lunch cost",
        "Is there a vending machine",
        "Canteen working hours",
    ],
    "library_access": [
        "How to access the library",
        "Library timings",
        "What ID do I need for library",
        "Can I borrow books",
        "Library card",
        "Reading room hours",
        "Where is the library",
        "How many books can I borrow",
        "Library membership process",
        "Digital library access",
        "E-journal access",
        "Library fine policy",
        "Book return deadline",
        "Reference section access",
        "Study room availability",
        "Library is closed today",
        "Online library portal",
        "Library book reservation",
        "Can interns use the library",
        "Technical books in library",
    ],
    "guide_assignment": [
        "When will I get a guide",
        "Who is my mentor",
        "Guide allocation process",
        "When is guide assigned",
        "How long until I get a mentor",
        "My guide is not assigned yet",
        "Mentor assignment status",
        "Can I change my guide",
        "Guide meeting schedule",
        "How to contact my mentor",
        "Mentor not responding",
        "When is the first meeting with guide",
        "My mentor has not contacted me",
        "Guide assignment delay",
        "Who assigns the project guide",
        "Supervisor allocation",
        "When will mentor be allotted",
        "Waiting for guide assignment",
        "How to request a different mentor",
        "Guide availability",
    ],
    "technical_support": [
        "WiFi not working",
        "How to connect to WiFi",
        "Internet password",
        "Laptop configuration",
        "VPN access",
        "Email setup",
        "System access issues",
        "Software installation",
        "Network connectivity problem",
        "How to reset my password",
        "WiFi is not connecting",
        "Cannot access internal network",
        "Email not syncing",
        "Printer setup help",
        "Software license request",
        "Desktop login not working",
        "Network is very slow",
        "How to connect to VPN from home",
        "IT helpdesk contact number",
        "Computer not turning on",
    ],
    "leave_attendance": [
        "How to apply for leave",
        "Attendance policy",
        "Can I take a day off",
        "Leave application process",
        "Sick leave policy",
        "How is attendance tracked",
        "What if I am late",
        "Half day leave request",
        "Attendance regularization",
        "Work from home policy",
        "Leave balance query",
        "How many leaves do I get",
        "Casual leave policy",
        "Compensatory off",
        "Late coming penalty",
        "Biometric attendance issue",
        "Forgot to punch attendance",
        "Leave approval process",
        "Who approves my leave",
        "Attendance correction request",
    ],
    "facilities_general": [
        "Where is the medical centre",
        "Is there an ATM nearby",
        "Parking information",
        "Bus schedule",
        "Guest house booking",
        "Where is the help desk",
        "Emergency contact",
        "Sports facilities",
        "Gym access on campus",
        "Where is the reception",
        "First aid available",
        "Nearest hospital",
        "Shuttle bus timings",
        "Visitor parking",
        "Where is the washroom",
        "Drinking water facility",
        "Fire exit location",
        "Security office number",
        "Lost and found desk",
        "Campus map",
    ],
    "project_task": [
        "How to start my project",
        "Task deadline extension",
        "Project submission format",
        "How to upload deliverables",
        "Weekly report format",
        "Daily diary guidelines",
        "Project evaluation criteria",
        "How is the project graded",
        "Deliverable submission deadline",
        "Can I change my project topic",
        "Project presentation schedule",
        "Mid-term review date",
        "Final evaluation date",
        "Report template download",
        "How to submit weekly report",
        "Project progress update format",
        "Code submission guidelines",
        "Demo schedule for project",
        "Plagiarism check for report",
        "Project extension request",
    ],
}

# Human-readable descriptions for each intent
INTENT_DESCRIPTIONS: dict[str, str] = {
    "identity_issue": "Questions about ID cards, badges, and utility cards",
    "reporting_process": "Joining day reporting time and location queries",
    "document_query": "Required documents, certificates, and ID proofs",
    "canteen_food": "Canteen location, meal timings, and food booking",
    "library_access": "Library access, timings, and borrowing policies",
    "guide_assignment": "Mentor/guide allocation and meeting details",
    "technical_support": "WiFi, VPN, email, and IT-related issues",
    "leave_attendance": "Leave application and attendance policies",
    "facilities_general": "Campus facilities — medical, ATM, parking, etc.",
    "project_task": "Project tasks, submissions, and evaluation",
}

# ---------------------------------------------------------------------------
# Action routing per intent
# ---------------------------------------------------------------------------

INTENT_ACTIONS: dict[str, dict] = {
    "identity_issue": {
        "action": "navigate",
        "target": "/campus",
        "office": "utility-card-office",
        "message": "Visit the Utility Card Office to resolve ID issues.",
    },
    "reporting_process": {
        "action": "checklist",
        "target": "/checklist",
        "message": "Check your joining checklist for reporting details.",
    },
    "document_query": {
        "action": "navigate",
        "target": "/documents",
        "message": "Go to Documents section to see required uploads.",
    },
    "canteen_food": {
        "action": "navigate",
        "target": "/campus",
        "office": "canteen",
        "message": "Visit Canteen page for timings and meal booking.",
    },
    "library_access": {
        "action": "navigate",
        "target": "/campus",
        "office": "library",
        "message": "Check Library page for access requirements and timings.",
    },
    "guide_assignment": {
        "action": "info",
        "target": "/dashboard",
        "message": "Guide assignment is handled by your coordinator. Check your dashboard for status.",
    },
    "technical_support": {
        "action": "contact",
        "target": "/contacts",
        "department": "it_support",
        "message": "Contact IT Support for technical issues.",
    },
    "leave_attendance": {
        "action": "info",
        "target": "/faq",
        "message": "Check FAQ section for attendance and leave policies.",
    },
    "facilities_general": {
        "action": "navigate",
        "target": "/campus",
        "message": "Check Campus Guide for facility locations and details.",
    },
    "project_task": {
        "action": "navigate",
        "target": "/projects",
        "message": "Visit your project page for task and submission details.",
    },
}

# ---------------------------------------------------------------------------
# Module-level cache for the trained model
# ---------------------------------------------------------------------------

_vectorizer = None
_classifier = None
_labels = None


def train_classifier():
    """Train (or re-train) the TF-IDF + Logistic Regression classifier."""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression

    global _vectorizer, _classifier, _labels

    texts: list[str] = []
    labels: list[str] = []
    for intent, examples in INTENT_DATA.items():
        for example in examples:
            texts.append(example)
            labels.append(intent)

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    X = vectorizer.fit_transform(texts)

    classifier = LogisticRegression(max_iter=1000)
    classifier.fit(X, labels)

    label_list = list(classifier.classes_)

    # Cache
    _vectorizer = vectorizer
    _classifier = classifier
    _labels = label_list

    return vectorizer, classifier, label_list


def predict_intent(text: str) -> dict:
    """
    Predict the intent of *text*.

    Returns::

        {
            "intent": str,
            "confidence": float,
            "all_intents": [{"intent": str, "confidence": float}, ...]
        }
    """
    global _vectorizer, _classifier, _labels

    if _vectorizer is None or _classifier is None or _labels is None:
        train_classifier()

    X = _vectorizer.transform([text])  # type: ignore[union-attr]
    proba = _classifier.predict_proba(X)[0]  # type: ignore[union-attr]

    top_idx = int(max(range(len(proba)), key=lambda i: proba[i]))
    intent = _labels[top_idx]  # type: ignore[index]
    confidence = float(proba[top_idx])

    all_intents = sorted(
        [{"intent": _labels[i], "confidence": float(proba[i])} for i in range(len(_labels))],  # type: ignore[arg-type]
        key=lambda x: x["confidence"],
        reverse=True,
    )

    return {
        "intent": intent,
        "confidence": confidence,
        "all_intents": all_intents,
    }


def classify_and_route(text: str) -> dict:
    """
    Classify *text* and return the predicted intent together with a
    routed action from ``INTENT_ACTIONS``.
    """
    prediction = predict_intent(text)
    intent = prediction["intent"]
    action_info = INTENT_ACTIONS.get(intent, {})

    return {
        "intent": intent,
        "confidence": prediction["confidence"],
        "action_type": action_info.get("action", "info"),
        "target_url": action_info.get("target", "/"),
        "message": action_info.get("message", ""),
        "all_intents": prediction["all_intents"],
        **{k: v for k, v in action_info.items() if k not in ("action", "target", "message")},
    }
