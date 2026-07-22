const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");

const MONGO_URI = "mongodb+srv://sachinkumar:sachin@cluster0.wgiqq.mongodb.net/AI?appName=Cluster0";
const JWT_SECRET = "your_secret_key";

const makeRequest = (token, payload) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: "localhost",
      port: 5001,
      path: "/api/interviews/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "Authorization": `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: body
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.write(data);
    req.end();
  });
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find a user
    const User = mongoose.model("User", new mongoose.Schema({ email: String, role: String }));
    const user = await User.findOne({});
    if (!user) {
      console.error("No user found in database. Please register a user first.");
      process.exit(1);
    }

    console.log(`Using user: ${user.email} (${user._id})`);

    // Sign JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    console.log("Generated Token:", token);

    // Payload
    const payload = {
      role: "React Developer",
      experience: "1-3 Years",
      difficulty: "Medium",
      resumeId: `res_${Date.now()}`,
      parsedResume: {},
      interviewPlan: {
        aptitude: true,
        technicalRound1: true,
        technicalRound2: true
      }
    };

    console.log("Sending POST request...");
    const res = await makeRequest(token, payload);

    console.log("Response Status:", res.statusCode);
    console.log("Response Headers:", res.headers);
    console.log("Response Data:", res.data);

    process.exit(0);
  } catch (err) {
    console.error("Execution failed:", err);
    process.exit(1);
  }
};

run();
