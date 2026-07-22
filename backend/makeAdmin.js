const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sachinkumar:sachin@cluster0.wgiqq.mongodb.net/AI?appName=Cluster0";

async function run() {
  console.log("Connecting to database...");
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const User = require("./models/User");
    const res = await User.updateMany({}, { role: "admin" });
    console.log("Updated users to admin:", res);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
