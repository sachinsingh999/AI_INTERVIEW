const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    visibleTestCases: [
      {
        label: String,
        input: String,
        expected: String,
      },
    ],
    hiddenTestCases: [
      {
        label: String,
        input: String,
        expected: String,
      },
    ],
    starterCode: {
      type: Object,
      default: {},
    },
    driverCode: {
      type: Object,
      default: {},
    },
    expectedTimeComplexity: {
      type: String,
      default: "N/A",
    },
    expectedSpaceComplexity: {
      type: String,
      default: "N/A",
    },
    difficulty: {
      type: String,
      default: "Medium",
    },
    role: {
      type: String,
      default: "Software Engineer",
    },
    tags: {
      type: [String],
      default: [],
    },
    functionName: {
      type: String,
      default: "solve",
    },
    returnType: {
      type: mongoose.Schema.Types.Mixed,
      default: "void",
    },
    parameters: [
      {
        name: String,
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    functionSignature: {
      functionName: { type: String, default: "solve" },
      returnType: { type: mongoose.Schema.Types.Mixed, default: "int" },
      parameters: [
        {
          type: mongoose.Schema.Types.Mixed,
          name: String,
        },
      ],
    },
    solveCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);
