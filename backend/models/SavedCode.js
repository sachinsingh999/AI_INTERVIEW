const mongoose = require("mongoose");

const savedCodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    autoSaveEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user, question, and language
savedCodeSchema.index({ user: 1, question: 1, language: 1 }, { unique: true });

module.exports = mongoose.model("SavedCode", savedCodeSchema);
