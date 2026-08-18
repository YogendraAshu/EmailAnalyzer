import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const {
      user_id,
      email_content,
      original_response,
      final_response,
      rating,
      issues,
      comment,
      action,
      approved,
    } = req.body;

    const original = original_response || final_response || "User Feedback";

    const feedback = await Feedback.create({
      user_id: user_id || null,
      email_content: email_content || "",
      original_response: original,
      final_response: final_response || original,
      rating: rating || null,
      issues: issues || [],
      comment: comment || "",
      action: action || "approve",
      approved: approved !== undefined ? approved : action !== "reject",
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};