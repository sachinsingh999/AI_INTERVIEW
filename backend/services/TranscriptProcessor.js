const Answer = require("../models/Answer");

/**
 * TranscriptProcessor: Merges questions and candidate answers from the database
 * to build one coherent chronological interview transcript.
 */
class TranscriptProcessor {
  /**
   * Generates a complete merged transcript for a given interview.
   * @param {string} interviewId
   * @param {Array} questions
   * @returns {Promise<{transcript: string, questionHistory: Array, answerHistory: Array}>}
   */
  async process(interviewId, questions = []) {
    try {
      console.log(`[TranscriptProcessor] Retrieving answers for interview: ${interviewId}`);
      const answers = await Answer.find({ interview: interviewId }).sort({ createdAt: 1 });

      let transcript = `=== INTERVIEW CONVERSATION TRANSCRIPT ===\n\n`;
      const questionHistory = [];
      const answerHistory = [];

      // Sort or align Q&As chronologically
      answers.forEach((ans, index) => {
        const qText = ans.question || `Question ${index + 1}`;
        const aText = ans.answer || "No response recorded.";

        transcript += `AI Interviewer:\n"${qText}"\n\n`;
        transcript += `Candidate:\n"${aText}"\n\n`;
        transcript += `--------------------------------------------------\n\n`;

        questionHistory.push(qText);
        answerHistory.push(aText);
      });

      if (answers.length === 0) {
        transcript += `[No conversation transcript was compiled during the session.]`;
      }

      return {
        transcript: transcript.trim(),
        questionHistory,
        answerHistory
      };
    } catch (error) {
      console.error(`[TranscriptProcessor] Transcript processing failed:`, error.message);
      throw error;
    }
  }
}

module.exports = new TranscriptProcessor();
