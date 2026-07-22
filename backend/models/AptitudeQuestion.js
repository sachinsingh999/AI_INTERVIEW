const mongoose = require("mongoose");

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AptitudeSession",
      required: true,
    },
    questionNumber: {
      type: Number,
      required: true,
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
      type: Number,
      required: true, // index 0 to 3
    },
    explanation: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: "Medium",
    },
    topic: {
      type: String,
    },
    subtopic: {
      type: String,
    },
    userSelectedAnswer: {
      type: Number,
      default: null, // index 0 to 3, or null
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number,
      default: 0, // in seconds
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of question number per session
aptitudeQuestionSchema.index({ sessionId: 1, questionNumber: 1 }, { unique: true });

module.exports = mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);
