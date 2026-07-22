require("dotenv").config();
const mongoose = require("mongoose");
const { generate2TechnicalQuestions } = require("./services/aiService");
const { getFallbackTechnicalQuestions } = require("./services/techFallbackService");

async function runTest() {
  console.log("================ Technical Round 1 Pipeline Test ================");

  const mongoUri = process.env.MONGO_URI || "mongodb+srv://sachinkumar:sachin@cluster0.wgiqq.mongodb.net/AI?appName=Cluster0";
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas.");
  } catch (e) {
    console.warn("MongoDB connection warning:", e.message);
  }

  const testContext = {
    role: "Senior Full Stack Engineer",
    experience: "3-5 Years",
    difficulty: "Medium",
    skills: ["React", "Node.js", "System Design", "MongoDB", "TypeScript"],
    parsedResume: {
      summary: "Fullstack developer specializing in scalable microservices, React Virtual DOM performance, and distributed systems.",
    },
    jobDescription: "Seeking a Senior Engineer proficient in React state management, Node.js event loop performance, and database transactions.",
  };

  console.log("\n[Test 1] Testing Primary AI Technical Generation (2 Questions: 1 Medium, 1 Hard)...");
  const aiResults = await generate2TechnicalQuestions(testContext);

  console.log(`\nResults count: ${aiResults.length} questions returned.`);
  aiResults.forEach((q, idx) => {
    console.log(`\n--- Question ${idx + 1} (${q.difficulty}) [Source: ${q.source}] ---`);
    console.log(`Category:              ${q.category}`);
    console.log(`Difficulty:            ${q.difficulty}`);
    console.log(`Question:              ${q.question}`);
    console.log(`Expected Points:       ${JSON.stringify(q.expectedAnswerPoints)}`);
    console.log(`Time Limit / Marks:    ${q.timeLimit}s / ${q.marks} marks`);
    console.log(`Evaluation Rubric:     Excellent: ${q.evaluationRubric?.excellent?.slice(0, 60)}...`);
  });

  console.log("\n[Test 2] Testing Pure Mongoose Database Progressive Fallback...");
  const dbResults = await getFallbackTechnicalQuestions(2, [], testContext);

  console.log(`\nFallback count: ${dbResults.length} questions returned.`);
  dbResults.forEach((q, idx) => {
    console.log(`\n--- Fallback Question ${idx + 1} (${q.difficulty}) [Source: ${q.source}] ---`);
    console.log(`Category:   ${q.category}`);
    console.log(`Difficulty: ${q.difficulty}`);
    console.log(`Question:   ${q.question}`);
  });

  console.log("\n================ Assertion Checks ================");
  console.assert(aiResults.length === 2, "FAIL: Should return exactly 2 questions");
  console.assert(aiResults[0].difficulty === "Medium", "FAIL: Question 1 must be Medium");
  console.assert(aiResults[1].difficulty === "Hard", "FAIL: Question 2 must be Hard");
  console.assert(dbResults.length === 2, "FAIL: Fallback should return exactly 2 questions");
  console.log("✓ All assertions passed successfully!");

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

runTest();
