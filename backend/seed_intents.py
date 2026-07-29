"""
Seed the FAQ table with training data for the intent classifier.

Run:  python -m seed_intents          (from backend/)
      python seed_intents.py          (from backend/)

Idempotent: skips insertion if FAQs already exist.
After inserting, retrains the intent classifier so the model is warm
for the next classify request.
"""

from __future__ import annotations

import sys, os

# Ensure the backend package is importable when running as a script.
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models.faq import FAQ
from app.ai.intent_classifier import train_classifier

# ---------------------------------------------------------------------------
# Seed data — 40 FAQ entries across categories with ISRO-specific items
# ---------------------------------------------------------------------------

SEED_FAQS: list[dict] = [
    # --- campus_navigation (identity_issue / facilities_general) ---
    {
        "question": "Where is the cafeteria?",
        "answer": "The main cafeteria is in Building C, ground floor. A smaller canteen is near the ISTRAC gate.",
        "category": "campus_navigation",
        "intent_label": "canteen_food",
    },
    {
        "question": "How do I get to the satellite integration lab?",
        "answer": "The satellite integration lab is in Building D, Block-2. You need prior clearance from your guide to enter.",
        "category": "campus_navigation",
        "intent_label": "facilities_general",
    },
    {
        "question": "Where is the ISTRAC visitor centre?",
        "answer": "ISTRAC visitor centre is at the main entrance of the ISTRAC campus. Visiting hours are 10 AM to 4 PM on weekdays.",
        "category": "campus_navigation",
        "intent_label": "facilities_general",
    },
    {
        "question": "Where is the medical centre on campus?",
        "answer": "The medical centre is near Gate 2, opposite the guest house. It operates 9 AM - 5 PM on weekdays.",
        "category": "campus_navigation",
        "intent_label": "facilities_general",
    },
    {
        "question": "How to find the library?",
        "answer": "The central library is in the Admin Block, first floor. Interns can access it with their temporary ID.",
        "category": "campus_navigation",
        "intent_label": "library_access",
    },
    # --- document_help ---
    {
        "question": "How do I upload documents to the portal?",
        "answer": "Log in to the IDC portal, go to Documents section, click Upload, and attach scanned copies in PDF format.",
        "category": "document_help",
        "intent_label": "document_query",
    },
    {
        "question": "What documents are needed for joining?",
        "answer": "You need Aadhaar card, college bonafide, offer letter, 2 passport photos, and a medical fitness certificate.",
        "category": "document_help",
        "intent_label": "document_query",
    },
    {
        "question": "Do I need original certificates or photocopies?",
        "answer": "Bring both originals for verification and two sets of self-attested photocopies.",
        "category": "document_help",
        "intent_label": "document_query",
    },
    {
        "question": "Where do I submit the NDA form?",
        "answer": "The NDA (Non-Disclosure Agreement) form should be submitted to the Security Office at Gate 1 on your first day.",
        "category": "document_help",
        "intent_label": "document_query",
    },
    {
        "question": "Is PAN card required for the internship?",
        "answer": "PAN card is not mandatory but recommended. You will need it if a stipend is disbursed.",
        "category": "document_help",
        "intent_label": "document_query",
    },
    # --- schedule_info ---
    {
        "question": "What are the working hours?",
        "answer": "Official working hours are 9:00 AM to 5:30 PM, Monday to Friday. Saturday is a half-day (9 AM to 1 PM) on alternate weeks.",
        "category": "schedule_info",
        "intent_label": "reporting_process",
    },
    {
        "question": "What time does orientation start?",
        "answer": "Orientation starts at 9:30 AM in the auditorium on your first day. Please arrive 15 minutes early.",
        "category": "schedule_info",
        "intent_label": "reporting_process",
    },
    {
        "question": "When is the next PSLV launch scheduled?",
        "answer": "PSLV launch schedules are updated on the ISRO website. Interns may get an opportunity to watch from the viewing gallery if cleared by their guide.",
        "category": "schedule_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "What is the shuttle bus timing?",
        "answer": "Campus shuttle buses run every 30 minutes from 8 AM to 7 PM. Routes cover Gate 1, ISTRAC, SAC, and the residential area.",
        "category": "schedule_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "When is the mid-term review?",
        "answer": "The mid-term review is typically in the 4th week of your internship. Your guide will confirm the exact date.",
        "category": "schedule_info",
        "intent_label": "project_task",
    },
    # --- contact_info ---
    {
        "question": "Who is my guide or mentor?",
        "answer": "Your guide is assigned within 2 working days of joining. Check your dashboard or contact the internship coordinator.",
        "category": "contact_info",
        "intent_label": "guide_assignment",
    },
    {
        "question": "How do I contact IT support?",
        "answer": "IT helpdesk is at extension 2345 or email ithelpdesk@isro.gov.in. Walk-in support is in Building A, Room 104.",
        "category": "contact_info",
        "intent_label": "technical_support",
    },
    {
        "question": "Who is the internship coordinator?",
        "answer": "The internship coordinator details are on your dashboard. You can also contact the HR office at extension 1100.",
        "category": "contact_info",
        "intent_label": "guide_assignment",
    },
    {
        "question": "Emergency contact number?",
        "answer": "For emergencies, call the security control room at extension 1000 or the medical centre at extension 1500.",
        "category": "contact_info",
        "intent_label": "facilities_general",
    },
    # --- project_help ---
    {
        "question": "How to submit my weekly report?",
        "answer": "Go to the Weekly Reports section in the IDC portal, fill in the template, and submit before Friday 5 PM.",
        "category": "project_help",
        "intent_label": "project_task",
    },
    {
        "question": "What is the project report format?",
        "answer": "Use the ISRO internship report template available in the Documents section. It must include abstract, methodology, results, and references.",
        "category": "project_help",
        "intent_label": "project_task",
    },
    {
        "question": "How to submit deliverables?",
        "answer": "Upload deliverables via the Projects tab. Accepted formats are PDF for reports and ZIP for code. Max file size is 50 MB.",
        "category": "project_help",
        "intent_label": "project_task",
    },
    {
        "question": "What is the deadline for the final project submission?",
        "answer": "Final project submission is due on the last working day of your internship. Check your dashboard for the exact date.",
        "category": "project_help",
        "intent_label": "project_task",
    },
    {
        "question": "Can I change my project topic?",
        "answer": "Topic changes require approval from your guide and the coordinator. Submit a request through the portal within the first week.",
        "category": "project_help",
        "intent_label": "project_task",
    },
    {
        "question": "Which lab is used for satellite testing?",
        "answer": "Satellite testing is done in the Spacecraft Integration and Testing Establishment (SITE). Access requires special clearance.",
        "category": "project_help",
        "intent_label": "facilities_general",
    },
    # --- general_info ---
    {
        "question": "What is the WiFi password?",
        "answer": "Connect to the ISRO-INTERN network. Credentials are provided during orientation. Contact IT helpdesk if you have issues.",
        "category": "general_info",
        "intent_label": "technical_support",
    },
    {
        "question": "How do I get my ID card?",
        "answer": "Temporary ID cards are issued at the Security Office on day one. Permanent cards are ready within 5 working days.",
        "category": "general_info",
        "intent_label": "identity_issue",
    },
    {
        "question": "What is the leave policy for interns?",
        "answer": "Interns can take up to 2 days of leave per month with prior approval from their guide. Unapproved absence may affect your certificate.",
        "category": "general_info",
        "intent_label": "leave_attendance",
    },
    {
        "question": "Is there a dress code?",
        "answer": "Business casual is expected. Avoid shorts, sleeveless tops, and open-toed footwear in lab areas.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "How does attendance work?",
        "answer": "Attendance is recorded via biometric at the main gate. Ensure you punch in and out daily.",
        "category": "general_info",
        "intent_label": "leave_attendance",
    },
    {
        "question": "Can I access the campus on weekends?",
        "answer": "Weekend access requires prior approval from your guide. Submit a weekend access request on the portal by Thursday.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "How to connect to VPN from home?",
        "answer": "VPN access is available for select projects only. Request access through IT helpdesk with your guide's approval.",
        "category": "general_info",
        "intent_label": "technical_support",
    },
    {
        "question": "Where can I park my vehicle?",
        "answer": "Intern parking is available at Lot B near Gate 2. Collect a parking sticker from the Security Office.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "What is the ISRO guest house booking process?",
        "answer": "Guest house booking is for official visitors only. Interns may request through their guide for outstation parents visiting campus.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "How to apply for a project extension?",
        "answer": "Submit an extension request on the portal with justification. It needs approval from your guide and the coordinator.",
        "category": "general_info",
        "intent_label": "project_task",
    },
    # --- ISRO-specific ---
    {
        "question": "What is the PSLV launch schedule this month?",
        "answer": "Launch schedules are classified until officially announced. Check the ISRO public website or the notice board near the auditorium.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "Can interns visit the Mission Control Centre?",
        "answer": "Visits to the Mission Control Centre (MCC) at ISTRAC can be arranged through your guide. Group visits are scheduled monthly.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "What are ISTRAC visiting hours?",
        "answer": "ISTRAC campus visiting hours for interns are 10 AM to 4 PM. You need your intern ID and a gate pass from your guide.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "Where is the clean room facility?",
        "answer": "The clean room is in the SITE building. Entry requires anti-static clothing and prior authorization from the lab in-charge.",
        "category": "general_info",
        "intent_label": "facilities_general",
    },
    {
        "question": "How do I get access to ISRO's digital library?",
        "answer": "Request digital library access through the library portal using your intern credentials. E-journals and technical reports are available.",
        "category": "general_info",
        "intent_label": "library_access",
    },
]


def seed():
    """Insert seed FAQs if the table is empty, then retrain the classifier."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(FAQ).count()
        if existing > 0:
            print(f"[seed_intents] {existing} FAQs already exist — skipping insert.")
        else:
            for entry in SEED_FAQS:
                db.add(FAQ(**entry))
            db.commit()
            print(f"[seed_intents] Inserted {len(SEED_FAQS)} FAQ entries.")

        # Retrain the intent classifier so it is warm for the next request
        print("[seed_intents] Training intent classifier ...")
        train_classifier()
        print("[seed_intents] Classifier trained and cached. Ready for demo.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
