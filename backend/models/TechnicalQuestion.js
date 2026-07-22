const mongoose = require("mongoose");

const TechnicalQuestionSchema = new mongoose.Schema(
  {
    roleTags: {
      type: [String],
      default: [],
      index: true,
    },
    technologyTags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "DSA Coding Challenge",
    },
    question: {
      type: String,
      required: true,
    },
    constraints: {
      type: String,
      default: "",
    },
    sampleInput: {
      type: String,
      default: "",
    },
    sampleOutput: {
      type: String,
      default: "",
    },
    examples: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    testCases: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    starterCode: {
      type: String,
      default: "",
    },
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
    expectedAnswerPoints: {
      type: [String],
      default: [],
    },
    idealAnswer: {
      type: String,
      required: true,
    },
    evaluationRubric: {
      excellent: { type: String, default: "" },
      good: { type: String, default: "" },
      average: { type: String, default: "" },
      poor: { type: String, default: "" },
    },
    timeLimit: {
      type: Number,
      default: 300,
    },
    marks: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TechnicalQuestion", TechnicalQuestionSchema);
