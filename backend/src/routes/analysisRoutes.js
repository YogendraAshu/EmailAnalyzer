import express from "express";
import multer from "multer";
import authMiddleware from "../middlewere/authMiddleware.js";
import {
  EmailResponse,
  getCostAnalysis,
  cleanupUploads,
} from "../controllers/emailController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

router.post(
  "/analyze",
  authMiddleware,
  upload.array("file", 3),
  EmailResponse
);

router.get(
  "/cost-analysis",
  authMiddleware,
  getCostAnalysis
);

// Manual or on-demand file cleanup endpoint
router.delete("/cleanup-files", authMiddleware, cleanupUploads);
router.post("/cleanup-files", authMiddleware, cleanupUploads);

export default router;