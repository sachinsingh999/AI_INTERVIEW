const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Answer = require("../models/Answer");
const TranscriptProcessor = require("./TranscriptProcessor");
const ResumeVerificationService = require("./ResumeVerificationService");
const SkillAssessmentEngine = require("./SkillAssessmentEngine");
const ProjectAssessmentEngine = require("./ProjectAssessmentEngine");
const CommunicationAnalyzer = require("./CommunicationAnalyzer");
const ConfidenceAnalyzer = require("./ConfidenceAnalyzer");
const FollowUpAnalyzer = require("./FollowUpAnalyzer");
const InterviewSummaryGenerator = require("./InterviewSummaryGenerator");
const RecommendationEngine = require("./RecommendationEngine");
const DatabasePersistenceService = require("./DatabasePersistenceService");
const InterviewAnalysis = require("../models/InterviewAnalysis");

class InterviewProcessingService {
  /**
   * Runs the complete analytical processing pipeline for a completed interview.
   * Runs asynchronously in the background to prevent blocking HTTP endpoints.
   * @param {string} interviewId
   */
  async startAnalysisPipeline(interviewId) {
    const startTime = Date.now();
    console.log(`[InterviewProcessingService] Initiating analysis pipeline for interview ID: ${interviewId}`);

    // Create initial processing analysis document in database
    let analysisDoc = null;
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error(`Interview ${interviewId} not found`);
      }

      analysisDoc = await InterviewAnalysis.findOneAndUpdate(
        { interview: interviewId },
        {
          interview: interviewId,
          candidate: interview.user,
          status: "processing",
          aiModelVersion: "gemini-1.5-flash",
          errorLogs: []
        },
        { new: true, upsert: true }
      );
    } catch (docErr) {
      console.error(`[InterviewProcessingService] Failed to initialize analysis document:`, docErr.message);
      return;
    }

    // Run the rest of the pipeline in a retry/try block
    let retries = 2;
    while (retries >= 0) {
      try {
        console.log(`[InterviewProcessingService] Running pipeline (attempts remaining: ${retries})...`);

        // 1. Retrieve core session details
        const interview = await Interview.findById(interviewId).populate("user");
        const answers = await Answer.find({ interview: interviewId });

        // 2. Generate merged chronological transcript
        const transcriptData = await TranscriptProcessor.process(interviewId, interview.questions);
        const transcript = transcriptData.transcript;

        // 3. Compare resume claims against transcript
        const verification = await ResumeVerificationService.verify(
          interview.resumeText || "",
          transcript
        );

        // 4. Assess technical skills
        const skillsAssessment = await SkillAssessmentEngine.assess(
          interview.role,
          interview.technologies || [],
          transcript
        );

        // 5. Assess projects understanding
        const projectAssessment = await ProjectAssessmentEngine.assess(transcript);

        // 6. Analyze communication traits
        const communication = await CommunicationAnalyzer.analyze(transcript);

        // 7. Analyze confidence level & response timing
        const confidence = await ConfidenceAnalyzer.analyze(transcript, answers);

        // 8. Analyze adaptive progression
        const adaptive = await FollowUpAnalyzer.analyze(transcript);

        // 9. Calculate internal scores based on evaluations
        const scores = {
          technicalSkills: Math.round(skillsAssessment.avgTechnicalScore || 6),
          projects: Math.round(projectAssessment.avgProjectScore || 6),
          communication: Math.round(communication.communicationScore || 6),
          confidence: Math.round(confidence.confidenceScore || 6),
          problemSolving: Math.round( ( (skillsAssessment.avgTechnicalScore || 6) + (projectAssessment.avgProjectScore || 6) ) / 2 ),
          resumeConsistency: Math.round(verification.overallConsistencyScore / 10 || 7),
          leadership: Math.round( ( (communication.communicationScore || 6) + (confidence.confidenceScore || 6) ) / 2 ),
          learningAbility: Math.round(adaptive.learningCurveScore || 7),
          overallPerformance: 0
        };

        scores.overallPerformance = Math.round(
          (scores.technicalSkills +
            scores.projects +
            scores.communication +
            scores.confidence +
            scores.problemSolving +
            scores.resumeConsistency) / 6
        );

        // 10. Generate recommendations, strengths & weaknesses
        const recommendation = await RecommendationEngine.generate({
          role: interview.role,
          techScore: scores.technicalSkills,
          projectScore: scores.projects,
          communicationScore: scores.communication,
          confidenceScore: scores.confidence,
          resumeConsistency: verification.overallConsistencyScore || 70
        });

        // 11. Generate detailed recruiter-facing evaluation narrative summary
        const summary = await InterviewSummaryGenerator.generate({
          candidateName: interview.user ? `${interview.user.firstName || ""} ${interview.user.lastName || ""}` : "Candidate",
          role: interview.role,
          techScore: scores.technicalSkills,
          projectScore: scores.projects,
          communicationRating: scores.communication,
          confidenceRating: scores.confidence,
          verificationDetails: verification
        });

        const processingDuration = Math.round((Date.now() - startTime) / 1000);

        // 12. Save final structured document to DB
        await DatabasePersistenceService.save({
          interview: interviewId,
          candidate: interview.user?._id,
          transcript,
          questionHistory: transcriptData.questionHistory,
          answerHistory: transcriptData.answerHistory,
          resumeVerification: verification,
          skillAnalysis: skillsAssessment,
          projectAnalysis: projectAssessment,
          communicationAnalysis: communication,
          confidenceAnalysis: confidence,
          adaptiveInterviewAnalysis: adaptive,
          scores,
          strengths: recommendation.strengths || [],
          weaknesses: recommendation.weaknesses || [],
          summary,
          recommendation: {
            decision: recommendation.decision || "Borderline",
            reasoning: recommendation.reasoning || ""
          },
          evidence: recommendation.evidence || [],
          processingTimestamp: new Date(),
          processingTime: processingDuration,
          status: "completed"
        });

        console.log(`[InterviewProcessingService] Analysis pipeline finished successfully for interview: ${interviewId}`);
        break;

      } catch (err) {
        console.error(`[InterviewProcessingService] Pipeline iteration error:`, err);
        retries--;
        
        if (analysisDoc) {
          analysisDoc.errorLogs.push(`Attempt failed: ${err.message}. Retries remaining: ${retries + 1}`);
          analysisDoc.markModified("errorLogs");
          await analysisDoc.save();
        }

        if (retries < 0) {
          console.error(`[InterviewProcessingService] Pipeline failed definitively for: ${interviewId}`);
          if (analysisDoc) {
            analysisDoc.status = "failed";
            await analysisDoc.save();
          }
        } else {
          // Stagger retries slightly
          await new Promise(res => setTimeout(res, 2000));
        }
      }
    }
  }
}

module.exports = new InterviewProcessingService();
