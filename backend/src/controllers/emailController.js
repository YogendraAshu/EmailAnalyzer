import axios from "axios";
import EmailAnalysis from "../models/EmailAnalysis.js";
import fs from "fs";
import path from "path";

export const EmailResponse = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // console.log("=================================");
    // console.log("EMAIL:", email);
    // console.log("FILES:", req.files);
    // console.log("=================================");

    // =========================================
    // UPLOAD DIRECTORY
    // =========================================

    const uploadDir = path.resolve("uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // =========================================
    // SAVE FILES
    // =========================================

    const filePaths = [];

    for (const file of req.files || []) {
      console.log("Original filename:", file.originalname);
      console.log("Mimetype:", file.mimetype);

      const extension = path.extname(file.originalname);

      if (!extension) {
        return res.status(400).json({
          success: false,
          message: `File extension missing: ${file.originalname}`,
        });
      }

      const safeFileName = `${Date.now()}-${file.originalname}`;

      const filePath = path.join(uploadDir, safeFileName);

      fs.writeFileSync(filePath, file.buffer);

      const pythonPath = filePath.replace(/\\/g, "/");

      if (!fs.existsSync(filePath)) {
        return res.status(500).json({
          success: false,
          message: "File was not saved properly",
        });
      }

      filePaths.push(pythonPath);

      console.log("Saved file:", filePath);
      console.log("Python path:", pythonPath);
    }

    // =========================================
    // PYTHON PAYLOAD
    // =========================================

    const pythonPayload = {
      email_content: email.trim(),
      file: filePaths,
      save_output: false,
    };

    console.log("=================================");
    console.log("DATA SENT TO PYTHON:");
    console.log(JSON.stringify(pythonPayload, null, 2));
    console.log("=================================");

    // =========================================
    // CALL PYTHON
    // =========================================

    const response = await axios.post(
      "http://127.0.0.1:8000/email",
      pythonPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );

    // =========================================
    // PYTHON RESPONSE
    // =========================================

    console.log("=================================");
    console.log("PYTHON RAW RESPONSE:");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("=================================");

    const pythonData = response.data;

    // =========================================
    // GET ACTUAL PYTHON RESPONSE
    // =========================================

    const result = pythonData?.response;

    if (!result) {
      console.error("Python response object missing");

      return res.status(500).json({
        success: false,
        message: "Invalid response received from Python API",
      });
    }

    // =========================================
    // EXTRACT ANALYSIS
    // =========================================

    const multiIntent = result?.multi_intent ?? null;

    const multiLingual = result?.multi_lingual ?? null;

    const sentiment = result?.sentiment_analysis ?? null;

    const detectedLanguage = result?.detected_language ?? null;

    const detectedCategory = result?.detected_category ?? null;

    const deepLink = result?.deep_link ?? null;

    const output = result?.output ?? "";

    const context = result?.context ?? [];

    // =========================================
    // LOG ANALYSIS
    // =========================================

    console.log("=================================");
    console.log("EXTRACTED ANALYSIS");
    console.log("=================================");

    console.log("MULTI INTENT:", multiIntent);
    console.log("SENTIMENT:", sentiment);
    console.log("MULTI LINGUAL:", multiLingual);
    console.log("DETECTED LANGUAGE:", detectedLanguage);
    console.log("DETECTED CATEGORY:", detectedCategory);

    console.log("=================================");

    // =========================================
    // NORMALIZED AI RESPONSE
    // =========================================

    const normalizedData = {
      multi_intent: multiIntent,
      multi_lingual: multiLingual,
      sentiment: sentiment,

      detected_language: detectedLanguage,
      detected_category: detectedCategory,

      deep_link: deepLink,

      output: output,

      context: context,

      // Complete Python response
      raw_response: pythonData,
    };

    // =========================================
    // DATABASE
    // =========================================

    const analysis = await EmailAnalysis.create({
      user: req.user.id,
      email: email.trim(),
      aiResponse: normalizedData,
    });

    // =========================================
    // SEND RESPONSE TO REACT
    // =========================================

    return res.status(200).json({
      success: true,
      message: "Email analysis successfully",

      data: {
        id: analysis._id,

        email: analysis.email,

        // =====================================
        // ANALYSIS
        // =====================================

        multi_intent: multiIntent,

        multi_lingual: multiLingual,

        sentiment: sentiment,

        detected_language: detectedLanguage,

        detected_category: detectedCategory,

        deep_link: deepLink,

        // =====================================
        // GENERATED EMAIL
        // =====================================

        output: output,

        context: context,

        // =====================================
        // COMPLETE AI RESPONSE
        // =====================================

        aiResponse: normalizedData,
      },
    });
  } catch (error) {
    console.error("=================================");
    console.error("EMAIL ANALYSIS ERROR");
    console.error("=================================");

    console.error("Message:", error.message);

    console.error("Python error:", error.response?.data);

    console.error("Python status:", error.response?.status);

    console.error("=================================");

    return res.status(500).json({
      success: false,

      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to analyze email",

      error: error.response?.data || null,
    });
  }
};