const AptitudeSession = require("../models/AptitudeSession");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const AiLog = require("../models/AiLog");
const aiService = require("../services/aiService");

// Start a new session or retrieve an ongoing one
exports.createSession = async (req, res) => {
  const { topic, difficulty, questionCount } = req.body;
  if (!topic || !difficulty || !questionCount) {
    return res.status(400).json({ message: "Topic, difficulty, and question count are required." });
  }

  try {
    // Check if there is an existing ongoing session for the same topic and difficulty
    const ongoingSession = await AptitudeSession.findOne({
      userId: req.user._id,
      topic,
      difficulty,
      status: "ongoing",
    });

    if (ongoingSession) {
      const questions = await AptitudeQuestion.find({ sessionId: ongoingSession._id }).sort({ questionNumber: 1 });
      return res.status(200).json({
        success: true,
        message: "Resumed existing ongoing session.",
        session: ongoingSession,
        questions,
      });
    }

    // Generate questions using AI
    let generatedQuestions;
    const promptText = `Topic: ${topic}, Difficulty: ${difficulty}, Count: ${questionCount}`;
    try {
      generatedQuestions = await aiService.generateAptitudeQuestions(topic, difficulty, questionCount);
    } catch (err) {
      // Log failed AI generation attempt
      await AiLog.create({
        userId: req.user._id,
        action: "APTITUDE_QUESTIONS_GEN_FAIL",
        prompt: promptText,
        response: "",
        success: false,
        error: err.message,
      });
      return res.status(502).json({ message: "AI question generation failed: " + err.message });
    }

    // Create session
    const session = await AptitudeSession.create({
      userId: req.user._id,
      topic,
      difficulty,
      questionCount,
      timeLeft: questionCount * 60, // 1 minute per question default
    });

    // Create questions
    const questionsToInsert = generatedQuestions.map((q, idx) => ({
      sessionId: session._id,
      questionNumber: idx,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || difficulty,
      topic: q.topic || topic,
      subtopic: q.subtopic || "",
    }));

    const insertedQuestions = await AptitudeQuestion.insertMany(questionsToInsert);

    // Log successful AI generation
    await AiLog.create({
      userId: req.user._id,
      action: "APTITUDE_QUESTIONS_GEN",
      prompt: promptText,
      response: JSON.stringify(generatedQuestions),
      success: true,
    });

    res.status(201).json({
      success: true,
      message: "New practice session created successfully.",
      session,
      questions: insertedQuestions,
    });
  } catch (err) {
    console.error("Error creating practice session:", err);
    res.status(500).json({ message: err.message });
  }
};

// Fetch specific session and its questions
exports.getSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await AptitudeSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Verify session owner
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    const questions = await AptitudeQuestion.find({ sessionId: session._id }).sort({ questionNumber: 1 });
    res.status(200).json({
      success: true,
      session,
      questions,
    });
  } catch (err) {
    console.error("Error getting session:", err);
    res.status(500).json({ message: err.message });
  }
};

// Auto-save user selections and metrics
exports.saveProgress = async (req, res) => {
  const { sessionId, currentIndex, questionsProgress, timeLeft } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required." });
  }

  try {
    const session = await AptitudeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (currentIndex !== undefined) session.currentIndex = currentIndex;
    if (timeLeft !== undefined) session.timeLeft = timeLeft;
    await session.save();

    if (questionsProgress && Array.isArray(questionsProgress)) {
      const bulkOps = questionsProgress.map((q) => ({
        updateOne: {
          filter: { _id: q.questionId, sessionId },
          update: {
            $set: {
              userSelectedAnswer: q.userSelectedAnswer,
              timeSpent: q.timeSpent,
              isAnswered: q.isAnswered,
            },
          },
        },
      }));
      if (bulkOps.length > 0) {
        await AptitudeQuestion.bulkWrite(bulkOps);
      }
    }

    res.status(200).json({ success: true, message: "Progress saved successfully." });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ message: err.message });
  }
};

// Grade and submit the test
exports.submitSession = async (req, res) => {
  const { sessionId, timeLeft } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required." });
  }

  try {
    const session = await AptitudeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    const questions = await AptitudeQuestion.find({ sessionId: session._id }).sort({ questionNumber: 1 });

    const total = questions.length;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let totalTimeSpent = 0;

    questions.forEach((q) => {
      totalTimeSpent += q.timeSpent || 0;
      if (q.userSelectedAnswer === null || q.userSelectedAnswer === undefined) {
        skipped++;
      } else if (q.userSelectedAnswer === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTimePerQuestion = total > 0 ? Math.round(totalTimeSpent / total) : 0;

    const statsSummary = {
      total,
      correct,
      wrong,
      skipped,
      accuracy,
      avgTimePerQuestion,
      topic: session.topic,
      difficulty: session.difficulty,
    };

    // Run AI analysis and recommendations
    let analysis = null;
    let recommendations = null;

    try {
      analysis = await aiService.analyzeAptitudePerformance(statsSummary, questions);
      recommendations = await aiService.getAptitudeRecommendations(statsSummary, questions);
    } catch (aiErr) {
      console.error("AI report generation failed, using rule fallbacks:", aiErr);
      analysis = {
        strengths: [`General understanding of ${session.topic}`],
        weakAreas: ["Requires more practice on specific calculations"],
        feedback: "Practice completed successfully. Review explanations for wrong answers below.",
      };
      recommendations = {
        nextTopics: ["Profit & Loss", "Simple Interest", "Ratio & Proportion"],
        recommendedDifficulty: session.difficulty,
        suggestedPracticeCount: 20,
      };
    }

    session.status = "completed";
    if (timeLeft !== undefined) session.timeLeft = timeLeft;
    session.analysis = analysis;
    session.recommendations = recommendations;
    await session.save();

    res.status(200).json({
      success: true,
      message: "Assessment submitted and graded.",
      session,
      questions,
    });
  } catch (err) {
    console.error("Error submitting session:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user practice history (active and completed)
exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await AptitudeSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error("Error fetching user history:", err);
    res.status(500).json({ message: err.message });
  }
};
