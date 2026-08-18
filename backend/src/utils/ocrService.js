import axios from "axios";

/**
 * Extract text from an image buffer using high-speed OCR
 * @param {Buffer} buffer - Raw image buffer
 * @param {string} mimetype - Image mime type
 * @returns {Promise<string>} - Extracted text string
 */
export const extractTextFromImage = async (buffer, mimetype = "image/png") => {
  if (!buffer || buffer.length === 0) return "";

  const base64Data = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${base64Data}`;

  const apiKeys = ["K88289874488957", "helloworld", "K82598374888957"];

  for (const key of apiKeys) {
    try {
      const response = await axios.post(
        "https://api.ocr.space/parse/image",
        new URLSearchParams({
          base64Image: dataUri,
          apikey: key,
          language: "eng",
          isOverlayRequired: "false",
          detectOrientation: "true",
          scale: "true",
          isTable: "true",
          OCREngine: "2",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 12000,
        }
      );

      const parsedResults = response.data?.ParsedResults;
      if (parsedResults && parsedResults.length > 0 && parsedResults[0]?.ParsedText) {
        const text = parsedResults[0].ParsedText.trim();
        if (text.length > 5) {
          console.log(`[OCR SUCCESS] Extracted ${text.length} characters from image`);
          return text;
        }
      }
    } catch (err) {
      console.warn(`[OCR API Attempt with key ${key} failed]:`, err.message);
    }
  }

  return "";
};

/**
 * Analyze email text, extracted image text, and user query to generate a complete contextual response
 */
export const generateContextualEmailResponse = ({
  userQuery = "",
  imageText = "",
  pdfText = "",
  fileList = [],
}) => {
  const combinedContext = [userQuery, imageText, pdfText].filter(Boolean).join("\n\n");
  const lowerContext = combinedContext.toLowerCase();
  const lowerQuery = userQuery.toLowerCase();

  // Detect language of query or content
  const isHindi =
    /[\u0900-\u097F]/.test(userQuery) ||
    lowerQuery.includes("kya") ||
    lowerQuery.includes("kaise") ||
    lowerQuery.includes("batao") ||
    lowerQuery.includes("likha") ||
    lowerQuery.includes("karo") ||
    lowerQuery.includes("hai") ||
    lowerQuery.includes("ye");

  // Determine intent & category
  let category = "General Communication";
  let intent = "Email Review & Inquiry";
  let sentiment = "Neutral";
  let deepLink = "Support";
  let deepLinkDesc = "Contact support, help center, FAQs";

  if (
    lowerContext.includes("login") ||
    lowerContext.includes("password") ||
    lowerContext.includes("otp") ||
    lowerContext.includes("lock") ||
    lowerContext.includes("sign in") ||
    lowerContext.includes("verification code") ||
    lowerContext.includes("unauthorized")
  ) {
    category = "Login & Security";
    intent = "Account Access, OTP & Password Security";
    deepLink = "Login";
    deepLinkDesc = "Login issues, forgot password, OTP not received, account locked";
  } else if (
    lowerContext.includes("kyc") ||
    lowerContext.includes("aadhaar") ||
    lowerContext.includes("pan card") ||
    lowerContext.includes("identity") ||
    lowerContext.includes("document verification") ||
    lowerContext.includes("passport")
  ) {
    category = "KYC & Verification";
    intent = "Identity Verification & Document Compliance";
    deepLink = "KYC & Verification";
    deepLinkDesc = "Aadhaar, PAN card verification, document upload, verification failed";
  } else if (
    lowerContext.includes("refund") ||
    lowerContext.includes("payment") ||
    lowerContext.includes("invoice") ||
    lowerContext.includes("transaction") ||
    lowerContext.includes("bill") ||
    lowerContext.includes("charge") ||
    lowerContext.includes("deducted") ||
    lowerContext.includes("receipt")
  ) {
    category = "Payments & Billing";
    intent = "Billing Inquiry, Transaction & Refund Processing";
    deepLink = "Payments & Billing";
    deepLinkDesc = "Payment failed, refund status, transaction issues, invoices";
  } else if (
    lowerContext.includes("error") ||
    lowerContext.includes("bug") ||
    lowerContext.includes("failed") ||
    lowerContext.includes("crash") ||
    lowerContext.includes("500") ||
    lowerContext.includes("404")
  ) {
    category = "Technical Issue";
    intent = "System Error Troubleshooting";
    deepLink = "Technical Support";
    deepLinkDesc = "System errors, application bug reports, performance diagnostics";
  }

  // Sentiment detection
  if (
    lowerContext.includes("urgent") ||
    lowerContext.includes("immediately") ||
    lowerContext.includes("asap") ||
    lowerContext.includes("fraud") ||
    lowerContext.includes("worst") ||
    lowerContext.includes("money deducted") ||
    lowerContext.includes("blocked")
  ) {
    sentiment = "Urgent / Critical";
  } else if (
    lowerContext.includes("thank") ||
    lowerContext.includes("appreciate") ||
    lowerContext.includes("great") ||
    lowerContext.includes("resolved") ||
    lowerContext.includes("good")
  ) {
    sentiment = "Positive";
  }

  // Extract key entities (emails, amounts, dates, codes) from OCR text
  const emailMatches = imageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const amountMatches = imageText.match(/(?:Rs\.?|INR|\$|₹|USD)\s*[\d,]+(?:\.\d{2})?/gi) || [];
  const dateMatches = imageText.match(/\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})\b/g) || [];
  const otpMatches = imageText.match(/\b(?:OTP|Code|PIN)[:\s]*([0-9]{4,8})\b/i) || [];
  const codeMatches = imageText.match(/\b(?:OTP|Code|ID|Ref|Ticket|Order|Txn|Reference)[:\s#]*([A-Z0-9-]{4,16})\b/i) || otpMatches;

  let extractedSummaryBullet = "";
  if (imageText.length > 0) {
    const cleanLines = imageText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 3)
      .slice(0, 6);

    extractedSummaryBullet = cleanLines.map((line) => `- ${line}`).join("\n");
  }

  // 1. Direct Answer Section
  let directAnswerSection = "";
  if (userQuery.trim()) {
    if (isHindi) {
      directAnswerSection = `### 🎯 Aapke Sawaal Ka Jawab\n` +
        `**Aapka Sawaal:** *"${userQuery}"*\n\n` +
        `**Direct Answer:** Uploaded email/image ke mutabiq yeh **${category}** (*${intent}*) se related hai. Isme user ki samasya ko verify karke solution provide karne ke baare me bataya gaya hai.\n` +
        `${emailMatches.length ? `- **Contact/Email:** \`${emailMatches[0]}\`\n` : ""}` +
        `${amountMatches.length ? `- **Amount Mentioned:** \`${amountMatches[0]}\`\n` : ""}` +
        `${codeMatches.length ? `- **Reference / ID:** \`${codeMatches[0]}\`\n` : ""}` +
        `${dateMatches.length ? `- **Date:** \`${dateMatches[0]}\`\n` : ""}\n---\n\n`;
    } else {
      directAnswerSection = `### 🎯 Direct Answer to Your Query\n` +
        `**Your Question:** *"${userQuery}"*\n\n` +
        `**Direct Answer:** Based on the uploaded email document, this is regarding **${category}** (*${intent}*). The message requests immediate review and necessary support resolution.\n` +
        `${emailMatches.length ? `- **Identified Contact:** \`${emailMatches[0]}\`\n` : ""}` +
        `${amountMatches.length ? `- **Amount Mentioned:** \`${amountMatches[0]}\`\n` : ""}` +
        `${codeMatches.length ? `- **Reference / ID:** \`${codeMatches[0]}\`\n` : ""}` +
        `${dateMatches.length ? `- **Date:** \`${dateMatches[0]}\`\n` : ""}\n---\n\n`;
    }
  }

  // 2. Smart Structured Sections
  const responseMarkdown = `${directAnswerSection}### 📋 Summary & Overview
- **Category:** ${category}
- **Intent:** ${intent}
- **Tone / Urgency:** ${sentiment}
- **Language:** ${isHindi ? "Hindi / Hinglish" : "English"}

---

### 🔍 Key Extracted Details
${
  extractedSummaryBullet ||
  `- **Identified Intent:** ${intent}\n- **Classification:** ${category}\n- **Urgency Level:** ${sentiment}`
}

---

### 🚀 Recommended Next Actions
1. **Verify Record:** Check customer account against the details found in the image.
2. **Execute Resolution:** Follow standard operational workflow for **${category}**.
3. **Send Confirmation:** Send the response draft below to keep the user informed.

---

### ✉️ Quick Customer Reply Draft
> **Subject:** Regarding your ${category} request [Ref: #${Math.floor(100000 + Math.random() * 900000)}]
> 
> Dear Customer,
> 
> Thank you for contacting our support team. We have received and reviewed your request concerning **${category}**.
> 
> Our team is actively investigating this matter to ensure a quick resolution. Please reply to this message if you have additional documents to provide.
> 
> Warm regards,  
> **Customer Support Team | AI Horizon**`;

  return {
    output: responseMarkdown,
    multi_intent: { intent, category },
    multi_lingual: { language: isHindi ? "Hindi / Hinglish" : "English" },
    sentiment_analysis: { sentiment },
    detected_category: category,
    detected_language: isHindi ? "Hindi / Hinglish" : "English",
    deep_link: { action: deepLink, description: deepLinkDesc },
    context: [
      `Category: ${category}`,
      `Intent: ${intent}`,
      ...(imageText ? [`OCR Extracted Text (${imageText.length} chars)`] : []),
    ],
  };
};
