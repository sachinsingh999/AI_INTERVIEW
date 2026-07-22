const mongoose = require("mongoose");

const potdCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    potd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "POTD",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    solved: {
      type: Boolean,
      default: false,
    },
    runtime: {
      type: String,
      default: "N/A",
    },
    memory: {
      type: String,
      default: "N/A",
    },
    completionTime: {
      type: Date,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user and POTD challenge
potdCompletionSchema.index({ user: 1, potd: 1 }, { unique: true });

module.exports = mongoose.model("POTDCompletion", potdCompletionSchema);
