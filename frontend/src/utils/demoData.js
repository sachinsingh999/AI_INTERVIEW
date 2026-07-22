export const demoInterviews = [
  {
    _id: "demo-video",
    role: "Frontend Developer",
    difficulty: "Medium",
    interviewType: "video",
    language: "",
    answeredCount: 6,
    questionCount: 10,
    questions: [
      "Tell me about a complex UI you built and how you handled performance.",
      "How would you explain React state management to a junior developer?",
      "Describe a time you disagreed with a design decision.",
      "How do you debug layout issues across screen sizes?",
      "What would you improve in our interview platform UI?",
    ],
  },
  {
    _id: "demo-code",
    role: "Full Stack Developer",
    difficulty: "Hard",
    interviewType: "code",
    language: "JavaScript",
    answeredCount: 3,
    questionCount: 8,
    questions: [
      "Write a function that groups users by role and returns sorted counts.",
      "Build a debounce utility and explain where you would use it.",
      "Design an API response cache with expiry.",
      "Find the first non-repeating character in a string.",
    ],
  },
  {
    _id: "demo-standard",
    role: "Backend Developer",
    difficulty: "Easy",
    interviewType: "standard",
    language: "",
    answeredCount: 8,
    questionCount: 8,
    questions: [
      "What is middleware in Express?",
      "Explain authentication with JWT.",
      "How do you structure a MongoDB schema?",
      "What is error handling in an API?",
    ],
  },
];

export const getDemoInterview = (id) =>
  demoInterviews.find((interview) => interview._id === id) ||
  demoInterviews[0];

export const createDemoInterview = ({
  role,
  difficulty,
  interviewType,
  language,
  resumeText = "",
}) => {
  const lowerResume = (resumeText || "").toLowerCase();
  const hasReact = lowerResume.includes("react") || lowerResume.includes("frontend") || lowerResume.includes("web");
  const hasNode = lowerResume.includes("node") || lowerResume.includes("backend") || lowerResume.includes("express");
  const hasSQL = lowerResume.includes("sql") || lowerResume.includes("database") || lowerResume.includes("mongo");

  let questions = [];
  if (interviewType === "code") {
    questions = [
      `Solve a ${language} coding problem focusing on array manipulations.`,
      "Write a function to search through logs and return occurrences.",
      "Implement a priority queue sorting task in JavaScript."
    ];
  } else if (interviewType === "video") {
    questions = [
      "Introduce yourself and highlight the key achievements listed on your resume.",
      hasReact ? "In your resume, you listed React. Explain how you optimized state and renders in a recent project." : "Explain a complex architectural decision you made under pressure.",
      "Describe a time you faced a challenging conflict in a team. How did you resolve it?",
      hasNode ? "How do you handle API request scaling and async event loops in your services?" : "Describe your system debugging process out loud.",
      "Why are you the perfect fit for this mock role?"
    ];
  } else {
    questions = [
      "Walk me through your professional experience and primary engineering projects.",
      hasReact ? "What is your approach to setting up scalable React folders and state management?" : "What are your strongest technical and soft skills?",
      hasSQL ? "In your resume projects, how did you structure your databases, migrations, or indexes?" : "Describe a technical project that you are most proud of.",
      "How do you handle architectural feedback and design tradeoffs?",
      "What are you hoping to learn and improve upon in your next role?"
    ];
  }

  return {
    _id: `demo-${Date.now()}`,
    role: role || "Demo Developer",
    difficulty,
    interviewType,
    language: interviewType === "code" ? language : "",
    answeredCount: 0,
    questionCount: questions.length,
    questions,
  };
};

export const demoReport = {
  totalAnswered: 5,
  averageScore: "9.3",
  performance: "Selected / Excellent",
  answers: [
    {
      _id: "demo-answer-1",
      question: "Aptitude Assessment: Work & Time & Logical Sequence",
      answer: "Option B (5/12) selected for Work & Time. Option A (127) selected for Logical Series.",
      score: 9,
      feedback: "Strong mathematical aptitude and analytical reasoning. 100% accuracy achieved on quantitative questions.",
      keyPoints: ["Work-rate formula application", "Geometric progression pattern identification", "Modular arithmetic correctness"],
      missingPoints: [],
      idealAnswer: "Option B (5/12) is correct because A's rate = 1/12 and B's rate = 1/16 per day. Combined 4-day work = 4*(1/12 + 1/16) = 7/12. Unfinished = 1 - 7/12 = 5/12.",
      howToSay: "State the individual rates clearly before summing them to avoid confusion during rapid calculation."
    },
    {
      _id: "demo-answer-2",
      question: "Technical Coding 1: Valid Anagram & Frequency Map",
      answer: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let char of s) count[char] = (count[char] || 0) + 1;\n  for (let char of t) {\n    if (!count[char]) return false;\n    count[char]--;\n  }\n  return true;\n}",
      score: 10,
      feedback: "Optimal O(N) time complexity and O(1) space complexity solution. All 10/10 test cases passed successfully.",
      keyPoints: ["Hash map frequency counting", "Early length check validation", "O(N) single-pass iteration"],
      missingPoints: [],
      idealAnswer: "Using a character frequency map allows single-pass string inspection with O(N) linear time and O(1) auxiliary space for English alphabet characters.",
      howToSay: "Emphasize early exit conditions like string length mismatch before allocating hash tables."
    },
    {
      _id: "demo-answer-3",
      question: "Technical Coding 2: Maximum Subarray Sum (Kadane's Algorithm)",
      answer: "function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}",
      score: 10,
      feedback: "Excellent execution of Kadane's algorithm. Handled negative numbers and single-element array edge cases correctly.",
      keyPoints: ["Dynamic programming recurrence relation", "Kadane's O(N) space optimization", "Edge case coverage for all negative numbers"],
      missingPoints: [],
      idealAnswer: "Kadane's algorithm dynamically tracks the local maximum subarray ending at index i, updating global maximum in linear time O(N).",
      howToSay: "Explain that Kadane's algorithm avoids brute-force O(N^2) loops by resetting currentSum when it drops below zero."
    },
    {
      _id: "demo-answer-4",
      question: "System Architecture & Scalable API Gateway (Tech Round 2)",
      answer: "Designed a distributed API Gateway with Token Bucket rate limiting backed by Redis Cluster. Used JWT authentication middleware and asynchronous NGINX reverse proxying.",
      score: 8.5,
      feedback: "Well-structured high level architecture. Demonstrated solid understanding of microservice rate-limiting and caching layers.",
      keyPoints: ["Redis sliding window / token bucket rate limiting", "Decentralized JWT validation", "Horizontal Gateway scaling behind L4 load balancers"],
      missingPoints: ["Circuit breaker pattern details (Hystrix/Resilience4j)"],
      idealAnswer: "A scalable API Gateway handles SSL termination, rate-limiting via Redis clusters, and route proxying with circuit breaker fallbacks for failing downstream services.",
      howToSay: "Highlight trade-offs between centralized Redis rate-limiting vs localized memory rate-limiting under high latency."
    },
    {
      _id: "demo-answer-5",
      question: "Behavioral: Conflict Resolution & Team Alignment (HR Round)",
      answer: "[Situation]: Disagreed on database migration strategy (SQL vs NoSQL).\n[Task]: Align team on schema choice before sprint deadline.\n[Action]: Benchmarked write throughput, presented benchmarking metrics to team lead.\n[Result]: Team adopted PostgreSQL JSONB, meeting latency SLA by 40%.",
      score: 9.0,
      feedback: "Exceptional STAR framework structure. Concrete metrics provided to justify technical decision and resolution.",
      keyPoints: ["Data-driven conflict resolution", "STAR method adherence", "Team collaboration and stakeholder alignment"],
      missingPoints: [],
      idealAnswer: "Resolving technical conflicts requires objective data benchmarking, active listening, and focusing on business SLAs over personal preference.",
      howToSay: "Quantify the outcome (e.g. 40% performance gain) at the end of your STAR response."
    }
  ]
};

export const demoProfile = {
  user: {
    name: "Demo Candidate",
    email: "demo@example.com",
  },
  summary: {
    categories: 3,
    totalAnswered: 17,
    bestRank: 2,
  },
  rankings: [
    {
      role: "Frontend Developer",
      rank: 2,
      totalUsers: 12,
      averageScore: 8.4,
      answeredCount: 9,
      leaderName: "Aarav",
      leaderScore: 9.1,
    },
    {
      role: "Backend Developer",
      rank: 4,
      totalUsers: 15,
      averageScore: 7.8,
      answeredCount: 5,
      leaderName: "Meera",
      leaderScore: 9,
    },
    {
      role: "Full Stack Developer",
      rank: 3,
      totalUsers: 9,
      averageScore: 8,
      answeredCount: 3,
      leaderName: "Rohan",
      leaderScore: 8.8,
    },
  ],
};
