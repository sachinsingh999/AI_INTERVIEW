// ===== Imports =====
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===== Protect Route =====
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({
          message: "Not Authorized, User not found",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No Token Found",
    });
  }
};

// ===== Admin Only Route =====
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: Admins only",
    });
  }
};

module.exports = { protect, adminOnly };