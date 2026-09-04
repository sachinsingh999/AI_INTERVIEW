const { genAI } = require("./aiService");

/**
 * CommunicationAnalyzer: Analyzes speaking clarity, grammar, and vocabulary.
 */
class CommunicationAnalyzer {
  /**
   * Evaluates communication details.
   * @param {string} transcript
   * @returns {Promise<object>}
   */
  async analyze(transcript = "") {
    try {
      console.log(`[CommunicationAnalyzer] Starting communication analysis...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a professional communication coach. Analyze the candidate's speech communication quality based on the transcript.

Evaluate:
- Speaking Clarity
- Grammar and Syntax
- Technical Vocabulary usage
- Professional Communication tone
- Sentence Structure
- Answer Organization
- Response Completeness
- Fillers or hesitation indicators

Interview Transcript:
${transcript || "No transcript provided."}

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "speakingClarity": "Excellent" | "Good" | "Average" | "Needs Improvement",
  "technicalVocabulary": 0 to 10,
  "professionalTone": 0 to 10,
  "structureRating": 0 to 10,
  "fillerWordsDensity": "Low" | "Medium" | "High",
  "summaryFeedback": "2-3 sentences of constructive feedback...",
  "communicationScore": 0 to 10
}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      let cleanText = responseText;
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      try {
        return JSON.parse(cleanText);
      } catch (parseErr) {
        console.error("[CommunicationAnalyzer] JSON parse failed, returning fallback.");
        return {
          speakingClarity: "Good",
          technicalVocabulary: 7,
          professionalTone: 8,
          structureRating: 7,
          fillerWordsDensity: "Medium",
          summaryFeedback: "Candidate communicates their technical thoughts reasonably well.",
          communicationScore: 7
        };
      }
    } catch (error) {
      console.error(`[CommunicationAnalyzer] Analysis failed:`, error.message);
      return {
        communicationScore: 5,
        error: error.message
      };
    }
  }
}

module.exports = new CommunicationAnalyzer();
