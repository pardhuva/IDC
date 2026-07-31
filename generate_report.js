const docx = require("docx");
const fs = require("fs");
const path = require("path");

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, PageBreak, TableOfContents,
  ShadingType, VerticalAlign, PageOrientation, TabStopPosition, TabStopType,
  Header, Footer, PageNumber, NumberFormat,
} = docx;

const CHARTS_DIR = path.join(__dirname, "backend", "report_charts");

function img(filename, w, h) {
  const fp = path.join(CHARTS_DIR, filename);
  if (!fs.existsSync(fp)) return null;
  return new ImageRun({ data: fs.readFileSync(fp), transformation: { width: w, height: h }, type: "png" });
}

const NAVY = "002147";
const ORANGE = "FF671F";

function heading(text, level) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 24, font: "Times New Roman", ...opts })],
  });
}

function boldPara(text) {
  return para(text, { bold: true });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2000, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.shading ? { type: ShadingType.CLEAR, color: "auto", fill: opts.shading } : undefined,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.CENTER,
      children: [new TextRun({ text: String(text), size: 22, font: "Times New Roman", bold: !!opts.bold, color: opts.color || "000000" })],
    })],
  });
}

function headerCell(text, width) {
  return cell(text, { bold: true, shading: NAVY, color: "FFFFFF", width });
}

function simpleTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map(row => new TableRow({
        children: row.map((c, i) => cell(c, { width: colWidths[i] })),
      })),
    ],
  });
}

function imgParagraph(filename, w, h, caption) {
  const items = [];
  const image = img(filename, w, h);
  if (image) {
    items.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [image] }));
  }
  if (caption) {
    items.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 200 },
      children: [new TextRun({ text: caption, size: 20, font: "Times New Roman", italics: true })],
    }));
  }
  return items;
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ── Cover Page ──
function coverPage() {
  return [
    new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "B.Tech Project Report", size: 32, font: "Times New Roman", bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "on", size: 28, font: "Times New Roman" }),
    ]}),
    new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "INTERN DIGITAL COMPANION (IDC)", size: 36, font: "Times New Roman", bold: true, color: NAVY }),
    ]}),
    new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "An AI-Augmented Internship Lifecycle Management System", size: 26, font: "Times New Roman", italics: true }),
    ]}),
    new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "for ISRO SDSC SHAR, Sriharikota", size: 26, font: "Times New Roman", italics: true }),
    ]}),
    new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Submitted by", size: 24, font: "Times New Roman" }),
    ]}),
    new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Pardhu", size: 28, font: "Times New Roman", bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 60 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "B.Tech, Indian Institute of Information Technology, Sri City", size: 22, font: "Times New Roman" }),
    ]}),
    new Paragraph({ spacing: { before: 500 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Under the guidance of", size: 24, font: "Times New Roman" }),
    ]}),
    new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "ISRO SDSC SHAR, Sriharikota", size: 26, font: "Times New Roman", bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Satish Dhawan Space Centre", size: 22, font: "Times New Roman" }),
    ]}),
    new Paragraph({ spacing: { before: 500 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "July 2026", size: 24, font: "Times New Roman" }),
    ]}),
    pageBreak(),
  ];
}

// ── Certificate ──
function certificatePage() {
  return [
    heading("CERTIFICATE", HeadingLevel.HEADING_1),
    para("This is to certify that the B.Tech Project entitled \"Intern Digital Companion (IDC): An AI-Augmented Internship Lifecycle Management System\" is a bonafide record of work carried out by Pardhu during the internship at ISRO SDSC SHAR, Sriharikota."),
    para("The project involves the design, development, and deployment of a full-stack web application integrated with multiple Machine Learning and Natural Language Processing models for automating and enhancing the internship management process at Satish Dhawan Space Centre."),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    new Paragraph({ children: [new TextRun({ text: "Guide Signature: ___________________", size: 24, font: "Times New Roman" })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Head of Division: ___________________", size: 24, font: "Times New Roman" })] }),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Director, SDSC SHAR: ___________________", size: 24, font: "Times New Roman" })] }),
    pageBreak(),
  ];
}

// ── Acknowledgement ──
function acknowledgement() {
  return [
    heading("ACKNOWLEDGEMENT", HeadingLevel.HEADING_1),
    para("I would like to express my sincere gratitude to the Indian Space Research Organisation (ISRO) and Satish Dhawan Space Centre (SDSC SHAR), Sriharikota for providing me the opportunity to undertake this B.Tech project during my internship."),
    para("I am deeply thankful to my project guide for their invaluable guidance, constant encouragement, and constructive feedback throughout the development of this project. Their expertise in space technology operations and software systems helped shape the practical aspects of this work."),
    para("I extend my heartfelt thanks to the Director, SDSC SHAR, and the Head of Division for granting permission and providing access to the necessary infrastructure and resources."),
    para("I am also grateful to my faculty at the Indian Institute of Information Technology, Sri City, for their academic support and encouragement."),
    para("Finally, I thank my family and friends for their unwavering support and motivation throughout this journey."),
    pageBreak(),
  ];
}

// ── Abstract ──
function abstractPage() {
  return [
    heading("ABSTRACT", HeadingLevel.HEADING_1),
    para("The Intern Digital Companion (IDC) is an AI-augmented internship lifecycle management system developed for ISRO Satish Dhawan Space Centre (SDSC SHAR), Sriharikota. The system automates the complete internship workflow from onboarding to certificate generation, incorporating 32 features across 4 categories: 17 core web features, 9 AI/ML features, 4 ISRO-specific customizations, and 2 UI/branding features."),
    para("The AI/ML component of the system integrates five distinct algorithms: (1) Sentence-Transformers with FAISS for semantic search achieving 75% Hit@3 accuracy over a 48-document corpus, (2) TF-IDF with Logistic Regression for intent classification achieving 79.5% cross-validated accuracy across 10 intent classes with 200 training samples, (3) TextBlob for sentiment analysis of daily diary entries with 93.33% adjacent-class accuracy, (4) Weighted multi-factor scoring for automated performance evaluation, and (5) Logistic Regression for workload prediction using 6 engineered features."),
    para("The system is built on a React + Vite frontend and FastAPI + SQLAlchemy + SQLite backend architecture, supporting three user roles (Intern, Guide, Coordinator) with role-based access control. Additional features include real-time messaging with direct and group chat, leave request workflows, TF-IDF extractive summarization for automated report generation, and dynamic certificate generation."),
    para("Keywords: Internship Management System, Natural Language Processing, Semantic Search, Intent Classification, Sentiment Analysis, Machine Learning, ISRO, SDSC SHAR, FAISS, Sentence-Transformers, TF-IDF, Logistic Regression"),
    pageBreak(),
  ];
}

// ── Table of Contents ──
function tocPage() {
  return [
    heading("TABLE OF CONTENTS", HeadingLevel.HEADING_1),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    pageBreak(),
  ];
}

// ── Chapter 1: About ISRO ──
function chapter1() {
  return [
    heading("Chapter 1: About ISRO SDSC SHAR", HeadingLevel.HEADING_1),
    heading("1.1 Indian Space Research Organisation", HeadingLevel.HEADING_2),
    para("The Indian Space Research Organisation (ISRO) is the national space agency of India, headquartered in Bengaluru. Established in 1969 under the vision of Dr. Vikram Sarabhai, ISRO has grown to become one of the world's leading space agencies with landmark achievements including the Mars Orbiter Mission (Mangalyaan), Chandrayaan-3 lunar landing, Gaganyaan human spaceflight program, and the Aditya-L1 solar observation mission."),
    heading("1.2 Satish Dhawan Space Centre (SDSC SHAR)", HeadingLevel.HEADING_2),
    para("SDSC SHAR is India's primary orbital launch centre, located at Sriharikota island in Andhra Pradesh. Named after the renowned scientist Prof. Satish Dhawan, the centre houses two operational launch pads (First Launch Pad for PSLV and Second Launch Pad for GSLV/LVM3), the Vehicle Assembly Building (VAB), Mission Control Centre (MCC), Solid Propellant Space Booster Plant (SPROB), and the ISTRAC Ground Station. SDSC SHAR is responsible for the integration and launch of all Indian satellite launch vehicles."),
    heading("1.3 Key Facilities at SHAR", HeadingLevel.HEADING_2),
    simpleTable(
      ["Facility", "Description"],
      [
        ["First Launch Pad (FLP)", "PSLV launch operations"],
        ["Second Launch Pad (SLP)", "GSLV Mk-III / LVM3 launches"],
        ["Vehicle Assembly Building", "Vehicle integration and checkout"],
        ["Mission Control Centre", "Real-time mission monitoring"],
        ["SPROB", "Solid propellant processing"],
        ["ISTRAC Ground Station", "Satellite tracking and telemetry"],
      ],
      [3500, 5500],
    ),
    para(""),
    heading("1.4 Internship Program", HeadingLevel.HEADING_2),
    para("ISRO SDSC SHAR conducts internship programs for engineering students across various disciplines. Interns are assigned to specific divisions, provided with a project guide, and work on real-world problems related to space technology. The internship involves structured onboarding, daily work tracking, periodic reviews, and formal evaluation. This project was developed to digitize and enhance this internship management process."),
    pageBreak(),
  ];
}

// ── Chapter 2: Introduction ──
function chapter2() {
  return [
    heading("Chapter 2: Introduction", HeadingLevel.HEADING_1),
    heading("2.1 Problem Statement", HeadingLevel.HEADING_2),
    para("The internship management process at ISRO SDSC SHAR involves multiple stakeholders (interns, guides, coordinators) and numerous manual workflows including onboarding documentation, daily progress tracking, leave management, performance evaluation, and certificate generation. These manual processes are time-consuming, error-prone, and lack real-time visibility into intern progress."),
    para("Furthermore, there is no intelligent system to help interns navigate the SHAR campus, find answers to common questions, or get AI-driven insights into their performance and workload. The absence of a centralized digital platform leads to information silos and communication gaps between interns and their guides."),
    heading("2.2 Proposed Solution", HeadingLevel.HEADING_2),
    para("The Intern Digital Companion (IDC) addresses these challenges by providing a comprehensive web-based platform that: (1) digitizes the entire internship lifecycle from registration to certificate generation, (2) integrates AI/ML models for semantic search, intent classification, sentiment analysis, performance scoring, and workload prediction, (3) provides role-based interfaces for interns, guides, and coordinators, and (4) includes ISRO SDSC SHAR-specific customizations for campus navigation, document types, and onboarding checklists."),
    heading("2.3 Objectives", HeadingLevel.HEADING_2),
    para("1. Design and develop a full-stack web application for internship lifecycle management with role-based access control for three user types."),
    para("2. Implement AI-powered semantic search using Sentence-Transformers and FAISS for intelligent campus information retrieval."),
    para("3. Build an intent classification system using TF-IDF and Logistic Regression to understand and route intern queries."),
    para("4. Integrate sentiment analysis using TextBlob NLP to monitor intern well-being through daily diary entries."),
    para("5. Develop automated performance scoring, workload prediction, and report summarization using machine learning algorithms."),
    para("6. Customize the system for ISRO SDSC SHAR with real campus data, document types, and operational workflows."),
    heading("2.4 Scope", HeadingLevel.HEADING_2),
    para("The project encompasses 32 features organized into four categories: 17 core web features for managing the internship workflow, 9 AI/ML features utilizing 5 different algorithms, 4 ISRO-specific customizations, and 2 UI/branding features. The system supports three user roles with distinct dashboards and capabilities."),
    pageBreak(),
  ];
}

// ── Chapter 3: Literature Review ──
function chapter3() {
  return [
    heading("Chapter 3: Literature Review and Background", HeadingLevel.HEADING_1),
    heading("3.1 Semantic Search and Vector Embeddings", HeadingLevel.HEADING_2),
    para("Traditional keyword-based search systems rely on exact string matching, which fails to capture the semantic meaning of queries. Sentence-BERT (Reimers and Gurevych, 2019) introduced the concept of encoding sentences into dense vector representations using Siamese transformer networks. The all-MiniLM-L6-v2 model, a distilled version with 22 million parameters, produces 384-dimensional embeddings optimized for semantic similarity tasks. Facebook AI Similarity Search (FAISS) by Johnson et al. (2019) provides efficient nearest-neighbor search over these embeddings using optimized index structures."),
    heading("3.2 Text Classification with TF-IDF", HeadingLevel.HEADING_2),
    para("Term Frequency-Inverse Document Frequency (TF-IDF) remains one of the most effective text representation methods for short-text classification tasks. When combined with Logistic Regression, TF-IDF achieves competitive performance on intent classification benchmarks, particularly with limited training data. The approach is computationally efficient and interpretable compared to deep learning alternatives, making it suitable for deployment in resource-constrained environments."),
    heading("3.3 Sentiment Analysis", HeadingLevel.HEADING_2),
    para("Sentiment analysis involves determining the emotional tone of text. Rule-based approaches like TextBlob use pre-defined lexicons and grammatical rules to compute polarity scores. While deep learning models (BERT, RoBERTa) achieve higher accuracy on benchmark datasets, rule-based systems offer zero-shot capability without requiring task-specific training data, making them practical for domain-specific applications where labeled sentiment data is unavailable."),
    heading("3.4 Extractive Text Summarization", HeadingLevel.HEADING_2),
    para("Extractive summarization selects the most important sentences from a document to form a summary. TF-IDF-based approaches compute sentence importance by measuring similarity to the document centroid vector. This method preserves the original phrasing and is particularly effective for structured text like diary entries and work reports where maintaining factual accuracy is critical."),
    heading("3.5 Logistic Regression for Prediction", HeadingLevel.HEADING_2),
    para("Logistic Regression is a probabilistic classification model that estimates the probability of a binary outcome using a sigmoid function. In workload prediction scenarios, it maps engineered features (task completion rate, diary consistency, velocity) to completion probability, providing interpretable coefficients that indicate the relative importance of each factor."),
    pageBreak(),
  ];
}

// ── Chapter 4: System Design ──
function chapter4() {
  return [
    heading("Chapter 4: System Design and Architecture", HeadingLevel.HEADING_1),
    heading("4.1 System Architecture", HeadingLevel.HEADING_2),
    para("The IDC follows a modern three-tier client-server architecture with a clear separation between the presentation layer (React SPA), the business logic layer (FastAPI REST API), and the data layer (SQLite + FAISS vector index)."),
    ...imgParagraph("7_system_architecture.png", 550, 350, "Figure 4.1: System Architecture Diagram"),
    heading("4.2 Technology Stack", HeadingLevel.HEADING_2),
    simpleTable(
      ["Layer", "Technology", "Purpose"],
      [
        ["Frontend", "React 18.3 + Vite 5.4", "Single-page application with HMR"],
        ["Frontend", "React Router DOM 6.26", "Client-side routing"],
        ["Frontend", "Axios 1.7", "HTTP client with JWT auth headers"],
        ["Backend", "FastAPI 0.115", "Async REST API framework"],
        ["Backend", "SQLAlchemy 2.0", "Object-Relational Mapper"],
        ["Backend", "SQLite", "Relational database"],
        ["Backend", "Python-Jose + bcrypt", "JWT auth + password hashing"],
        ["AI/ML", "Sentence-Transformers", "384-dim text embeddings"],
        ["AI/ML", "FAISS (faiss-cpu)", "Vector similarity search"],
        ["AI/ML", "scikit-learn", "TF-IDF, Logistic Regression"],
        ["AI/ML", "TextBlob", "Sentiment analysis"],
        ["AI/ML", "NumPy", "Numerical computation"],
      ],
      [2000, 3000, 4000],
    ),
    para(""),
    heading("4.3 Database Schema", HeadingLevel.HEADING_2),
    para("The database consists of the following core entities managed through SQLAlchemy ORM models:"),
    simpleTable(
      ["Entity", "Key Fields", "Relationships"],
      [
        ["User", "id, name, email, hashed_password, role", "Has Profile, Tasks, Diary"],
        ["Profile", "user_id, department, college, blood_group", "Belongs to User"],
        ["Project", "title, description, assigned_to", "Has Tasks"],
        ["Task", "title, status, priority, project_id", "Belongs to Project"],
        ["DailyDiary", "date, activities, learning, challenges", "Belongs to User"],
        ["WeeklyReport", "from_date, to_date, summary, status", "Belongs to User"],
        ["Document", "type, file_path, status", "Belongs to User"],
        ["ChecklistItem", "title, is_completed, user_id", "Belongs to User"],
        ["LeaveRequest", "type, from_date, to_date, status", "Intern -> Guide review"],
        ["Message", "sender_id, receiver_id, group_id, content", "DM or Group chat"],
      ],
      [2200, 3500, 3300],
    ),
    para(""),
    heading("4.4 API Design", HeadingLevel.HEADING_2),
    para("The backend exposes RESTful API endpoints organized by resource. Key endpoint groups include:"),
    simpleTable(
      ["Endpoint Group", "Routes", "Description"],
      [
        ["/auth", "POST /register, /login, GET /me", "JWT authentication"],
        ["/profile", "GET/PUT /me", "Profile management"],
        ["/tasks", "CRUD operations", "Task management"],
        ["/diary", "CRUD + GET /sentiment", "Daily diary with sentiment"],
        ["/reports", "CRUD + POST /auto-generate", "Weekly reports + AI summary"],
        ["/ai/search", "GET ?q=query", "Semantic search"],
        ["/ai/intent", "GET ?q=query", "Intent classification"],
        ["/ai/performance", "GET /score", "Performance scoring"],
        ["/ai/workload", "GET /predict", "Workload prediction"],
        ["/leave", "CRUD + PUT /review", "Leave request workflow"],
        ["/messages", "POST + GET /dm, /group", "Messaging system"],
      ],
      [2200, 3200, 3600],
    ),
    para(""),
    heading("4.5 Role-Based Access Control", HeadingLevel.HEADING_2),
    para("The system implements three user roles with distinct permissions and UI views:"),
    simpleTable(
      ["Role", "Capabilities"],
      [
        ["Intern", "Profile, documents, checklist, diary, tasks, reports, AI search, AI insights, leave requests, messaging, certificate"],
        ["Guide", "View assigned interns, review diary/reports, manage projects/tasks, approve leave, DM + group messaging"],
        ["Coordinator", "Assign guides, manage campus data, verify documents, create events/announcements, view all feedback, manage contacts"],
      ],
      [2000, 7000],
    ),
    para(""),
    pageBreak(),
  ];
}

// ── Chapter 5: AI/ML - Intent Classification ──
function chapter5() {
  return [
    heading("Chapter 5: Intent Classification", HeadingLevel.HEADING_1),
    heading("5.1 Problem Definition", HeadingLevel.HEADING_2),
    para("When interns type natural language queries into the system, the intent classifier determines the category of the query to provide appropriate navigation suggestions and contextual responses. The system classifies queries into 10 intent classes relevant to the ISRO SHAR internship context."),
    heading("5.2 Dataset", HeadingLevel.HEADING_2),
    para("A custom training dataset was created with 200 labeled samples (20 samples per class) covering 10 intent categories:"),
    simpleTable(
      ["Intent Class", "Example Query", "Samples"],
      [
        ["canteen_food", "Where is the mess? What time is lunch?", "20"],
        ["document_query", "How to submit joining report?", "20"],
        ["facilities_general", "Where is the gym? Recreation room?", "20"],
        ["guide_assignment", "Who is my guide? When will guide be assigned?", "20"],
        ["identity_issue", "How to get ID card? Lost my pass", "20"],
        ["leave_attendance", "How to apply for leave? Attendance rules?", "20"],
        ["library_access", "Where is the library? How to borrow books?", "20"],
        ["project_task", "What is my project? Task deadline?", "20"],
        ["reporting_process", "How to write weekly report?", "20"],
        ["technical_support", "WiFi not working, laptop issues", "20"],
      ],
      [3000, 3500, 1500],
    ),
    para(""),
    heading("5.3 Methodology", HeadingLevel.HEADING_2),
    para("The text classification pipeline consists of two stages: (1) TF-IDF Vectorization with unigram and bigram features (n-gram range 1-2, maximum 5000 features) to convert raw text into numerical feature vectors, and (2) Logistic Regression with L2 regularization as the classification model. The TF-IDF vectorizer captures both single words and two-word phrases, enabling the model to learn patterns like 'ID card', 'weekly report', and 'lunch time' as distinct features."),
    heading("5.3.1 TF-IDF Mathematical Formulation", HeadingLevel.HEADING_3),
    para("Term Frequency (TF) measures how frequently a term t appears in a document d:"),
    para("TF(t, d) = count(t, d) / |d|", { align: AlignmentType.CENTER, italics: true }),
    para("Inverse Document Frequency (IDF) measures how important a term is across the corpus of N documents:"),
    para("IDF(t) = log(N / DF(t)) + 1, where DF(t) = number of documents containing term t", { align: AlignmentType.CENTER, italics: true }),
    para("The TF-IDF weight is the product: TF-IDF(t, d) = TF(t, d) x IDF(t). Higher weights indicate terms that are frequent in a specific document but rare across the corpus, making them discriminative features."),
    heading("5.3.2 Logistic Regression", HeadingLevel.HEADING_3),
    para("Logistic Regression models the probability of class k given input features x using the softmax function (for multi-class classification):"),
    para("P(y = k | x) = exp(w_k . x + b_k) / SUM_j exp(w_j . x + b_j)", { align: AlignmentType.CENTER, italics: true }),
    para("The model is trained by minimizing the cross-entropy loss with L2 regularization:"),
    para("L = -SUM_i log P(y_i | x_i) + lambda * ||w||^2", { align: AlignmentType.CENTER, italics: true }),
    para("Where lambda controls the regularization strength to prevent overfitting. scikit-learn's LogisticRegression uses the L-BFGS optimizer with max_iter=1000 to ensure convergence."),
    heading("5.4 Evaluation Results", HeadingLevel.HEADING_2),
    para("The model was evaluated using 5-fold stratified cross-validation to ensure robust performance estimation across all classes."),
    boldPara("Overall Accuracy: 79.5% (+/- 2.92%)"),
    ...imgParagraph("1_intent_confusion_matrix.png", 480, 400, "Figure 5.1: Confusion Matrix - Intent Classification (10 classes)"),
    ...imgParagraph("1_intent_per_class_metrics.png", 500, 320, "Figure 5.2: Per-Class Precision, Recall, and F1-Score"),
    heading("5.5 Per-Class Analysis", HeadingLevel.HEADING_2),
    simpleTable(
      ["Intent", "Precision", "Recall", "F1-Score"],
      [
        ["guide_assignment", "0.95", "0.95", "0.95"],
        ["identity_issue", "0.86", "0.95", "0.90"],
        ["leave_attendance", "1.00", "0.80", "0.89"],
        ["project_task", "0.82", "0.90", "0.86"],
        ["reporting_process", "0.78", "0.90", "0.84"],
        ["document_query", "0.84", "0.80", "0.82"],
        ["library_access", "0.88", "0.70", "0.78"],
        ["technical_support", "0.64", "0.80", "0.71"],
        ["facilities_general", "0.60", "0.60", "0.60"],
        ["canteen_food", "0.65", "0.55", "0.59"],
      ],
      [3000, 1500, 1500, 1500],
    ),
    para(""),
    para("The highest-performing class is guide_assignment (F1=0.95), which contains distinctive vocabulary. The lowest-performing classes (canteen_food, facilities_general) show confusion due to overlapping vocabulary around campus locations and facilities."),
    ...imgParagraph("1_intent_top_features.png", 500, 350, "Figure 5.3: Top TF-IDF Features per Intent Class"),
    pageBreak(),
  ];
}

// ── Chapter 6: Semantic Search ──
function chapter6() {
  return [
    heading("Chapter 6: Semantic Search", HeadingLevel.HEADING_1),
    heading("6.1 Problem Definition", HeadingLevel.HEADING_2),
    para("Keyword-based search fails to understand the semantic meaning of queries. For example, searching 'lunch timings' would not match a document titled 'Mess / Canteen' using exact keyword matching. Semantic search addresses this by encoding both queries and documents into a shared vector space where semantically similar texts are close together."),
    heading("6.2 Model Architecture", HeadingLevel.HEADING_2),
    para("The semantic search system uses a two-stage architecture:"),
    para("Stage 1 - Encoding: The all-MiniLM-L6-v2 model (22 million parameters, 6 transformer layers) encodes text into 384-dimensional dense vectors. This model is a distilled version of Microsoft's MiniLM, optimized for semantic similarity tasks with a balance between accuracy and inference speed."),
    para("Stage 2 - Retrieval: FAISS (Facebook AI Similarity Search) IndexFlatIP performs inner-product search over L2-normalized vectors, which is equivalent to cosine similarity. The index supports real-time querying over the document corpus."),
    heading("6.2.1 Cosine Similarity", HeadingLevel.HEADING_3),
    para("Cosine similarity measures the angle between two vectors in the embedding space:"),
    para("cos(A, B) = (A . B) / (||A|| * ||B||)", { align: AlignmentType.CENTER, italics: true }),
    para("When vectors are L2-normalized (||A|| = ||B|| = 1), the cosine similarity simplifies to the inner product (dot product): cos(A, B) = A . B. This is why FAISS IndexFlatIP (Inner Product) is used after normalizing all embeddings with faiss.normalize_L2(). The score ranges from -1 (opposite) to +1 (identical), with higher scores indicating greater semantic similarity."),
    heading("6.2.2 Embedding Normalization", HeadingLevel.HEADING_3),
    para("L2 normalization maps each vector to the unit hypersphere: v_norm = v / ||v||_2, where ||v||_2 = sqrt(SUM v_i^2). This ensures that the inner product between any two normalized vectors equals their cosine similarity, enabling FAISS to use its highly optimized inner product search (IndexFlatIP) for cosine similarity retrieval."),
    heading("6.3 Document Corpus", HeadingLevel.HEADING_2),
    simpleTable(
      ["Source Type", "Count", "Examples"],
      [
        ["Office Locations", "16", "First Launch Pad, MCC, SPROB, Library"],
        ["FAQ Entries", "18", "WiFi access, ID card process, canteen timings"],
        ["Contact Directory", "8", "Division heads, security, medical centre"],
        ["Announcements", "6", "Events, notices, schedule updates"],
      ],
      [3000, 1500, 4500],
    ),
    para(""),
    boldPara("Total Corpus: 48 documents, 384-dimensional embeddings"),
    heading("6.4 Evaluation Results", HeadingLevel.HEADING_2),
    simpleTable(
      ["Metric", "Value"],
      [
        ["Hit@1 (Top-1 Accuracy)", "37.50% (3/8)"],
        ["Hit@3 (Top-3 Accuracy)", "75.00% (6/8)"],
        ["Hit@5 (Top-5 Accuracy)", "75.00% (6/8)"],
        ["Embedding Dimensions", "384"],
        ["Index Type", "FAISS IndexFlatIP"],
      ],
      [4500, 4500],
    ),
    para(""),
    para("Note: The Hit@1 metric of 37.5% reflects that the model often returns a semantically correct but different-category result. For example, the query 'wifi password' returns the FAQ 'How do I get WiFi access?' (semantically correct answer) rather than the expected 'IT / Computer Centre' (office location). This indicates the model successfully captures semantic meaning even when the expected ground truth is from a different source type."),
    ...imgParagraph("2_semantic_retrieval_accuracy.png", 450, 300, "Figure 6.1: Retrieval Accuracy at Different K Values"),
    ...imgParagraph("2_semantic_tsne_embeddings.png", 500, 400, "Figure 6.2: t-SNE Visualization of Document Embeddings (384D -> 2D)"),
    para("The t-SNE visualization shows the distribution of document embeddings in 2D space, with documents of the same type clustering together, demonstrating that the model learns meaningful semantic representations."),
    pageBreak(),
  ];
}

// ── Chapter 7: Sentiment Analysis ──
function chapter7() {
  return [
    heading("Chapter 7: Sentiment Analysis", HeadingLevel.HEADING_1),
    heading("7.1 Problem Definition", HeadingLevel.HEADING_2),
    para("Monitoring intern well-being is crucial for a productive internship experience. The sentiment analysis module automatically analyzes the emotional tone of daily diary entries, providing guides and coordinators with early warning signals if an intern is struggling or experiencing negative sentiment trends."),
    heading("7.2 Methodology", HeadingLevel.HEADING_2),
    para("The system uses TextBlob, a rule-based NLP library that computes two metrics from text: (1) Polarity: a float in [-1.0, +1.0] indicating negative to positive sentiment, and (2) Subjectivity: a float in [0.0, 1.0] indicating objective to subjective content. Based on the polarity score, entries are classified into five mood categories:"),
    simpleTable(
      ["Polarity Range", "Mood Category", "Visual Indicator"],
      [
        ["< -0.3", "Very Negative", "Red emoji"],
        ["-0.3 to -0.05", "Negative", "Orange emoji"],
        ["-0.05 to 0.2", "Neutral", "Gray emoji"],
        ["0.2 to 0.5", "Positive", "Light green emoji"],
        ["> 0.5", "Very Positive", "Green emoji"],
      ],
      [2500, 3000, 3500],
    ),
    para(""),
    heading("7.3 Evaluation Results", HeadingLevel.HEADING_2),
    para("The model was evaluated on 15 hand-labeled test samples representing various sentiment scenarios an intern might write in their diary:"),
    boldPara("Exact Match Accuracy: 60.00% (9/15)"),
    boldPara("Adjacent Match Accuracy (plus/minus 1 class): 93.33% (14/15)"),
    ...imgParagraph("3_sentiment_accuracy.png", 450, 300, "Figure 7.1: Sentiment Classification Accuracy (Exact vs Adjacent)"),
    ...imgParagraph("3_sentiment_polarity_distribution.png", 480, 320, "Figure 7.2: Polarity Score Distribution across Test Samples"),
    heading("7.4 Analysis", HeadingLevel.HEADING_2),
    para("The 93.33% adjacent accuracy indicates that the system rarely misclassifies sentiment by more than one category. The single miss case ('Feeling overwhelmed with workload' classified as positive instead of negative) occurs because TextBlob's lexicon assigns neutral/positive weight to common words while the negative sentiment is expressed through context rather than individual negative words. For the use case of monitoring intern well-being trends over time, adjacent accuracy is the more relevant metric."),
    pageBreak(),
  ];
}

// ── Chapter 8: Performance Scoring & Workload Prediction ──
function chapter8() {
  return [
    heading("Chapter 8: Performance Scoring and Workload Prediction", HeadingLevel.HEADING_1),
    heading("8.1 Performance Scoring", HeadingLevel.HEADING_2),
    para("The performance scoring module computes a comprehensive 0-100 score for each intern based on five weighted factors:"),
    simpleTable(
      ["Factor", "Weight", "Data Source"],
      [
        ["Task Completion Rate", "30%", "Completed vs total tasks"],
        ["Document Timeliness", "20%", "Verified vs total documents"],
        ["Diary Consistency", "20%", "Entries vs expected working days"],
        ["Sentiment Trend", "15%", "Average polarity from diary"],
        ["Checklist Progress", "15%", "Completed vs total items"],
      ],
      [3500, 1500, 4000],
    ),
    para(""),
    para("The weighted score is mapped to letter grades: A (90-100), B (75-89), C (60-74), D (40-59), F (0-39). The system also generates AI-driven recommendations based on underperforming factors."),
    ...imgParagraph("4_performance_scoring_weights.png", 450, 320, "Figure 8.1: Performance Factor Weights Distribution"),
    ...imgParagraph("4_performance_grade_distribution.png", 450, 320, "Figure 8.2: Grade Distribution for Sample Intern Profiles"),
    heading("8.2 Workload Prediction", HeadingLevel.HEADING_2),
    para("The workload predictor uses Logistic Regression to estimate the probability that an intern will complete their internship goals on time. The model is trained on 8 synthetic anchor points (4 positive examples representing on-track interns, 4 negative examples representing behind-schedule interns) using 6 engineered features."),
    heading("8.3 Feature Engineering", HeadingLevel.HEADING_2),
    simpleTable(
      ["Feature", "Description", "Coefficient"],
      [
        ["Task Completion Rate", "Completed / total tasks", "0.577"],
        ["Diary Consistency", "Diary entries / expected days", "0.506"],
        ["Document Score", "Verified docs / total docs", "0.481"],
        ["Checklist Progress", "Completed / total items", "0.577"],
        ["Time Remaining", "Fraction of internship left", "0.390"],
        ["Velocity", "Tasks completed per day", "0.577"],
      ],
      [3000, 3500, 2000],
    ),
    para(""),
    boldPara("Model Intercept: -1.4281"),
    para("The positive coefficients indicate that higher task completion, diary consistency, and velocity all increase the predicted completion probability. The model output is mapped to three status categories: On Track (>=70%), At Risk (40-70%), and Behind Schedule (<40%)."),
    ...imgParagraph("5_workload_feature_importance.png", 480, 320, "Figure 8.3: Feature Importance (Logistic Regression Coefficients)"),
    ...imgParagraph("5_workload_probability_curve.png", 480, 320, "Figure 8.4: Completion Probability vs Feature Values"),
    pageBreak(),
  ];
}

// ── Chapter 9: TF-IDF Summarization ──
function chapter9() {
  return [
    heading("Chapter 9: TF-IDF Extractive Summarization", HeadingLevel.HEADING_1),
    heading("9.1 Problem Definition", HeadingLevel.HEADING_2),
    para("Interns write daily diary entries recording their activities, learning outcomes, and challenges. Writing weekly summary reports from these individual entries is repetitive and time-consuming. The auto-summarization system automatically generates weekly reports by extracting the most important sentences from aggregated diary text."),
    heading("9.2 Algorithm", HeadingLevel.HEADING_2),
    para("The extractive summarization pipeline operates in four steps:"),
    para("Step 1 - Sentence Tokenization: The input text is split into individual sentences using punctuation-based rules."),
    para("Step 2 - TF-IDF Computation: A TF-IDF matrix is computed where each row represents a sentence and each column represents a term. Term frequency measures how often a word appears in a sentence, while inverse document frequency penalizes common words that appear across many sentences."),
    para("Step 3 - Centroid Computation: The document centroid is calculated as the mean TF-IDF vector across all sentences, representing the 'average topic' of the document."),
    para("Step 4 - Sentence Ranking: Each sentence is scored by its cosine similarity to the document centroid. The top N sentences (default N=5) with the highest similarity scores are selected as the summary, preserving their original order."),
    heading("9.2.1 Centroid-Based Scoring Formula", HeadingLevel.HEADING_3),
    para("The document centroid C is the mean TF-IDF vector: C = (1/n) * SUM_i S_i, where S_i is the TF-IDF vector for sentence i and n is the total number of sentences."),
    para("Each sentence score is computed as: score(S_i) = SUM_t TF(t, S_i) * IDF(t), for all unique terms t in S_i.", { align: AlignmentType.CENTER, italics: true }),
    para("Sentences with higher scores contain more informative (high TF-IDF weight) terms, making them better candidates for the summary. The implementation avoids computing explicit cosine similarity and instead uses the sum of TF-IDF weights as a proxy for importance, which is computationally efficient."),
    heading("9.3 Keyword Extraction", HeadingLevel.HEADING_2),
    para("In addition to sentence extraction, the system extracts the top 10 keywords by summing TF-IDF weights across all sentences for each term. These keywords provide a quick overview of the main topics covered in the diary entries."),
    ...imgParagraph("6_tfidf_sentence_ranking.png", 500, 320, "Figure 9.1: Sentence Scores by TF-IDF Cosine Similarity to Centroid"),
    ...imgParagraph("6_tfidf_keywords.png", 500, 320, "Figure 9.2: Top TF-IDF Keywords Extracted from Sample Text"),
    heading("9.4 Applications in IDC", HeadingLevel.HEADING_2),
    para("The TF-IDF summarizer is used in two features: (1) Auto Diary-to-Report Generation: aggregates diary entries for a date range and produces a weekly report with AI-generated summary and keywords, and (2) Senior Intern Tips: extracts key themes from aggregated feedback text to identify common advice patterns from previous interns."),
    pageBreak(),
  ];
}

// ── Chapter 10: Implementation ──
function chapter10() {
  return [
    heading("Chapter 10: Implementation Details", HeadingLevel.HEADING_1),
    heading("10.1 Software Requirements", HeadingLevel.HEADING_2),
    simpleTable(
      ["Software", "Version", "Purpose"],
      [
        ["Python", "3.10+", "Backend runtime"],
        ["Node.js", "18+", "Frontend build toolchain"],
        ["npm", "9+", "Package manager"],
        ["Git", "2.40+", "Version control"],
        ["Browser", "Chrome/Edge/Firefox", "Client application"],
      ],
      [3000, 2000, 4000],
    ),
    para(""),
    heading("10.2 Hardware Requirements", HeadingLevel.HEADING_2),
    simpleTable(
      ["Component", "Minimum", "Recommended"],
      [
        ["Processor", "Dual Core 2.0 GHz", "Quad Core 3.0+ GHz"],
        ["RAM", "4 GB", "8 GB"],
        ["Storage", "2 GB free", "5 GB free"],
        ["Network", "Internet for model download", "Broadband"],
        ["OS", "Windows 10 / Ubuntu 20.04", "Windows 11 / Ubuntu 22.04"],
      ],
      [2500, 3000, 3500],
    ),
    para(""),
    heading("10.3 Project Structure", HeadingLevel.HEADING_2),
    para("The project follows a modular directory structure separating frontend, backend, and AI components:"),
    para("IDC/"),
    para("  backend/"),
    para("    app/"),
    para("      ai/ - intent_classifier.py, semantic_search.py, sentiment_analyzer.py, performance_scorer.py, workload_predictor.py, report_summarizer.py"),
    para("      core/ - database.py, security.py, deps.py"),
    para("      models/ - user.py, profile.py, project.py, task.py, diary.py, document.py, etc."),
    para("      routers/ - auth.py, profile.py, tasks.py, diary.py, ai.py, leave_requests.py, messages.py, etc."),
    para("      schemas/ - Pydantic validation schemas"),
    para("  frontend/"),
    para("    src/"),
    para("      components/ - Layout.jsx, ProtectedRoute.jsx"),
    para("      pages/ - Dashboard.jsx, AIInsights.jsx, Messages.jsx, LeaveRequests.jsx, etc."),
    heading("10.4 Authentication Flow", HeadingLevel.HEADING_2),
    para("The system uses JWT (JSON Web Tokens) for stateless authentication. User passwords are hashed using bcrypt with automatic salt generation. On login, the server generates a JWT containing the user ID and role, which the frontend stores in localStorage and sends as a Bearer token in the Authorization header for all subsequent API requests."),
    heading("10.5 AI Model Loading", HeadingLevel.HEADING_2),
    para("The Sentence-Transformers model (all-MiniLM-L6-v2, ~90MB) is loaded lazily on the first semantic search request. The FAISS index is built by encoding all campus documents (offices, FAQs, contacts, announcements) into 384-dimensional vectors and adding them to an IndexFlatIP index. The index can be rebuilt on demand via the /ai/rebuild-index endpoint."),
    pageBreak(),
  ];
}

// ── Chapter 11: Results and Model Comparison ──
function chapter11() {
  return [
    heading("Chapter 11: Results and Discussion", HeadingLevel.HEADING_1),
    heading("11.1 Model Comparison Summary", HeadingLevel.HEADING_2),
    ...imgParagraph("7_model_comparison_table.png", 550, 280, "Figure 11.1: Comparison of All AI/ML Models Used in IDC"),
    simpleTable(
      ["AI Feature", "Algorithm", "Key Metric", "Value"],
      [
        ["Intent Classification", "TF-IDF + LogReg", "5-Fold CV Accuracy", "79.5%"],
        ["Semantic Search", "MiniLM + FAISS", "Hit@3 Accuracy", "75.0%"],
        ["Sentiment Analysis", "TextBlob", "Adjacent Accuracy", "93.3%"],
        ["Performance Scoring", "Weighted Formula", "Factors", "5"],
        ["Workload Prediction", "Logistic Regression", "Features", "6"],
        ["Report Summarization", "TF-IDF Extractive", "Top-N Sentences", "5"],
      ],
      [2500, 2500, 2200, 1800],
    ),
    para(""),
    heading("11.2 Discussion", HeadingLevel.HEADING_2),
    para("The intent classification accuracy of 79.5% is notable given the small training set of only 200 samples (20 per class). The confusion primarily occurs between semantically similar classes (canteen_food vs facilities_general) where the vocabulary overlaps significantly. With additional training data, performance is expected to improve substantially."),
    para("The semantic search system achieves 75% Hit@3 accuracy, meaning the correct result appears in the top 3 results three-quarters of the time. The model demonstrates genuine semantic understanding by matching queries like 'lunch timings' to documents about the 'Mess / Canteen' despite no keyword overlap."),
    para("The sentiment analysis module achieves 93.33% adjacent accuracy, which is highly effective for the use case of tracking sentiment trends over time. Minor misclassifications (e.g., neutral vs positive) do not significantly impact the trend analysis that guides and coordinators use for monitoring intern well-being."),
    heading("11.3 Feature Summary", HeadingLevel.HEADING_2),
    simpleTable(
      ["Category", "Count", "Examples"],
      [
        ["Core Web Features", "17", "Auth, Profile, Dashboard, Documents, Tasks, Diary, Reports"],
        ["AI/ML Features", "9", "Semantic Search, Intent Classification, Sentiment, Performance, Workload"],
        ["ISRO-Specific", "4", "SHAR Campus Data, Emergency Contact, ISRO Documents, Certificate"],
        ["UI/Branding", "2", "ISRO Branding, Responsive Sidebar"],
      ],
      [2500, 1500, 5000],
    ),
    para(""),
    boldPara("Total: 32 features across 4 categories"),
    pageBreak(),
  ];
}

// ── Chapter 12: Conclusion ──
function chapter12() {
  return [
    heading("Chapter 12: Conclusion and Future Work", HeadingLevel.HEADING_1),
    heading("12.1 Conclusion", HeadingLevel.HEADING_2),
    para("The Intern Digital Companion (IDC) successfully demonstrates the integration of modern web technologies with machine learning and natural language processing to create a comprehensive internship management system. The system digitizes the entire internship lifecycle at ISRO SDSC SHAR, replacing manual processes with automated, AI-augmented workflows."),
    para("Key technical contributions of this project include: (1) A semantic search system using Sentence-Transformers and FAISS that understands natural language queries beyond keyword matching, (2) A multi-model AI pipeline combining intent classification, sentiment analysis, performance scoring, and workload prediction into a unified insights dashboard, (3) An extractive summarization system that automatically generates weekly reports from daily diary entries, and (4) A role-based platform with real-time messaging that supports the complex stakeholder relationships in an internship program."),
    para("The ML evaluation results validate the feasibility of deploying these models in a production environment: 79.5% intent classification accuracy with only 200 training samples, 75% semantic search Hit@3 accuracy over a 48-document corpus, and 93.33% adjacent sentiment classification accuracy demonstrate practical utility for the target use cases."),
    heading("12.2 Future Work", HeadingLevel.HEADING_2),
    para("1. Deep Learning Models: Replace TF-IDF + Logistic Regression with fine-tuned BERT or DistilBERT models for intent classification, potentially improving accuracy beyond 90%."),
    para("2. Real-time Notifications: Implement WebSocket-based real-time messaging and push notifications to replace the current 5-second polling mechanism."),
    para("3. Analytics Dashboard: Add advanced analytics with interactive charts showing organizational-level trends in intern performance, sentiment, and completion rates."),
    para("4. Mobile Application: Develop a React Native companion app for on-the-go access to essential features like diary entries, notifications, and messaging."),
    para("5. Multi-language Support: Add support for Hindi and regional languages in the NLP pipeline to accommodate interns from diverse linguistic backgrounds."),
    para("6. Deployment: Deploy the system on ISRO's internal infrastructure with Docker containerization and CI/CD pipelines for automated testing and deployment."),
    pageBreak(),
  ];
}

// ── References ──
function references() {
  return [
    heading("REFERENCES", HeadingLevel.HEADING_1),
    para("[1] Reimers, N. and Gurevych, I. (2019). Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks. Proceedings of EMNLP-IJCNLP 2019."),
    para("[2] Johnson, J., Douze, M., and Jegou, H. (2019). Billion-scale similarity search with GPUs. IEEE Transactions on Big Data, 7(3), 535-547."),
    para("[3] Loria, S. (2018). TextBlob: Simplified Text Processing. https://textblob.readthedocs.io/"),
    para("[4] Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830."),
    para("[5] Tiangolo, S. (2019). FastAPI framework, high performance, easy to learn. https://fastapi.tiangolo.com/"),
    para("[6] Facebook AI Research (2017). FAISS - A library for efficient similarity search. https://github.com/facebookresearch/faiss"),
    para("[7] Wang, W. et al. (2020). MiniLM: Deep Self-Attention Distillation for Task-Agnostic Compression of Pre-Trained Transformers. NeurIPS 2020."),
    para("[8] ISRO (2024). Satish Dhawan Space Centre SHAR. https://www.shar.gov.in/"),
  ];
}

// ── Code block helper ──
function codeBlock(sourceCode, title) {
  const lines = sourceCode.split("\n");
  const items = [
    heading(title, HeadingLevel.HEADING_2),
  ];
  for (const line of lines) {
    items.push(new Paragraph({
      spacing: { after: 0, line: 240 },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "F5F5F5" },
      children: [new TextRun({ text: line || " ", size: 15, font: "Courier New" })],
    }));
  }
  items.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  return items;
}

// ── Appendix A: AI/ML Source Code ──
function appendixA() {
  const AI_DIR = path.join(__dirname, "backend", "app", "ai");
  const files = [
    { name: "intent_classifier.py", title: "A.1 Intent Classification Module" },
    { name: "semantic_search.py", title: "A.2 Semantic Search Module" },
    { name: "sentiment_analyzer.py", title: "A.3 Sentiment Analysis Module" },
    { name: "performance_scorer.py", title: "A.4 Performance Scoring Module" },
    { name: "workload_predictor.py", title: "A.5 Workload Prediction Module" },
    { name: "report_summarizer.py", title: "A.6 Report Summarization Module" },
  ];

  const items = [
    heading("Appendix A: AI/ML Source Code", HeadingLevel.HEADING_1),
    para("This appendix contains the complete source code of all six AI/ML modules implemented in the IDC system. These modules are located in the backend/app/ai/ directory and are invoked by the FastAPI backend at runtime."),
  ];

  for (const f of files) {
    const fp = path.join(AI_DIR, f.name);
    if (fs.existsSync(fp)) {
      const code = fs.readFileSync(fp, "utf-8");
      items.push(...codeBlock(code, f.title));
    }
  }
  items.push(pageBreak());
  return items;
}

// ── Appendix B: Evaluation Script ──
function appendixB() {
  const fp = path.join(__dirname, "backend", "generate_report_charts.py");
  const items = [
    heading("Appendix B: ML Evaluation and Chart Generation Script", HeadingLevel.HEADING_1),
    para("This appendix contains the complete evaluation script that trains and tests each AI/ML model, computes cross-validation metrics, generates confusion matrices, accuracy charts, t-SNE visualizations, and feature importance plots. Running this script reproduces all evaluation results presented in Chapters 5-9."),
    para("To run: cd backend && venv\\Scripts\\activate && python generate_report_charts.py"),
    para("Output: 15 PNG charts and 5 text metric reports saved to backend/report_charts/"),
  ];

  if (fs.existsSync(fp)) {
    const code = fs.readFileSync(fp, "utf-8");
    items.push(...codeBlock(code, "B.1 generate_report_charts.py"));
  }
  return items;
}

// ── Build Document ──
async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 24 } },
        heading1: { run: { font: "Times New Roman", size: 32, bold: true, color: NAVY } },
        heading2: { run: { font: "Times New Roman", size: 28, bold: true, color: "333333" } },
        heading3: { run: { font: "Times New Roman", size: 26, bold: true } },
      },
    },
    features: { updateFields: true },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "IDC - Intern Digital Companion | ISRO SDSC SHAR", size: 18, font: "Times New Roman", color: "888888", italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Times New Roman" })],
          })],
        }),
      },
      children: [
        ...coverPage(),
        ...certificatePage(),
        ...acknowledgement(),
        ...abstractPage(),
        ...tocPage(),
        ...chapter1(),
        ...chapter2(),
        ...chapter3(),
        ...chapter4(),
        ...chapter5(),
        ...chapter6(),
        ...chapter7(),
        ...chapter8(),
        ...chapter9(),
        ...chapter10(),
        ...chapter11(),
        ...chapter12(),
        ...references(),
        ...appendixA(),
        ...appendixB(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "BTP_Report_IDC_v2.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Report generated:", outPath);
}

main().catch(console.error);
