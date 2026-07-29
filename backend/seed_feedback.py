"""Seed sample feedback from 'previous interns' for the Senior Intern Tips feature."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models.feedback import Feedback
from app.models.intern_profile import InternProfile
from app.models.user import User
Base.metadata.create_all(bind=engine)

SAMPLE_INTERNS = [
    {"name": "Priya Sharma", "email": "priya.s@demo.com"},
    {"name": "Rahul Menon", "email": "rahul.m@demo.com"},
    {"name": "Ananya Patel", "email": "ananya.p@demo.com"},
    {"name": "Vikram Joshi", "email": "vikram.j@demo.com"},
    {"name": "Sneha Reddy", "email": "sneha.r@demo.com"},
]

SAMPLE_FEEDBACK = [
    {
        "rating": 5,
        "experience_feedback": "My internship at ISRO was a life-changing experience. I got to work on satellite communication systems and learned so much about signal processing. The mentors were incredibly supportive and always available for guidance. The exposure to real space missions was unparalleled.",
        "suggestions": "Start working on your project early and don't hesitate to ask your guide for help. The ISRO digital library is a goldmine.",
        "best_part": "Working on live satellite projects",
        "worst_part": "Initial paperwork takes time",
        "would_recommend": True,
    },
    {
        "rating": 4,
        "experience_feedback": "Great learning environment with access to cutting-edge technology. The weekly seminars by senior scientists were very informative. I particularly enjoyed the lab visits and understanding how ground stations operate. The cafeteria food is decent too!",
        "suggestions": "Keep your daily diary updated from day 1 — it helps a lot when writing weekly reports. Also explore all the labs, not just your assigned one.",
        "best_part": "Seminars by senior scientists",
        "worst_part": "Limited weekend access to labs",
        "would_recommend": True,
    },
    {
        "rating": 5,
        "experience_feedback": "ISRO internship gave me hands-on experience with embedded systems used in launch vehicles. My guide was very patient and explained complex concepts clearly. The best part was watching a PSLV launch from the viewing gallery — absolutely unforgettable!",
        "suggestions": "Make friends with other interns — the group projects and discussions are invaluable. Also, attend every launch viewing if you can!",
        "best_part": "Watching a PSLV launch live",
        "worst_part": "Bus timings can be inconvenient",
        "would_recommend": True,
    },
    {
        "rating": 4,
        "experience_feedback": "The internship provided excellent exposure to space technology and research methodologies. I worked on data analysis for earth observation satellites. The computational resources available were impressive. Documentation requirements are strict but teach good engineering practices.",
        "suggestions": "Learn Python and MATLAB before joining — you'll need them. Also complete the onboarding checklist quickly so you can start your actual project sooner.",
        "best_part": "Access to satellite data and compute resources",
        "worst_part": "Strict documentation requirements",
        "would_recommend": True,
    },
    {
        "rating": 5,
        "experience_feedback": "One of the best internships I could have asked for. The work culture at ISRO is inspiring — everyone is passionate about space exploration. I got to contribute to the NavIC navigation system project. My guide helped me publish a conference paper from my internship work!",
        "suggestions": "Focus on producing publishable results — your guide can help you write a paper. Also use the IDC app to track everything, it really helps during the final presentation.",
        "best_part": "Publishing a research paper",
        "worst_part": "Security clearance process is slow",
        "would_recommend": True,
    },
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Feedback).count()
        if existing >= 5:
            print(f"[seed_feedback] {existing} feedback entries already exist — skipping.")
            return

        from app.core.security import hash_password

        for i, (intern_data, fb_data) in enumerate(zip(SAMPLE_INTERNS, SAMPLE_FEEDBACK)):
            user = db.query(User).filter(User.email == intern_data["email"]).first()
            if not user:
                user = User(
                    name=intern_data["name"],
                    email=intern_data["email"],
                    hashed_password=hash_password("demo123"),
                    role="intern",
                )
                db.add(user)
                db.flush()

            profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
            if not profile:
                profile = InternProfile(
                    user_id=user.id,
                    department="Space Applications",
                    college=f"Demo College {i+1}",
                    phone="9999900000",
                    current_stage="completed",
                    internship_duration_months=3,
                )
                db.add(profile)
                db.flush()

            existing_fb = db.query(Feedback).filter(Feedback.intern_id == profile.id).first()
            if not existing_fb:
                feedback = Feedback(**fb_data, intern_id=profile.id)
                db.add(feedback)

        db.commit()
        print(f"[seed_feedback] Seeded {len(SAMPLE_FEEDBACK)} feedback entries from previous interns.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
