const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    interviewType: {
      type: String,
      default: "standard",
    },

    phases: {
      oa: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
      tech1: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
      tech2: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
      hr: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    },

    language: {
      type: String,
      default: "",
    },

    questions: [mongoose.Schema.Types.Mixed],
    aptitudeQuestions: [mongoose.Schema.Types.Mixed],
    technicalQuestions: [mongoose.Schema.Types.Mixed],

    resumeText: {
      type: String,
      default: "",
    },
    resumeAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    evaluatorName: {
      type: String,
      default: "",
    },
    evaluationDate: {
      type: Date,
    },
    instructions: {
      type: String,
      default: "",
    },

    companyType: {
      type: String,
      default: "",
    },

    aptitudeCategories: {
      type: [String],
      default: [],
    },

    hrTopics: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
      default: "",
    },
    finalScore: {
      type: String,
      default: "",
    },
    finalPercentage: {
      type: Number,
    },
    decision: {
      type: String,
      enum: ["PASSED", "FAILED", "REATTEMPT_REQUIRED"],
    },
    userAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      default: "In Progress",
    },
    workspaceFiles: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    templateId: {
      type: String,
      default: null,
    },
    workspaceState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    executionHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    workspaceSubmission: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    integrityEvents: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    workspaceVersions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    completedAt: {
      type: Date,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    activePhases: {
      type: [String],
      default: ["phase1"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Interview",
  interviewSchema
);
