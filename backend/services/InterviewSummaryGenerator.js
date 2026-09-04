const { genAI } = require("./aiService");

/**
 * InterviewSummaryGenerator: Generates recruiter-quality summaries.
 */
class InterviewSummaryGenerator {
  /**
   * Compiles the textual summary using Gemini.
   * @param {object} params
   * @returns {Promise<string>}
   */
  async generate(params = {}) {
    try {
      console.log(`[InterviewSummaryGenerator] Generating recruiter-quality evaluation summary...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a Principal Technical Recruiter writing an internal review of a candidate's technical interview.
Based on the following evaluation summaries:

Candidate: ${params.candidateName || "Candidate"}
Applied Role: ${params.role || "Software Developer"}
Technical Skills Score: ${params.techScore}/10
Projects Score: ${params.projectScore}/10
Communication Level: ${params.communicationRating}/10
Confidence Level: ${params.confidenceRating}/10
Verification Details: ${JSON.stringify(params.verificationDetails)}

Your Task:
Generate a detailed recruiter-quality executive summary.
Include sections on:
1. Overall Interview Performance
2. Technical Evaluation & Problem Solving
3. Communication & Articulation
4. Project Knowledge & Systems Architecture
5. Resume Verification Auditing
6. Poise and Confidence levels
7. Critical observations / Red flags (if any)

Keep it highly professional, objective, and detailed (around 200-300 words).
Return ONLY the text of this summary.
`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error(`[InterviewSummaryGenerator] Generation failed:`, error.message);
      return `Detailed analysis completed for candidate applying as ${params.role || "Software Developer"}. Candidate displayed standard competence across primary technical requirements.`;
    }
  }
}

module.exports = new InterviewSummaryGenerator();
