const express = require("express");
const router = express.Router();
const { uploadResume, parseResume } = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/upload", protect, uploadResume);
router.post("/parse", protect, parseResume);

module.exports = router;
