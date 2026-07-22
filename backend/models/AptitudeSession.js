const mongoose = require("mongoose");

const aptitudeSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    questionCount: {
      type: Number,
      required: true,
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    timeLeft: {
      type: Number, // in seconds
    },
    analysis: {
      type: Object, // AI Performance analysis object
      default: null,
    },
    recommendations: {
      type: Object, // AI recommendations object
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AptitudeSession", aptitudeSessionSchema);
