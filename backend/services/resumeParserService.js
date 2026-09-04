const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const WordExtractor = require("word-extractor");
const Tesseract = require("tesseract.js");

/**
 * Extracts raw text from an uploaded resume file based on its MIME type.
 * Supports PDF, DOCX, DOC. If PDF text is minimal, falls back to OCR using Tesseract.js.
 * 
 * @param {string} filePath - Path to the temporary file on disk
 * @param {string} mimeType - The file's MIME type
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromFile(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    throw new Error("Temporary file does not exist on disk.");
  }

  const fileBuffer = fs.readFileSync(filePath);
  let extractedText = "";

  console.log(`[Parser Service] Beginning text extraction for type: ${mimeType}`);

  // 1. PDF Parser
  if (mimeType === "application/pdf" || filePath.endsWith(".pdf")) {
    try {
      const { PDFParse } = require("pdf-parse");
      const parser = new PDFParse(new Uint8Array(fileBuffer));
      const pdfData = await parser.getText();
      extractedText = pdfData.text || "";
      console.log(`[Parser Service] pdf-parse extracted ${extractedText.length} characters.`);

      // If text is extremely short, it is likely a scanned image PDF. Run OCR on embedded images.
      if (extractedText.trim().length < 150) {
        console.log("[Parser Service] Extracted PDF text is too short. Running OCR fallback via Tesseract.js on embedded images...");
        let ocrText = "";
        try {
          const imagesResult = await parser.getImage({ imageBuffer: true });
          if (imagesResult && Array.isArray(imagesResult.pages)) {
            for (const page of imagesResult.pages) {
              if (Array.isArray(page.images)) {
                for (const img of page.images) {
                  if (img.data && img.data.length > 0) {
                    console.log(`[Parser Service] OCR processing embedded PDF image of size ${img.data.length} bytes...`);
                    const ocrResult = await Tesseract.recognize(Buffer.from(img.data), "eng");
                    if (ocrResult && ocrResult.data && ocrResult.data.text) {
                      ocrText += ocrResult.data.text + "\n";
                    }
                  }
                }
              }
            }
          }
        } catch (imgErr) {
          console.error("[Parser Service] Failed to extract images for OCR:", imgErr.message);
        }

        if (ocrText.trim().length > 0) {
          extractedText = ocrText;
          console.log(`[Parser Service] OCR completed. Extracted ${extractedText.length} characters.`);
        }
      }
    } catch (err) {
      console.error("[Parser Service] PDF parsing failed:", err.message);
      throw new Error(`Failed to parse PDF file: ${err.message}`);
    }
  } 
  // 2. DOCX Parser
  else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value || "";
      console.log(`[Parser Service] Mammoth extracted ${extractedText.length} characters.`);
    } catch (err) {
      console.error("[Parser Service] Mammoth extraction failed, falling back to word-extractor:", err.message);
      try {
        const extractor = new WordExtractor();
        const doc = await extractor.extract(filePath);
        extractedText = doc.getBody();
      } catch (extErr) {
        throw new Error(`Failed to parse DOCX file: ${extErr.message}`);
      }
    }
  } 
  // 3. DOC Parser
  else if (mimeType === "application/msword" || filePath.endsWith(".doc")) {
    try {
      const extractor = new WordExtractor();
      const doc = await extractor.extract(filePath);
      extractedText = doc.getBody();
      console.log(`[Parser Service] word-extractor extracted ${extractedText.length} characters.`);
    } catch (err) {
      throw new Error(`Failed to parse DOC file: ${err.message}`);
    }
  } 
  // 4. Scanned image files (in case PDF is sent as image MIME or file extension matches image)
  else if (mimeType.startsWith("image/") || /\.(jpe?g|png|webp|bmp)$/i.test(filePath)) {
    console.log("[Parser Service] Image detected. Running Tesseract.js OCR directly...");
    try {
      const ocrResult = await Tesseract.recognize(fileBuffer, "eng");
      extractedText = ocrResult.data.text || "";
      console.log(`[Parser Service] Image OCR completed. Extracted ${extractedText.length} characters.`);
    } catch (err) {
      throw new Error(`Failed to run OCR on image: ${err.message}`);
    }
  }
  else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error("The uploaded resume appears to be empty or unreadable.");
  }

  return extractedText.trim();
}

module.exports = {
  extractTextFromFile,
};
