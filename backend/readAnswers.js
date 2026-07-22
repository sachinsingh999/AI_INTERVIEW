const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sachinkumar:sachin@cluster0.wgiqq.mongodb.net/AI?appName=Cluster0";

async function run() {
  console.log("Connecting to database...");
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const Answer = require("./models/Answer");
    const Interview = require("./models/Interview");

    const answers = await Answer.find({});
    console.log(`Found ${answers.length} total answers in DB:`);
    answers.forEach(a => {
      console.log(`- Answer: "${a.answer}" | Score: ${a.score} | Interview ID: ${a.interview} | Question: "${a.question}"`);
    });

    const interviews = await Interview.find({});
    console.log(`Found ${interviews.length} total interviews in DB:`);
    interviews.forEach(i => {
      console.log(`- Interview ID: ${i._id} | Type: ${i.interviewType} | Questions Count: ${i.questions?.length}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
