const express = require("express");
const router = express.Router();
const aptitudeController = require("../controllers/aptitudeController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected by JWT authentication
router.post("/session", protect, aptitudeController.createSession);
router.get("/sessions", protect, aptitudeController.getUserSessions);
router.get("/session/:id", protect, aptitudeController.getSession);
router.post("/save-progress", protect, aptitudeController.saveProgress);
router.post("/submit", protect, aptitudeController.submitSession);

module.exports = router;
