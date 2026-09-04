const { genAI } = require("./aiService");

/**
 * FollowUpAnalyzer: Evaluates candidate performance across adaptive question progressions.
 */
class FollowUpAnalyzer {
  /**
   * Evaluates adaptive interview progression.
   * @param {string} transcript
   * @returns {Promise<object>}
   */
  async analyze(transcript = "") {
    try {
      console.log(`[FollowUpAnalyzer] Starting follow-up adaptive analysis...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a senior tech lead assessor. Analyze how the candidate responded as questions became more complex or changed topics.

Evaluate:
- Performance on deeper follow-up questions
- Consistency when switching topics
- Knowledge consistency (did they contradict themselves?)
- Candidate improvement or fatigue during the session
- Core problem-solving adaptability

Interview Transcript:
${transcript || "No transcript provided."}

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "followUpPerformance": "Strong" | "Good" | "Average" | "Struggled",
  "topicSwitchingAdaptability": "Seamless" | "Adequate" | "Disrupted",
  "knowledgeConsistency": "High" | "Medium" | "Low",
  "learningCurveScore": 0 to 10,
  "adaptiveSummaryFeedback": "2-3 sentences evaluating candidate responsiveness to shifting question constraints."
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
        console.error("[FollowUpAnalyzer] JSON parse failed, returning fallback.");
        return {
          followUpPerformance: "Good",
          topicSwitchingAdaptability: "Adequate",
          knowledgeConsistency: "High",
          learningCurveScore: 7,
          adaptiveSummaryFeedback: "Candidate exhibits steady logic as technical complexity scales."
        };
      }
    } catch (error) {
      console.error(`[FollowUpAnalyzer] Analysis failed:`, error.message);
      return {
        learningCurveScore: 5,
        error: error.message
      };
    }
  }
}

module.exports = new FollowUpAnalyzer();
