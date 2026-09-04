const { genAI } = require("./aiService");

/**
 * SkillAssessmentEngine: Assesses technical skill depth based on conversation logs.
 */
class SkillAssessmentEngine {
  /**
   * Evaluates technical skills based on the interview transcript.
   * @param {string} role
   * @param {Array} skills
   * @param {string} transcript
   * @returns {Promise<object>}
   */
  async assess(role = "", skills = [], transcript = "") {
    try {
      console.log(`[SkillAssessmentEngine] Starting technical skills assessment...`);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a senior technical interviewer. Evaluate the candidate's core technical skills based on the interview transcript.

Target Job Role: ${role || "Software Developer"}
Target Skills: ${JSON.stringify(skills)}

Interview Transcript:
${transcript || "No transcript provided."}

Your Task:
For each technical skill, provide:
1. Knowledge Level ("Beginner" | "Intermediate" | "Advanced" | "Expert")
2. Technical Score (0 to 10)
3. Reasoning or explanation of their understanding
4. Estimating Confidence (0 to 10) based on their answers
5. Specific evidence or quotes from the transcript

Return ONLY a JSON response matching the following schema. Do NOT include markdown blocks (\`\`\`), comments, or extra text.
{
  "skillsAssessment": [
    {
      "skill": "React",
      "level": "Advanced",
      "score": 8,
      "reasoning": "Reasoning text...",
      "confidence": 9,
      "evidence": "Candidate successfully explained Virtual DOM and React Fiber."
    }
  ],
  "avgTechnicalScore": 0 to 10
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
        console.error("[SkillAssessmentEngine] Gemini output was not valid JSON, returning fallback.");
        return {
          skillsAssessment: [],
          avgTechnicalScore: 5
        };
      }
    } catch (error) {
      console.error(`[SkillAssessmentEngine] Assessment failed:`, error.message);
      return {
        skillsAssessment: [],
        avgTechnicalScore: 5,
        error: error.message
      };
    }
  }
}

module.exports = new SkillAssessmentEngine();
