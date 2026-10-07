// ===== Imports =====
const express = require("express");
const cors = require("cors");
require("dotenv").config();


// ===== Routes =====
const userRoutes = require("./routes/userRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const answerRoutes = require("./routes/answerRoutes");
const codeRoutes = require("./routes/codeRoutes");
const compilerRoutes = require("./routes/compilerRoutes");
const potdRoutes = require("./routes/potdRoutes");
const aptitudeRoutes = require("./routes/aptitudeRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");

// ===== Database =====

const connectDB = require("./config/db");
connectDB();

// Clean up leftover compiler temp files on startup
const fs = require("fs");
const path = require("path");
const cleanupTempDir = () => {
  const tempDir = path.join(__dirname, "temp");
  if (fs.existsSync(tempDir)) {
    try {
      const files = fs.readdirSync(tempDir);
      let count = 0;
      files.forEach((file) => {
        if (file.startsWith("temp_py_") || file.startsWith("temp_cpp_")) {
          try {
            fs.unlinkSync(path.join(tempDir, file));
            count++;
          } catch (err) {
            console.error(`[Cleanup] Failed to delete file ${file}:`, err.message);
          }
        }
      });
      if (count > 0) {
        console.log(`[Cleanup] Cleared ${count} leftover local compilation artifacts on startup.`);
      }
    } catch (err) {
      console.error("[Cleanup] Failed to read temp directory on startup:", err.message);
    }
  }
};
cleanupTempDir();

// ===== App Initialization =====
const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Backend Running");
});

const resumeRoutes = require("./routes/resumeRoutes");
const aiRoutes = require("./routes/aiRoutes");

// ===== API Routes =====
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/potd", potdRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/ai", aiRoutes);

// Error logging middleware
app.use((err, req, res, next) => {
  console.error("[SERVER ERROR] Unhandled error:", err);
  res.status(500).json({ message: "Internal server error: " + err.message });
});

// ===== Server =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Proactive periodic daily problem checks (running every hour)
  const { generateAndPublishPOTD, getTodayId } = require("./controllers/potdController");
  const POTD = require("./models/POTD");
  setInterval(async () => {
    try {
      const todayId = getTodayId();
      const existing = await POTD.findOne({ problemId: todayId, isActive: true });
      if (!existing) {
        console.log(`[POTD Cron] Active daily problem missing for ${todayId}. Running scheduler...`);
        await generateAndPublishPOTD(todayId);
      }
    } catch (err) {
      console.error("[POTD Cron Scheduler Error]:", err.message);
    }
  }, 1000 * 60 * 60); // hourly check
});
