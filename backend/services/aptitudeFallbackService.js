const OAQuestion = require("../models/OAQuestion");
const AptitudeQuestion = require("../models/AptitudeQuestion");

/**
 * Fallback mechanism to fill remaining required aptitude questions from MongoDB.
 * Ensures exactly 10 unique, non-duplicative, schema-valid questions are produced.
 *
 * @param {number} neededCount - Number of additional questions needed to reach 10
 * @param {Array} existingQuestions - Array of question objects already selected
 * @param {Object} context - Candidate context { jobRole, difficulty }
 * @returns {Promise<Array>} List of formatted fallback question objects
 */
async function getFallbackAptitudeQuestions(neededCount, existingQuestions = [], context = {}) {
  if (neededCount <= 0) return [];

  const existingTexts = new Set(
    existingQuestions.map((q) => (q?.question ? q.question.toLowerCase().trim() : ""))
  );

  const { jobRole = "Software Engineer", difficulty = "Medium" } = context;

  let fallbackResults = [];

  try {
    // 1. Fetch from OAQuestion collection in random order using aggregate sample
    const count = await OAQuestion.countDocuments();
    if (count > 0) {
      const sampleSize = Math.min(count, Math.max(neededCount * 2, 30));
      const oaCandidates = await OAQuestion.aggregate([
        { $sample: { size: sampleSize } }
      ]);
      for (const item of oaCandidates) {
        const normalized = item.question ? item.question.toLowerCase().trim() : "";
        if (normalized && !existingTexts.has(normalized)) {
          existingTexts.add(normalized);
          fallbackResults.push(formatOADoc(item));
          if (fallbackResults.length >= neededCount) break;
        }
      }
    }

    // 2. Fetch from AptitudeQuestion collection if more are needed
    if (fallbackResults.length < neededCount) {
      const aptCount = await AptitudeQuestion.countDocuments();
      if (aptCount > 0) {
        const sampleSize = Math.min(aptCount, Math.max(neededCount * 2, 30));
        const aptCandidates = await AptitudeQuestion.aggregate([
          { $sample: { size: sampleSize } }
        ]);
        for (const item of aptCandidates) {
          const normalized = item.question ? item.question.toLowerCase().trim() : "";
          if (normalized && !existingTexts.has(normalized)) {
            existingTexts.add(normalized);
            fallbackResults.push(formatAptitudeQuestionDoc(item));
            if (fallbackResults.length >= neededCount) break;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error retrieving fallback aptitude questions from MongoDB:", err.message);
  }

  // 3. Built-in Static Safety Pool Fallback (Guarantees completion under any condition)
  if (fallbackResults.length < neededCount) {
    const staticPool = getStaticAptitudePool();
    const shuffledStatic = [...staticPool].sort(() => 0.5 - Math.random());
    for (const item of shuffledStatic) {
      const normalized = item.question.toLowerCase().trim();
      if (!existingTexts.has(normalized)) {
        existingTexts.add(normalized);
        fallbackResults.push(item);
        if (fallbackResults.length >= neededCount) break;
      }
    }
  }

  return fallbackResults.slice(0, neededCount);
}

/**
 * Format AptitudeQuestion Document into standard Schema
 */
function formatAptitudeQuestionDoc(doc) {
  let letterAns = "A";
  if (typeof doc.correctAnswer === "number" && doc.correctAnswer >= 0 && doc.correctAnswer <= 3) {
    letterAns = ["A", "B", "C", "D"][doc.correctAnswer];
  } else if (typeof doc.correctAnswer === "string" && ["A", "B", "C", "D"].includes(doc.correctAnswer.toUpperCase())) {
    letterAns = doc.correctAnswer.toUpperCase();
  }

  return {
    id: doc._id ? doc._id.toString() : null,
    type: "aptitude",
    category: doc.topic || doc.subtopic || "Logical Reasoning",
    difficulty: doc.difficulty || "Medium",
    question: doc.question,
    options: Array.isArray(doc.options) ? doc.options : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: letterAns,
    explanation: doc.explanation || "Calculated step by step based on logical and quantitative principles.",
    timeLimit: 60,
    marks: 1,
  };
}

/**
 * Format OAQuestion Document into standard Schema
 */
function formatOADoc(doc) {
  return {
    id: doc._id ? doc._id.toString() : null,
    type: "aptitude",
    category: doc.category || doc.topic || "Logical Reasoning",
    difficulty: doc.difficulty || "Medium",
    question: doc.question,
    options: Array.isArray(doc.options) ? doc.options : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: doc.correctAnswer || "A",
    explanation: doc.explanation || "Calculated based on standard logical and quantitative principles.",
    timeLimit: doc.timeLimit || 60,
    marks: doc.marks || 1,
  };
}

/**
 * Built-in static fallback pool
 */
function getStaticAptitudePool() {
  return [
    {
      id: null,
      type: "aptitude",
      category: "Quantitative Aptitude",
      difficulty: "Easy",
      question: "A developer completes a task in 12 hours, and another completes it in 24 hours. How long will they take working together?",
      options: ["8 hours", "6 hours", "10 hours", "4 hours"],
      correctAnswer: "A",
      explanation: "Combined rate = 1/12 + 1/24 = 3/24 = 1/8. Time required = 8 hours.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Logical Reasoning",
      difficulty: "Easy",
      question: "Find the next number in the sequence: 2, 6, 12, 20, 30, ...",
      options: ["42", "40", "36", "48"],
      correctAnswer: "A",
      explanation: "Differences increase by 2: +4, +6, +8, +10, so +12 -> 30 + 12 = 42.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Verbal Ability",
      difficulty: "Easy",
      question: "Which of the following is a synonym for 'OPTIMIZE'?",
      options: ["Streamline", "Complicate", "Ignore", "Decline"],
      correctAnswer: "A",
      explanation: "Optimize means to make as effective or functional as possible, synonymous with streamline.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Data Interpretation",
      difficulty: "Medium",
      question: "If a server's memory usage increases by 20% and then decreases by 10%, what is the net percentage change?",
      options: ["8% increase", "10% increase", "2% increase", "5% decrease"],
      correctAnswer: "A",
      explanation: "1.20 * 0.90 = 1.08, which represents an 8% net increase.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Logical Reasoning",
      difficulty: "Medium",
      question: "In a code language, 'DEBUG' is written as 'EFCVH'. How is 'BUILD' written in that language?",
      options: ["CVJME", "CVKME", "BWJME", "CUKMD"],
      correctAnswer: "A",
      explanation: "Shift each character forward by 1 letter: B->C, U->V, I->J, L->M, D->E.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Analytical Reasoning",
      difficulty: "Medium",
      question: "Four microservices A, B, C, D execute sequentially. A runs before B. C runs after B. D runs before A. What is the execution order?",
      options: ["D, A, B, C", "A, B, C, D", "D, B, A, C", "B, A, D, C"],
      correctAnswer: "A",
      explanation: "D is before A, A is before B, B is before C -> Order: D, A, B, C.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Numerical Ability",
      difficulty: "Medium",
      question: "What is the probability of selecting a prime number from integers between 1 and 10 inclusive?",
      options: ["4/10", "3/10", "5/10", "2/10"],
      correctAnswer: "A",
      explanation: "Prime numbers between 1 and 10 are 2, 3, 5, 7 (4 numbers). Probability = 4/10 = 0.4.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Permutation & Combination",
      difficulty: "Hard",
      question: "In how many distinct ways can the letters of the word 'API' be arranged?",
      options: ["6", "3", "12", "4"],
      correctAnswer: "A",
      explanation: "3 distinct letters = 3! = 3 * 2 * 1 = 6 ways.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Time Speed Distance",
      difficulty: "Hard",
      question: "A data packet travels through Network Node 1 at 60 Mbps and returns via Node 2 at 40 Mbps. What is the average speed for the round trip?",
      options: ["48 Mbps", "50 Mbps", "45 Mbps", "52 Mbps"],
      correctAnswer: "A",
      explanation: "Harmonic mean = 2 * (60 * 40) / (60 + 40) = 4800 / 100 = 48 Mbps.",
      timeLimit: 60,
      marks: 1,
    },
    {
      id: null,
      type: "aptitude",
      category: "Number System",
      difficulty: "Hard",
      question: "What is the unit digit of 3^40?",
      options: ["1", "3", "9", "7"],
      correctAnswer: "A",
      explanation: "Powers of 3 repeat in cycles of 4 (3, 9, 7, 1). Since 40 is divisible by 4, the unit digit is 1.",
      timeLimit: 60,
      marks: 1,
    },
  ];
}

module.exports = {
  getFallbackAptitudeQuestions,
};
