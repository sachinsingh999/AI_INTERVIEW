const express = require("express");
const router = express.Router();

const {
  runCode,
  submitCode,
  generateQuestion,
  getQuestions,
  getQuestionById,
  getSubmissions,
  getTrendingQuestions,
  getMyPractice,
  toggleBookmark,
  toggleSave,
  saveProgress,
  getProgress,
  getLastActive,
} = require("../controllers/compilerController");
const { protect } = require("../middleware/authMiddleware");

router.post("/run", protect, runCode);
router.post("/submit", protect, submitCode);
router.post("/generate", protect, generateQuestion);
router.get("/questions/trending", protect, getTrendingQuestions);
router.get("/questions/my-practice", protect, getMyPractice);
router.post("/questions/:id/bookmark", protect, toggleBookmark);
router.post("/questions/:id/save", protect, toggleSave);
router.get("/questions", protect, getQuestions);
router.get("/questions/:id", protect, getQuestionById);
router.get("/submissions", protect, getSubmissions);
router.post("/save-progress", protect, saveProgress);
router.get("/get-progress/:questionId/:language", protect, getProgress);
router.get("/get-last-active", protect, getLastActive);

module.exports = router;
