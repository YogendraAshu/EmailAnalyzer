import mongoose from "mongoose";

const emailAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
},
{
    timestamps: true
});
const EmailAnalysis = mongoose.model(
    "EmailAnalysis",
    emailAnalysisSchema
);
export default EmailAnalysis;
