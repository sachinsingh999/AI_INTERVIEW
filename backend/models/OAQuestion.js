const mongoose = require("mongoose");

const oaQuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "aptitude",
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length === 4;
        },
        message: "Options must have exactly 4 items.",
      },
    },
    correctAnswer: {
      type: String, // e.g. "B" or "A" or option text
      required: true,
    },
    category: {
      type: String,
      default: "General Aptitude",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    topic: {
      type: String,
      default: "General Aptitude",
    },
    explanation: {
      type: String,
      default: "",
    },
    timeLimit: {
      type: Number,
      default: 60,
    },
    marks: {
      type: Number,
      default: 1,
    },
    jobRole: {
      type: String,
      default: "Software Engineer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OAQuestion", oaQuestionSchema);
