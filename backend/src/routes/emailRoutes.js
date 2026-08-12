import express from "express";
import multer from "multer";
import { EmailResponse } from "../controllers/emailController.js";
import authMiddleware from "../middlewere/authMiddleware.js";

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

export default router;