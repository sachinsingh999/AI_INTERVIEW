const InterviewAnalysis = require("../models/InterviewAnalysis");

/**
 * DatabasePersistenceService: Persists the structured evaluation analysis document.
 */
class DatabasePersistenceService {
  /**
   * Saves or updates the analysis document.
   * @param {object} analysisData
   * @returns {Promise<object>}
   */
  async save(analysisData = {}) {
    try {
      console.log(`[DatabasePersistenceService] Saving analysis data for interview: ${analysisData.interview}`);
      
      const savedDoc = await InterviewAnalysis.findOneAndUpdate(
        { interview: analysisData.interview },
        analysisData,
        { new: true, upsert: true }
      );

      console.log(`[DatabasePersistenceService] Analysis saved successfully: ${savedDoc._id}`);
      return savedDoc;
    } catch (error) {
      console.error(`[DatabasePersistenceService] Saving analysis to database failed:`, error.message);
      throw error;
    }
  }
}

module.exports = new DatabasePersistenceService();
