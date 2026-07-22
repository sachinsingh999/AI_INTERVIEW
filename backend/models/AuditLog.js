const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    decision: {
      type: String,
      enum: ["PASSED", "FAILED", "REATTEMPT_REQUIRED"],
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    previousStatus: {
      type: String,
      default: "",
    },
    newStatus: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
