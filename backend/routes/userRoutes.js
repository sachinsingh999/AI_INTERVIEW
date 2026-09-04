// ===== Imports =====
const express = require("express");
const router = express.Router();

// ===== Controllers =====
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfileController,
  analyzeResumeController,
  getAllUsers,
  getSystemStats,
  toggleUserRole,
  getUserNotifications,
  markNotificationRead,
} = require("../controllers/userController");

// ===== Middleware =====
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ===== Public Routes =====
router.post("/register", registerUser);
router.post("/login", loginUser);

// ===== Protected Routes =====
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileController);
router.post("/analyze-resume", protect, analyzeResumeController);

router.get("/notifications", protect, getUserNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);

// ===== Admin Routes =====
router.get("/admin/users", protect, adminOnly, getAllUsers);
router.get("/admin/stats", protect, adminOnly, getSystemStats);
router.put("/admin/toggle-role/:id", protect, adminOnly, toggleUserRole);

module.exports = router;