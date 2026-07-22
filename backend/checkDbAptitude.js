const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const OAQuestion = require("./models/OAQuestion");
const AptitudeQuestion = require("./models/AptitudeQuestion");

async function checkDb() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-interview-app";
  console.log("Connecting to MongoDB at:", mongoUri);

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!\n");

    const oaCount = await OAQuestion.countDocuments();
    const aptCount = await AptitudeQuestion.countDocuments();

    console.log("================ MongoDB Question Counts ================");
    console.log(`1. OAQuestion Collection Count:        ${oaCount}`);
    console.log(`2. AptitudeQuestion Collection Count:  ${aptCount}`);
    console.log("=========================================================\n");

    if (oaCount > 0) {
      console.log("Sample OAQuestion Items:");
      const samples = await OAQuestion.find().limit(3).lean();
      samples.forEach((item, index) => {
        console.log(`\n--- Sample ${index + 1} ---`);
        console.log(`Question: ${item.question}`);
        console.log(`Category: ${item.category || item.topic}`);
        console.log(`Difficulty: ${item.difficulty}`);
        console.log(`Options: ${JSON.stringify(item.options)}`);
        console.log(`Correct Answer: ${item.correctAnswer}`);
      });
    }

    if (aptCount > 0) {
      console.log("\nSample AptitudeQuestion Items:");
      const samplesApt = await AptitudeQuestion.find().limit(3).lean();
      samplesApt.forEach((item, index) => {
        console.log(`\n--- Aptitude Sample ${index + 1} ---`);
        console.log(`Question: ${item.question}`);
        console.log(`Topic: ${item.topic}`);
        console.log(`Difficulty: ${item.difficulty}`);
        console.log(`Options: ${JSON.stringify(item.options)}`);
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error connecting or querying MongoDB:", err.message);
  }
}

checkDb();
