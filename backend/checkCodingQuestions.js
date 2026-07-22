require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");
const OAQuestion = require("./models/OAQuestion");
const POTD = require("./models/POTD");

async function checkCodingDB() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://sachinkumar:sachin@cluster0.wgiqq.mongodb.net/AI?appName=Cluster0";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!\n");

    const questionCount = await Question.countDocuments();
    const oaCount = await OAQuestion.countDocuments();
    const potdCount = await POTD.countDocuments();

    console.log("================ MongoDB Coding Question Counts ================");
    console.log(`1. 'questions' collection count:    ${questionCount}`);
    console.log(`2. 'oaquestions' collection count:  ${oaCount}`);
    console.log(`3. 'potds' collection count:        ${potdCount}`);
    console.log("=================================================================\n");

    if (questionCount > 0) {
      const sampleQuestions = await Question.find({}).limit(5).lean();
      console.log("--- Sample items from 'questions' collection ---");
      sampleQuestions.forEach((q, idx) => {
        console.log(`[${idx + 1}] Title: ${q.title}`);
        console.log(`    Category/Topic: ${q.topic || q.category || q.tags?.join(", ") || "N/A"}`);
        console.log(`    Difficulty: ${q.difficulty || "N/A"}`);
        console.log(`    Description snippet: ${(q.description || "").slice(0, 100)}...\n`);
      });
    }

    if (oaCount > 0) {
      const sampleOA = await OAQuestion.find({}).limit(5).lean();
      console.log("--- Sample items from 'oaquestions' collection ---");
      sampleOA.forEach((q, idx) => {
        console.log(`[${idx + 1}] Question: ${q.question || q.title}`);
      });
    }

    if (potdCount > 0) {
      const samplePOTD = await POTD.find({}).limit(5).lean();
      console.log("--- Sample items from 'potds' collection ---");
      samplePOTD.forEach((q, idx) => {
        console.log(`[${idx + 1}] Title: ${q.title}`);
      });
    }

  } catch (err) {
    console.error("Error checking database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

checkCodingDB();
