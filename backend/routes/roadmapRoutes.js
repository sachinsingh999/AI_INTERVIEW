const express = require("express");
const router = express.Router();
const { generateAIRoadmap } = require("../controllers/roadmapController");
const { protect } = require("../middleware/authMiddleware");

// Generate AI Roadmap Endpoint (protected route)
router.post("/generate", protect, generateAIRoadmap);

module.exports = router;
