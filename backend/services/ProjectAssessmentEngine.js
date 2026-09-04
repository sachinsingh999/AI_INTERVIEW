const { genAI } = require("./aiService");

/**
 * ProjectAssessmentEngine: Analyzes candidate's projects and engineering decisions.
 */
class ProjectAssessmentEngine {
  /**
   * Evaluates project-related answers from the transcript.
   * @param {string} transcript
   * @returns {Promise<object>}
   */
  async assess(transcript = "") {
    try {
      console.log(`[ProjectAssessmentEngine] Starting projects assessment...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a senior tech reviewer. Analyze the candidate's understanding of projects they discussed in the interview.

Evaluate their answers on:
- Architecture Understanding
- Technology Selection
- Deployment Knowledge
- Database Design
- Authentication & Security
- Performance & Scalability
- Optimization & Tradeoffs
- Challenges Solved
- Code Ownership Level

Interview Transcript:
${transcript || "No transcript provided."}

Your Task:
Identify the projects discussed and for each project evaluate:
1. Project Score (0 to 10)
2. Project Confidence (0 to 10)
3. Ownership Level ("High" | "Medium" | "Low")
4. Short auditor evidence

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "projectsAssessment": [
    {
      "name": "CartNow",
      "score": 9,
      "confidence": 8,
      "ownership": "High",
      "evidence": "Candidate accurately described the microservices division, MongoDB indexing decisions, and Redis cache integration."
    }
  ],
  "avgProjectScore": 0 to 10
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
        console.error("[ProjectAssessmentEngine] Gemini output was not valid JSON, returning fallback.");
        return {
          projectsAssessment: [],
          avgProjectScore: 5
        };
      }
    } catch (error) {
      console.error(`[ProjectAssessmentEngine] Assessment failed:`, error.message);
      return {
        projectsAssessment: [],
        avgProjectScore: 5,
        error: error.message
      };
    }
  }
}

module.exports = new ProjectAssessmentEngine();
