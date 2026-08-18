import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    email_content: {
      type: String,
      default: "",
    },

    original_response: {
      type: String,
      required: true,
    },

    final_response: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    issues: {
      type: [String],
      default: [],
    },

    comment: {
      type: String,
      default: "",
    },

    action: {
      type: String,
      enum: ["approve", "edit_approve", "reject"],
      default: "approve",
    },

    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;