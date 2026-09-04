const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    idealAnswer: {
      type: String,
      default: "",
    },

    keyPoints: {
      type: [String],
      default: [],
    },

    missingPoints: {
      type: [String],
      default: [],
    },

    howToSay: {
      type: String,
      default: "",
    },

    communicationScore: {
      type: Number,
      default: 0,
    },

    confidenceScore: {
      type: Number,
      default: 0,
    },

    professionalismScore: {
      type: Number,
      default: 0,
    },

    communicationFeedback: {
      type: String,
      default: "",
    },

    results: {
      type: Array,
      default: [],
    },
    questionAudio: {
      type: String,
      default: "",
    },
    candidateAudio: {
      type: String,
      default: "",
    },
    thinkingTime: {
      type: Number,
      default: 0,
    },
    answerDuration: {
      type: Number,
      default: 0,
    },
    resumeTopic: {
      type: String,
      default: "",
    },
    skillEvaluated: {
      type: String,
      default: "",
    },
    projectDiscussed: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "evaluated"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Answer", answerSchema);