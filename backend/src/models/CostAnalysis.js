import mongoose from "mongoose";

const costDetailsSchema = new mongoose.Schema(
  {
    modelService: {
      type: String,
      required: true,
    },

    inputToken: {
      type: Number,
      default: 0,
    },

    outputToken: {
      type: Number,
      default: 0,
    },

    totalToken: {
      type: Number,
      default: 0,
    },

    cost: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const costAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    totalInputToken: {
      type: Number,
      default: 0,
    },

    totalOutputToken: {
      type: Number,
      default: 0,
    },

    totalToken: {
      type: Number,
      default: 0,
    },

    totalCostToken: {
      type: Number,
      default: 0,
    },
    details: [costDetailsSchema],
  },
  {
    timestamps: true,
  },
);

const costAnalysis = mongoose.model(
    "CostAnalysis",
    costAnalysisSchema
);

export default costAnalysis;

