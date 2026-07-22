const express = require("express");
const router = express.Router();

const {
  submitAnswer,
  getAnswersByInterview,
  submitOAAnswers,
  adminEvaluateAnswerManual,
  adminEvaluateAnswerAI,
  evaluateOAAssessment,
  adminCreateOAQuestion,
  finalizeOADecision,
} = require("../controllers/answerController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Submit Answer
router.post("/submit", protect, submitAnswer);

// Submit OA answers
router.post("/submit-oa", protect, submitOAAnswers);

// Get Answers By Interview
router.get(
  "/interview/:interviewId",
  protect,
  getAnswersByInterview
);

// Admin Routes
router.put("/admin/:id/evaluate-manual", protect, adminOnly, adminEvaluateAnswerManual);
router.post("/admin/:id/evaluate-ai", protect, adminOnly, adminEvaluateAnswerAI);
router.post("/admin/interview/:interviewId/evaluate-oa", protect, adminOnly, evaluateOAAssessment);
router.post("/admin/interview/:interviewId/finalize-decision", protect, adminOnly, finalizeOADecision);
router.post("/admin/oa-question", protect, adminOnly, adminCreateOAQuestion);

module.exports = router;