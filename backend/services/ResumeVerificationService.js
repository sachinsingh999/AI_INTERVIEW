const { genAI } = require("./aiService");

/**
 * ResumeVerificationService: Compares resume claims with candidate answers to verify
 * accuracy of technologies, responsibilities, projects, and skills.
 */
class ResumeVerificationService {
  /**
   * Performs resume claims verification using Gemini.
   * @param {string} resumeText
   * @param {string} transcript
   * @returns {Promise<object>}
   */
  async verify(resumeText = "", transcript = "") {
    try {
      console.log(`[ResumeVerificationService] Starting claims verification...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an expert AI Resume Auditor. Compare the candidate's resume claims against the interview responses.

Resume Details:
${resumeText || "No resume text provided."}

Interview Transcript:
${transcript || "No transcript provided."}

Your Task:
For each core claim identified in the resume (focusing on Skills, Projects, Experience, and Technologies):
1. Determine the status: "Verified" (candidate demonstrates solid depth), "Partially Verified" (some knowledge shown but gaps or lack of depth), or "Not Verified" (either candidate struggled, showed incorrect understanding, or the topic was not discussed at all).
2. Provide short auditor evidence or rationale.

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "skills": [
    { "name": "React", "status": "Verified" | "Partially Verified" | "Not Verified", "evidence": "text..." }
  ],
  "projects": [
    { "name": "CartNow", "status": "Verified" | "Partially Verified" | "Not Verified", "evidence": "text..." }
  ],
  "experience": [
    { "role": "Software Engineer at Google", "status": "Verified" | "Partially Verified" | "Not Verified", "evidence": "text..." }
  ],
  "overallConsistencyScore": 0 to 100
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
        console.error("[ResumeVerificationService] Gemini output was not valid JSON, returning fallback structure.");
        return {
          skills: [],
          projects: [],
          experience: [],
          overallConsistencyScore: 70,
          error: "JSON Parsing Failed"
        };
      }
    } catch (error) {
      console.error(`[ResumeVerificationService] Verification failed:`, error.message);
      return {
        skills: [],
        projects: [],
        experience: [],
        overallConsistencyScore: 50,
        error: error.message
      };
    }
  }
}

module.exports = new ResumeVerificationService();
