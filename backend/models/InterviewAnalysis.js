const mongoose = require("mongoose");

const interviewAnalysisSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    voiceMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    questionHistory: {
      type: Array,
      default: [],
    },
    answerHistory: {
      type: Array,
      default: [],
    },
    resumeVerification: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skillAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    projectAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    communicationAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    confidenceAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    adaptiveInterviewAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    answerAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scores: {
      technicalSkills: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      resumeConsistency: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      learningAbility: { type: Number, default: 0 },
      overallPerformance: { type: Number, default: 0 },
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "",
    },
    recommendation: {
      decision: {
        type: String,
        enum: ["Strong Hire", "Hire", "Borderline", "Need Another Round", "Reject"],
        default: "Borderline",
      },
      reasoning: {
        type: String,
        default: "",
      },
    },
    evidence: {
      type: [String],
      default: [],
    },
    processingTimestamp: {
      type: Date,
      default: Date.now,
    },
    aiModelVersion: {
      type: String,
      default: "gemini-1.5-flash",
    },
    processingTime: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    errorLogs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InterviewAnalysis", interviewAnalysisSchema);
