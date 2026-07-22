const mongoose = require("mongoose");
const dotenv = require("dotenv");
const OAQuestion = require("../models/OAQuestion");

dotenv.config();

const sampleAptitudePool = [
  {
    type: "aptitude",
    category: "Quantitative Aptitude",
    difficulty: "Easy",
    topic: "Work & Time",
    jobRole: "Software Engineer",
    question: "A can complete a task in 10 days, and B can complete it in 15 days. How many days will they take if they work together?",
    options: ["6 days", "8 days", "5 days", "7 days"],
    correctAnswer: "A",
    explanation: "Combined 1-day work = (1/10 + 1/15) = (3+2)/30 = 5/30 = 1/6. Days required = 6 days.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Logical Reasoning",
    difficulty: "Easy",
    topic: "Sequence Pattern",
    jobRole: "Software Engineer",
    question: "Identify the next number in the logical series: 5, 11, 23, 47, 95, ...",
    options: ["191", "190", "189", "192"],
    correctAnswer: "A",
    explanation: "Pattern is (N * 2) + 1. (95 * 2) + 1 = 191.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Numerical Ability",
    difficulty: "Easy",
    topic: "Percentage",
    jobRole: "Software Engineer",
    question: "If a developer's salary increases by 15% and then decreases by 10%, what is the net percentage change?",
    options: ["3.5% increase", "5% increase", "2.5% increase", "1.5% decrease"],
    correctAnswer: "A",
    explanation: "Net factor = 1.15 * 0.90 = 1.035, representing a 3.5% net increase.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Analytical Reasoning",
    difficulty: "Medium",
    topic: "Seating Arrangement",
    jobRole: "Software Engineer",
    question: "Five engineers A, B, C, D, E sit in a row. A is next to B, C is next to D. D is not sitting with E who is on the far left. If C is 2nd from right, who sits in the middle?",
    options: ["A", "B", "C", "D"],
    correctAnswer: "A",
    explanation: "Sequence from left to right: E, B, A, C, D. A sits in the 3rd (middle) position.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Data Interpretation",
    difficulty: "Medium",
    topic: "Ratio & Proportion",
    jobRole: "Software Engineer",
    question: "The ratio of backend engineers to frontend engineers in a squad is 3:2. If there are 15 backend engineers, what is the total squad size?",
    options: ["25", "20", "30", "22"],
    correctAnswer: "A",
    explanation: "3 parts = 15 -> 1 part = 5. Total parts = 5 -> Total squad size = 5 * 5 = 25.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Probability",
    difficulty: "Medium",
    topic: "Probability & Statistics",
    jobRole: "Software Engineer",
    question: "Two dice are rolled simultaneously. What is the probability that the sum of the numbers is equal to 7?",
    options: ["1/6", "1/12", "1/4", "5/36"],
    correctAnswer: "A",
    explanation: "Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. Probability = 6/36 = 1/6.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Coding-Decoding",
    difficulty: "Medium",
    topic: "Logical Reasoning",
    jobRole: "Software Engineer",
    question: "In a secret cipher, 'KUBERNETES' is coded as 'LVCFSOFUFT'. How is 'DOCKER' coded?",
    options: ["EPDLSF", "EPDKRE", "EOCLSF", "FPDLSF"],
    correctAnswer: "A",
    explanation: "Shift every character by +1 in alphabetical order: D->E, O->P, C->D, K->L, E->F, R->S -> EPDLSF.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Time Speed Distance",
    difficulty: "Hard",
    topic: "Network Throughput",
    jobRole: "Software Engineer",
    question: "Data Stream A transmits at 80 Mbps for 30 seconds, and Stream B transmits at 120 Mbps for 20 seconds. What is the overall average throughput?",
    options: ["96 Mbps", "100 Mbps", "92 Mbps", "104 Mbps"],
    correctAnswer: "A",
    explanation: "Total bits = (80*30 + 120*20) = 2400 + 2400 = 4800 Megabits. Total time = 50s. Average = 4800/50 = 96 Mbps.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Permutation & Combination",
    difficulty: "Hard",
    topic: "Combinatorics",
    jobRole: "Software Engineer",
    question: "In how many ways can a committee of 3 developers be chosen from a team of 7 developers?",
    options: ["35", "21", "42", "28"],
    correctAnswer: "A",
    explanation: "7C3 = (7 * 6 * 5) / (3 * 2 * 1) = 35 ways.",
    timeLimit: 60,
    marks: 1,
  },
  {
    type: "aptitude",
    category: "Number System",
    difficulty: "Hard",
    topic: "Modular Arithmetic",
    jobRole: "Software Engineer",
    question: "What is the remainder when 2^50 is divided by 7?",
    options: ["4", "2", "1", "5"],
    correctAnswer: "A",
    explanation: "2^3 = 8 ≡ 1 (mod 7). 2^50 = (2^3)^16 * 2^2 ≡ 1^16 * 4 ≡ 4 (mod 7). Remainder is 4.",
    timeLimit: 60,
    marks: 1,
  },
];

async function seedAptitudePool() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-interview-app";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding Aptitude pool...");

    for (const q of sampleAptitudePool) {
      await OAQuestion.updateOne(
        { question: q.question },
        { $set: q },
        { upsert: true }
      );
    }

    console.log(`Successfully seeded ${sampleAptitudePool.length} Aptitude pool questions into MongoDB.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding Aptitude Pool:", err.message);
  }
}

seedAptitudePool();
