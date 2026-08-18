import express from "express";
import multer from "multer";

import {
  EmailResponse,
  getCostAnalysis,
} from "../controllers/emailController.js";

import authMiddleware from "../middlewere/authMiddleware.js";

const router = express.Router();

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PNG, JPG, JPEG, PDF, MP3 and WAV files are allowed."
        ),
        false
      );
    }
  },
});

// =====================================================
// EMAIL ANALYSIS
// =====================================================

router.post(
  "/analyze",
  authMiddleware,
  upload.array("file", 3),
  EmailResponse
);

// =====================================================
// COST ANALYSIS
// =====================================================

router.get(
  "/cost-analysis",
  authMiddleware,
  getCostAnalysis
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size cannot exceed 15MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "File upload failed.",
    });
  }

  next();
});

export default router;