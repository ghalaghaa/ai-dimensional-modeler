// Edit this file to update site content — nothing else needs to change.
// GITHUB_USER should match the account you push the split repos to
// (see portfolio/scripts/split_and_push.sh).
const GITHUB_USER = "ghalaghaa";

const PROFILE = {
  name: "Ghala Alnemari",
  title: "AI Engineer · Software Developer",
  location: "Saudi Arabia",
  email: "ghalanemari20@gmail.com",
  github: `https://github.com/${GITHUB_USER}`,
  linkedin: "", // add your LinkedIn URL here
  summary:
    "AI Engineer with hands-on experience building and deploying AI-driven " +
    "solutions — chatbots, OCR systems, and real-time video analytics. " +
    "Skilled in integrating AI models with backend systems and APIs, leading " +
    "end-to-end project delivery, and contributing to pre-sales and solution " +
    "design for large governmental entities and enterprises.",
};

const STATS = [
  { value: "10", label: "Projects" },
  { value: "159", label: "Automated tests" },
  { value: "4", label: "AI/ML techniques" },
  { value: "7", label: "Languages & stacks" },
];

const SKILLS = [
  {
    group: "AI & Computer Vision",
    items: [
      "OpenCV", "NVIDIA DeepStream SDK", "GStreamer", "Object Detection & Tracking",
      "GPU Inference", "LLaMA", "OCR", "CLIP", "Image Preprocessing & Augmentation",
    ],
  },
  {
    group: "Programming Languages",
    items: ["Python", "Java", "C#", "C++", "JavaScript", "SQL", "Swift"],
  },
  {
    group: "Backend & Data",
    items: ["FastAPI", "Spring Boot", "ASP.NET Core", "Node.js", "React", "Qdrant", "SQL", "MinIO"],
  },
  {
    group: "Cloud, Tools & OS",
    items: ["Firebase", "CloudKit", "SwiftData", "GitHub", "Linux", "SSH", "Docker"],
  },
];

const EXPERIENCE = [
  {
    role: "AI Engineer",
    org: "Ejada",
    period: "Sep 2025 – Present",
    points: [
      "AI Consultant during pre-sales — solution design, technical proposals, and POC development for large governmental entities and ministries.",
      "Managed projects end-to-end as Project Manager: scope, planning, delivery scheduling, risk and change management.",
      "Built internal AI-powered solutions using NLP, computer vision, and API integrations to automate workflows.",
    ],
  },
  {
    role: "AI Engineer R&D Training",
    org: "SDAIA (NCAI)",
    period: "Jan 2025 – May 2025",
    points: [
      "Built a real-time video analytics system with NVIDIA DeepStream SDK + GStreamer for people detection and live dashboard monitoring.",
      "Converted models to ONNX for deployment; used CLIP for text-to-image retrieval.",
      "Built a FastAPI + Qdrant backend for a text-to-image retrieval tool, with unit tests and a React labeling UI.",
    ],
  },
  {
    role: "Developer",
    org: "Apple Developer Academy",
    period: "Jul 2024 – Jun 2025",
    points: [
      "Gaming Track: built and shipped \"Hajjat\" (SpriteKit, Saudi-inspired visuals) to the App Store in one month.",
      "Academy Track: built a Smart Journaling app using LLaMA to analyze journal entries alongside Health app data.",
      "Built a savings app with an interactive widget and Siri support for goal tracking.",
    ],
  },
];

const EDUCATION = {
  degree: "B.Sc. in Computer Science",
  school: "Princess Nourah bint Abdulrahman University",
  period: "May 2025",
  note:
    "Graduation project: trained a CNN from scratch to classify children's " +
    "drawings and detect emotions (supporting children with autism), " +
    "integrated a LLaVA vision-language model for image description, and " +
    "used Deep Translator for English→Arabic translation.",
};

const CERTIFICATIONS = [
  "AWS Certified Machine Learning — AWS",
  "SQL in Databases — Oracle",
  "API Testing of Real Web Applications — Postman",
  "Artificial Intelligence Analyst — IBM",
  "PCAP — Cisco Networking Academy",
];

// category: "ai" | "software" — drives the badge color (fixed categorical order)
const PROJECTS = [
  {
    title: "Study Buddy RAG",
    category: "ai",
    stack: "Python · FastAPI · TF-IDF · LLM",
    description:
      "Turns your own study notes into a grounded multiple-choice quiz using retrieval-augmented generation — only relevant passages reach the LLM.",
    audience: "Students",
    repo: "study-buddy-rag",
    tests: 11,
  },
  {
    title: "Fake News Classifier — From Scratch",
    category: "ai",
    stack: "Python · NumPy (manual backprop)",
    description:
      "A neural network with hand-derived forward/backward passes and gradient descent — no ML framework — proven correct with a numerical-gradient check and an XOR sanity test.",
    audience: "Demonstrates NN fundamentals",
    repo: "fake-news-classifier-scratch",
    tests: 11,
  },
  {
    title: "Appointment Agent",
    category: "ai",
    stack: "Python · SQLite · LLM tool-calling",
    description:
      "An LLM agent that chooses which tools to call — add, list, cancel — to manage a real SQLite-backed appointment book from natural language.",
    audience: "Small clinics & businesses",
    repo: "appointment-agent",
    tests: 8,
  },
  {
    title: "Clinic Manager",
    category: "software",
    stack: "Java · Spring Boot · H2",
    description:
      "A layered REST API for patients, appointments, and inventory, with a low-stock business-logic endpoint and full MockMvc test coverage.",
    audience: "Clinics & pharmacies",
    repo: "clinic-manager",
    tests: 20,
  },
  {
    title: "Budget Tracker",
    category: "software",
    stack: "C# · ASP.NET Core · EF Core",
    description:
      "A personal-finance API with categorized transactions and a monthly income/expense summary service, backed by SQLite via Entity Framework Core.",
    audience: "Everyday personal finance",
    repo: "budget-tracker",
    tests: 9,
  },
  {
    title: "Fast Doc Search",
    category: "software",
    stack: "C++ · CMake · Inverted index",
    description:
      "A fully offline CLI that builds a TF-IDF inverted index over a folder of text files for instant, ranked keyword search — no cloud, no internet.",
    audience: "Anyone with a large personal archive",
    repo: "fast-doc-search",
    tests: 25,
  },
  {
    title: "Study Room Realtime",
    category: "software",
    stack: "Node.js · Express · Socket.IO",
    description:
      "A live collaborative study room — shared notes, presence, and chat over real WebSocket connections, tested with genuine socket integration tests.",
    audience: "Student study groups",
    repo: "study-room-realtime",
    tests: 8,
  },
  {
    title: "Volunteer Match",
    category: "software",
    stack: "React 19 · Vite · Express",
    description:
      "A volunteer-opportunity marketplace: browse and filter by category, apply with live spots-remaining tracking, and post new opportunities.",
    audience: "Volunteers & nonprofits",
    repo: "volunteer-match",
    tests: 16,
  },
  {
    title: "Accessible Reader",
    category: "software",
    stack: "HTML · CSS · Vanilla JS",
    description:
      "A zero-dependency text-to-speech reader built on the Web Speech API, with live word highlighting, adjustable rate, and a high-contrast accessible UI.",
    audience: "Visually impaired users",
    repo: "accessible-reader",
    tests: 29,
  },
  {
    title: "Voice Accessibility Assistant",
    category: "ai",
    stack: "Python · Rule-based NLU",
    description:
      "A voice-controlled computer assistant: a swappable speech-to-text layer feeds a rule-based intent parser that drives real mouse/keyboard actions.",
    audience: "Users with motor impairments",
    repo: "voice-accessibility-assistant",
    tests: 22,
  },
];

const CATEGORY_LABELS = { ai: "AI / ML", software: "Software" };
