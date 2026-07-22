const mongoose = require("mongoose");

const questionHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure quick lookups per user
questionHistorySchema.index({ user: 1, fingerprint: 1 });

module.exports = mongoose.model("QuestionHistory", questionHistorySchema);
