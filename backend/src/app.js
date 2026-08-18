import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);

// IMPORTANT
// Frontend: POST /api/email/analyze
app.use("/api/email", analysisRoutes);

// Feedback
app.use("/api", feedbackRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Horizon Backend is running",
  });
});

export default app;