const express = require("express");
const router = express.Router();
const { upload, uploadResume, parseResume } = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/upload", protect, uploadResume);
router.post("/parse", protect, upload.single("resume"), parseResume);

module.exports = router;
