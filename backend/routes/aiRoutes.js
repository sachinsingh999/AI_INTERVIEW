const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Verified knowledge base matching the ACTUAL CodeForge application
const KNOWLEDGE_BASE = [
  {
    keywords: ["phase", "phases", "stage", "stages", "round", "rounds", "format", "process", "loop", "how it works"],
    title: "🎯 3-Phase Interview Loop",
    response:
      "CodeForge guides you through a realistic 3-phase technical interview:\n\n• **Phase 1: Aptitude Assessment** – Timed multiple-choice questions covering quantitative and logical reasoning.\n• **Phase 2: Technical Round 1 (Core Concepts)** – Fundamentals, architecture, and concepts tailored to your role and skills.\n• **Phase 3: Technical Round 2 (Coding & Problem Solving)** – Live coding in our Monaco editor with compiler execution and test suites.",
    keyPoints: [
      "Phase 1: Aptitude & Logical Reasoning (Timed MCQs)",
      "Phase 2: Technical Round 1 (Core Concepts & Stack)",
      "Phase 3: Technical Round 2 (Live Coding & Compiler)"
    ],
    suggestedFollowUps: [
      "Can CodeForge tailor questions from my resume?",
      "Which programming languages can I code in?",
      "Is CodeForge free to use?"
    ]
  },
  {
    keywords: ["resume", "cv", "upload", "tailor", "personalize", "custom"],
    title: "📄 Resume-Tailored Questions",
    response:
      "Yes. When setting up an interview, you can upload your PDF or DOCX resume. CodeForge extracts your tech stack, skills, and past experience to generate personalized interview questions grounded in your background.",
    keyPoints: [
      "Upload PDF or DOCX resume",
      "Automated skill & tech stack extraction",
      "Personalized questions matching your real experience"
    ],
    suggestedFollowUps: [
      "What are the 3 interview phases?",
      "Which programming languages are supported?",
      "Is CodeForge completely free?"
    ]
  },
  {
    keywords: ["language", "languages", "compiler", "run", "execute", "python", "javascript", "typescript", "java", "c++", "go", "code"],
    title: "💻 Multi-Language Coding Runtime",
    response:
      "CodeForge includes an in-browser Monaco coding editor supporting Python, JavaScript, TypeScript, Java, C++, and Go. Your code runs against automated test cases with real-time output and execution feedback.",
    keyPoints: [
      "Supported: Python, JavaScript, TypeScript, Java, C++, Go",
      "In-browser Monaco editor with syntax highlighting",
      "Automated test case assertions and console output"
    ],
    suggestedFollowUps: [
      "What are the 3 interview phases?",
      "Can I practice daily coding problems?",
      "Is CodeForge free to use?"
    ]
  },
  {
    keywords: ["free", "cost", "price", "pricing", "pay", "subscription", "trial", "credit card"],
    title: "💎 100% Free Candidate Access",
    response:
      "CodeForge is 100% free for candidates. There are no credit cards required, no subscription paywalls, and no session limits. You get full access to the 3-phase interview loop, resume tailoring, and the compiler.",
    keyPoints: [
      "No credit card required",
      "Unlimited mock interview sessions",
      "Full compiler and resume tailoring access"
    ],
    suggestedFollowUps: [
      "How do I start a mock interview?",
      "What are the 3 interview phases?",
      "Can I upload my resume?"
    ]
  },
  {
    keywords: ["potd", "practice", "roadmap", "daily", "challenge", "challenges"],
    title: "🚀 Practice Hub & Daily Challenges",
    response:
      "In addition to mock interviews, CodeForge includes a Practice Hub with Daily Challenges (Problem of the Day / POTD) and structured roadmaps to sharpen your data structures, algorithms, and core fundamentals.",
    keyPoints: [
      "Daily Problem of the Day (POTD)",
      "Role-based learning roadmaps",
      "Interactive coding practice with test cases"
    ],
    suggestedFollowUps: [
      "What are the 3 interview phases?",
      "Which programming languages are supported?",
      "Is CodeForge free?"
    ]
  }
];

function findFallbackAnswer(query) {
  const cleanedQuery = query.toLowerCase().replace(/codeforge/g, "");
  const normalized = query.toLowerCase();

  if (
    normalized.includes("what is") ||
    normalized.includes("tell me about") ||
    normalized.includes("overview") ||
    normalized.includes("about codeforge")
  ) {
    return {
      title: "🤖 CodeForge Overview",
      response:
        "CodeForge is an AI-powered technical interview simulator. It guides candidates through a 3-phase hiring loop: Phase 1 Aptitude MCQs, Phase 2 Core Technical Concepts, and Phase 3 Live Coding with an in-browser Monaco compiler in Python, JS, TS, Java, C++, and Go. You can upload your resume for personalized questions, and it is 100% free.",
      keyPoints: [
        "3-Phase Interview Loop (Aptitude, Core Tech, Live Coding)",
        "Resume-tailored question generation",
        "Multi-language in-browser compiler",
        "100% free with no credit card required"
      ],
      suggestedFollowUps: [
        "How do the 3 interview phases work?",
        "Can I upload my resume for custom questions?",
        "Which programming languages are supported?"
      ]
    };
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, "i");
      if (regex.test(cleanedQuery) || regex.test(normalized)) {
        score += 3;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch || KNOWLEDGE_BASE[0];
}

// POST /api/ai/ask-app
// Public endpoint for visitors to ask anything regarding CodeForge
router.post("/ask-app", async (req, res) => {
  const prompt = req.body.prompt || req.body.question || "";
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Please provide a question." });
  }

  const cleanPrompt = prompt.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are the CodeForge Platform Assistant on the landing page.
Ground truth about CodeForge:
1. 3-Phase Interview Loop:
   - Phase 1: Aptitude Assessment (timed MCQs on quantitative and logical reasoning).
   - Phase 2: Technical Round 1 (Core Concepts & Fundamentals based on selected role and tech stack).
   - Phase 3: Technical Round 2 (Live Coding & Problem Solving with Monaco editor & compiler in Python, JavaScript, TypeScript, Java, C++, Go).
2. Resume Personalization: Upload PDF/DOCX resume to extract tech stack and generate personalized questions.
3. Practice & POTD: Problem of the Day daily challenges and coding practice.
4. 100% Free: No credit cards, completely free candidate access.

Instructions:
- Answer in 2 to 3 concise sentences maximum.
- Be direct, accurate, and encouraging.
- Never invent fictional 4th phases or unsupported features.`
    });

    const aiRes = await model.generateContent(cleanPrompt);
    const rawText = aiRes.response.text().trim();
    const fallbackData = findFallbackAnswer(cleanPrompt);

    return res.json({
      success: true,
      source: "gemini",
      response: rawText || fallbackData.response,
      keyPoints: fallbackData.keyPoints || [],
      suggestedFollowUps: fallbackData.suggestedFollowUps || []
    });
  } catch (err) {
    console.warn("[ask-app fallback]:", err.message);
    const fallback = findFallbackAnswer(cleanPrompt);
    return res.json({
      success: true,
      source: "knowledge_base",
      response: fallback.response,
      keyPoints: fallback.keyPoints,
      suggestedFollowUps: fallback.suggestedFollowUps
    });
  }
});

module.exports = router;
