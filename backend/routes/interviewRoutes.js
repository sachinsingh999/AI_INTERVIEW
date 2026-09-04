const express = require("express");
const router = express.Router();

const {
  createInterview,
  getInterviews,
  getInterviewById,
  getInterviewReport,
  adminGetAllInterviews,
  adminGetInterviewReport,
  releaseInterviewReport,
  adminSetInterviewDecision,
  getInterviewQuestions,
  saveAnswer,
  patchAnswer,
  submitInterviewSession,
  startPhase,
  submitPhase,
  getInterviewWorkspace,
  updateInterviewWorkspace,
  executeWorkspaceSandbox,
  streamWorkspaceSandbox,
  stopWorkspaceSandbox,
  executeWorkspaceTests,
  submitWorkspace,
  logIntegrityEvent,
  getWorkspaceVersions,
  restoreWorkspaceVersion,
  patchWorkspaceFile,
  getVoiceNextQuestion,
  submitVoiceAnswer,
} = require("../controllers/interviewController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Create Interview
router.post("/create", protect, createInterview);
router.post("/", protect, createInterview);

// Save & Submit Assessment Answers
router.post("/save-answer", protect, saveAnswer);
router.patch("/:interviewId/answer", protect, patchAnswer);
router.post("/submit", protect, submitInterviewSession);
router.post("/start-phase", protect, startPhase);
router.post("/:id/phase/:phaseNum/submit", protect, submitPhase);

// Voice assessment routes
router.post("/:id/voice/next-question", protect, getVoiceNextQuestion);
router.post("/:id/voice/submit-answer", protect, submitVoiceAnswer);

// Get All Interviews
router.get("/", protect, getInterviews);

// Admin Routes
router.get("/admin/all", protect, adminOnly, adminGetAllInterviews);
router.get("/admin/:id/responses", protect, adminOnly, adminGetInterviewReport);
router.post("/admin/:id/release-report", protect, adminOnly, releaseInterviewReport);
router.post("/admin/:id/decision", protect, adminOnly, adminSetInterviewDecision);

// Get Interview Questions & Details
router.get("/public/questions", getInterviewQuestions);
router.get("/:id/questions", protect, getInterviewQuestions);
router.get("/:id", protect, getInterviewById);

router.get(
  "/:id/report",
  protect,
  getInterviewReport
);

// Workspace & IDE Workspace endpoints (Phase 2)
router.get("/:id/workspace", protect, getInterviewWorkspace);
router.post("/:id/workspace", protect, updateInterviewWorkspace);
router.post("/:id/run", protect, executeWorkspaceSandbox);
router.get("/:id/run-stream", protect, streamWorkspaceSandbox);
router.post("/:id/stop-run", protect, stopWorkspaceSandbox);
router.post("/:id/run-tests", protect, executeWorkspaceTests);
router.post("/:id/submit-workspace", protect, submitWorkspace);
router.post("/:id/integrity-event", protect, logIntegrityEvent);
router.get("/:id/workspace-versions", protect, getWorkspaceVersions);
router.post("/:id/restore-version", protect, restoreWorkspaceVersion);

// Project endpoints alias alignment (Technical Round 2)
router.post("/:id/project/init", protect, getInterviewWorkspace);
router.get("/:id/project", protect, getInterviewWorkspace);
router.patch("/:id/project/file", protect, patchWorkspaceFile);
router.post("/:id/project/run", protect, executeWorkspaceSandbox);
router.get("/:id/project/logs", protect, streamWorkspaceSandbox);
router.post("/:id/project/submit", protect, submitWorkspace);

module.exports = router;