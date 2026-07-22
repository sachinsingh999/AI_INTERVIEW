
// ===== Imports =====
const User = require("../models/User");
const Answer = require("../models/Answer");
const Interview = require("../models/Interview");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { analyzeResume } = require("../services/aiService");

// ===== Generate JWT =====
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ===== Register User =====
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "User Registered Successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

   res.status(200).json({
  message: "Login Successful",
  token: generateToken(user._id),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
  },
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ===== Get Profile =====
const getProfile = async (req, res) => {
  try {
    const categoryScores = await Answer.aggregate([
      {
        $lookup: {
          from: "interviews",
          localField: "interview",
          foreignField: "_id",
          as: "interview",
        },
      },
      {
        $unwind: "$interview",
      },
      {
        $group: {
          _id: {
            user: "$interview.user",
            role: "$interview.role",
          },
          averageScore: { $avg: "$score" },
          answeredCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          userId: "$_id.user",
          userName: "$user.name",
          role: "$_id.role",
          averageScore: { $round: ["$averageScore", 1] },
          answeredCount: 1,
        },
      },
    ]);

    const scoresByRole = categoryScores.reduce(
      (roles, score) => {
        if (!roles[score.role]) {
          roles[score.role] = [];
        }

        roles[score.role].push(score);
        return roles;
      },
      {}
    );

    const userId = req.user._id.toString();
    const rankings = Object.entries(scoresByRole)
      .map(([role, scores]) => {
        const sortedScores = scores.sort((a, b) => {
          if (b.averageScore !== a.averageScore) {
            return b.averageScore - a.averageScore;
          }

          return b.answeredCount - a.answeredCount;
        });

        const userIndex = sortedScores.findIndex(
          (score) => score.userId.toString() === userId
        );

        if (userIndex === -1) {
          return null;
        }

        const userScore = sortedScores[userIndex];

        return {
          role,
          rank: userIndex + 1,
          totalUsers: sortedScores.length,
          averageScore: userScore.averageScore,
          answeredCount: userScore.answeredCount,
          leaderName: sortedScores[0]?.userName || "",
          leaderScore: sortedScores[0]?.averageScore || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank);

    const totalAnswered = rankings.reduce(
      (total, item) => total + item.answeredCount,
      0
    );

    const bestRank = rankings.length
      ? Math.min(...rankings.map((item) => item.rank))
      : null;

    res.status(200).json({
      user: req.user,
      summary: {
        categories: rankings.length,
        totalAnswered,
        bestRank,
      },
      rankings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===== Analyze Resume =====
const analyzeResumeController = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        message: "Resume text content is required for analysis",
      });
    }

    const analysis = await analyzeResume(resumeText);

    // Update user record
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.resumeText = resumeText;
    user.resumeAnalysis = analysis;
    await user.save();

    res.status(200).json({
      message: "Resume analyzed and profile updated successfully",
      resumeText: user.resumeText,
      resumeAnalysis: user.resumeAnalysis,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===== Admin: Get All Users =====
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Admin: Get System Stats =====
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    // Group users by creation date to show registration trend
    const registrationTrend = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 10 }
    ]);

    // Group interviews by creation date to show interview trend
    const interviewTrend = await Interview.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      totalUsers,
      totalInterviews,
      totalSubmissions,
      trends: {
        registration: registrationTrend.map(t => ({ date: t._id, count: t.count })),
        interviews: interviewTrend.map(t => ({ date: t._id, count: t.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Admin: Toggle User Role =====
const toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle role between user and admin
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.status(200).json({
      message: `User role updated to ${user.role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Candidate Notifications =====
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  analyzeResumeController,
  getAllUsers,
  getSystemStats,
  toggleUserRole,
  getUserNotifications,
  markNotificationRead,
};
