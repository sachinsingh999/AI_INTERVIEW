const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { extractTextFromFile } = require("../services/resumeParserService");
const { extractResumeData } = require("../services/aiService");

// Ensure temporary uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage and upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error("Unsupported file format. Only PDF, DOC, and DOCX are allowed."));
    }
    cb(null, true);
  },
});

/**
 * Calculates programmatic confidence score (overall & per-field) based on
 * presence, length, and format of the extracted fields.
 */
function calculateConfidence(parsedData) {
  const weights = {
    name: 1.0,
    email: 1.0,
    phone: 1.0,
    linkedin: 0.5,
    github: 0.5,
    portfolio: 0.5,
    location: 0.5,
    summary: 1.0,
    skills: 1.5,
    education: 1.5,
    experience: 1.5,
    projects: 1.5,
    certifications: 0.5,
    achievements: 0.5,
    languages: 0.5
  };

  let totalWeight = 0;
  let earnedWeight = 0;
  const fieldConfidences = {};

  for (const key of Object.keys(weights)) {
    totalWeight += weights[key];
    const val = parsedData[key];
    let score = 0.0;

    if (Array.isArray(val)) {
      if (val.length > 0) {
        // Validate elements inside the array
        let validItems = 0;
        for (const item of val) {
          if (typeof item === "string" && item.trim().length > 0) {
            validItems++;
          } else if (typeof item === "object" && item !== null) {
            // Check if any subfield contains text
            const hasText = Object.values(item).some(
              (v) => typeof v === "string" && v.trim().length > 0
            );
            if (hasText) validItems++;
          }
        }
        score = validItems > 0 ? 0.95 : 0.0;
      } else {
        score = 0.0;
      }
    } else if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.length > 0) {
        if (key === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          score = emailRegex.test(trimmed) ? 0.99 : 0.40;
        } else if (key === "phone") {
          const phoneRegex = /^[\d\s+\-()]{7,20}$/;
          score = phoneRegex.test(trimmed) ? 0.98 : 0.45;
        } else if (key === "name") {
          score = trimmed.split(/\s+/).length >= 2 ? 0.98 : 0.70;
        } else if (key === "linkedin" || key === "github" || key === "portfolio") {
          score = trimmed.startsWith("http") || trimmed.includes(".com") || trimmed.includes(".org") ? 0.98 : 0.50;
        } else {
          score = 0.95;
        }
      } else {
        score = 0.0;
      }
    }

    fieldConfidences[key] = score;
    earnedWeight += score * weights[key];
  }

  const overallConfidence = totalWeight > 0 ? earnedWeight / totalWeight : 0.0;
  return {
    overallConfidence: parseFloat(overallConfidence.toFixed(2)),
    fieldConfidences,
  };
}

// ===== POST /api/resume/parse (Real ATS Parser) =====
const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No resume file uploaded." });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    console.log(`[Parser Controller] Upload received: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. Extract raw text from file
    const rawText = await extractTextFromFile(filePath, mimeType);

    // 2. Parse text with LLM
    const parsedData = await extractResumeData(rawText);

    // 3. Compute extraction confidence
    const { overallConfidence, fieldConfidences } = calculateConfidence(parsedData);

    console.log(`[Parser Controller] Parsing complete. Overall Confidence: ${overallConfidence}`);

    res.status(200).json({
      success: true,
      parsedData,
      confidence: overallConfidence,
      fieldConfidences,
    });
  } catch (error) {
    console.error("[Parser Controller] Error during parsing execution:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while parsing the resume.",
    });
  } finally {
    // Delete file from temporary storage folder
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Parser Controller] Cleaned up temporary file: ${filePath}`);
      } catch (err) {
        console.error(`[Parser Controller] Cleanup failed: ${err.message}`);
      }
    }
  }
};

// Placeholder legacy upload for compatibility
const uploadResume = async (req, res) => {
  res.status(400).json({
    success: false,
    message: "POST /api/resume/upload is deprecated. Use POST /api/resume/parse with multipart/form-data directly.",
  });
};

module.exports = {
  upload,
  uploadResume,
  parseResume,
};
