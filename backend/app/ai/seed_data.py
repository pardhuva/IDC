"""
Seed the database with realistic campus data for demo / AI search testing.

Run:
    cd backend
    .venv/Scripts/python.exe -m app.ai.seed_data
"""

import sys
sys.path.insert(0, ".")

from app.core.database import SessionLocal, Base, engine
import app.models  # noqa: F401 — register all models
Base.metadata.create_all(bind=engine)

from app.models.campus import OfficeLocation, Announcement
from app.models.faq import FAQ
from app.models.contact import Contact
from app.models.event import Event
from app.models.article import Article

db = SessionLocal()

# ═══════════════════════════════════════════════════════════════════════════
# Office Locations
# ═══════════════════════════════════════════════════════════════════════════
offices = [
    OfficeLocation(
        name="Main Gate & Security",
        slug="main-gate-security",
        category="facility",
        building="SHAR Main Gate Complex",
        floor="Ground",
        purpose="Primary entry and exit point for SDSC SHAR. All personnel, visitors, and vehicles are checked here. Vehicle pass counter issues temporary and permanent passes. Biometric verification for ISRO staff and registered interns.",
        timings="24/7",
        required_documents="Valid ISRO entry pass or government-issued photo ID with prior gate-pass approval",
        entry_rules="All persons must show SHAR entry pass at the gate. Vehicles require a vehicle pass sticker. Electronic devices may be restricted in certain zones. Bags and belongings are subject to security screening.",
        restrictions="No unauthorized entry after 8 PM without prior written approval from the Security Controller. Photography and mobile phones prohibited beyond designated zones.",
        contact_phone="+91-8624-225001",
        contact_email="shar-security@isro.gov.in",
        nearby_locations="Vehicle Pass Counter, Administration Building",
        is_active=True,
    ),
    OfficeLocation(
        name="Internship Cell / HR Office",
        slug="internship-cell-hr",
        category="office",
        building="SHAR Administration Building",
        floor="1st Floor",
        purpose="Central office for all internship and HR-related activities at SDSC SHAR. Handles intern onboarding, joining reports, NDA signing, guide assignment, project allocation, attendance, stipend processing, and internship completion formalities.",
        timings="Mon-Fri: 9:00 AM - 5:30 PM",
        required_documents="Offer letter, college ID, joining report, NDA form, passport-size photographs",
        entry_rules="Interns must carry their SHAR intern ID badge at all times within the campus. Walk-ins welcome during office hours for onboarding queries.",
        restrictions="Closed on weekends, public holidays, and launch days (unless notified otherwise)",
        contact_phone="+91-8624-225010",
        contact_email="shar-internship@isro.gov.in",
        nearby_locations="Administration Building, Main Gate & Security",
        is_active=True,
    ),
    OfficeLocation(
        name="First Launch Pad (FLP)",
        slug="first-launch-pad",
        category="facility",
        building="Launch Complex - FLP",
        floor="Multi-level structure",
        purpose="The First Launch Pad is used for PSLV (Polar Satellite Launch Vehicle) missions. It includes the Mobile Service Tower, umbilical tower, and launch pedestal. Interns may visit during non-active periods with prior approval from their guide and the Range Safety team.",
        timings="Restricted access - schedule varies with launch campaigns",
        required_documents="Special area entry pass, guide's authorization letter",
        entry_rules="Entry only with authorized escort. Hard hats and safety shoes mandatory. Follow all Range Safety instructions. No electronic devices beyond the checkpoint.",
        restrictions="Strictly no access during launch campaigns, propellant loading, or hazardous operations. Access limited to approved ISRO personnel and escorted visitors only.",
        contact_phone="+91-8624-225020",
        contact_email="shar-launchops@isro.gov.in",
        nearby_locations="Second Launch Pad (SLP), Vehicle Assembly Building (VAB)",
        is_active=True,
    ),
    OfficeLocation(
        name="Second Launch Pad (SLP)",
        slug="second-launch-pad",
        category="facility",
        building="Launch Complex - SLP",
        floor="Multi-level structure",
        purpose="The Second Launch Pad supports GSLV and LVM3 (formerly GSLV Mk III) missions. It features a larger Mobile Service Tower and cryogenic propellant handling systems. This pad was used for Chandrayaan, Gaganyaan test flights, and heavy-lift missions.",
        timings="Restricted access - schedule varies with launch campaigns",
        required_documents="Special area entry pass, guide's authorization letter",
        entry_rules="Entry only with authorized escort. Strict safety protocols apply. Hard hats, safety shoes, and anti-static clothing required in certain zones.",
        restrictions="Absolutely no access during launch campaigns, cryogenic fuelling, or hazardous operations. Controlled by Range Safety Officer.",
        contact_phone="+91-8624-225021",
        contact_email="shar-launchops@isro.gov.in",
        nearby_locations="First Launch Pad (FLP), Vehicle Assembly Building (VAB), Mission Control Centre (MCC)",
        is_active=True,
    ),
    OfficeLocation(
        name="Vehicle Assembly Building (VAB)",
        slug="vehicle-assembly-building",
        category="facility",
        building="Vehicle Assembly Building",
        floor="Multi-level (High Bay)",
        purpose="The Vehicle Assembly Building is where launch vehicles (PSLV, GSLV, LVM3) are integrated stage-by-stage before being transported to the launch pad. Houses clean rooms, integration bays, and testing facilities for rocket stages and satellite payload mating.",
        timings="Mon-Sat: 8:00 AM - 6:00 PM (extended hours during launch campaigns)",
        required_documents="Special area entry pass, safety clearance certificate",
        entry_rules="Clean room protocols must be followed in designated areas. Anti-static clothing and shoe covers required. No loose items, jewellery, or unauthorized electronics inside integration bays.",
        restrictions="Access restricted to authorized integration team and approved visitors. Intern visits require guide escort and prior approval from the Associate Director.",
        contact_phone="+91-8624-225030",
        contact_email="shar-vab@isro.gov.in",
        nearby_locations="First Launch Pad (FLP), Second Launch Pad (SLP), Solid Propellant Space Booster Plant (SPROB)",
        is_active=True,
    ),
    OfficeLocation(
        name="Mission Control Centre (MCC)",
        slug="mission-control-centre",
        category="facility",
        building="Mission Control Centre",
        floor="Ground and 1st Floor",
        purpose="The nerve centre of all launch operations at SHAR. MCC monitors and controls the entire launch sequence, range safety, tracking, and telemetry. Houses real-time data displays, communication consoles, and the Range Safety Officer's station. Interns may observe from the visitor gallery during designated events.",
        timings="Active 24/7 during launch campaigns; regular hours Mon-Fri: 9:00 AM - 5:30 PM",
        required_documents="MCC visitor gallery pass (issued by Internship Cell for launch viewing events)",
        entry_rules="Absolute silence in the control room during operations. Visitor gallery access only during approved events. No photography inside MCC.",
        restrictions="Control room access limited to mission-critical personnel only. Visitor gallery opens only during scheduled launch events with prior registration.",
        contact_phone="+91-8624-225040",
        contact_email="shar-mcc@isro.gov.in",
        nearby_locations="Second Launch Pad (SLP), ISTRAC Ground Station",
        is_active=True,
    ),
    OfficeLocation(
        name="Solid Propellant Space Booster Plant (SPROB)",
        slug="sprob",
        category="facility",
        building="SPROB Complex",
        floor="Ground Level (spread across multiple buildings)",
        purpose="SPROB is responsible for processing and casting solid propellant boosters used in PSLV, GSLV, and LVM3 launch vehicles. The facility handles hazardous propellant chemicals and operates under strict safety protocols. Educational visits are arranged for interns to understand propellant technology.",
        timings="Mon-Sat: 8:00 AM - 5:00 PM (active operations may vary)",
        required_documents="SPROB area pass, safety briefing completion certificate, guide's authorization",
        entry_rules="Mandatory safety briefing before first entry. Anti-static clothing, no metallic items, no electronic devices. Follow escort at all times.",
        restrictions="Highly restricted zone. No unauthorized entry. Interns may visit only designated demonstration areas with prior approval and escort. No access during propellant processing operations.",
        contact_phone="+91-8624-225050",
        contact_email="shar-sprob@isro.gov.in",
        nearby_locations="Vehicle Assembly Building (VAB), First Launch Pad (FLP)",
        is_active=True,
    ),
    OfficeLocation(
        name="ISTRAC Ground Station",
        slug="istrac-ground-station",
        category="facility",
        building="ISTRAC Ground Station Complex",
        floor="Ground and 1st Floor",
        purpose="ISRO Telemetry, Tracking and Command Network (ISTRAC) ground station at Sriharikota provides tracking and telemetry support during launch missions. Houses large dish antennas and tracking equipment. Also supports post-launch satellite orbit determination and early orbit operations.",
        timings="24/7 during missions; regular hours Mon-Fri: 9:00 AM - 5:30 PM",
        required_documents="ISTRAC area pass, guide's authorization",
        entry_rules="Restricted area. Entry with escort only. No interference with tracking equipment. Follow RF safety guidelines near antenna installations.",
        restrictions="No access during active tracking operations without mission director's approval. Mobile phones to be switched off near antenna systems.",
        contact_phone="+91-8624-225060",
        contact_email="shar-istrac@isro.gov.in",
        nearby_locations="Mission Control Centre (MCC), Administration Building",
        is_active=True,
    ),
    OfficeLocation(
        name="Sriharikota Township / Hostels",
        slug="shar-township-hostels",
        category="facility",
        building="SHAR Township Residential Area",
        floor="Ground and 1st Floor",
        purpose="Residential township within the SHAR campus providing hostel accommodation for interns and trainees, as well as quarters for ISRO employees. Hostels include furnished rooms, common areas, and basic amenities. Allotment is handled by the Estate Section of Administration.",
        timings="Hostel office: Mon-Fri: 9:00 AM - 5:00 PM. Hostel entry: 24/7 with resident ID.",
        required_documents="Hostel allotment letter from Internship Cell, ID proof, passport-size photo",
        entry_rules="Residents must carry hostel ID at all times. Visitors allowed in common areas only during designated hours (5 PM - 8 PM). Gate closes at 10 PM for interns.",
        restrictions="No cooking in rooms. No loud music after 10 PM. Guests not allowed to stay overnight. Alcohol and smoking strictly prohibited on ISRO campus.",
        contact_phone="+91-8624-225070",
        contact_email="shar-hostel@isro.gov.in",
        nearby_locations="Mess / Canteen, Medical Centre, SHAR Library & Resource Centre",
        is_active=True,
    ),
    OfficeLocation(
        name="Mess / Canteen",
        slug="mess-canteen",
        category="facility",
        building="SHAR Township Welfare Area",
        floor="Ground Floor",
        purpose="Multiple mess and canteen facilities across SHAR campus serving breakfast, lunch, dinner, and snacks. The township mess provides subsidized meals for hostel residents. Additional canteens are located near the Admin building and work areas. Vegetarian and non-vegetarian options available.",
        timings="Breakfast: 7:00-9:00 AM, Lunch: 12:00-2:00 PM, Snacks: 4:00-5:30 PM, Dinner: 7:00-9:00 PM",
        required_documents="Mess card or SHAR intern ID for subsidized rates",
        entry_rules="Mess card must be shown for subsidized meals. Cash payment accepted at regular canteens. Self-service: return plates to the counter after eating.",
        restrictions="Outside food not allowed inside mess premises. Mess timings are strictly followed; no service outside scheduled hours.",
        contact_phone="+91-8624-225071",
        contact_email="shar-mess@isro.gov.in",
        nearby_locations="Sriharikota Township / Hostels, Medical Centre",
        is_active=True,
    ),
    OfficeLocation(
        name="Medical Centre",
        slug="medical-centre",
        category="service",
        building="SHAR Township Medical Facility",
        floor="Ground Floor",
        purpose="On-campus medical facility providing first aid, basic and emergency medical care, and health check-ups for SHAR personnel and interns. Equipped with a dispensary, minor OT, and ambulance service. A qualified doctor is available during working hours; emergency medical support available 24/7.",
        timings="Mon-Sat: 8:30 AM - 5:00 PM. Emergency: 24/7",
        required_documents="SHAR ID card or intern ID",
        entry_rules="Walk-in for emergencies. Non-urgent consultations during OPD hours (9 AM - 1 PM). Ambulance: call emergency number.",
        restrictions="Specialist consultations on referral basis. For serious cases, referral to Sullurpeta or Nellore hospital.",
        contact_phone="+91-8624-225080",
        contact_email="shar-medical@isro.gov.in",
        nearby_locations="Sriharikota Township / Hostels, Mess / Canteen",
        is_active=True,
    ),
    OfficeLocation(
        name="SHAR Library & Resource Centre",
        slug="shar-library",
        category="facility",
        building="SHAR Knowledge Centre",
        floor="Ground and 1st Floor",
        purpose="Technical library housing books, journals, ISRO technical reports, research papers, and e-resources related to space science, rocketry, propulsion, satellite technology, and allied subjects. Includes a digital section with computer terminals for accessing ISRO's internal knowledge base and online journals.",
        timings="Mon-Sat: 9:00 AM - 7:00 PM",
        required_documents="Library card (issued by Internship Cell) or SHAR ID",
        entry_rules="Silence must be maintained. Bags to be kept in lockers at entrance. Maximum 2 books can be borrowed for 14 days. Reference section books are non-circulating.",
        restrictions="No food or drinks inside. Photocopying limited to 20 pages per day. ISRO classified documents require special clearance.",
        contact_phone="+91-8624-225090",
        contact_email="shar-library@isro.gov.in",
        nearby_locations="IT/Computer Centre, Administration Building, Training Hall / Seminar Hall",
        is_active=True,
    ),
    OfficeLocation(
        name="IT / Computer Centre",
        slug="it-computer-centre",
        category="office",
        building="SHAR Computer Centre Building",
        floor="Ground and 1st Floor",
        purpose="Central IT facility providing network access, email account creation, system/workstation allocation, software support, and intranet services for SHAR personnel and interns. Manages SHAR's LAN, internet gateway, and ISRO's internal communication systems.",
        timings="Mon-Fri: 9:00 AM - 5:30 PM",
        required_documents="SHAR intern ID, guide's approval email for system access or software requests",
        entry_rules="Raise a request through the IT helpdesk portal or visit with your guide's written approval. Walk-in for urgent connectivity issues only.",
        restrictions="Internet access is filtered and monitored. External USB devices require IT approval. No installation of unauthorized software. Classified network access requires separate clearance.",
        contact_phone="+91-8624-225100",
        contact_email="shar-it@isro.gov.in",
        nearby_locations="SHAR Library & Resource Centre, Training Hall / Seminar Hall, Conference Room",
        is_active=True,
    ),
    OfficeLocation(
        name="Training Hall / Seminar Hall",
        slug="training-seminar-hall",
        category="facility",
        building="SHAR Training Centre",
        floor="1st Floor",
        purpose="Multi-purpose hall used for intern orientation programs, technical seminars, workshops, invited lectures, and training sessions. Equipped with projector, PA system, and video conferencing. Capacity: 200 persons. Also used for launch-day live viewing for non-essential personnel.",
        timings="Mon-Fri: 9:00 AM - 6:00 PM (bookable through Administration)",
        required_documents="Booking confirmation from Administration",
        entry_rules="Reserved for scheduled events only. Check the notice board or SHAR intranet for daily schedule.",
        restrictions="No food or drinks. AV equipment requests must be made 24 hours in advance. Mobile phones on silent mode during sessions.",
        contact_phone="+91-8624-225110",
        contact_email="shar-training@isro.gov.in",
        nearby_locations="Conference Room, SHAR Library & Resource Centre, IT / Computer Centre",
        is_active=True,
    ),
    OfficeLocation(
        name="Conference Room",
        slug="conference-room",
        category="facility",
        building="SHAR Administration Building",
        floor="2nd Floor",
        purpose="Conference and meeting room with video conferencing facility, large display, and whiteboard. Capacity: 40 persons. Used for project reviews, mission briefings, inter-centre meetings, and intern mid-term/final presentations.",
        timings="Mon-Fri: 9:00 AM - 5:30 PM (bookable through Administration)",
        required_documents="Booking confirmation from Administration",
        entry_rules="Must be booked through Administration at least one day in advance. Priority given to mission-related meetings.",
        restrictions="Maximum booking duration: 3 hours. Cancel 2 hours before if not needed. No food or drinks.",
        contact_phone="+91-8624-225111",
        contact_email="shar-admin@isro.gov.in",
        nearby_locations="Internship Cell / HR Office, Training Hall / Seminar Hall",
        is_active=True,
    ),
    OfficeLocation(
        name="Sullurpeta Bus Stop / Transport Office",
        slug="sullurpeta-transport",
        category="service",
        building="SHAR Transport Section (near Main Gate)",
        floor="Ground",
        purpose="ISRO operates shuttle buses between Sullurpeta town and SHAR campus for employees and interns. The Transport Office handles bus pass issuance, shuttle schedules, and special transport requests. Sullurpeta is the nearest town (approx. 20 km) with railway station, markets, and ATMs.",
        timings="Transport Office: Mon-Fri: 9:00 AM - 5:00 PM. Shuttle buses: 7:00 AM, 8:00 AM, 5:30 PM, 6:30 PM",
        required_documents="SHAR ID card for bus pass; bus pass for daily shuttle",
        entry_rules="Board shuttle at designated stops only. Show bus pass to the driver. Be at the stop 5 minutes before departure.",
        restrictions="Shuttle runs on fixed schedule only. No shuttle service on Sundays and gazetted holidays unless notified. Special transport for launch campaigns arranged separately.",
        contact_phone="+91-8624-225120",
        contact_email="shar-transport@isro.gov.in",
        nearby_locations="Main Gate & Security, Sriharikota Township / Hostels",
        is_active=True,
    ),
]

# ═══════════════════════════════════════════════════════════════════════════
# FAQs
# ═══════════════════════════════════════════════════════════════════════════
faqs = [
    FAQ(
        question="What is the dress code for interns?",
        answer="Interns are expected to follow business casual dress code. Formal shirts, trousers, and closed-toe shoes are recommended. Jeans are allowed on Fridays (casual Friday). Avoid shorts, slippers, and sleeveless tops. Lab areas may require additional safety gear.",
        category="general",
        intent_label="dress_code",
        is_active=True,
    ),
    FAQ(
        question="What documents do I need to bring on my first day?",
        answer="On your first day, please bring: (1) Original offer letter, (2) College ID card, (3) Government ID proof (Aadhar/PAN), (4) 4 passport-size photographs, (5) Joining report signed by your college, (6) Medical fitness certificate. Submit photocopies of all documents to the Internship Cell.",
        category="onboarding",
        intent_label="first_day_documents",
        is_active=True,
    ),
    FAQ(
        question="Can I bring my own laptop for work?",
        answer="Yes, you can bring your personal laptop. However, you must register it with the IT Department for network access. Company WiFi requires device registration. Some projects may provide dedicated workstations. Personal laptops must have updated antivirus software.",
        category="it",
        intent_label="laptop_policy",
        is_active=True,
    ),
    FAQ(
        question="What is the reporting time for interns?",
        answer="Interns are expected to report by 9:00 AM. The standard working hours are 9:00 AM to 5:30 PM, Monday to Friday. A grace period of 15 minutes is allowed. Consistent late arrivals will be reported to the Internship Cell. Half-day attendance is marked if you arrive after 10:30 AM.",
        category="general",
        intent_label="reporting_time",
        is_active=True,
    ),
    FAQ(
        question="Where can I have lunch on campus?",
        answer="The campus canteen is located in the Welfare Block, Ground Floor. Lunch is served from 12:00 PM to 2:00 PM. Subsidized meals are available if you have a utility card. The canteen serves both vegetarian and non-vegetarian options. There are also vending machines near the Tech Block for snacks.",
        category="facilities",
        intent_label="canteen_info",
        is_active=True,
    ),
    FAQ(
        question="How do I access the library?",
        answer="The library is in the Knowledge Center, 1st and 2nd Floor. You need your intern ID or library card for entry. You can borrow up to 3 books at a time for 14 days. E-resources are accessible via the library portal using your intern credentials. The library also has quiet study rooms that can be booked.",
        category="facilities",
        intent_label="library_access",
        is_active=True,
    ),
    FAQ(
        question="How do I get WiFi access on campus?",
        answer="Visit the IT Department (Tech Block, 3rd Floor) with your intern ID. They will register your device and provide WiFi credentials. The network name is 'Campus-Intern'. Password is provided upon registration. Maximum 2 devices can be registered per intern. For connectivity issues, raise a ticket on the IT portal.",
        category="it",
        intent_label="wifi_access",
        is_active=True,
    ),
    FAQ(
        question="How is the guide assignment process done?",
        answer="Guide assignment is handled by the Internship Cell after your onboarding is complete. Based on your department, skills, and project preferences, a suitable guide (mentor) is assigned within the first week. You will be notified via email and the IDC portal. Your guide will then assign you a project.",
        category="onboarding",
        intent_label="guide_assignment",
        is_active=True,
    ),
    FAQ(
        question="What should I do if I feel unwell at work?",
        answer="Visit the Medical Centre in the Welfare Block, Ground Floor. A qualified doctor is available Mon-Fri 9 AM to 5 PM. For emergencies, call the medical helpline at +91-9876543216. If you need to leave early due to illness, inform your guide and mark a half-day leave through the portal.",
        category="health",
        intent_label="medical_help",
        is_active=True,
    ),
    FAQ(
        question="How do I get my ID card and utility card?",
        answer="Visit the Utility Card Office (Admin Block, Ground Floor) with a passport-size photo, your joining letter, and ID proof. New cards are issued on Monday and Wednesday. The utility card gives you access to subsidized canteen meals, library entry, and facility bookings. Replacement cards take 3 working days.",
        category="onboarding",
        intent_label="id_card",
        is_active=True,
    ),
    FAQ(
        question="Is there parking available for interns?",
        answer="Yes, limited parking is available. Two-wheeler parking is near the Main Gate. Four-wheeler parking requires a parking pass from the Security Office. Parking passes are issued on a first-come-first-served basis. Bicycle stands are available near every building. Carpooling is encouraged.",
        category="facilities",
        intent_label="parking",
        is_active=True,
    ),
    FAQ(
        question="What is the leave policy for interns?",
        answer="Interns are entitled to 1 casual leave per month. Leave must be applied at least 1 day in advance through the portal and approved by your guide. For medical emergencies, inform your guide via phone/email as early as possible. Unapproved absence for 3 consecutive days may lead to internship termination.",
        category="general",
        intent_label="leave_policy",
        is_active=True,
    ),
    FAQ(
        question="How do I submit my daily diary and weekly reports?",
        answer="Daily diary entries must be submitted by 6:00 PM each working day through the IDC portal. Weekly reports are auto-generated from your diary entries every Friday or can be created manually. Your guide reviews and provides feedback on weekly reports. Consistent diary submission is mandatory for internship completion.",
        category="work",
        intent_label="diary_reports",
        is_active=True,
    ),
    FAQ(
        question="Can I work on weekends or after hours?",
        answer="Regular working hours are Mon-Fri 9 AM to 5:30 PM. Weekend or after-hours access requires prior approval from your guide and the Security Office. If approved, inform security with your guide's written approval. The canteen and medical centre have limited hours on weekends.",
        category="general",
        intent_label="weekend_work",
        is_active=True,
    ),
    FAQ(
        question="What happens at the end of my internship?",
        answer="In your last week: (1) Complete all pending diary entries and reports, (2) Submit your final project presentation, (3) Get a completion certificate from the Internship Cell, (4) Return your ID card and utility card, (5) Complete the no-dues clearance form, (6) Fill out the feedback form. Your guide will submit a performance evaluation.",
        category="offboarding",
        intent_label="internship_completion",
        is_active=True,
    ),
    FAQ(
        question="Is there any stipend for interns?",
        answer="Stipend availability depends on your internship type and the arrangement with your college. If applicable, stipends are processed by the HR Office on the last working day of each month. You need to submit your attendance record and bank details to HR. Queries related to stipend are handled on Tuesdays and Thursdays.",
        category="general",
        intent_label="stipend",
        is_active=True,
    ),
    FAQ(
        question="How do I print documents on campus?",
        answer="Printing facilities are available at the Library (Knowledge Center) and the IT Department. You need your utility card for printing. Black and white prints cost Rs. 2 per page, color prints Rs. 10 per page. You can also use the self-service kiosk near the Library entrance.",
        category="facilities",
        intent_label="printing",
        is_active=True,
    ),
    FAQ(
        question="Who should I contact for technical issues with my workstation?",
        answer="For any technical issues (software installation, network problems, hardware faults), raise a ticket on the IT portal or visit the IT Department at Tech Block, 3rd Floor. For urgent issues, call IT Support at +91-9876543217. Always get guide approval before requesting new software installations.",
        category="it",
        intent_label="tech_support",
        is_active=True,
    ),
]

# ═══════════════════════════════════════════════════════════════════════════
# Contacts
# ═══════════════════════════════════════════════════════════════════════════
contacts = [
    Contact(
        name="Dr. Rajesh Kumar",
        designation="Internship Coordinator",
        department="Internship Cell",
        phone="+91-9876543211",
        email="rajesh.kumar@shar.isro.gov.in",
        category="coordinator",
        is_active=True,
    ),
    Contact(
        name="Priya Sharma",
        designation="HR Manager",
        department="Human Resources",
        phone="+91-9876543212",
        email="priya.sharma@shar.isro.gov.in",
        category="hr",
        is_active=True,
    ),
    Contact(
        name="Amit Patel",
        designation="IT Support Lead",
        department="IT Department",
        phone="+91-9876543217",
        email="amit.patel@shar.isro.gov.in",
        category="it_support",
        is_active=True,
    ),
    Contact(
        name="Vikram Singh",
        designation="Chief Security Officer",
        department="Security",
        phone="+91-9876543214",
        email="vikram.singh@shar.isro.gov.in",
        category="security",
        is_active=True,
    ),
    Contact(
        name="Sunita Devi",
        designation="Head Librarian",
        department="Library",
        phone="+91-9876543215",
        email="sunita.devi@shar.isro.gov.in",
        category="helpdesk",
        is_active=True,
    ),
    Contact(
        name="Dr. Meena Gupta",
        designation="Campus Medical Officer",
        department="Medical Centre",
        phone="+91-9876543216",
        email="meena.gupta@shar.isro.gov.in",
        category="helpdesk",
        is_active=True,
    ),
    Contact(
        name="Ravi Teja",
        designation="Help Desk Executive",
        department="Administration",
        phone="+91-9876543218",
        email="ravi.teja@shar.isro.gov.in",
        category="helpdesk",
        is_active=True,
    ),
    Contact(
        name="Lakshmi Narayan",
        designation="Canteen Manager",
        department="Canteen / Food Services",
        phone="+91-9876543220",
        email="lakshmi.narayan@shar.isro.gov.in",
        category="helpdesk",
        is_active=True,
    ),
]

# ═══════════════════════════════════════════════════════════════════════════
# Announcements
# ═══════════════════════════════════════════════════════════════════════════
announcements = [
    Announcement(
        title="Intern Orientation Program - July 2026 Batch",
        content="Welcome to the July 2026 internship batch! The orientation program will be held on Monday, July 28th at 10:00 AM in the Training Hall. All new interns must attend. Bring your offer letter and ID proof. Refreshments will be provided. Contact the Internship Cell for any queries.",
        category="orientation",
        target_role="intern",
        is_active=True,
    ),
    Announcement(
        title="Python & AI Workshop for Interns",
        content="A hands-on workshop on Python for AI/ML will be conducted on August 5-6, 2026 in the Training Hall from 10 AM to 4 PM. Topics include: NumPy, Pandas, scikit-learn basics, and building a simple ML model. Open to all interns. Register on the IDC portal by August 2nd. Limited seats: 50.",
        category="workshop",
        target_role="intern",
        is_active=True,
    ),
    Announcement(
        title="Independence Day Holiday Notice",
        content="The campus will remain closed on Friday, August 15th, 2026 on account of Independence Day. Regular operations resume on Monday, August 18th. Interns working on critical projects requiring weekend access must obtain prior approval from their guide and security.",
        category="holiday",
        target_role="all",
        is_active=True,
    ),
    Announcement(
        title="Mid-Term Presentation Schedule",
        content="All interns who joined in July must present their mid-term project progress on August 20-21, 2026. Presentations will be held in the Conference Room, Tech Block. Each intern gets 15 minutes (10 min presentation + 5 min Q&A). Schedule will be shared by guides. Prepare a 10-slide PPT covering objectives, progress, and next steps.",
        category="notice",
        target_role="intern",
        is_active=True,
    ),
    Announcement(
        title="Campus WiFi Maintenance - Scheduled Downtime",
        content="The campus WiFi network will undergo maintenance on Saturday, August 2nd from 10 PM to 6 AM Sunday. Internet services may be intermittent during this period. Please save your work and plan accordingly. Wired LAN connections in the Tech Block will not be affected.",
        category="general",
        target_role="all",
        is_active=True,
    ),
    Announcement(
        title="Guide Mentorship Best Practices Session",
        content="A session on effective intern mentorship and evaluation techniques will be held on August 8th at 3 PM in the Conference Room. All guides are encouraged to attend. Topics: setting expectations, providing constructive feedback, using the IDC portal for tracking, and evaluation criteria.",
        category="workshop",
        target_role="guide",
        is_active=True,
    ),
]

# ═══════════════════════════════════════════════════════════════════════════
# Events
# ═══════════════════════════════════════════════════════════════════════════
from datetime import datetime

events = [
    Event(
        title="PSLV-C58 / XPoSat Launch",
        description="Live viewing of PSLV-C58 mission carrying the X-ray Polarimeter Satellite (XPoSat) from Sriharikota. Join us at the Training Hall for a live broadcast and expert commentary on the mission objectives and payload details.",
        event_date=datetime(2026, 8, 5, 9, 30),
        event_type="launch",
        location="Training Hall, Learning Center",
        is_featured=True,
    ),
    Event(
        title="Seminar: Gaganyaan - India's Human Spaceflight Program",
        description="A detailed seminar by senior scientists on the Gaganyaan mission progress, crew training updates, and the roadmap for India's first crewed space mission. Q&A session included.",
        event_date=datetime(2026, 8, 12, 14, 0),
        event_type="seminar",
        location="Conference Room, Tech Block",
        is_featured=True,
    ),
    Event(
        title="Workshop: Satellite Data Analysis with Python",
        description="Hands-on workshop covering satellite image processing, remote sensing data analysis using Python libraries (Rasterio, GDAL, EarthPy). Bring your laptop with Python installed.",
        event_date=datetime(2026, 8, 20, 10, 0),
        event_type="workshop",
        location="IT Lab, Tech Block",
        is_featured=False,
    ),
    Event(
        title="ISRO Foundation Day Celebration",
        description="Celebrating the founding of ISRO with cultural programs, a photo exhibition of milestone missions, and an address by the Director. All interns and staff are invited.",
        event_date=datetime(2026, 8, 15, 10, 0),
        event_type="celebration",
        location="Main Auditorium",
        is_featured=True,
    ),
    Event(
        title="Visit to Satellite Integration & Testing Facility",
        description="A guided tour of the satellite integration and testing facility. Interns will observe clean room protocols, vibration testing, and thermal vacuum testing procedures. Limited to 30 participants.",
        event_date=datetime(2026, 9, 3, 9, 0),
        event_type="visit",
        location="Satellite Centre, Building 5",
        is_featured=False,
    ),
    Event(
        title="Seminar: NavIC - India's Regional Navigation System",
        description="Technical seminar on NavIC (Navigation with Indian Constellation) covering system architecture, signal structure, receiver technology, and applications in civilian and strategic domains.",
        event_date=datetime(2026, 9, 10, 15, 0),
        event_type="seminar",
        location="Training Hall, Learning Center",
        is_featured=False,
    ),
]

# ═══════════════════════════════════════════════════════════════════════════
# Articles
# ═══════════════════════════════════════════════════════════════════════════
articles = [
    Article(
        title="Chandrayaan-3: India's Historic Moon Landing",
        content="On August 23, 2023, India made history as Chandrayaan-3's Vikram lander successfully touched down near the lunar south pole, making India the fourth country to achieve a soft landing on the Moon and the first to land near the south pole. The Pragyan rover conducted in-situ experiments confirming the presence of sulphur and other elements on the lunar surface.",
        summary="India became the first country to land near the Moon's south pole with Chandrayaan-3.",
        category="achievement",
        author="ISRO Public Relations",
        is_published=True,
    ),
    Article(
        title="Gaganyaan: India's Ambitious Human Spaceflight Mission",
        content="The Gaganyaan programme aims to send Indian astronauts (Gaganauts) to a 400 km Low Earth Orbit for a 3-day mission and bring them safely back. The programme includes development of a crew module, service module, crew escape system, and the human-rated LVM3 launch vehicle. Uncrewed test flights are underway, with the crewed mission targeted for 2026.",
        summary="Overview of India's first crewed space mission programme and its current progress.",
        category="research",
        author="Space Applications Centre",
        is_published=True,
    ),
    Article(
        title="Aditya-L1: India's First Solar Observatory Mission",
        content="Aditya-L1 is India's first space-based solar observatory, successfully placed in a halo orbit around the Sun-Earth Lagrange point L1. The spacecraft carries seven payloads to study the solar corona, chromosphere, photosphere, and solar wind. This mission provides continuous observation of the Sun without eclipses or occultation.",
        summary="India's first dedicated solar mission studying the Sun from the L1 Lagrange point.",
        category="achievement",
        author="ISRO Science Team",
        is_published=True,
    ),
    Article(
        title="ISRO's Reusable Launch Vehicle Technology Demonstrator",
        content="ISRO is developing a Reusable Launch Vehicle (RLV) to enable low-cost access to space. The RLV-TD programme has successfully demonstrated autonomous landing of a winged body vehicle. The technology aims to reduce launch costs by a factor of 10 compared to expendable rockets, making space access more affordable for commercial and scientific missions.",
        summary="Progress on ISRO's reusable rocket technology aimed at drastically reducing launch costs.",
        category="research",
        author="VSSC Thiruvananthapuram",
        is_published=True,
    ),
    Article(
        title="ISRO's Small Satellite Launch Vehicle (SSLV) Operational",
        content="The Small Satellite Launch Vehicle (SSLV) has been declared operational after successful missions. Designed for launching small satellites up to 500 kg to Low Earth Orbit, SSLV offers rapid turnaround, low cost, and flexibility. It can be assembled in just 72 hours compared to months for PSLV, opening new opportunities for commercial small satellite launches.",
        summary="ISRO's SSLV offers rapid and affordable launches for small satellites.",
        category="news",
        author="ISRO Headquarters",
        is_published=True,
    ),
    Article(
        title="India's Space Economy: Growing at Record Pace",
        content="India's space economy is projected to reach $44 billion by 2033, driven by increased private sector participation following the Indian Space Policy 2023. IN-SPACe has authorized over 300 private entities for space activities. Startups like Skyroot Aerospace and Agnikul Cosmos have conducted successful test launches, marking a new era for India's commercial space sector.",
        summary="India's space sector is booming with private players entering the market.",
        category="general",
        author="IN-SPACe",
        is_published=True,
    ),
]

# ═══════════════════════════════════════════════════════════════════════════
# Insert into database (idempotent — clears old data first)
# ═══════════════════════════════════════════════════════════════════════════
print("Clearing old seed data...")
db.query(OfficeLocation).delete()
db.query(FAQ).delete()
db.query(Contact).delete()
db.query(Announcement).delete()
db.query(Event).delete()
db.query(Article).delete()

print("Seeding office locations...")
db.add_all(offices)

print("Seeding FAQs...")
db.add_all(faqs)

print("Seeding contacts...")
db.add_all(contacts)

print("Seeding announcements...")
db.add_all(announcements)

print("Seeding events...")
db.add_all(events)

print("Seeding articles...")
db.add_all(articles)

db.commit()
db.close()

print(f"Seed data inserted successfully!")
print(f"  - {len(offices)} office locations")
print(f"  - {len(faqs)} FAQs")
print(f"  - {len(contacts)} contacts")
print(f"  - {len(announcements)} announcements")
print(f"  - {len(events)} events")
print(f"  - {len(articles)} articles")
