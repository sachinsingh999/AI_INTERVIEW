const mongoose = require("mongoose");

const potdSchema = new mongoose.Schema(
  {
    problemId: {
      type: String, // e.g. "potd_2026_06_11"
      required: true,
      unique: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("POTD", potdSchema);
