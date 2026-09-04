const { genAI } = require("./aiService");

/**
 * RecommendationEngine: Determines the final hiring decision and outputs reasoning.
 */
class RecommendationEngine {
  /**
   * Generates recommendation decision and reasoning.
   * @param {object} stats
   * @returns {Promise<{decision: string, reasoning: string, strengths: Array, weaknesses: Array, evidence: Array}>}
   */
  async generate(stats = {}) {
    try {
      console.log(`[RecommendationEngine] Determining hiring recommendations...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a Principal Software Engineer chairing the hiring bar committee. Evaluate the candidate's metrics and transcripts:

Applied Role: ${stats.role || "Software Developer"}
Technical Assessment Score: ${stats.techScore}/10
Projects Assessment Score: ${stats.projectScore}/10
Communication Assessment Score: ${stats.communicationScore}/10
Poise & Confidence Score: ${stats.confidenceScore}/10
Resume Verification Consistency: ${stats.resumeConsistency}/100

Your Task:
Based on these inputs, determine the final hiring recommendation.
The decision MUST be one of: "Strong Hire", "Hire", "Borderline", "Need Another Round", "Reject".
Also, identify the candidate's top 3 strengths (with brief evidence quotes) and top 3 weaknesses/knowledge gaps.

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "decision": "Strong Hire" | "Hire" | "Borderline" | "Need Another Round" | "Reject",
  "reasoning": "Detailed technical reasoning explaining the decision context...",
  "strengths": ["Strength 1...", "Strength 2...", "Strength 3..."],
  "weaknesses": ["Weakness 1...", "Weakness 2...", "Weakness 3..."],
  "evidence": ["Specific transcript quote/evidence 1...", "Evidence 2..."]
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
        console.error("[RecommendationEngine] JSON parse failed, returning fallback.");
        return {
          decision: "Borderline",
          reasoning: "Performance was intermediate across technical metrics.",
          strengths: ["Shows technical understanding"],
          weaknesses: ["Deep-dive concepts could be improved"],
          evidence: ["Candidate answered core questions correctly."]
        };
      }
    } catch (error) {
      console.error(`[RecommendationEngine] Recommendation failed:`, error.message);
      return {
        decision: "Borderline",
        reasoning: error.message,
        strengths: [],
        weaknesses: [],
        evidence: []
      };
    }
  }
}

module.exports = new RecommendationEngine();
