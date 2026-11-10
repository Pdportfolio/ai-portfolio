export const person = {
  name: "Prakhar Dwivedi",
  role: "AI/ML Engineer",
  email: "prakhardwivedipd1117@gmail.com",
  github: "https://github.com/prakharpd",
  linkedin: "http://www.linkedin.com/in/prakhardwivedi-pd",
  resume: "/resume.pdf",
  summary:
    "AI/ML Engineer with ML modeling, deep learning, and AI systems (LLM, RAG) experience — built through a Data Science internship at IIM Indore and self-directed projects in computer vision, NLP, and AI agents. Skilled in Python, Deep Learning, and Generative AI, with model deployment via Fast API.",
  heroFact:
    "At Procureright, built an agentic extraction loop across 4135+ SKUs at 85% accuracy with a free open-weight LLM.",
} as const;

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
] as const;

export const projects = [
  {
    title: "CNN-Ensemble Model for Real-Time Surface Roughness Prediction",
    body: "90% predictive accuracy, R² 0.90, combining CNN feature extraction with a stacked XGBoost/SVM ensemble; deployed into a real-time computer-vision GUI with <1 min latency.",
    github: "https://github.com/prakharpd/CNN-Ensemble-Surface-Roughness-Model",
    demo: null,
  },
  {
    title: "Audio-to-Meeting-Minutes Generator",
    body: "LangChain + Hugging Face + OpenAI Whisper pipeline; automated ~70% of manual documentation; structured meeting minutes in <5 min.",
    github: "https://github.com/prakharpd/meeting_minutes_generator",
    demo: "https://huggingface.co/spaces/Pd18/Meeting_Minutes",
  },
  {
    title: "Agentic AI Portfolio Lead Capture Assistant",
    body: "Local RAG pipeline (Ollama + Transformers) with section-based chunking, ~50% token efficiency gain; autonomous function-calling tools + SMTP notifications for 100% automated lead capture.",
    github: "https://github.com/prakharpd/Agentic-Portfolio",
    demo: "https://huggingface.co/spaces/Pd18/AI_Avatar",
  },
  {
    title: "S.I.R. Disease Machine Learning Model",
    body: "Disease-spread forecasting using the S.I.R. framework, with a 2026 hybrid physics-ANN extension (differential equation as physics prior + ANN correction layer).",
    github: "https://github.com/prakharpd/S.I.R._Disease_Machine_Learning_Model",
    demo: null,
  },
  {
    title: "Movie Ratings Visualization",
    body: "Analyzed genre-vs-budget relationships across ~560 movies, with multi-plot visualization in R/ggplot2.",
    github: "https://github.com/prakharpd/R-Programming-Movie_Ratings_Visulization",
    demo: null,
  },
] as const;

export const experience = [
  {
    title: "AI Engineer",
    org: "Procureright",
    place: "On-Site",
    dates: "Aug 2026 – Present",
    bullets: [
      "Built an end-to-end Agentic Loop System with an eval system extracting vendor, contact, and product details across 4135+ SKUs at 85% accuracy, using a free open-weight LLM.",
      "Built a 15,906+ product search system with 0.4 min latency and 80% accuracy in production.",
      "Built a production-grade FAQ chatbot with order-status tool calling.",
    ],
  },
  {
    title: "Data Science Intern",
    org: "IIM Indore",
    place: "On-Site",
    dates: "May 2023 – Jul 2023",
    bullets: [
      "S.I.R. ML Model: disease-spread forecasting using the S.I.R. framework (linear regression fit to epidemiological data, numerically solved differential equation), R² 0.91.",
      "Movie Data Viz: analyzed genre-vs-budget relationships across ~560 movies, multi-plot visualization in R/ggplot2.",
      "2026 follow-up: extended the S.I.R. model into a hybrid physics-ANN architecture (differential equation as physics prior + ANN correction layer), R² 0.89, RMSE 19.4 on non-linear data.",
    ],
  },
  {
    title: "Web Developer",
    org: "Counselxperts",
    place: "College Startup",
    dates: "Jul 2023 – Sep 2023",
    bullets: [
      "Onboarded 100+ users, cut transaction time ~40% via responsive payment UI, built a reusable React starter adopted team-wide.",
    ],
  },
  {
    title: "Web Developer",
    org: "Sawari",
    place: "College Startup",
    dates: "Dec 2022 – Feb 2023",
    bullets: [
      "Cut payment processing time ~60% (5min → 2min) via Google Forms payment workflow, increased engagement via a marketing site section.",
    ],
  },
  {
    title: "Operations & Strategy Associate",
    org: "Competitive Conqueror",
    place: "College Startup",
    dates: "Aug 2022 – Oct 2022",
    bullets: ["₹10,000+ profit in 8 weeks with zero capital."],
  },
] as const;

export const skillGroups = [
  { name: "Programming", items: ["Python", "R"] },
  {
    name: "Generative AI",
    items: ["LLM Engineering", "Context Engineering", "Vector Embedding", "NLP", "Model Evaluation"],
  },
  {
    name: "Machine Learning",
    items: ["TensorFlow", "PyTorch", "Scikit-learn", "CNN", "ANN", "Deep Learning"],
  },
  { name: "Computer Vision", items: ["OpenCV"] },
  {
    name: "Data Analysis",
    items: ["Pandas", "NumPy", "SciPy", "SQL", "Matplotlib", "ggplot2", "Statistical Analysis"],
  },
  {
    name: "Agentic AI",
    items: [
      "OpenAI Agents SDK",
      "LangChain",
      "LangGraph",
      "Pydantic AI",
      "RAG",
      "Tool Calling",
      "PG Vector",
    ],
  },
  { name: "Deployment", items: ["FastAPI", "Gradio", "Hugging Face Spaces"] },
  { name: "Web Development", items: ["React.js", "Node.js", "Express.js"] },
  { name: "Tools", items: ["Git", "GitHub"] },
] as const;

export const education = [
  {
    school: "National Institute of Technology, Andhra Pradesh",
    detail: "B.Tech, CGPA 7.91/10",
    dates: "2021–2025",
  },
  {
    school: "Lions School, Lal Diggi, Mirzapur, UP",
    detail: "Intermediate (Science), CGPA 10/10; High School (Science), 94.8%",
    dates: null,
  },
] as const;

export const certifications = [
  "Machine Learning Specialization (Stanford Online/DeepLearning.AI)",
  "Agentic AI Fundamentals & Generative AI Fundamentals (LinkedIn Learning)",
  "NSO: 1st (Class), 242nd (Int'l)",
  "IOM: 2nd (Class), 274th (Int'l)",
] as const;
