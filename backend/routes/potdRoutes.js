const express = require("express");
const router = express.Router();

const { getCurrentPOTD, getPOTDHistory } = require("../controllers/potdController");
const { protect } = require("../middleware/authMiddleware");

router.get("/current", protect, getCurrentPOTD);
router.get("/archive", protect, getPOTDHistory);

module.exports = router;
