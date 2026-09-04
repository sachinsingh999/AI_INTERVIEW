const { genAI } = require("./aiService");

/**
 * ConfidenceAnalyzer: Evaluates poise, mistake recovery, and hesitation patterns.
 */
class ConfidenceAnalyzer {
  /**
   * Evaluates candidate confidence and thinking patterns.
   * @param {string} transcript
   * @param {Array} answers
   * @returns {Promise<object>}
   */
  async analyze(transcript = "", answers = []) {
    try {
      console.log(`[ConfidenceAnalyzer] Starting confidence analysis...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Extract details like thinking times if available
      const timeMetrics = answers.map(a => ({
        question: a.question,
        thinkingTime: a.thinkingTime || 0,
        answerDuration: a.answerDuration || 0,
        confidenceScore: a.confidenceScore || 5
      }));

      const prompt = `
You are an expert behavioral analyst. Evaluate the candidate's confidence levels and decision-making patterns during the interview.

Evaluate:
- Poise and Confidence
- Hesitation and long pauses
- Recovery after making mistakes or answering incorrectly
- Decision making and core logic
- Thinking Patterns
- Response Latency and durations: ${JSON.stringify(timeMetrics)}

Interview Transcript:
${transcript || "No transcript provided."}

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "poiseLevel": "High" | "Medium" | "Low",
  "hesitationLevel": "Low" | "Medium" | "High",
  "mistakeRecovery": "Strong" | "Good" | "Average" | "Struggled",
  "thinkingPattern": "Structured" | "Analytical" | "Intuitive" | "Unstructured",
  "confidenceScore": 0 to 10,
  "confidenceAuditingFeedback": "2-3 sentences summarizing their poise and decision consistency."
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
        console.error("[ConfidenceAnalyzer] JSON parse failed, returning fallback.");
        return {
          poiseLevel: "Medium",
          hesitationLevel: "Medium",
          mistakeRecovery: "Good",
          thinkingPattern: "Analytical",
          confidenceScore: 7,
          confidenceAuditingFeedback: "Candidate exhibits typical confidence levels and manages mistakes adequately."
        };
      }
    } catch (error) {
      console.error(`[ConfidenceAnalyzer] Analysis failed:`, error.message);
      return {
        confidenceScore: 5,
        error: error.message
      };
    }
  }
}

module.exports = new ConfidenceAnalyzer();
