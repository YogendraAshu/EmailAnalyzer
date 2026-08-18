import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../Feedback.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Feedback({
  analysis = "",
  emailContent = "",
  userId = null,
  onResponseUpdate,
  lightTheme = true,
}) {
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [issues, setIssues] = useState([]);
  const [comment, setComment] = useState("");
  const [editedResponse, setEditedResponse] = useState(analysis || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedResponse(analysis || "");
  }, [analysis]);

  const issueList = [
    "Too generic",
    "Missing steps",
    "Wrong tone",
    "Too long",
    "Too short",
    "Needs more detail",
    "Incorrect information",
    "Add Hindi",
  ];

  const toggleIssue = (issue) => {
    setIssues((old) =>
      old.includes(issue)
        ? old.filter((item) => item !== issue)
        : [...old, issue]
    );
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return "Excellent";
      case 4:
        return "Very Good";
      case 3:
        return "Good";
      case 2:
        return "Needs Improvement";
      case 1:
        return "Poor";
      default:
        return "";
    }
  };

  const sendFeedback = async (action) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userStored = localStorage.getItem("user");
      let currentUserId = userId;

      if (!currentUserId && userStored) {
        try {
          const parsed = JSON.parse(userStored);
          currentUserId = parsed._id || parsed.id || parsed.userId || null;
        } catch (e) {
          console.error("Error parsing user:", e);
        }
      }

      const finalOriginal = analysis || editedResponse || "User Feedback";
      const finalContent =
        action === "edit_approve" ? (editedResponse || finalOriginal) : finalOriginal;

      const payload = {
        user_id: currentUserId || null,
        email_content: emailContent || "",
        original_response: finalOriginal,
        final_response: finalContent,
        rating: rating || null,
        issues: issues || [],
        comment: comment.trim(),
        action: action,
        approved: action !== "reject",
      };

      // Send to backend feedback endpoint
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        await axios.post(`${API_BASE_URL}/api/feedback`, payload, {
          headers,
        });
      } catch (err) {
        console.error("Feedback submission failed:", err);
        throw err;
      }

      if (action === "reject") {
        toast.success("Response rejected and feedback logged");
      } else if (action === "edit_approve") {
        toast.success("Edited response approved & injected into knowledge base!");
        if (onResponseUpdate) {
          onResponseUpdate(editedResponse);
        }
      } else {
        toast.success("Feedback submitted & response approved!");
      }

      setComment("");
      setIssues([]);
      setEditing(false);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  const activeStarCount = hoverRating || rating;

  return (
    <div className={`feedback-card ${!lightTheme ? "dark-theme" : ""}`}>
      <h2>Feedback</h2>

      <p className="feedback-description">
        Review the AI response and submit feedback. Approved or edited
        responses are automatically injected into the knowledge base so the AI
        learns from them.
      </p>

      {/* RATING */}
      <div className="rating-area">
        <span className="rating-label">Rate this response:</span>

        <div className="stars" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-btn"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              aria-label={`Rate ${star} star`}
            >
              <span
                className={`star-icon ${
                  star <= activeStarCount ? "active" : ""
                }`}
              >
                ★
              </span>
            </button>
          ))}

          <span className="rating-text">
            {getRatingLabel(activeStarCount)}
          </span>
        </div>
      </div>

      {/* IMPROVEMENT TAGS */}
      <div className="feedback-section">
        <label>What could be improved? (optional)</label>

        <div className="issue-buttons">
          {issueList.map((issue) => {
            const isSelected = issues.includes(issue);
            return (
              <button
                key={issue}
                type="button"
                className={`issue-pill ${isSelected ? "selected" : ""}`}
                onClick={() => toggleIssue(issue)}
              >
                {issue}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMMENT TEXTAREA */}
      <div className="feedback-section">
        <label>
          Describe what was missing or how to improve this response:
        </label>

        <textarea
          className="feedback-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. The steps for KYC update were missing. Please include document upload instructions next time."
        />
      </div>

      {/* EDIT RESPONSE AREA (WHEN EDITING) */}
      {editing && (
        <div className="feedback-section">
          <label>Edit AI Response before approval:</label>

          <textarea
            className="feedback-textarea edit-response-area"
            value={editedResponse}
            onChange={(e) => setEditedResponse(e.target.value)}
            placeholder="Edit AI generated response here..."
          />
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="feedback-buttons">
        {/* APPROVE */}
        <button
          type="button"
          className="feedback-btn btn-approve"
          disabled={loading}
          onClick={() => sendFeedback("approve")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
          </svg>
          <span>Approve</span>
        </button>

        {/* EDIT & APPROVE */}
        <button
          type="button"
          className="feedback-btn btn-edit-approve"
          disabled={loading}
          onClick={() => {
            if (!editing) {
              setEditing(true);
            } else {
              sendFeedback("edit_approve");
            }
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          <span>{editing ? "Save & Approve" : "Edit & Approve"}</span>
        </button>

        {/* REJECT */}
        <button
          type="button"
          className="feedback-btn btn-reject"
          disabled={loading}
          onClick={() => sendFeedback("reject")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 14V2" />
            <path d="M15 18.12 14 14h5.83a2 2 0 0 0 1.92-2.56l-2.33-8A2 2 0 0 0 17.5 2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3.76a2 2 0 0 0 1.79 1.11L12 22h0a3.13 3.13 0 0 0 3-3.88Z" />
          </svg>
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}

export default Feedback;