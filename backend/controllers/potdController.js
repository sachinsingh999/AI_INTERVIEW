const mongoose = require("mongoose");
const POTD = require("../models/POTD");
const POTDCompletion = require("../models/POTDCompletion");
const Question = require("../models/Question");
const { generateSingleCodingQuestion } = require("../services/aiService");

// UTC calendar date identifier helper
const getTodayId = () => {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `potd_${yyyy}_${mm}_${dd}`;
};

// Calculate milliseconds until next UTC midnight
const getCountdownMs = () => {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return nextMidnight.getTime() - now.getTime();
};

// Streak Calculator helper
const getSolvedStreak = async (userId) => {
  try {
    const completions = await POTDCompletion.find({ user: userId, solved: true })
      .populate("potd")
      .sort({ completionTime: -1 });

    const validCompletions = completions.filter(c => c.completionTime && c.potd);
    if (validCompletions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let lastSolveDate = null;

    for (let i = 0; i < validCompletions.length; i++) {
      const comp = validCompletions[i];
      const compDate = new Date(comp.completionTime);
      compDate.setUTCHours(0, 0, 0, 0);

      if (i === 0) {
        // Must be solved today or yesterday to count
        const diffTime = today.getTime() - compDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          break; // Broken streak
        }
        streak = 1;
        lastSolveDate = compDate;
      } else {
        const diffTime = lastSolveDate.getTime() - compDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          lastSolveDate = compDate;
        } else if (diffDays === 0) {
          // Solved on same UTC calendar day (multiple completions), skip duplicate count
          continue;
        } else {
          break; // Gap in days, streak broken
        }
      }
    }
    return streak;
  } catch (err) {
    console.error("Streak calculation failed:", err);
    return 0;
  }
};

// Static validation of generated structure
const validatePotdStructure = (rawQuestion) => {
  if (!rawQuestion) return false;
  if (!rawQuestion.title || !rawQuestion.description) return false;
  if (!rawQuestion.visibleTestCases || rawQuestion.visibleTestCases.length === 0) return false;
  if (!rawQuestion.hiddenTestCases || rawQuestion.hiddenTestCases.length === 0) return false;
  
  // Verify starters and drivers are present for JS/Python/CPP
  const starters = rawQuestion.starterCode || rawQuestion.starters || {};
  const drivers = rawQuestion.driverCode || rawQuestion.drivers || {};
  if (!starters.javascript && !starters.python && !starters.cpp) return false;
  if (!drivers.javascript && !drivers.python && !drivers.cpp) return false;

  return true;
};

// Main generator method
const generateAndPublishPOTD = async (todayId) => {
  console.log(`[POTD Scheduler] Generating new problem for ID: ${todayId}`);
  
  const topics = ["Arrays", "Strings", "Linked List", "Stack", "Queue", "Trees", "Graphs", "DP", "Greedy", "Backtracking"];
  const difficulties = ["Easy", "Medium", "Hard"];
  
  const chosenTopic = topics[Math.floor(Math.random() * topics.length)];
  const chosenDiff = difficulties[Math.floor(Math.random() * difficulties.length)];

  // Gather existing titles to avoid repeat
  const existing = await Question.find({}).select("title");
  const existingTitles = existing.map(q => q.title);

  let newQuestionDoc = null;

  try {
    const rawQuestion = await generateSingleCodingQuestion(
      "Software Engineer",
      chosenDiff,
      chosenTopic,
      existingTitles
    );

    if (validatePotdStructure(rawQuestion)) {
      // Normalize starters
      const rawStarters = rawQuestion.starterCode || rawQuestion.starters || {};
      const normalizedStarters = {};
      Object.keys(rawStarters).forEach(key => {
        const normKey = key.toLowerCase().replace("c++", "cpp");
        normalizedStarters[normKey] = rawStarters[key];
      });

      // Normalize drivers
      const rawDrivers = rawQuestion.driverCode || rawQuestion.drivers || {};
      const normalizedDrivers = {};
      Object.keys(rawDrivers).forEach(key => {
        const normKey = key.toLowerCase().replace("c++", "cpp");
        normalizedDrivers[normKey] = rawDrivers[key];
      });

      let finalTags = [chosenTopic];
      if (rawQuestion.tags && Array.isArray(rawQuestion.tags) && rawQuestion.tags.length > 0) {
        finalTags = rawQuestion.tags;
      }

      newQuestionDoc = new Question({
        title: rawQuestion.title,
        description: rawQuestion.description,
        constraints: rawQuestion.constraints || [],
        examples: rawQuestion.examples || [],
        visibleTestCases: rawQuestion.visibleTestCases,
        hiddenTestCases: rawQuestion.hiddenTestCases,
        starterCode: normalizedStarters,
        driverCode: normalizedDrivers,
        expectedTimeComplexity: rawQuestion.expectedTimeComplexity || "O(n)",
        expectedSpaceComplexity: rawQuestion.expectedSpaceComplexity || "O(1)",
        difficulty: chosenDiff,
        role: "Software Engineer",
        tags: finalTags,
        functionName: rawQuestion.functionName || "solve",
        returnType: rawQuestion.returnType || "void",
        solveCount: 0,
      });

      await newQuestionDoc.save();
      console.log(`[POTD Scheduler] AI Problem validated and saved: ${rawQuestion.title}`);
    }
  } catch (err) {
    console.error("[POTD Scheduler] AI generation failed, falling back:", err.message);
  }

  // Fallback to database question if generation failed or returned invalid structure
  if (!newQuestionDoc) {
    console.log("[POTD Scheduler] Triggering database fallback question...");
    const fallbackQ = await Question.findOne({ title: "Two Sum" });
    if (fallbackQ) {
      newQuestionDoc = fallbackQ;
    } else {
      // Fallback to any random question in DB
      const anyQ = await Question.findOne({});
      if (anyQ) {
        newQuestionDoc = anyQ;
      } else {
        throw new Error("No database question found for fallback pool. Seeding required.");
      }
    }
  }

  // Deactivate all older active POTDs
  await POTD.updateMany({ problemId: { $ne: todayId }, isActive: true }, { isActive: false });

  // Create or update POTD entry
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));

  const potd = await POTD.findOneAndUpdate(
    { problemId: todayId },
    {
      question: newQuestionDoc._id,
      publishedAt: startOfDay,
      expiresAt: endOfDay,
      isActive: true,
    },
    { new: true, upsert: true }
  );

  return potd;
};

// GET /api/potd/current
const getCurrentPOTD = async (req, res) => {
  try {
    const todayId = getTodayId();
    let potd = await POTD.findOne({ problemId: todayId }).populate("question");

    // JIT automated generator fallback if missing for today
    if (!potd) {
      potd = await generateAndPublishPOTD(todayId);
      potd = await POTD.findOne({ problemId: todayId }).populate("question");
    } else if (!potd.isActive) {
      // Ensure other older ones are deactivated and activate today's
      await POTD.updateMany({ problemId: { $ne: todayId }, isActive: true }, { isActive: false });
      potd.isActive = true;
      await potd.save();
    }

    const countdownMs = getCountdownMs();
    const streak = await getSolvedStreak(req.user._id);

    // Query user solved status
    const completion = await POTDCompletion.findOne({
      user: req.user._id,
      potd: potd._id,
    });

    // Strip hiddenTestCases from the response
    const questionObj = potd.question.toObject();
    delete questionObj.hiddenTestCases;

    res.status(200).json({
      success: true,
      potd: {
        _id: potd._id,
        problemId: potd.problemId,
        publishedAt: potd.publishedAt,
        expiresAt: potd.expiresAt,
        isActive: potd.isActive,
        question: questionObj,
      },
      countdownMs,
      streak,
      solved: completion ? completion.solved : false,
      completion: completion || null,
    });
  } catch (error) {
    console.error("Failed to load POTD details:", error);
    res.status(500).json({ message: "Failed to load POTD: " + error.message });
  }
};

// GET /api/potd/archive
const getPOTDHistory = async (req, res) => {
  try {
    const potdHistory = await POTD.find({}).populate("question").sort({ publishedAt: -1 });
    
    // Fetch completion records for this user
    const completions = await POTDCompletion.find({ user: req.user._id });

    const archive = potdHistory.map((item) => {
      const isSolved = completions.some((c) => c.potd.toString() === item._id.toString() && c.solved);
      
      const qObj = item.question.toObject();
      delete qObj.hiddenTestCases;

      return {
        _id: item._id,
        problemId: item.problemId,
        publishedAt: item.publishedAt,
        expiresAt: item.expiresAt,
        isActive: item.isActive,
        solved: isSolved,
        question: qObj,
      };
    });

    res.status(200).json(archive);
  } catch (error) {
    res.status(500).json({ message: "Failed to load POTD archive: " + error.message });
  }
};

module.exports = {
  getCurrentPOTD,
  getPOTDHistory,
  generateAndPublishPOTD,
  getTodayId,
};
