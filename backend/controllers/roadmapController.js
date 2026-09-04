const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "dummy_key"
);

// Smart Fallback Roadmap Generator (in case Gemini API is offline or unconfigured)
const getFallbackRoadmap = (role = "Full Stack Engineer", level = "Intermediate", duration = "8 Weeks", focusAreas = "") => {
  const roleName = role || "Software Engineer";
  const focus = focusAreas ? focusAreas : "Data Structures, System Architecture, & Core Practice";

  return {
    title: `AI Personalized ${roleName} Master Roadmap`,
    targetRole: roleName,
    level: level,
    duration: duration,
    summary: `A structured ${duration} learning path tailored for ${level} level. Focuses on ${focus} with actionable milestones.`,
    phases: [
      {
        id: "phase-1",
        phaseNumber: 1,
        title: "1. Core Fundamentals & Coding Mastery",
        duration: "Weeks 1-2",
        badge: "Foundation",
        desc: "Master essential algorithms, data structure operations, and runtime optimization.",
        topics: ["Arrays & Strings", "Hash Tables", "Two Pointers", "Time/Space Complexity"],
        checklist: [
          { id: "p1-c1", text: "Solve 15 Easy & Medium Array manipulation exercises", checked: true },
          { id: "p1-c2", text: "Master Hash Map lookup & frequency counter pattern", checked: true },
          { id: "p1-c3", text: "Implement custom binary search & two-pointer windowing", checked: false },
          { id: "p1-c4", text: "Analyze Big-O time and space complexity for code snippets", checked: false }
        ],
        resources: [
          { label: "DSA Patterns Cheatsheet", link: "/practice/coding", type: "practice" },
          { label: "Big-O Analysis Guide", link: "#", type: "article" }
        ]
      },
      {
        id: "phase-2",
        phaseNumber: 2,
        title: "2. Deep Dive Architecture & System Design",
        duration: "Weeks 3-5",
        badge: "System Design",
        desc: "Learn scalability, microservice communication, database indexing, and caching mechanisms.",
        topics: ["Database Indexing", "Redis Caching", "API Design", "Load Balancing"],
        checklist: [
          { id: "p2-c1", text: "Design a high-throughput URL Shortener / Rate Limiter", checked: false },
          { id: "p2-c2", text: "Compare Write-Through vs Write-Back caching strategies", checked: false },
          { id: "p2-c3", text: "Understand SQL indexing (B-Trees) vs NoSQL document stores", checked: false },
          { id: "p2-c4", text: "Complete 1 System Design MCQ practice quiz", checked: false }
        ],
        resources: [
          { label: "System Design Practice", link: "/practice/technical", type: "practice" },
          { label: "Caching & Scalability Handbook", link: "#", type: "article" }
        ]
      },
      {
        id: "phase-3",
        phaseNumber: 3,
        title: "3. Advanced Problem Solving & Mock Evaluations",
        duration: "Weeks 6-7",
        badge: "Advanced DSA",
        desc: "Conquer complex graph traversals, dynamic programming, and dynamic state trees.",
        topics: ["Graph Traversals (BFS/DFS)", "Dynamic Programming", "Trees & Tries", "Backtracking"],
        checklist: [
          { id: "p3-c1", text: "Solve 10 Graph BFS/DFS shortest path problems", checked: false },
          { id: "p3-c2", text: "Implement DP memoization vs tabulation for 1D/2D problems", checked: false },
          { id: "p3-c3", text: "Practice Tree traversal (Inorder, Preorder, Postorder)", checked: false }
        ],
        resources: [
          { label: "DSA Coding Arena", link: "/practice/coding", type: "practice" },
          { label: "DP Patterns Breakdown", link: "#", type: "article" }
        ]
      },
      {
        id: "phase-4",
        phaseNumber: 4,
        title: "4. Behavioral & Live AI Interview Simulation",
        duration: "Week 8",
        badge: "Interview Ready",
        desc: "Refine verbal delivery, STAR technique response structure, and live technical presentation.",
        topics: ["STAR Technique", "System Explanation", "Communication Flow", "Mock Interview"],
        checklist: [
          { id: "p4-c1", text: "Complete 1 full-length AI Mock Technical Interview", checked: false },
          { id: "p4-c2", text: "Review video feedback & eliminate filler words (target < 3 per min)", checked: false },
          { id: "p4-c3", text: "Prepare 5 behavioral STAR stories for past project challenges", checked: false }
        ],
        resources: [
          { label: "Start AI Mock Interview", link: "/create-interview", type: "practice" },
          { label: "STAR Technique Guide", link: "/practice/hr", type: "article" }
        ]
      }
    ]
  };
};

// Generate AI Roadmap Controller
const generateAIRoadmap = async (req, res) => {
  try {
    const { role = "Full Stack Engineer", level = "Intermediate", duration = "8 Weeks", focusAreas = "" } = req.body;

    console.log(`[AI Roadmap Controller] Generating roadmap for Role: "${role}", Level: "${level}", Duration: "${duration}", Focus: "${focusAreas}"`);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy_key") {
      console.log("[AI Roadmap Controller] GEMINI_API_KEY missing or dummy. Using fallback generator.");
      const fallback = getFallbackRoadmap(role, level, duration, focusAreas);
      return res.json({ success: true, source: "fallback", data: fallback });
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are an elite Tech Career Coach & Principal Engineering Architect.
Generate a structured, highly actionable learning and interview preparation roadmap for a candidate with the following details:
- Target Role: ${role}
- Experience Level: ${level}
- Target Duration: ${duration}
- Specific Focus Areas / Objectives: ${focusAreas || "Comprehensive mastery of core concepts and interview readiness"}

Return ONLY a valid JSON object with NO markdown formatting around it (do not wrap in \`\`\`json).
The JSON object MUST strictly follow this JSON schema:
{
  "title": "A short inspiring title for the roadmap",
  "targetRole": "${role}",
  "level": "${level}",
  "duration": "${duration}",
  "summary": "2-3 sentences summarizing the strategic learning goals for this candidate",
  "phases": [
    {
      "id": "phase-1",
      "phaseNumber": 1,
      "title": "Phase 1 title (e.g. 1. Core Logic & Foundations)",
      "duration": "Week 1-2",
      "badge": "Short 1-2 word badge (e.g. Foundations, Architecture, System Design)",
      "desc": "Short overview description of what to achieve in this phase",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      "checklist": [
        { "id": "p1-c1", "text": "Actionable task item 1", "checked": false },
        { "id": "p1-c2", "text": "Actionable task item 2", "checked": false },
        { "id": "p1-c3", "text": "Actionable task item 3", "checked": false }
      ],
      "resources": [
        { "label": "Resource or Practice Title", "link": "/practice/coding", "type": "practice" },
        { "label": "Article or Guide Title", "link": "#", "type": "article" }
      ]
    }
  ]
}

Make sure to generate 3 to 5 realistic, progressive phases detailing exact algorithms, framework principles, and interview preparation steps required for a candidate targeting ${role}. Ensure checklist items are concrete tasks. Return pure JSON only.
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleaned);

      return res.json({
        success: true,
        source: "gemini",
        data: parsedData
      });

    } catch (aiErr) {
      console.error("[AI Roadmap Controller] Gemini API error, returning fallback:", aiErr.message);
      const fallback = getFallbackRoadmap(role, level, duration, focusAreas);
      return res.json({ success: true, source: "fallback", data: fallback });
    }

  } catch (err) {
    console.error("[AI Roadmap Controller] Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generateAIRoadmap
};
