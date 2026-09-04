
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

    // Fetch user's actual interviews & answers
    const userInterviews = await Interview.find({ user: userId }).sort({ createdAt: -1 });
    const userInterviewIds = userInterviews.map(i => i._id);
    const userAnswers = await Answer.find({ interview: { $in: userInterviewIds } }).sort({ createdAt: -1 });

    const mockInterviewsCompleted = userInterviews.length;
    const problemsSolved = totalAnswered;
    const contestRating = 1200 + (bestRank ? Math.max(0, (10 - bestRank) * 25) : 0) + (totalAnswered * 5);

    // Calculate current activity streak
    const activityDates = new Set();
    [...userInterviews, ...userAnswers].forEach(item => {
      if (item.createdAt) {
        const dateStr = new Date(item.createdAt).toISOString().split("T")[0];
        activityDates.add(dateStr);
      }
    });

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Build 365-day Contribution Heatmap object: { "2026-09-05": 3, "2026-09-04": 1, ... }
    const contributionHeatmap = {};
    activityDates.forEach(dateStr => {
      const count = [...userInterviews, ...userAnswers].filter(
        item => item.createdAt && new Date(item.createdAt).toISOString().split("T")[0] === dateStr
      ).length;
      contributionHeatmap[dateStr] = count;
    });

    // Recent activities feed (sorted date desc)
    const recentActivities = [
      ...userInterviews.map(i => ({
        id: `int-${i._id}`,
        type: "Interview",
        title: `Completed ${i.role} (${i.interviewType || "Standard"})`,
        subtitle: `${i.difficulty} difficulty`,
        date: i.createdAt,
        badge: "Interview"
      })),
      ...userAnswers.map(a => ({
        id: `ans-${a._id}`,
        type: "Problem Solved",
        title: `Answered question in interview assessment`,
        subtitle: a.score ? `Scored ${a.score}/10` : "Completed response",
        date: a.createdAt,
        badge: "Problem"
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

    // Difficulty breakdown calculation
    const easySolved = Math.min(Math.round(problemsSolved * 0.5), 100);
    const mediumSolved = Math.min(Math.round(problemsSolved * 0.35), 80);
    const hardSolved = Math.min(Math.max(0, problemsSolved - easySolved - mediumSolved), 40);

    const difficultyBreakdown = {
      easy: { solved: easySolved, total: 100 },
      medium: { solved: mediumSolved, total: 80 },
      hard: { solved: hardSolved, total: 40 }
    };

    // Calculate dynamic earned vs locked achievements
    const achievements = [
      {
        id: "ach-1",
        title: "First Step",
        description: "Completed your first mock interview assessment",
        icon: "🚀",
        earned: mockInterviewsCompleted >= 1,
        earnedAt: userInterviews[0]?.createdAt || null
      },
      {
        id: "ach-2",
        title: "Problem Solver",
        description: "Solved 5 or more interview problems",
        icon: "⚡",
        earned: problemsSolved >= 5
      },
      {
        id: "ach-3",
        title: "Consistency Champion",
        description: "Maintained a 2+ day daily activity streak",
        icon: "🔥",
        earned: currentStreak >= 2
      },
      {
        id: "ach-4",
        title: "Top Competitor",
        description: "Achieved Top 3 placement in a role category",
        icon: "🏆",
        earned: !!(bestRank && bestRank <= 3)
      },
      {
        id: "ach-5",
        title: "Resume Verified",
        description: "Uploaded & analyzed resume with AI",
        icon: "📄",
        earned: !!req.user.resumeAnalysis
      },
      {
        id: "ach-6",
        title: "Grandmaster",
        description: "Completed 10+ mock assessment sessions",
        icon: "👑",
        earned: mockInterviewsCompleted >= 10
      }
    ];

    // Build user object with default fallback strings for empty fields
    const userObj = {
      ...req.user._doc,
      username: req.user.username || `@${(req.user.name || "user").toLowerCase().replace(/\s+/g, "")}`,
      bio: req.user.bio || "Software Engineer passionate about coding, algorithms, and system design.",
      location: req.user.location || "San Francisco, CA",
      education: req.user.education || "B.S. Computer Science",
      website: req.user.website || "https://github.com",
      skills: req.user.skills && req.user.skills.length > 0 
        ? req.user.skills 
        : ["React", "Node.js", "JavaScript", "TypeScript", "Python", "DSA", "System Design", "SQL"]
    };

    res.status(200).json({
      user: userObj,
      stats: {
        problemsSolved,
        contestRating,
        mockInterviewsCompleted,
        currentStreak
      },
      summary: {
        categories: rankings.length,
        totalAnswered,
        bestRank,
      },
      rankings,
      difficultyBreakdown,
      recentActivities,
      contributionHeatmap,
      achievements
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===== Update Profile Controller =====
const updateProfileController = async (req, res) => {
  try {
    const { name, username, bio, location, education, website, skills, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;
    if (website !== undefined) user.website = website;
    if (avatar !== undefined) user.avatar = avatar;
    if (Array.isArray(skills)) user.skills = skills;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  updateProfileController,
  analyzeResumeController,
  getAllUsers,
  getSystemStats,
  toggleUserRole,
  getUserNotifications,
  markNotificationRead,
};

