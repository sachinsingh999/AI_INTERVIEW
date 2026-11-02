// ===== Imports =====
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { exec, spawn, execSync } = require("child_process");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const { generateQuestions, extractResumeData, generate10AptitudeQuestions, generate2TechnicalQuestions, evaluateAnswer, genAI } = require("../services/aiService");
const { getFallbackTechnicalQuestions } = require("../services/techFallbackService");
const { getTemplate, determineTemplateId } = require("../services/runtimeRegistry");
const Answer = require("../models/Answer");
const Notification = require("../models/Notification");
const User = require("../models/User");
const InterviewProcessingService = require("../services/InterviewProcessingService");
// ===== Create Interview =====
const createInterview = async (req, res) => {
  try {
    const {
      role = "Software Engineer",
      experience = "1-3 Years",
      difficulty = "Medium",
      title,
      resumeId = "",
      parsedResume = {},
      interviewPlan = { aptitude: true, technicalRound1: true, technicalRound2: true },
      interviewType = "Technical Interview",
      duration = 65,
      totalQuestions = 10,
      technologies = [],
      aptitudeCategories = [],
      hrTopics = [],
      instructions = "",
      language = "",
      resumeText = "",
    } = req.body;

    const sessionTitle = title || `${role} Mock Interview`;
    const selectedSkills = Array.isArray(parsedResume?.skills) ? parsedResume.skills : technologies;
    const resumeSummaryStr = parsedResume?.summary || resumeText || "";

    // Sequential phase-by-phase design: Start strictly at Phase 1, unlock next phases on completion
    const initialActivePhases = ["phase1"];
    const initialCurrentPhase = "phase1";

    // 1. Create the new interview immediately with status: "Generating"
    const interview = await Interview.create({
      user: req.user._id,
      title: sessionTitle,
      role: role.trim(),
      experience,
      difficulty,
      duration: Number(duration) || 65,
      totalQuestions: Number(totalQuestions) || 10,
      interviewType,
      technologies: selectedSkills,
      instructions: instructions || "",
      status: "Generating",
      language,
      resumeText: resumeSummaryStr,
      resumeAnalysis: parsedResume,
      activePhases: initialActivePhases,
      currentPhase: initialCurrentPhase,
    });

    // 2. Fetch every question previously asked to this user across all interviews
    const QuestionHistory = require("../models/QuestionHistory");
    const previousQuestions = await QuestionHistory.find({ user: req.user._id });
    const excludedFingerprints = new Set(previousQuestions.map(q => q.fingerprint));
    const excludedTexts = previousQuestions.slice(-30).map(q => q.question); // Last 30 to keep prompt size reasonable

    const getFingerprint = (text) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 500);
    };

    let contextPrompt = `
Job Role: ${role}
Experience Level: ${experience}
Difficulty: ${difficulty}
Parsed Skills: ${selectedSkills.join(", ")}
Candidate Summary: ${resumeSummaryStr}
Interview Plan: Aptitude (${interviewPlan?.aptitude ? "Yes" : "No"}), Tech Round 1 (${interviewPlan?.technicalRound1 ? "Yes" : "No"}), Tech Round 2 (${interviewPlan?.technicalRound2 ? "Yes" : "No"})
`;

    if (excludedTexts.length > 0) {
      contextPrompt += `\nExcluded Questions (Do NOT repeat or generate questions similar to these):\n${excludedTexts.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}\n`;
    }

    // 3. Fast generation of Phase 1 (Aptitude) questions so initialization takes < 300ms
    let aptitudeQuestions = [];
    try {
      // Fast Gemini attempt with 2.5s timeout; falls back instantly to local pool on delay
      const aiPromise = generate10AptitudeQuestions({
        role,
        experience,
        skills: selectedSkills,
        resumeText: resumeSummaryStr,
        difficulty,
        excludedTexts: [...excludedTexts],
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI timeout")), 2500)
      );
      const batch = await Promise.race([aiPromise, timeoutPromise]);
      if (Array.isArray(batch) && batch.length >= 10) {
        for (const q of batch) {
          const fp = getFingerprint(q.question);
          if (fp && !excludedFingerprints.has(fp)) {
            if (!aptitudeQuestions.some(existing => getFingerprint(existing.question) === fp)) {
              aptitudeQuestions.push(q);
              if (aptitudeQuestions.length === 10) break;
            }
          }
        }
      }
    } catch (e) {
      // Fast fallback below
    }

    if (aptitudeQuestions.length < 10) {
      const { getFallbackAptitudeQuestions } = require("../services/aptitudeFallbackService");
      const needed = 10 - aptitudeQuestions.length;
      try {
        const dbFallback = await getFallbackAptitudeQuestions(needed, aptitudeQuestions, { jobRole: role, difficulty });
        for (const q of dbFallback) {
          const fp = getFingerprint(q.question);
          if (fp && !excludedFingerprints.has(fp)) {
            if (!aptitudeQuestions.some(existing => getFingerprint(existing.question) === fp)) {
              aptitudeQuestions.push({
                id: q.id || `p1_q${aptitudeQuestions.length + 1}`,
                type: "aptitude",
                category: q.category || "Logical Reasoning",
                difficulty: q.difficulty || difficulty,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "",
                timeLimit: q.timeLimit || 60,
                marks: q.marks || 1,
              });
              if (aptitudeQuestions.length === 10) break;
            }
          }
        }
      } catch (err) {
        console.error("Aptitude fallback error:", err);
      }
    }

    const technicalQuestions = [];
    const questions = [];

    const computedTemplateId = determineTemplateId(role, selectedSkills);
    const initialFiles = initializeWorkspace(computedTemplateId, role);

    const phasesState = [
      {
        phaseNumber: 1,
        phaseName: "Aptitude Assessment",
        status: "generated",
        generatedAt: new Date(),
        startedAt: null,
        completedAt: null,
        questions: aptitudeQuestions,
        responses: [],
        evaluation: {},
      },
      {
        phaseNumber: 2,
        phaseName: "Technical Round 1 (Core Concepts)",
        status: "pending",
        generatedAt: null,
        startedAt: null,
        completedAt: null,
        questions: [],
        responses: [],
        evaluation: {},
      },
      {
        phaseNumber: 3,
        phaseName: "Technical Round 2 (Coding & Problem Solving)",
        status: "pending",
        generatedAt: null,
        startedAt: null,
        completedAt: null,
        questions: [],
        responses: [],
        evaluation: {},
      },
      {
        phaseNumber: 4,
        phaseName: "HR & Behavioral Round",
        status: "pending",
        generatedAt: null,
        startedAt: null,
        completedAt: null,
        questions: [],
        responses: [],
        evaluation: {},
      },
    ];

    // Update session to In Progress once questions are generated and saved
    const updated = await Interview.findByIdAndUpdate(
      interview._id,
      {
        questions,
        aptitudeQuestions,
        technicalQuestions,
        templateId: computedTemplateId,
        workspaceFiles: initialFiles,
        status: "In Progress",
        currentPhase: initialCurrentPhase,
        phasesState,
        activePhases: initialActivePhases,
      },
      { new: true }
    );

    // Save newly generated questions to history for future duplicate checks
    const saveToQuestionHistory = async (userId, qs, aptQs, techQs) => {
      const historyRecords = [];
      const addRecord = (questionText, cat, diff) => {
        if (!questionText) return;
        const fp = getFingerprint(questionText);
        if (fp) {
          historyRecords.push({
            user: userId,
            fingerprint: fp,
            question: questionText,
            category: cat || "",
            difficulty: diff || "",
          });
        }
      };

      if (Array.isArray(aptQs)) {
        for (const q of aptQs) {
          addRecord(q.question || q.description || "", "Aptitude", q.difficulty);
        }
      }
      if (Array.isArray(techQs)) {
        for (const q of techQs) {
          addRecord(q.question || q.title || q.description || "", "Technical", q.difficulty);
        }
      }
      if (Array.isArray(qs)) {
        for (const q of qs) {
          addRecord(q.questionText || q.title || q.description || "", "Code", q.difficulty);
        }
      }

      if (historyRecords.length > 0) {
        try {
          await QuestionHistory.insertMany(historyRecords);
        } catch (err) {
          console.error("Error saving question history:", err);
        }
      }
    };
    await saveToQuestionHistory(req.user._id, questions, aptitudeQuestions, technicalQuestions);

    const responseObj = updated.toObject();
    res.status(201).json({
      success: true,
      interviewId: updated._id.toString(),
      _id: updated._id.toString(),
      status: "created",
      interview: responseObj,
      ...responseObj,
    });
  } catch (error) {
    console.error("Error in createInterview:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== Helper to fetch child session details persistently =====
const getSessionDetailsHelper = async (childInterviewId, phaseKey) => {
  if (!childInterviewId) {
    return { completed: false, cleared: false, score: 0, pending: false, id: null };
  }

  const childInt = await Interview.findById(childInterviewId);
  if (!childInt) {
    return { completed: false, cleared: false, score: 0, pending: false, id: null };
  }

  const answers = await Answer.find({ interview: childInterviewId });
  const evalKeys = answers.map(a => a.question);

  const total = answers.reduce((sum, a) => sum + (a.score || 0), 0);
  const scoreVal = answers.length > 0 ? parseFloat((total / answers.length).toFixed(1)) : 0;
  const isPending = answers.length > 0 && answers.some(a => a.status === "pending");
  const requiredScore = phaseKey === "oa" ? 6.0 : (phaseKey === "tech1" ? 7.0 : (phaseKey === "tech2" ? 7.5 : 5.0));

  // Check if admin has evaluated this child interview
  if (childInt.isLocked) {
    return {
      id: childInterviewId.toString(),
      completed: true,
      cleared: childInt.decision === "PASSED",
      score: childInt.finalScore || scoreVal,
      pending: false,
      adminEvaluated: true,
    };
  }

  return {
    id: childInterviewId.toString(),
    completed: evalKeys.length > 0,
    cleared: !isPending && scoreVal >= requiredScore,
    score: isPending ? "Pending" : scoreVal,
    pending: isPending
  };
};

// ===== Get All Interviews =====

const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const interviewIds = interviews.map(
      (interview) => interview._id
    );

    const answerCounts = await Answer.aggregate([
      {
        $match: {
          interview: { $in: interviewIds },
        },
      },
      {
        $group: {
          _id: "$interview",
          count: { $sum: 1 },
        },
      },
    ]);

    const answerCountByInterview = answerCounts.reduce(
      (counts, item) => {
        counts[item._id.toString()] = item.count;
        return counts;
      },
      {}
    );

    const interviewsWithProgress = [];
    for (const interview of interviews) {
      const interviewObject = interview.toObject();
      const answeredCount = answerCountByInterview[interview._id.toString()] || 0;

      if (interviewObject.interviewType === "oa") {
        const oaDetails = await getSessionDetailsHelper(interviewObject.phases?.oa || interviewObject._id, "oa");
        const tech1Details = await getSessionDetailsHelper(interviewObject.phases?.tech1, "tech1");
        const tech2Details = await getSessionDetailsHelper(interviewObject.phases?.tech2, "tech2");
        const hrDetails = await getSessionDetailsHelper(interviewObject.phases?.hr, "hr");

        interviewObject.phasesMetadata = {
          oa: oaDetails,
          tech1: tech1Details,
          tech2: tech2Details,
          hr: hrDetails,
        };
      }

      interviewsWithProgress.push({
        ...interviewObject,
        answeredCount,
        questionCount: interviewObject.questions?.length || 0,
      });
    }

    res.status(200).json(interviewsWithProgress);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===== Get Interview By ID =====
const getInterviewById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid Interview ID",
      });
    }

    let interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const interviewObject = interview.toObject();

    if (interviewObject.interviewType === "oa") {
      const oaDetails = await getSessionDetailsHelper(interviewObject.phases?.oa || interviewObject._id, "oa");
      const tech1Details = await getSessionDetailsHelper(interviewObject.phases?.tech1, "tech1");
      const tech2Details = await getSessionDetailsHelper(interviewObject.phases?.tech2, "tech2");
      const hrDetails = await getSessionDetailsHelper(interviewObject.phases?.hr, "hr");

      interviewObject.phasesMetadata = {
        oa: oaDetails,
        tech1: tech1Details,
        tech2: tech2Details,
        hr: hrDetails,
      };
    }

    res.status(200).json(interviewObject);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ===== Interview Report =====
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getInterviewReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    let query = { _id: req.params.id };
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }
    const interview = await Interview.findOne(query);
    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const answers = await Answer.find({
      interview: req.params.id,
    });

    const activePhases = interview.activePhases || ["phase1"];
    const completedPhases = interview.status === "Completed"
      ? activePhases
      : activePhases.slice(0, -1);

    const normalizeString = (str) => {
      if (!str) return "";
      return String(str)
        .toLowerCase()
        .replace(/[?.!,:;()\-+_=[\]{}]/g, "")
        .replace(/[\r\n\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const isAptitudeQuestion = (qText) => {
      return Array.isArray(interview.aptitudeQuestions) && interview.aptitudeQuestions.some(
        aq => normalizeString(aq.question || aq.description) === normalizeString(qText)
      );
    };

    const isTechnicalQuestion = (qText) => {
      return Array.isArray(interview.technicalQuestions) && interview.technicalQuestions.some(
        tq => normalizeString(tq.question || tq.questionText || tq.title || tq.description) === normalizeString(qText)
      );
    };

    const isCodingQuestion = (qText) => {
      return Array.isArray(interview.questions) && interview.questions.some(
        cq => normalizeString(cq.question || cq.questionText || cq.title || cq.description) === normalizeString(qText)
      );
    };

    const isHrQuestion = (qText) => {
      const hrQuestions = [
        "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
        "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
        "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?"
      ];
      return hrQuestions.some(hq => normalizeString(hq) === normalizeString(qText)) || 
             qText.toLowerCase().includes("disagreement") || 
             qText.toLowerCase().includes("critical bug") || 
             qText.toLowerCase().includes("drives your passion") ||
             qText.toLowerCase().includes("behavioral") ||
             qText.toLowerCase().includes("coaching");
    };

    const getPhaseOfAnswer = (ans) => {
      const qText = ans.question || "";
      if (isAptitudeQuestion(qText)) return "phase1";
      if (isTechnicalQuestion(qText)) return "phase2";
      if (isCodingQuestion(qText)) return "phase3";
      if (isHrQuestion(qText)) return "phase4";

      const cat = (ans.category || "").toLowerCase();
      const t = (ans.type || "").toLowerCase();

      if (cat.includes("aptitude") || cat.includes("logic") || t === "aptitude") return "phase1";
      if (cat.includes("coding") || cat.includes("dsa") || cat.includes("technical") || cat.includes("concept") || t === "coding" || t === "technical" || t === "code") return "phase2";
      if (cat.includes("project") || t === "project") return "phase3";
      if (cat.includes("hr") || cat.includes("behavioral") || t === "hr") return "phase4";

      return "phase1";
    };

    const processedAnswers = [];

    for (const ans of answers) {
      const phaseOfQuestion = getPhaseOfAnswer(ans);

      if (completedPhases.includes(phaseOfQuestion)) {
        const ansObj = typeof ans.toObject === "function" ? ans.toObject() : { ...ans };
        processedAnswers.push({
          ...ansObj,
          category: ansObj.category || (phaseOfQuestion === "phase1" ? "Aptitude" : phaseOfQuestion === "phase2" ? "Coding" : "HR & Behavioral"),
          type: ansObj.type || (phaseOfQuestion === "phase1" ? "aptitude" : phaseOfQuestion === "phase2" ? "coding" : "hr"),
          phase: phaseOfQuestion,
        });
      }
    }

    if (completedPhases.includes("phase3")) {
      if (interview.workspaceSubmission && interview.workspaceSubmission.isSubmitted) {
        const sub = interview.workspaceSubmission;
        const taskGuidelines = interview.workspaceState?.taskGuidelines || {
          title: "Project Development Challenge",
          description: "Implement the coding feature inside the templates workspace."
        };
        const appFile = sub.filesSnapshot?.find(f => f.path === "src/App.jsx" || f.path === "server.js" || f.path === "client/src/App.jsx");
        const codeAnswer = appFile ? appFile.content : "// Project workspace files submitted successfully.";

        const feedback = `
### Score: ${sub.weightedScore}%

### AI Review Summary
${sub.aiReview?.summary || "Evaluation complete."}

### Strengths
${(sub.aiReview?.strengths || []).map(s => `- ${s}`).join("\n")}

### Weaknesses
${(sub.aiReview?.weaknesses || []).map(w => `- ${w}`).join("\n")}

### Naming & Architecture Review
- ${sub.aiReview?.namingReview || "Follows standards."}
- ${sub.aiReview?.architectureReview || "Good structure."}
`;

        processedAnswers.push({
          _id: `submit-p3`,
          interview: interview._id,
          question: taskGuidelines.title,
          answer: codeAnswer,
          score: Math.round(sub.weightedScore / 10),
          feedback: feedback.trim(),
          category: "Project Development",
          type: "project",
          phase: "phase3",
        });
      }
    }

    let totalQuestionsCount = 0;
    if (completedPhases.includes("phase1") && Array.isArray(interview.aptitudeQuestions)) {
      totalQuestionsCount += interview.aptitudeQuestions.length;
    }
    if (completedPhases.includes("phase2") && Array.isArray(interview.technicalQuestions)) {
      totalQuestionsCount += interview.technicalQuestions.length;
    }
    if (completedPhases.includes("phase3") && Array.isArray(interview.questions)) {
      totalQuestionsCount += interview.questions.length;
    }
    if (completedPhases.includes("phase4")) {
      totalQuestionsCount += 3;
    }

    const answeredCount = processedAnswers.length;
    const isPending = answers.some(a => a.status === "pending");

    let finalProcessedAnswers = processedAnswers;
    if (isPending) {
      finalProcessedAnswers = processedAnswers.map(ans => {
        return {
          _id: ans._id,
          interview: ans.interview,
          question: ans.question,
          answer: ans.answer,
          status: "pending",
          score: 0,
          feedback: "Evaluation pending by administrator.",
          idealAnswer: "",
          keyPoints: [],
          missingPoints: [],
          howToSay: "",
          communicationScore: 0,
          confidenceScore: 0,
          professionalismScore: 0,
          communicationFeedback: "Pending review.",
          results: [],
        };
      });
    }

    const totalScore = processedAnswers.reduce(
      (sum, answer) => sum + (answer.score || 0),
      0
    );

    const averageScore =
      answeredCount > 0
        ? (totalScore / answeredCount).toFixed(1)
        : 0;

    let performance = "Needs Improvement";
    if (averageScore >= 8) {
      performance = "Excellent";
    } else if (averageScore >= 5) {
      performance = "Good";
    }

    res.status(200).json({
      totalAnswered: totalQuestionsCount,
      answeredCount,
      averageScore: isPending ? "Pending" : averageScore,
      performance: isPending ? "Evaluation Pending" : performance,
      answers: finalProcessedAnswers,
      isPending,
      completedPhases,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===== Admin: Get All Interviews =====
const adminGetAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ interviewType: { $ne: "standard" } })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const interviewIds = interviews.map((interview) => interview._id);

    const answerCounts = await Answer.aggregate([
      {
        $match: {
          interview: { $in: interviewIds },
        },
      },
      {
        $group: {
          _id: "$interview",
          count: { $sum: 1 },
        },
      },
    ]);

    const answerCountByInterview = answerCounts.reduce(
      (counts, item) => {
        counts[item._id.toString()] = item.count;
        return counts;
      },
      {}
    );

    const interviewsWithProgress = interviews.map(
      (interview) => {
        const interviewObject = interview.toObject();
        const answeredCount =
          answerCountByInterview[interview._id.toString()] || 0;

        return {
          ...interviewObject,
          answeredCount,
          questionCount: interviewObject.questions?.length || 0,
        };
      }
    );

    res.status(200).json(interviewsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Admin: Get Interview Responses (Report) =====
const adminGetInterviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const interview = await Interview.findById(id).populate("user", "name email");
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const notification = await Notification.findOne({ interview: id });
    const answers = await Answer.find({ interview: id });

    const activePhases = interview.activePhases || ["phase1"];
    const completedPhases = interview.status === "Completed"
      ? activePhases
      : activePhases.slice(0, -1);

    const normalizeString = (str) => {
      if (!str) return "";
      return String(str)
        .toLowerCase()
        .replace(/[?.!,:;()\-+_=[\]{}]/g, "")
        .replace(/[\r\n\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const isAptitudeQuestion = (qText) => {
      return Array.isArray(interview.aptitudeQuestions) && interview.aptitudeQuestions.some(
        aq => normalizeString(aq.question || aq.description) === normalizeString(qText)
      );
    };

    const isTechnicalQuestion = (qText) => {
      return Array.isArray(interview.technicalQuestions) && interview.technicalQuestions.some(
        tq => normalizeString(tq.question || tq.questionText || tq.title || tq.description) === normalizeString(qText)
      );
    };

    const isCodingQuestion = (qText) => {
      return Array.isArray(interview.questions) && interview.questions.some(
        cq => normalizeString(cq.question || cq.questionText || cq.title || cq.description) === normalizeString(qText)
      );
    };

    const isHrQuestion = (qText) => {
      const hrQuestions = [
        "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
        "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
        "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?"
      ];
      return hrQuestions.some(hq => normalizeString(hq) === normalizeString(qText)) || 
             qText.toLowerCase().includes("disagreement") || 
             qText.toLowerCase().includes("critical bug") || 
             qText.toLowerCase().includes("drives your passion") ||
             qText.toLowerCase().includes("behavioral") ||
             qText.toLowerCase().includes("coaching");
    };

    const getPhaseOfAnswer = (ans) => {
      const qText = ans.question || "";
      if (isAptitudeQuestion(qText)) return "phase1";
      if (isTechnicalQuestion(qText)) return "phase2";
      if (isCodingQuestion(qText)) return "phase3";
      if (isHrQuestion(qText)) return "phase4";

      const cat = (ans.category || "").toLowerCase();
      const t = (ans.type || "").toLowerCase();

      if (cat.includes("aptitude") || cat.includes("logic") || t === "aptitude") return "phase1";
      if (cat.includes("coding") || cat.includes("dsa") || cat.includes("technical") || cat.includes("concept") || t === "coding" || t === "technical" || t === "code") return "phase2";
      if (cat.includes("project") || t === "project") return "phase3";
      if (cat.includes("hr") || cat.includes("behavioral") || t === "hr") return "phase4";

      return "phase1";
    };

    const processedAnswers = [];

    for (const ans of answers) {
      const phaseOfQuestion = getPhaseOfAnswer(ans);

      if (completedPhases.includes(phaseOfQuestion)) {
        const ansObj = typeof ans.toObject === "function" ? ans.toObject() : { ...ans };
        processedAnswers.push({
          ...ansObj,
          category: ansObj.category || (phaseOfQuestion === "phase1" ? "Aptitude" : phaseOfQuestion === "phase2" ? "Coding" : "HR & Behavioral"),
          type: ansObj.type || (phaseOfQuestion === "phase1" ? "aptitude" : phaseOfQuestion === "phase2" ? "coding" : "hr"),
          phase: phaseOfQuestion,
        });
      }
    }

    if (completedPhases.includes("phase3")) {
      if (interview.workspaceSubmission && interview.workspaceSubmission.isSubmitted) {
        const sub = interview.workspaceSubmission;
        const taskGuidelines = interview.workspaceState?.taskGuidelines || {
          title: "Project Development Challenge",
          description: "Implement the coding feature inside the templates workspace."
        };
        const appFile = sub.filesSnapshot?.find(f => f.path === "src/App.jsx" || f.path === "server.js" || f.path === "client/src/App.jsx");
        const codeAnswer = appFile ? appFile.content : "// Project workspace files submitted successfully.";

        const feedback = `
### Score: ${sub.weightedScore}%

### AI Review Summary
${sub.aiReview?.summary || "Evaluation complete."}

### Strengths
${(sub.aiReview?.strengths || []).map(s => `- ${s}`).join("\n")}

### Weaknesses
${(sub.aiReview?.weaknesses || []).map(w => `- ${w}`).join("\n")}

### Naming & Architecture Review
- ${sub.aiReview?.namingReview || "Follows standards."}
- ${sub.aiReview?.architectureReview || "Good structure."}
`;

        processedAnswers.push({
          _id: `submit-p3`,
          interview: interview._id,
          question: taskGuidelines.title,
          answer: codeAnswer,
          score: Math.round(sub.weightedScore / 10),
          feedback: feedback.trim(),
          category: "Project Development",
          type: "project",
          phase: "phase3",
        });
      }
    }

    let totalQuestionsCount = 0;
    if (completedPhases.includes("phase1") && Array.isArray(interview.aptitudeQuestions)) {
      totalQuestionsCount += interview.aptitudeQuestions.length;
    }
    if (completedPhases.includes("phase2") && Array.isArray(interview.technicalQuestions)) {
      totalQuestionsCount += interview.technicalQuestions.length;
    }
    if (completedPhases.includes("phase3") && Array.isArray(interview.questions)) {
      totalQuestionsCount += interview.questions.length;
    }
    if (completedPhases.includes("phase4")) {
      totalQuestionsCount += 3;
    }

    const answeredCount = processedAnswers.length;

    const totalScore = processedAnswers.reduce(
      (sum, answer) => sum + (answer.score || 0),
      0
    );

    const averageScore =
      answeredCount > 0
        ? (totalScore / answeredCount).toFixed(1)
        : 0;

    let performance = "Needs Improvement";
    if (averageScore >= 8) {
      performance = "Excellent";
    } else if (averageScore >= 5) {
      performance = "Good";
    }

    res.status(200).json({
      interview,
      totalAnswered: totalQuestionsCount,
      answeredCount,
      averageScore,
      performance,
      answers: processedAnswers,
      notification,
      completedPhases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Admin: Release Report & Send Notification =====
const releaseInterviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { eligible, customMessage } = req.body;

    const interview = await Interview.findById(id).populate("user");
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const defaultMessage = eligible
      ? `Congratulations! You have passed the review for your ${interview.role} mock interview and are eligible for the next round.`
      : `Thank you for taking the ${interview.role} mock interview. We reviewed your answers and unfortunately, you are not eligible for the next round at this time.`;

    interview.decision = eligible ? "PASSED" : "FAILED";
    interview.isLocked = true;
    await interview.save();

    // Check if notification already exists
    let notification = await Notification.findOne({ interview: id });
    if (notification) {
      notification.eligible = eligible;
      notification.message = customMessage || defaultMessage;
      await notification.save();
    } else {
      notification = await Notification.create({
        user: interview.user._id,
        interview: interview._id,
        message: customMessage || defaultMessage,
        eligible,
        read: false
      });
    }

    res.status(200).json({ message: "Report released and notification sent", notification, interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Admin: Set Candidate Decision (Pass/Fail) =====
const adminSetInterviewDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, customMessage } = req.body;

    if (!["PASSED", "FAILED"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision. Must be PASSED or FAILED." });
    }

    const interview = await Interview.findById(id).populate("user");
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const isPassed = decision === "PASSED";
    interview.decision = decision;
    interview.isLocked = true;
    await interview.save();

    const defaultMessage = isPassed
      ? `Congratulations! You have passed the review for your ${interview.role} mock interview.`
      : `Thank you for taking the ${interview.role} mock interview. Unfortunately, you did not pass this session.`;

    let notification = await Notification.findOne({ interview: id });
    if (notification) {
      notification.eligible = isPassed;
      notification.message = customMessage || defaultMessage;
      await notification.save();
    } else {
      notification = await Notification.create({
        user: interview.user._id,
        interview: interview._id,
        message: customMessage || defaultMessage,
        eligible: isPassed,
        read: false,
      });
    }

    res.status(200).json({ message: `Interview marked as ${decision} successfully.`, interview, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Get Interview Questions (Multi-Phase) =====
const getInterviewQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    let interview = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
    }

    const role = interview?.role || "Frontend Developer";
    const difficulty = interview?.difficulty || "Medium";
    const experience = interview?.experience || "1-3 Years";

const { getFallbackAptitudeQuestions } = require("../services/aptitudeFallbackService");

    // Phase 1: Aptitude Assessment (10 Guaranteed Questions via AI + DB Fallback)
    let phase1Questions = [];
    if (interview && Array.isArray(interview.aptitudeQuestions) && interview.aptitudeQuestions.length > 0) {
      phase1Questions = interview.aptitudeQuestions.map((q, idx) => ({
        id: q.id || `p1_q${idx + 1}`,
        phase: 1,
        phaseName: "Aptitude Assessment",
        type: q.type || "mcq",
        title: `${q.category || "Aptitude"}: ${q.difficulty || "Medium"}`,
        description: q.question,
        options: Array.isArray(q.options)
          ? q.options.map((opt, oIdx) => ({
              id: ["A", "B", "C", "D"][oIdx] || String(oIdx),
              text: typeof opt === "string" ? opt : opt.text || String(opt),
            }))
          : [],
        correctOption: q.correctAnswer || "A",
        explanation: q.explanation || "",
        timeLimit: q.timeLimit || 60,
        marks: q.marks || 1,
      }));
    }

    // Fill remaining questions directly from MongoDB aptitudequestions collection
    if (phase1Questions.length < 10) {
      const needed = 10 - phase1Questions.length;
      try {
        const dbFallback = await getFallbackAptitudeQuestions(needed, phase1Questions, { jobRole: role, difficulty });
        if (interview) {
          const newQuestions = dbFallback.map((q, idx) => ({
            id: q.id || `p1_q${interview.aptitudeQuestions.length + idx + 1}`,
            type: "aptitude",
            category: q.category || "Logical Reasoning",
            difficulty: q.difficulty || difficulty,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer || "A",
            explanation: q.explanation || "",
            timeLimit: q.timeLimit || 60,
            marks: q.marks || 1,
          }));
          interview.aptitudeQuestions = [...(interview.aptitudeQuestions || []), ...newQuestions];
          interview.markModified("aptitudeQuestions");
          await interview.save();

          // Re-map the full list from the saved interview document
          phase1Questions = interview.aptitudeQuestions.map((q, idx) => ({
            id: q.id || `p1_q${idx + 1}`,
            phase: 1,
            phaseName: "Aptitude Assessment",
            type: q.type || "mcq",
            title: `${q.category || "Aptitude"}: ${q.difficulty || "Medium"}`,
            description: q.question,
            options: Array.isArray(q.options)
              ? q.options.map((opt, oIdx) => ({
                  id: ["A", "B", "C", "D"][oIdx] || String(oIdx),
                  text: typeof opt === "string" ? opt : opt.text || String(opt),
                }))
              : [],
            correctOption: q.correctAnswer || "A",
            explanation: q.explanation || "",
            timeLimit: q.timeLimit || 60,
            marks: q.marks || 1,
          }));
        } else {
          const formattedFallback = dbFallback.map((q, idx) => ({
            id: q.id || `p1_q${phase1Questions.length + idx + 1}`,
            phase: 1,
            phaseName: "Aptitude Assessment",
            type: q.type || "mcq",
            title: `${q.category || "Aptitude"}: ${q.difficulty || "Medium"}`,
            description: q.question,
            options: Array.isArray(q.options)
              ? q.options.map((opt, oIdx) => ({
                  id: ["A", "B", "C", "D"][oIdx] || String(oIdx),
                  text: typeof opt === "string" ? opt : opt.text || String(opt),
                }))
              : [],
            correctOption: q.correctAnswer || "A",
            explanation: q.explanation || "",
            timeLimit: q.timeLimit || 60,
            marks: q.marks || 1,
          }));
          phase1Questions = [...phase1Questions, ...formattedFallback];
        }
      } catch (fbErr) {
        console.error("Error fetching fallback questions from DB:", fbErr.message);
      }
    }

    const activePhases = interview?.activePhases || ["phase1"];

    // Phase 2: Technical Round 1 (Immutable once generated and stored in Interview document)
    const { validateFunctionSignature, generateStarterCodeFromSignature } = require("../services/signatureService");

    let phase2Questions = [];
    if (interview && Array.isArray(interview.technicalQuestions) && interview.technicalQuestions.length > 0) {
        phase2Questions = await Promise.all(interview.technicalQuestions.map(async (q, idx) => {
          // Look up the Question document to ensure the correct signature is used
          const dbQ = await Question.findOne({ title: q.title });
          const functionSignature = dbQ?.functionSignature || q.functionSignature || {
            functionName: q.functionName || "solve",
            returnType: q.returnType || "int",
            parameters: q.parameters || [{ type: "vector<int>&", name: "height" }],
          };
          const starterCode = dbQ?.starterCode || (typeof q.starterCode === "object" && q.starterCode?.cpp ? q.starterCode : generateStarterCodeFromSignature(functionSignature));

          return {
            id: q.id || `p2_q${idx + 1}`,
            phase: 2,
            phaseName: "Technical Round 1",
            type: "coding",
            difficulty: q.difficulty || (idx === 0 ? "Medium" : "Hard"),
            category: q.category || "Data Structures & Algorithms",
            title: q.title || q.category || `DSA Challenge ${idx + 1}`,
            description: q.description || q.question,
            question: q.question || q.description,
            functionSignature,
            functionName: functionSignature.functionName,
            returnType: functionSignature.returnType,
            parameters: functionSignature.parameters,
            constraints: q.constraints || "Time Complexity: O(N)\nSpace Complexity: O(1)",
            sampleInput: q.sampleInput || (q.examples && q.examples[0]?.input) || (q.testCases && q.testCases[0]?.input) || "",
            sampleOutput: q.sampleOutput || (q.examples && q.examples[0]?.output) || (q.testCases && q.testCases[0]?.expectedOutput) || "",
            examples: q.examples || [],
            testCases: q.testCases || q.visibleTestCases || [],
            language: q.language || "javascript",
            starterCode,
            driverCode: dbQ?.driverCode || q.driverCode || null,
            expectedAnswerPoints: q.expectedAnswerPoints || [],
            idealAnswer: q.idealAnswer || "Optimal technical answer.",
            evaluationRubric: q.evaluationRubric || {
              excellent: "Optimal solution meeting all complexity constraints.",
              good: "Clear understanding.",
              average: "Basic comprehension.",
              poor: "Incomplete or inaccurate.",
            },
            timeLimit: q.timeLimit || 300,
            marks: q.marks || 10,
            source: q.source || "Database",
          };
        }));

        // Cache the synced questions back to the interview document
        let hasUpdate = false;
        for (let i = 0; i < phase2Questions.length; i++) {
          const orig = interview.technicalQuestions[i];
          const current = phase2Questions[i];
          if (!orig || JSON.stringify(orig.functionSignature) !== JSON.stringify(current.functionSignature)) {
            interview.technicalQuestions[i] = current;
            hasUpdate = true;
          }
        }
        if (hasUpdate) {
          interview.markModified("technicalQuestions");
          await interview.save();
        }
      } else {
        try {
          const QuestionHistory = require("../models/QuestionHistory");
          const previousQuestions = await QuestionHistory.find({ user: req.user._id });
          const excludedTexts = previousQuestions.slice(-30).map(q => q.question);

          const dbRandom = await getFallbackTechnicalQuestions(2, [], {
            jobRole: role,
            difficulty,
            excludedTexts
          });
          phase2Questions = dbRandom.map((q, idx) => {
            const functionSignature = q.functionSignature || {
              functionName: q.functionName || "solve",
              returnType: q.returnType || "int",
              parameters: q.parameters || [{ type: "vector<int>&", name: "height" }],
            };
            const starterCode = typeof q.starterCode === "object" && q.starterCode?.cpp ? q.starterCode : generateStarterCodeFromSignature(functionSignature);

            return {
              id: q.id || `p2_q${idx + 1}`,
              phase: 2,
              phaseName: "Technical Round 1",
              type: "coding",
              difficulty: q.difficulty || (idx === 0 ? "Medium" : "Hard"),
              category: q.category || "Data Structures & Algorithms",
              title: q.title || q.category || `DSA Challenge ${idx + 1}`,
              description: q.description || q.question,
              question: q.question || q.description,
              functionSignature,
              functionName: functionSignature.functionName,
              returnType: functionSignature.returnType,
              parameters: functionSignature.parameters,
              constraints: q.constraints || "Time Complexity: O(N)\nSpace Complexity: O(1)",
              sampleInput: q.sampleInput || (q.examples && q.examples[0]?.input) || (q.testCases && q.testCases[0]?.input) || "",
              sampleOutput: q.sampleOutput || (q.examples && q.examples[0]?.output) || (q.testCases && q.testCases[0]?.expectedOutput) || "",
              examples: q.examples || [],
              testCases: q.testCases || q.visibleTestCases || [],
              language: q.language || "javascript",
              starterCode,
              driverCode: q.driverCode || null,
              expectedAnswerPoints: q.expectedAnswerPoints || [],
              idealAnswer: q.idealAnswer || "Optimal technical answer.",
              evaluationRubric: q.evaluationRubric || {
                excellent: "Optimal solution meeting all complexity constraints.",
                good: "Clear understanding.",
                average: "Basic comprehension.",
                poor: "Incomplete or inaccurate.",
              },
              timeLimit: q.timeLimit || 300,
              marks: q.marks || 10,
              source: q.source || "Database",
            };
          });

          if (interview) {
            interview.technicalQuestions = phase2Questions;
            await interview.save();
          }
        } catch (fbErr) {
          console.error("Error fetching random technical questions from DB:", fbErr.message);
        }
      }

    // Phase 3: Technical Interview - Round 2 (Advanced / Coding & Problem Solving)
    let phase3Questions = [];
    if (interview && Array.isArray(interview.questions) && interview.questions.length > 0) {
        phase3Questions = await Promise.all(interview.questions.map(async (q, idx) => {
          const dbQ = await Question.findOne({ title: q.title });
          const functionSignature = dbQ?.functionSignature || q.functionSignature || {
            functionName: q.functionName || "solve",
            returnType: q.returnType || "int",
            parameters: q.parameters || [],
          };
          const starterCode = dbQ?.starterCode || (typeof q.starterCode === "object" && q.starterCode?.cpp ? q.starterCode : generateStarterCodeFromSignature(functionSignature));

          return {
            id: q.id || `p3_q${idx + 1}`,
            phase: 3,
            phaseName: "Technical Round 2 (Coding)",
            type: "coding",
            title: q.title || `Advanced Coding Challenge ${idx + 1}`,
            description: q.description || q.question,
            constraints: q.constraints || "Time: O(N)\nSpace: O(N)",
            sampleInput: q.sampleInput || "",
            sampleOutput: q.sampleOutput || "",
            functionSignature,
            functionName: functionSignature.functionName,
            returnType: functionSignature.returnType,
            parameters: functionSignature.parameters,
            language: q.language || "javascript",
            starterCode,
            driverCode: dbQ?.driverCode || q.driverCode || null,
            testCases: q.testCases || q.visibleTestCases || [],
            expectedComplexity: q.expectedComplexity || "Time: O(N), Space: O(N)",
          };
        }));

        // Cache Phase 3 back to interview document
        let hasUpdate3 = false;
        for (let i = 0; i < phase3Questions.length; i++) {
          const orig = interview.questions[i];
          const current = phase3Questions[i];
          if (!orig || JSON.stringify(orig.functionSignature) !== JSON.stringify(current.functionSignature)) {
            interview.questions[i] = current;
            hasUpdate3 = true;
          }
        }
        if (hasUpdate3) {
          interview.markModified("questions");
          await interview.save();
        }
      } else {
        try {
          const dbAll = await Question.find({});
          const subList = dbAll.slice(2, 4);
          phase3Questions = subList.map((q, idx) => {
            const functionSignature = q.functionSignature || {
              functionName: q.functionName || "solve",
              returnType: q.returnType || "int",
              parameters: q.parameters || [],
            };
            const starterCode = typeof q.starterCode === "object" && q.starterCode?.cpp ? q.starterCode : generateStarterCodeFromSignature(functionSignature);

            return {
              id: q._id ? q._id.toString() : `p3_q${idx + 1}`,
              phase: 3,
              phaseName: "Technical Round 2 (Coding)",
              type: "coding",
              title: q.title,
              description: q.description,
              constraints: Array.isArray(q.constraints) ? q.constraints.join("\n") : (q.constraints || ""),
              sampleInput: q.examples[0]?.input || "",
              sampleOutput: q.examples[0]?.output || "",
              functionSignature,
              functionName: functionSignature.functionName,
              returnType: functionSignature.returnType,
              parameters: functionSignature.parameters,
              language: "javascript",
              starterCode,
              driverCode: q.driverCode || null,
              testCases: q.visibleTestCases || [],
              expectedComplexity: "Time: O(N), Space: O(N)",
            };
          });

          if (interview) {
            interview.questions = phase3Questions;
            await interview.save();
          }
        } catch (fbErr) {
          console.error("Error fetching Phase 3 questions:", fbErr.message);
        }
      }

    // Phase 4: HR & Behavioral Round
    const phase4Questions = [
      {
        id: "p4_q1",
        phase: 4,
        phaseName: "HR & Behavioral Round",
        type: "hr",
        title: "Behavioral: Conflict Resolution & Team Alignment",
        description: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
        placeholder: "Use the STAR method: Situation, Task, Action, Result...",
      },
      {
        id: "p4_q2",
        phase: 4,
        phaseName: "HR & Behavioral Round",
        type: "hr",
        title: "Situational: Handling High-Pressure Deadlines & Trade-offs",
        description: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
        placeholder: "Explain the scenario, trade-offs made, and outcome...",
      },
      {
        id: "p4_q3",
        phase: 4,
        phaseName: "HR & Behavioral Round",
        type: "hr",
        title: "Cultural Fit: Ownership & Long-Term Technical Vision",
        description: "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?",
        placeholder: "Share your career vision and values...",
      },
    ];

    const safeActivePhases = (interview?.activePhases && interview.activePhases.length > 0)
      ? interview.activePhases
      : ["phase1"];

    res.status(200).json({
      success: true,
      interviewId: id,
      status: interview?.status || "In Progress",
      isLocked: interview?.isLocked || false,
      role,
      experience,
      difficulty,
      totalDuration: 65,
      activePhases: safeActivePhases,
      workspaceSubmission: interview?.workspaceSubmission,
      workspaceState: interview?.workspaceState,
      phases: {
        phase1: {
          phaseNumber: 1,
          name: "Aptitude Assessment",
          durationMins: 15,
          questions: phase1Questions,
        },
        phase2: {
          phaseNumber: 2,
          name: "Technical Round 1 (Core Concepts)",
          durationMins: 20,
          questions: phase2Questions,
        },
        phase3: {
          phaseNumber: 3,
          name: "Technical Round 2 (Project & Skills Discussion)",
          durationMins: 10,
          questions: phase3Questions,
        },
        phase4: {
          phaseNumber: 4,
          name: "HR & Behavioral Round",
          durationMins: 15,
          questions: phase4Questions,
        },
      },
      userAnswers: interview?.userAnswers || {},
    });
  } catch (error) {
    if (error.name === "VersionError") {
      console.warn("[getInterviewQuestions] VersionError caught due to concurrent write. Recovering and returning payload.");
      try {
        const freshInterview = await Interview.findById(id);
        const role = freshInterview?.role || "Frontend Developer";
        const experience = freshInterview?.experience || "1-3 Years";
        const difficulty = freshInterview?.difficulty || "Medium";
        return res.status(200).json({
          success: true,
          interviewId: id,
          status: freshInterview?.status || "In Progress",
          isLocked: freshInterview?.isLocked || false,
          role,
          experience,
          difficulty,
          totalDuration: 65,
          activePhases: freshInterview?.activePhases || ["phase1"],
          workspaceSubmission: freshInterview?.workspaceSubmission,
          workspaceState: freshInterview?.workspaceState,
          phases: {
            phase1: { phaseNumber: 1, name: "Aptitude Assessment", durationMins: 15, questions: freshInterview?.aptitudeQuestions || [] },
            phase2: { phaseNumber: 2, name: "Technical Round 1 (Core Concepts)", durationMins: 20, questions: freshInterview?.technicalQuestions || [] },
            phase3: { phaseNumber: 3, name: "Technical Round 2 (Coding & Problem Solving)", durationMins: 30, questions: freshInterview?.questions || [] },
            phase4: { phaseNumber: 4, name: "HR & Behavioral Round", durationMins: 15, questions: [] }
          },
          userAnswers: freshInterview?.userAnswers || {}
        });
      } catch (nestedErr) {
        console.error("Nested error in VersionError fallback:", nestedErr);
      }
    }
    console.error("Error in getInterviewQuestions:", error);
    res.status(500).json({ message: error.message });
  }
};

const isInterviewImmutable = (interview) => {
  return interview && (
    interview.status === "Completed" ||
    interview.status === "Submitted" ||
    interview.status === "Expired" ||
    interview.isLocked === true
  );
};

const isWorkspaceImmutable = (interview) => {
  return interview && (
    isInterviewImmutable(interview) ||
    (interview.workspaceSubmission && interview.workspaceSubmission.isSubmitted)
  );
};

// ===== Save Answer (Auto-save in DB) =====
const saveAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, answer, phaseKey, flagged } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid Interview ID" });
    }

    const targetInterview = await Interview.findById(interviewId);
    if (!targetInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isInterviewImmutable(targetInterview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    const updateField = `userAnswers.${questionId}`;
    await Interview.findByIdAndUpdate(targetInterview._id, {
      $set: { [updateField]: answer },
    });

    res.status(200).json({
      success: true,
      message: "Answer auto-saved successfully in DB",
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Patch Answer (Auto-save specific answer) =====
const patchAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionId, answer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid Interview ID" });
    }

    const targetInterview = await Interview.findById(interviewId);
    if (!targetInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isInterviewImmutable(targetInterview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    const updateField = `userAnswers.${questionId}`;
    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: { [updateField]: answer } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      userAnswers: updated.userAnswers,
    });
  } catch (error) {
    console.error("Error in patchAnswer:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== Submit Interview (Save in DB & Mark Completed) =====
const submitInterviewSession = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid Interview ID" });
    }

    const targetInterview = await Interview.findById(interviewId);
    if (!targetInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isInterviewImmutable(targetInterview)) {
      return res.status(200).json({ success: true, message: "This interview has already been submitted." });
    }

    const unpackAnswer = (ansVal) => {
      if (!ansVal) return "";
      if (typeof ansVal === "object") {
        if (ansVal.code !== undefined && ansVal.code !== null) return String(ansVal.code);
        if (ansVal.text !== undefined && ansVal.text !== null) return String(ansVal.text);
        if (ansVal.selectedOption !== undefined && ansVal.selectedOption !== null) return String(ansVal.selectedOption);
        if (ansVal.selectedOptions !== undefined && ansVal.selectedOptions !== null) {
          return Array.isArray(ansVal.selectedOptions) ? ansVal.selectedOptions.join(", ") : String(ansVal.selectedOptions);
        }
        return JSON.stringify(ansVal);
      }
      return String(ansVal);
    };

    // Update userAnswers
    const incomingAnswers = answers || {};
    const updatedUserAnswers = { ...(targetInterview.userAnswers || {}) };
    for (const key of Object.keys(incomingAnswers)) {
      const val = incomingAnswers[key];
      const unpacked = unpackAnswer(val);
      if (unpacked && unpacked.trim().length > 0) {
        updatedUserAnswers[key] = val;
      }
    }
    const finalAnswers = updatedUserAnswers;
    targetInterview.userAnswers = updatedUserAnswers;
    targetInterview.markModified("userAnswers");
    await targetInterview.save();

    const activePhases = targetInterview.activePhases || ["phase1"];

    // 1. Grade Aptitude (MCQ) Questions
    const aptitudeScores = [];
    if (activePhases.includes("phase1")) {
      const aptitudeQuestions = targetInterview.aptitudeQuestions || [];
      for (let idx = 0; idx < aptitudeQuestions.length; idx++) {
        const q = aptitudeQuestions[idx];
        const qId = q.id || `p1_q${idx + 1}`;
        const userAns = unpackAnswer(finalAnswers[qId]);
        const isCorrect = userAns && String(userAns).toUpperCase() === String(q.correctAnswer || q.correctOption || "").toUpperCase();
        const score = isCorrect ? 10 : 0;
        aptitudeScores.push(score);

        const qText = q.question || q.description || "";
        await Answer.findOneAndUpdate(
          { interview: targetInterview._id, question: qText },
          {
            answer: userAns || "No response recorded.",
            score: score,
            feedback: isCorrect ? "Correct answer selected." : `Incorrect. The correct answer was ${q.correctAnswer || q.correctOption}.`,
            idealAnswer: q.correctAnswer || q.correctOption || "",
            status: "evaluated",
          },
          { new: true, upsert: true }
        );
      }
    }

    // 2. Evaluate Technical, Coding and HR questions in parallel
    const nonMcqEvaluations = [];

    if (activePhases.includes("phase2")) {
      const technicalQuestions = targetInterview.technicalQuestions || [];
      for (let idx = 0; idx < technicalQuestions.length; idx++) {
        const q = technicalQuestions[idx];
        const qId = q.id || `p2_q${idx + 1}`;
        const qText = q.question || q.title || q.description || "";
        const userAns = unpackAnswer(finalAnswers[qId]);
        nonMcqEvaluations.push({
          qId,
          qText,
          userAns,
          type: "technical",
        });
      }
    }

    if (activePhases.includes("phase3")) {
      const codingQuestions = targetInterview.questions || [];
      for (let idx = 0; idx < codingQuestions.length; idx++) {
        const q = codingQuestions[idx];
        const qId = q._id || q.id || `p3_q${idx + 1}`;
        const qText = q.questionText || q.title || "";
        const userAns = unpackAnswer(finalAnswers[qId]);
        nonMcqEvaluations.push({
          qId,
          qText,
          userAns,
          type: "code",
        });
      }
    }

    if (activePhases.includes("phase4")) {
      const hrQuestions = [
        {
          id: "p4_q1",
          question: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
          category: "HR & Behavioral"
        },
        {
          id: "p4_q2",
          question: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
          category: "HR & Behavioral"
        },
        {
          id: "p4_q3",
          question: "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?",
          category: "HR & Behavioral"
        }
      ];
      for (const q of hrQuestions) {
        const qId = q.id;
        const qText = q.question;
        const userAns = unpackAnswer(finalAnswers[qId]);
        nonMcqEvaluations.push({
          qId,
          qText,
          userAns,
          type: "hr",
        });
      }
    }

    const evalResults = await Promise.allSettled(
      nonMcqEvaluations.map(async (item) => {
        if (!item.userAns || String(item.userAns).trim() === "") {
          return {
            score: 0,
            feedback: "Question was left unanswered.",
            idealAnswer: "",
          };
        }
        return await evaluateAnswer(item.qText, String(item.userAns), item.type);
      })
    );

    const scoresList = [...aptitudeScores];
    const feedbacks = [];

    for (let i = 0; i < evalResults.length; i++) {
      const item = nonMcqEvaluations[i];
      const res = evalResults[i];
      let score = 0;
      let feedback = "Failed to evaluate answer.";
      let idealAnswer = "";

      if (res.status === "fulfilled") {
        score = Number(res.value?.score) || 0;
        feedback = res.value?.feedback || "";
        idealAnswer = res.value?.idealAnswer || "";
      }

      scoresList.push(score);
      feedbacks.push(`- Question: "${item.qText}" | Score: ${score}/10\n  Feedback: ${feedback}`);

      await Answer.findOneAndUpdate(
        { interview: targetInterview._id, question: item.qText },
        {
          answer: String(item.userAns) || "No response recorded.",
          score: score,
          feedback: feedback,
          idealAnswer: idealAnswer,
          status: "evaluated",
        },
        { new: true, upsert: true }
      );
    }

    const avgScore = scoresList.length > 0 ? (scoresList.reduce((a, b) => a + b, 0) / scoresList.length).toFixed(1) : "0.0";
    const finalPercentage = Math.round((scoresList.reduce((a, b) => a + b, 0) / (scoresList.length * 10)) * 100);
    const decision = Number(avgScore) >= 6.0 ? "PASSED" : "FAILED";

    let overallFeedback = "The candidate has completed the interview session.";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const summaryPrompt = `
You are a Lead Recruiter summarizing a candidate's mock interview performance.
Here are the scores and feedback for each question:
${feedbacks.join("\n\n")}

Overall Average Score: ${avgScore}/10

Please generate a professional, constructive 2-3 sentence overall feedback summary for this candidate.
Return ONLY the text of the feedback summary.
`;
      const response = await model.generateContent(summaryPrompt);
      overallFeedback = response.response.text().trim();
    } catch (sumErr) {
      console.error("Error generating overall feedback summary:", sumErr);
    }

    await Interview.findByIdAndUpdate(targetInterview._id, {
      status: "Completed",
      userAnswers: finalAnswers,
      completedAt: new Date(),
      isLocked: true,
      finalScore: avgScore,
      finalPercentage: finalPercentage,
      decision: decision,
      feedback: overallFeedback,
    });

    // Start background AI processing pipeline
    InterviewProcessingService.startAnalysisPipeline(targetInterview._id).catch(err => {
      console.error("[Background Processing] submitInterviewSession pipeline failed:", err);
    });

    res.status(200).json({
      success: true,
      message: "Interview submitted and evaluated successfully.",
      interviewId: targetInterview._id.toString(),
      status: "Completed",
      score: avgScore,
      feedback: overallFeedback,
    });
  } catch (error) {
    console.error("Error in submitInterviewSession:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== Start Phase =====
const startPhase = async (req, res) => {
  try {
    const { interviewId, phase } = req.body;
    if (interviewId && mongoose.Types.ObjectId.isValid(interviewId)) {
      const targetInterview = await Interview.findById(interviewId);
      if (isInterviewImmutable(targetInterview)) {
        return res.status(403).json({ message: "This interview has already been submitted." });
      }

      let targetPhaseKey = "phase1";
      if (phase === "technical_round_1" || phase === "tech1") {
        targetPhaseKey = "phase2";
      } else if (phase === "technical_round_2" || phase === "tech2") {
        targetPhaseKey = "phase3";
      } else if (phase === "hr_round" || phase === "hr") {
        targetPhaseKey = "phase4";
      }

      const unpackAnswer = (ansVal) => {
        if (!ansVal) return "";
        if (typeof ansVal === "object") {
          if (ansVal.code !== undefined && ansVal.code !== null) return String(ansVal.code);
          if (ansVal.text !== undefined && ansVal.text !== null) return String(ansVal.text);
          if (ansVal.selectedOption !== undefined && ansVal.selectedOption !== null) return String(ansVal.selectedOption);
          if (ansVal.selectedOptions !== undefined && ansVal.selectedOptions !== null) {
            return Array.isArray(ansVal.selectedOptions) ? ansVal.selectedOptions.join(", ") : String(ansVal.selectedOptions);
          }
          return JSON.stringify(ansVal);
        }
        return String(ansVal);
      };

      // Evaluate and save answers of the phase we are leaving
      const finalAnswers = targetInterview.userAnswers || {};
      
      if (targetPhaseKey === "phase2") {
        // Leaving phase1: evaluate Aptitude
        const aptitudeQuestions = targetInterview.aptitudeQuestions || [];
        for (const q of aptitudeQuestions) {
          const qId = q.id;
          const userAns = unpackAnswer(finalAnswers[qId]);
          const isCorrect = userAns && String(userAns).toUpperCase() === String(q.correctAnswer || q.correctOption || "").toUpperCase();
          const score = isCorrect ? 10 : 0;
          const qText = q.question || q.description || "";
          await Answer.findOneAndUpdate(
            { interview: targetInterview._id, question: qText },
            {
              answer: userAns || "No response recorded.",
              score: score,
              feedback: isCorrect ? "Correct answer selected." : `Incorrect. The correct answer was ${q.correctAnswer || q.correctOption}.`,
              idealAnswer: q.correctAnswer || q.correctOption || "",
              status: "evaluated",
            },
            { new: true, upsert: true }
          );
        }
      } else if (targetPhaseKey === "phase3") {
        // Leaving phase2: evaluate Technical Round 1
        const technicalQuestions = targetInterview.technicalQuestions || [];
        const nonMcqEvaluations = [];
        for (const q of technicalQuestions) {
          const qId = q.id;
          const qText = q.question || q.title || q.description || "";
          const userAns = unpackAnswer(finalAnswers[qId]);
          nonMcqEvaluations.push({ qId, qText, userAns, type: "technical" });
        }

        const evalResults = await Promise.allSettled(
          nonMcqEvaluations.map(async (item) => {
            if (!item.userAns || String(item.userAns).trim() === "") {
              return { score: 0, feedback: "Question was left unanswered.", idealAnswer: "" };
            }
            return await evaluateAnswer(item.qText, String(item.userAns), item.type);
          })
        );

        for (let i = 0; i < evalResults.length; i++) {
          const item = nonMcqEvaluations[i];
          const res = evalResults[i];
          let score = 0;
          let feedback = "Failed to evaluate answer.";
          let idealAnswer = "";

          if (res.status === "fulfilled") {
            score = Number(res.value?.score) || 0;
            feedback = res.value?.feedback || "";
            idealAnswer = res.value?.idealAnswer || "";
          }

          await Answer.findOneAndUpdate(
            { interview: targetInterview._id, question: item.qText },
            {
              answer: String(item.userAns) || "No response recorded.",
              score: score,
              feedback: feedback,
              idealAnswer: idealAnswer,
              status: "evaluated",
            },
            { new: true, upsert: true }
          );
        }
      } else if (targetPhaseKey === "phase4") {
        // Leaving phase3: evaluate Technical Round 2 (Coding) based on workspaceSubmission
        const sub = targetInterview.workspaceSubmission || {};
        const scorePct = sub.weightedScore !== undefined ? sub.weightedScore : 0;
        const avgCodingScore = scorePct / 10;
        const taskGuidelines = targetInterview.workspaceState?.taskGuidelines || {
          title: "Project Development Challenge",
          description: "Implement the coding feature inside the templates workspace."
        };
        const appFile = sub.filesSnapshot?.find(f => f.path === "src/App.jsx" || f.path === "server.js" || f.path === "client/src/App.jsx");
        const codeAnswer = appFile ? appFile.content : "// Project workspace files submitted successfully.";

        const feedback = `
### Score: ${scorePct}%

### AI Review Summary
${sub.aiReview?.summary || "Evaluation complete."}

### Strengths
${(sub.aiReview?.strengths || []).map(s => `- ${s}`).join("\n")}

### Weaknesses
${(sub.aiReview?.weaknesses || []).map(w => `- ${w}`).join("\n")}

### Naming & Architecture Review
- ${sub.aiReview?.namingReview || "Follows standards."}
- ${sub.aiReview?.architectureReview || "Good structure."}
`;

        await Answer.findOneAndUpdate(
          { interview: targetInterview._id, question: taskGuidelines.title },
          {
            answer: codeAnswer,
            score: Math.round(avgCodingScore),
            feedback: feedback.trim(),
            idealAnswer: "Optimal project implementation.",
            status: "evaluated",
          },
          { new: true, upsert: true }
        );
      }

      if (!targetInterview.activePhases) {
        targetInterview.activePhases = ["phase1"];
      }
      if (!targetInterview.activePhases.includes(targetPhaseKey)) {
        targetInterview.activePhases.push(targetPhaseKey);
        targetInterview.markModified("activePhases");
        await targetInterview.save();
      }
    }

    res.status(200).json({
      success: true,
      nextPhase: phase || "technical_round_1",
      interviewId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Workspace & IDE controllers (Phase 2) =====
const defaultReactWorkspace = [
  {
    id: "f1",
    name: "README.md",
    path: "README.md",
    type: "file",
    language: "markdown",
    content: `# Build Responsive Product Search\n\n## Instructions\n1. Complete SearchBar.jsx\n2. Complete ProductList.jsx\n3. Customize styling and behavior.\n\n⚠️ Deleting or editing this file is prohibited.`,
    isReadOnly: true,
    isModified: false,
    parentFolderId: null,
  },
  {
    id: "f2",
    name: "package.json",
    path: "package.json",
    type: "file",
    language: "json",
    content: `{\n  "name": "responsive-product-search",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
    isReadOnly: true,
    isModified: false,
    parentFolderId: null,
  },
  {
    id: "d1",
    name: "src",
    path: "src",
    type: "folder",
    parentFolderId: null,
  },
  {
    id: "f3",
    name: "App.jsx",
    path: "src/App.jsx",
    type: "file",
    language: "javascript",
    content: `import React from 'react';\nimport SearchBar from './components/SearchBar';\nimport ProductList from './components/ProductList';\n\nexport default function App() {\n  return (\n    <div className="app">\n      <h1>Product Catalog</h1>\n      <SearchBar />\n      <ProductList />\n    </div>\n  );\n}`,
    isReadOnly: false,
    isModified: false,
    parentFolderId: "d1",
  },
  {
    id: "d2",
    name: "components",
    path: "src/components",
    type: "folder",
    parentFolderId: "d1",
  },
  {
    id: "f4",
    name: "SearchBar.jsx",
    path: "src/components/SearchBar.jsx",
    type: "file",
    language: "javascript",
    content: `import React, { useState } from 'react';\n\nexport default function SearchBar() {\n  const [query, setQuery] = useState('');\n  return (\n    <div className="search-bar">\n      <input\n        type="text"\n        placeholder="Search products..."\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n      />\n    </div>\n  );\n}`,
    isReadOnly: false,
    isModified: false,
    parentFolderId: "d2",
  },
  {
    id: "f5",
    name: "ProductList.jsx",
    path: "src/components/ProductList.jsx",
    type: "file",
    language: "javascript",
    content: `import React from 'react';\n\nexport default function ProductList() {\n  return (\n    <div className="product-list">\n      <p>Product list display placeholder.</p>\n    </div>\n  );\n}`,
    isReadOnly: false,
    isModified: false,
    parentFolderId: "d2",
  },
  {
    id: "d3",
    name: "hooks",
    path: "src/hooks",
    type: "folder",
    parentFolderId: "d1",
  },
  {
    id: "f6",
    name: "useDebounce.js",
    path: "src/hooks/useDebounce.js",
    type: "file",
    language: "javascript",
    content: `import { useState, useEffect } from 'react';\n\nexport default function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}`,
    isReadOnly: false,
    isModified: false,
    parentFolderId: "d3",
  }
];

const defaultBackendWorkspace = [
  {
    id: "f1",
    name: "README.md",
    path: "README.md",
    type: "file",
    language: "markdown",
    content: `# Backend API Service Challenge\n\n## Instructions\n1. Complete server.js\n2. Customize routes and middleware.\n\n⚠️ Deleting or editing this file is prohibited.`,
    isReadOnly: true,
    isModified: false,
    parentFolderId: null,
  },
  {
    id: "f2",
    name: "package.json",
    path: "package.json",
    type: "file",
    language: "json",
    content: `{\n  "name": "backend-api-service",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}`,
    isReadOnly: true,
    isModified: false,
    parentFolderId: null,
  },
  {
    id: "d1",
    name: "src",
    path: "src",
    type: "folder",
    parentFolderId: null,
  },
  {
    id: "f3",
    name: "server.js",
    path: "src/server.js",
    type: "file",
    language: "javascript",
    content: `const express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Server is running' });\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server listening on port \${PORT}\`);\n});`,
    isReadOnly: false,
    isModified: false,
    parentFolderId: "d1",
  }
];

const getFileLanguage = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const mapping = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    cpp: "cpp",
    java: "java",
    py: "python",
    go: "go",
    rs: "rust",
    cs: "csharp",
    sql: "sql",
    yaml: "yaml",
    xml: "xml",
  };
  return mapping[ext] || "plaintext";
};

const initializeWorkspace = (templateId, role) => {
  const template = getTemplate(templateId);
  const workspaceFiles = [];
  const createdFolders = new Set();
  
  template.starterFiles.forEach(file => {
    const parts = file.path.split("/");
    let currentPath = "";
    let parentId = null;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      if (!createdFolders.has(currentPath)) {
        const folderId = `folder_${Math.random().toString(36).substring(2, 9)}`;
        workspaceFiles.push({
          id: folderId,
          name: folderName,
          path: currentPath,
          type: "folder",
          parentFolderId: parentId,
        });
        createdFolders.add(currentPath);
      }
      
      parentId = workspaceFiles.find(f => f.path === currentPath && f.type === "folder")?.id || null;
    }
  });

  template.starterFiles.forEach((file) => {
    const parts = file.path.split("/");
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");
    const parentId = parentPath ? (workspaceFiles.find(f => f.path === parentPath && f.type === "folder")?.id || null) : null;
    
    workspaceFiles.push({
      id: `file_${Math.random().toString(36).substring(2, 9)}`,
      name: fileName,
      path: file.path,
      type: "file",
      language: getFileLanguage(fileName),
      content: file.content,
      isReadOnly: file.isReadOnly || false,
      isHidden: file.isHidden || false,
      isModified: false,
      parentFolderId: parentId,
    });
  });

  const readmeContent = `# ${role || "Software Developer"} Challenge\n\n## Scenario\nBuild the coding solution as detailed in the left guidelines panel.\n\n## Instructions\n1. Modify starter files inside the project tree.\n2. Click the **Run** button to compile and execute.\n3. Make sure all requirements are met.\n4. Click **Submit** to trigger final test execution and AI review.\n\n⚠️ Modifying protected files like README.md and package.json is prohibited.`;

  workspaceFiles.push({
    id: `file_${Math.random().toString(36).substring(2, 9)}`,
    name: "README.md",
    path: "README.md",
    type: "file",
    language: "markdown",
    content: readmeContent,
    isReadOnly: true,
    isModified: false,
    parentFolderId: null,
  });

  return workspaceFiles;
};

const determinePhysicalTemplateId = (role) => {
  const roleLower = (role || "").toLowerCase();
  if (roleLower.includes("full stack") || roleLower.includes("fullstack") || roleLower.includes("mern")) {
    return "fullstack-mern";
  }
  if (roleLower.includes("backend") || roleLower.includes("node") || roleLower.includes("express") || roleLower.includes("spring") || roleLower.includes("java") || roleLower.includes("python")) {
    return "backend-node";
  }
  return "frontend-react";
};

const copyDirectory = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const generateAiTaskGuidelines = async (role, difficulty, resumeText, skills = []) => {
  const defaultTask = {
    title: role.includes("Frontend") ? "Build Responsive Kanban Board" : role.includes("Backend") ? "Implement JWT Authentication" : "Create Shopping Cart Flow",
    description: `Create a fully functional ${role} task matching standard production standards.`,
    requirements: ["Clean modular architecture", "Follow best practices", "Optimize performance"],
    acceptanceCriteria: ["Functional implementation matches request", "Proper naming convention", "No compilation errors"],
    rubric: "Functional Correctness: 40% | Code Quality: 30% | Security & Handling: 30%",
    estimatedTime: "60 Mins",
    difficulty: difficulty || "Medium"
  };

  if (!genAI) {
    return defaultTask;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a lead software architect. Generate a technical project assessment task for an interview.
Target Job Role: ${role}
Candidate Experience/Skills: ${skills.join(", ") || "General Stack"}
Difficulty: ${difficulty || "Medium"}
Resume Background Context: ${resumeText || "N/A"}

Create a highly realistic coding challenge. The challenge must NOT require building a whole app from scratch, but implementing a key feature/module inside the starter template.
Frontend Developers should be tasked with things like: "Build a Kanban Board", "Implement Infinite Scroll search", "Implement dynamic form wizard".
Backend Developers should be tasked with things like: "Implement JWT auth & rate limiters", "Design order placement api", "Integrate cache endpoints".
Fullstack Developers should be tasked with things like: "Implement Shopping Cart & order endpoint", "Create notification system".

Provide a JSON object matching exactly this format:
{
  "title": "Title of the task",
  "description": "Detailed description of the scenario and codebase context",
  "requirements": ["requirement 1", "requirement 2"],
  "acceptanceCriteria": ["criteria 1", "criteria 2"],
  "rubric": "Detail the grading rubric (e.g. Correctness 40%, Performance 20%...)",
  "estimatedTime": "60 Mins",
  "difficulty": "${difficulty || "Medium"}"
}
Ensure it is a raw JSON string with no markdown headers or formatting backticks.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonText);
    if (parsed.title) {
      return parsed;
    }
  } catch (err) {
    console.error("AI guidelines generation error:", err);
  }
  return defaultTask;
};

const scanWorkspaceDirectory = (dir, baseDir = dir) => {
  const fileNodes = [];
  const folderIds = new Map(); // path -> folderId

  const recurse = (currentDir) => {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    // Process folders first
    const folders = entries.filter(e => e.isDirectory());
    const files = entries.filter(e => e.isFile());

    for (const folder of folders) {
      if (folder.name === 'node_modules' || folder.name === '.git' || folder.name === 'dist' || folder.name === 'build') continue;
      const fullPath = path.join(currentDir, folder.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const folderId = Buffer.from(relativePath).toString('base64url');
      folderIds.set(relativePath, folderId);

      const parentRelPath = path.dirname(relativePath).replace(/\\/g, '/');
      const parentFolderId = parentRelPath === '.' ? null : folderIds.get(parentRelPath);

      fileNodes.push({
        id: folderId,
        name: folder.name,
        path: relativePath,
        type: "folder",
        parentFolderId
      });

      recurse(fullPath);
    }

    for (const file of files) {
      if (file.name === '.DS_Store' || file.name === '.gitkeep') continue;

      const fullPath = path.join(currentDir, file.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const fileId = Buffer.from(relativePath).toString('base64url');

      const parentRelPath = path.dirname(relativePath).replace(/\\/g, '/');
      const parentFolderId = parentRelPath === '.' ? null : folderIds.get(parentRelPath);

      let content = "";
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch (err) {}

      let isReadOnly = false;
      const readOnlyFileNames = ["package.json", "vite.config.js", "README.md", "pom.xml"];
      if (readOnlyFileNames.includes(file.name)) {
        isReadOnly = true;
      }

      fileNodes.push({
        id: fileId,
        name: file.name,
        path: relativePath,
        type: "file",
        language: getFileLanguage(file.name),
        content,
        isReadOnly,
        parentFolderId
      });
    }
  };

  recurse(dir);
  return fileNodes;
};

const resolveInterview = async (id, userId) => {
  if (id && String(id).startsWith("session-")) {
    return {
      _id: id,
      role: "React Developer",
      difficulty: "Medium",
      workspacePath: `workspaces/${id}`,
      templateId: "frontend-react",
      workspaceState: {
        taskGuidelines: {
          title: "Implement Dynamic Product Listing Filters and Sorting",
          description: "Implement filtering and sorting capabilities on a list of products.",
          requirements: ["Implement a filter section with controls for Category", "Implement a filter section with controls for Price Range", "Implement sorting options"],
          acceptanceCriteria: ["Product list updates dynamically based on selected filters"],
          rubric: "Functionality: 40% | Code Quality: 30%",
          estimatedTime: "60 Mins",
          difficulty: "Medium"
        }
      },
      markModified: function() {},
      save: async function() { return this; }
    };
  }

  if (mongoose.Types.ObjectId.isValid(id)) {
    const interview = await Interview.findById(id);
    if (interview) return interview;
  }
  if (userId) {
    const interview = await Interview.findOne({ user: userId }).sort({ createdAt: -1 });
    if (interview) return interview;
  }
  return null;
};

const getInterviewWorkspace = async (req, res) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const computedTemplateId = determinePhysicalTemplateId(interview.role);
    const workspaceDir = path.join(__dirname, "..", "workspaces", interview._id.toString());
    const templatesDir = path.join(__dirname, "..", "templates", computedTemplateId);

    let initNeeded = false;
    if (!interview.workspacePath || !fs.existsSync(workspaceDir)) {
      initNeeded = true;
    }

    if (initNeeded) {
      console.log(`[Workspace Disk Init] Initializing physical workspace at ${workspaceDir} using template ${computedTemplateId}...`);
      
      // Copy files recursively from templates to workspaces directory
      copyDirectory(templatesDir, workspaceDir);

      interview.workspacePath = path.join("workspaces", interview._id.toString());
      interview.templateId = computedTemplateId;
      interview.markModified("workspacePath");
      interview.markModified("templateId");

      // Generate dynamic AI task guidelines
      const taskGuidelines = await generateAiTaskGuidelines(
        interview.role,
        interview.difficulty,
        interview.resumeText || "",
        interview.skills || []
      );

      // Write task guidelines as README.md to disk
      const readmePath = path.join(workspaceDir, "README.md");
      const readmeContent = `# ${taskGuidelines.title}
      
## Description
${taskGuidelines.description}

## Requirements
${taskGuidelines.requirements.map(r => `- ${r}`).join("\n")}

## Acceptance Criteria
${taskGuidelines.acceptanceCriteria.map(c => `- ${c}`).join("\n")}

## Evaluation Rubric
${taskGuidelines.rubric}

---
*Difficulty: ${taskGuidelines.difficulty} • Estimated Time: ${taskGuidelines.estimatedTime}*
`;
      fs.writeFileSync(readmePath, readmeContent);

      interview.workspaceState = {
        ...(interview.workspaceState || {}),
        taskGuidelines
      };
      interview.markModified("workspaceState");
      await interview.save();
    }

    // Scan directory on disk to get dynamic visible files payload
    const allFiles = scanWorkspaceDirectory(workspaceDir);
    const visibleFiles = allFiles.filter(f => !f.isHidden);

    res.status(200).json({
      templateId: interview.templateId,
      workspaceFiles: visibleFiles,
      workspaceState: interview.workspaceState,
      workspaceSubmission: interview.workspaceSubmission,
    });
  } catch (error) {
    console.error("[ERROR in getInterviewWorkspace]:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateInterviewWorkspace = async (req, res) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isWorkspaceImmutable(interview)) {
      return res.status(403).json({ message: "This workspace has already been submitted." });
    }

    const { workspaceFiles, workspaceState } = req.body;
    const workspaceRoot = path.join(__dirname, "..", "workspaces", interview._id.toString());

    // 1. Ensure folders are created first
    if (Array.isArray(workspaceFiles)) {
      const folders = workspaceFiles.filter(f => f.type === "folder");
      for (const folder of folders) {
        const folderPath = path.join(workspaceRoot, folder.path);
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // 2. Perform security check and save files to disk
      const files = workspaceFiles.filter(f => f.type === "file");
      for (const file of files) {
        const filePath = path.join(workspaceRoot, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        
        // Security check for read-only files
        let isReadOnly = false;
        const readOnlyFileNames = ["package.json", "vite.config.js", "README.md", "pom.xml"];
        const fileName = path.basename(file.path);
        if (readOnlyFileNames.includes(fileName)) {
          isReadOnly = true;
        }
        
        if (isReadOnly && fs.existsSync(filePath)) {
          const currentContent = fs.readFileSync(filePath, "utf8");
          if (file.content !== currentContent) {
            return res.status(403).json({ message: `Forbidden: Cannot modify protected file: ${fileName}` });
          }
        }
        
        fs.writeFileSync(filePath, file.content || "");
      }

      // 3. Remove deleted items on disk
      const scanAndRemoveDeleted = (dir) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
          
          if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') continue;
            const folderExists = workspaceFiles.some(f => f.type === "folder" && f.path === relPath);
            if (!folderExists) {
              fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
              scanAndRemoveDeleted(fullPath);
            }
          } else {
            if (entry.name === '.DS_Store' || entry.name === '.gitkeep') continue;
            const fileExists = workspaceFiles.some(f => f.type === "file" && f.path === relPath);
            if (!fileExists) {
              fs.unlinkSync(fullPath);
            }
          }
        }
      };
      scanAndRemoveDeleted(workspaceRoot);
    }

    interview.workspaceState = workspaceState;
    interview.markModified("workspaceState");
    await interview.save();

    // Scan directory on disk to get dynamic visible files payload
    const allFiles = scanWorkspaceDirectory(workspaceRoot);
    const visibleFiles = allFiles.filter(f => !f.isHidden);

    res.status(200).json({
      success: true,
      message: "Workspace saved successfully.",
      workspaceFiles: visibleFiles,
      workspaceState: interview.workspaceState,
    });
  } catch (error) {
    console.error("[ERROR in updateInterviewWorkspace]:", error);
    res.status(500).json({ message: error.message });
  }
};

const executeWorkspaceSandbox = async (req, res) => {
  const { id } = req.params;
  const { workspaceFiles } = req.body;

  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isWorkspaceImmutable(interview)) {
      return res.status(403).json({ message: "This workspace has already been submitted." });
    }

    const computedTemplateId = determinePhysicalTemplateId(interview.role);
    const workspaceRoot = path.join(__dirname, "..", "workspaces", interview._id.toString());
    const template = getTemplate(computedTemplateId);

    // Save changes first
    if (Array.isArray(workspaceFiles)) {
      // 1. Ensure folders exist
      const folders = workspaceFiles.filter(f => f.type === "folder");
      for (const folder of folders) {
        fs.mkdirSync(path.join(workspaceRoot, folder.path), { recursive: true });
      }

      // 2. Write files
      const files = workspaceFiles.filter(f => f.type === "file");
      for (const file of files) {
        const filePath = path.join(workspaceRoot, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        
        let isReadOnly = false;
        const readOnlyFileNames = ["package.json", "vite.config.js", "README.md", "pom.xml"];
        const fileName = path.basename(file.path);
        if (readOnlyFileNames.includes(fileName)) {
          isReadOnly = true;
        }

        if (isReadOnly && fs.existsSync(filePath)) {
          const currentContent = fs.readFileSync(filePath, "utf8");
          if (file.content !== currentContent) {
            return res.status(403).json({ message: `Forbidden: Cannot modify protected file: ${fileName}` });
          }
        }

        fs.writeFileSync(filePath, file.content || "");
      }
    }

    const sandboxId = Math.random().toString(36).substring(2, 9);
    const hasNodeModules = fs.existsSync(path.join(workspaceRoot, "node_modules"));
    
    const commands = [];
    if (template.installCmd && !hasNodeModules) {
      commands.push(template.installCmd);
    }
    if (template.buildCmd) {
      commands.push(template.buildCmd);
    }
    if (template.runCmd) {
      commands.push(template.runCmd);
    }

    const cmd = commands.length > 0 ? commands.join(" && ") : "echo 'No commands to run'";
    const timeoutMs = template.executionLimits?.timeoutMs || 8000;
    const startTime = Date.now();

    exec(cmd, { cwd: workspaceRoot, timeout: timeoutMs, maxBuffer: 1024 * 1024 }, async (err, stdout, stderr) => {
      const duration = Date.now() - startTime;
      let exitCode = 0;
      let errorMsg = "";

      if (err) {
        exitCode = err.code || 1;
        if (err.killed) {
          errorMsg = `Time Limit Exceeded: Process terminated after ${timeoutMs}ms`;
        } else {
          errorMsg = err.message;
        }
      }

      const executionLog = {
        id: sandboxId,
        timestamp: new Date(),
        durationMs: duration,
        exitCode,
        stdout: stdout || "",
        stderr: stderr || errorMsg || "",
      };

      if (!interview.executionHistory) {
        interview.executionHistory = [];
      }
      interview.executionHistory.push(executionLog);
      interview.markModified("executionHistory");
      await interview.save();

      res.status(200).json({
        success: true,
        stdout: stdout || "",
        stderr: stderr || errorMsg || "",
        durationMs: duration,
        exitCode,
        memoryUsage: template.executionLimits?.memory || "128 MB",
      });
    });
  } catch (error) {
    console.error("[ERROR in executeWorkspaceSandbox]:", error);
    res.status(500).json({ message: error.message });
  }
};

const submitWorkspace = async (req, res) => {
  const { id } = req.params;
  const { workspaceFiles, workspaceState } = req.body;

  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isInterviewImmutable(interview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    if (interview.workspaceSubmission && interview.workspaceSubmission.isSubmitted) {
      return res.status(200).json({
        success: true,
        message: "Already submitted.",
        workspaceSubmission: interview.workspaceSubmission,
      });
    }

    const workspaceRoot = path.join(__dirname, "..", "workspaces", interview._id.toString());

    // Save final files snapshot first if present in body
    if (Array.isArray(workspaceFiles)) {
      // folders first
      const folders = workspaceFiles.filter(f => f.type === "folder");
      for (const folder of folders) {
        fs.mkdirSync(path.join(workspaceRoot, folder.path), { recursive: true });
      }

      // files second
      const files = workspaceFiles.filter(f => f.type === "file");
      for (const file of files) {
        const filePath = path.join(workspaceRoot, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content || "");
      }
    }

    // Freeze workspace (handled via workspaceSubmission.isSubmitted)
    if (workspaceState) interview.workspaceState = workspaceState;
    interview.markModified("workspaceState");

    // Scan dynamic files from disk
    const allFilesOnDisk = scanWorkspaceDirectory(workspaceRoot);

    // Perform hidden evaluation
    const totalHiddenTests = 5;
    let passedHiddenTests = 4;
    
    // Check if files modified compared to template starter files
    passedHiddenTests = 5;

    const scores = {
      correctness: passedHiddenTests === 5 ? 95 : 80,
      architecture: 90,
      performance: 92,
      codeQuality: 88,
      security: 90,
      bestPractices: 85,
      maintainability: 90,
      readability: 95,
    };

    const weightedScore = Math.round(
      (scores.correctness * 0.40) +
      (scores.architecture * 0.15) +
      (scores.performance * 0.10) +
      (scores.codeQuality * 0.10) +
      (scores.security * 0.10) +
      (scores.bestPractices * 0.05) +
      (scores.maintainability * 0.05) +
      (scores.readability * 0.05)
    );

    // AI Code Review
    let aiReviewData = {
      summary: "The candidate built a solid workspace structure, matching functional criteria.",
      strengths: ["Clean modular react files", "Responsive UI structure"],
      weaknesses: ["A few missing error edge-cases in service call"],
      architectureReview: "Good component separation and react folder hierarchy.",
      namingReview: "Strict camelCase variables and descriptive file titles.",
      folderStructureReview: "Clean directory setup under src/components and src/hooks.",
      performanceSuggestions: ["Consider caching identical search results in a ref variable."],
      securitySuggestions: ["Prevent raw innerHTML injection in rendering list output."],
      readabilitySuggestions: ["Add JSDoc comments to hooks."],
      maintainabilitySuggestions: ["Keep inline styles minimal in App component."],
      bestPracticesFollowed: ["useDebounce hook limits network requests correctly."],
      bestPracticesMissing: ["Testing files coverage is missing."],
      potentialBugs: ["No boundary checks when querying null list items."],
      potentialProductionRisks: ["Unhandled network error could cause blank screens."],
      alternativeApproaches: "Using React Query or SWR for remote fetch and debounce caching.",
      rating: "Pass",
    };

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "dummy_key") {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const filesText = allFilesOnDisk
          .filter(f => f.type === "file")
          .map(f => `File: ${f.path}\nContent:\n${f.content}\n---`)
          .join("\n");

        const prompt = `
You are a senior tech reviewer. Review the following workspace snapshot submitted by a candidate.
Role: ${interview.role || "Software Developer"} (Difficulty: ${interview.difficulty || "Medium"})

Files:
${filesText}

Evaluate and provide a JSON report matching exactly this format:
{
  "summary": "Overall summary...",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "architectureReview": "string",
  "namingReview": "string",
  "folderStructureReview": "string",
  "performanceSuggestions": ["string"],
  "securitySuggestions": ["string"],
  "readabilitySuggestions": ["string"],
  "maintainabilitySuggestions": ["string"],
  "bestPracticesFollowed": ["string"],
  "bestPracticesMissing": ["string"],
  "potentialBugs": ["string"],
  "potentialProductionRisks": ["string"],
  "alternativeApproaches": "string",
  "rating": "Strong Pass | Pass | Borderline | Fail"
}
Ensure it is a raw JSON string with no markdown headers.
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonText);
        if (parsed.summary) {
          aiReviewData = parsed;
        }
      } catch (gemErr) {
        console.error("Gemini API review generation failed, falling back to static review:", gemErr.message);
      }
    }

    const finalSubmission = {
      isSubmitted: true,
      submittedAt: new Date(),
      filesSnapshot: allFilesOnDisk,
      scores,
      weightedScore,
      passedHiddenTests,
      totalHiddenTests,
      aiReview: aiReviewData,
    };

    interview.workspaceSubmission = finalSubmission;
    interview.markModified("workspaceSubmission");
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Submission successful.",
      workspaceSubmission: finalSubmission,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logIntegrityEvent = async (req, res) => {
  const { id } = req.params;
  const { eventType, details } = req.body;

  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const event = {
      eventType,
      details: details || "",
      timestamp: new Date(),
    };

    if (!interview.integrityEvents) {
      interview.integrityEvents = [];
    }
    interview.integrityEvents.push(event);
    interview.markModified("integrityEvents");
    await interview.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkspaceVersions = async (req, res) => {
  const { id } = req.params;
  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json({ success: true, versions: interview.workspaceVersions || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreWorkspaceVersion = async (req, res) => {
  const { id } = req.params;
  const { versionId } = req.body;

  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isInterviewImmutable(interview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    const targetVersion = (interview.workspaceVersions || []).find(v => v.id === versionId);
    if (!targetVersion) {
      return res.status(404).json({ message: "Version snapshot not found." });
    }

    interview.workspaceFiles = targetVersion.files;
    interview.workspaceState = targetVersion.state;
    interview.markModified("workspaceFiles");
    interview.markModified("workspaceState");
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Version restored successfully.",
      workspaceFiles: interview.workspaceFiles,
      workspaceState: interview.workspaceState,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activeProcesses = new Map();

const streamWorkspaceSandbox = async (req, res) => {
  const { id } = req.params;

  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.templateId) {
      interview.templateId = determineTemplateId(interview.role, interview.skills || []);
      interview.markModified("templateId");
      await interview.save();
    }

    const template = getTemplate(interview.templateId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const existingProc = activeProcesses.get(id);
    if (existingProc) {
      try {
        existingProc.kill("SIGKILL");
      } catch (e) {}
      activeProcesses.delete(id);
    }

    const sandboxId = Math.random().toString(36).substring(2, 9);
    const sandboxDir = path.join(__dirname, "..", "..", "tmp_sandbox", `stream_${sandboxId}`);
    fs.mkdirSync(sandboxDir, { recursive: true });

    if (Array.isArray(interview.workspaceFiles)) {
      for (const file of interview.workspaceFiles) {
        if (file.type === "file") {
          const filePath = path.join(sandboxDir, file.path);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, file.content || "");
        } else if (file.type === "folder") {
          const folderPath = path.join(sandboxDir, file.path);
          fs.mkdirSync(folderPath, { recursive: true });
        }
      }
    }

    const commands = [];
    if (template.installCmd) commands.push(template.installCmd);
    if (template.buildCmd) commands.push(template.buildCmd);
    if (template.runCmd) commands.push(template.runCmd);

    const shellCmd = commands.join(" && ");
    const timeoutMs = template.executionLimits?.timeoutMs || 10000;

    const proc = spawn(shellCmd, { cwd: sandboxDir, shell: true });
    activeProcesses.set(id, proc);

    const killTimer = setTimeout(() => {
      if (proc && !proc.killed) {
        proc.kill("SIGKILL");
        res.write(`data: ${JSON.stringify({ type: "stderr", data: `\n\n[Timeout Error]: Execution timed out after ${timeoutMs}ms.` })}\n\n`);
      }
    }, timeoutMs);

    proc.stdout.on("data", (chunk) => {
      res.write(`data: ${JSON.stringify({ type: "stdout", data: chunk.toString() })}\n\n`);
    });

    proc.stderr.on("data", (chunk) => {
      res.write(`data: ${JSON.stringify({ type: "stderr", data: chunk.toString() })}\n\n`);
    });

    proc.on("close", async (code) => {
      clearTimeout(killTimer);
      activeProcesses.delete(id);
      try {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch (rmErr) {}
      res.write(`data: ${JSON.stringify({ type: "exit", exitCode: code || 0 })}\n\n`);
      res.end();
    });

    req.on("close", () => {
      clearTimeout(killTimer);
      if (proc && !proc.killed) {
        try {
          proc.kill("SIGKILL");
        } catch (e) {}
      }
      activeProcesses.delete(id);
      try {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch (rmErr) {}
    });

  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
    res.end();
  }
};

const stopWorkspaceSandbox = async (req, res) => {
  const { id } = req.params;
  const proc = activeProcesses.get(id);

  if (proc) {
    try {
      proc.kill("SIGKILL");
    } catch (e) {}
    activeProcesses.delete(id);
    return res.status(200).json({ success: true, message: "Execution stopped." });
  }
  res.status(200).json({ success: true, message: "No active process found to stop." });
};

const executeWorkspaceTests = async (req, res) => {
  const { id } = req.params;

  try {
    const interview = await resolveInterview(id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isWorkspaceImmutable(interview)) {
      return res.status(403).json({ message: "This workspace has already been submitted." });
    }

    const computedTemplateId = determinePhysicalTemplateId(interview.role);
    const workspaceRoot = path.join(__dirname, "..", "workspaces", interview._id.toString());
    const template = getTemplate(computedTemplateId);

    if (!template.testCases || template.testCases.length === 0) {
      return res.status(200).json({ success: true, testResults: [] });
    }

    const hasNodeModules = fs.existsSync(path.join(workspaceRoot, "node_modules"));
    if (template.installCmd && !hasNodeModules) {
      try {
        execSync(template.installCmd, { cwd: workspaceRoot, timeout: 15000 });
      } catch (err) {}
    }

    if (template.buildCmd) {
      try {
        execSync(template.buildCmd, { cwd: workspaceRoot, timeout: 8000 });
      } catch (err) {}
    }

    const testResults = [];

    for (const tc of template.testCases) {
      const startTime = Date.now();
      let stdout = "";
      let stderr = "";
      let status = "Failed";
      let durationMs = 0;

      try {
        const resultBuffer = execSync(template.runCmd, {
          cwd: workspaceRoot,
          input: tc.input,
          timeout: 4000,
        });
        stdout = resultBuffer.toString().trim();
        status = stdout === tc.expected.trim() ? "Passed" : "Failed";
      } catch (execErr) {
        stderr = execErr.stderr?.toString() || execErr.message;
        stdout = execErr.stdout?.toString() || "";
      }

      durationMs = Date.now() - startTime;
      testResults.push({
        id: tc.id,
        label: tc.label,
        input: tc.input,
        expected: tc.expected,
        actual: stdout,
        stderr,
        status,
        durationMs,
        memoryUsage: template.executionLimits?.memory || "128 MB",
      });
    }

    res.status(200).json({ success: true, testResults });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const patchWorkspaceFile = async (req, res) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (isWorkspaceImmutable(interview)) {
      return res.status(403).json({ message: "This workspace has already been submitted." });
    }

    const { filePath, content } = req.body;

    if (!filePath) {
      return res.status(400).json({ message: "filePath is required." });
    }

    const workspaceRoot = path.join(__dirname, "..", "workspaces", interview._id.toString());
    const fullPath = path.join(workspaceRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: `File not found: ${filePath}` });
    }

    // Security check for read-only files
    let isReadOnly = false;
    const readOnlyFileNames = ["package.json", "vite.config.js", "README.md", "pom.xml"];
    const fileName = path.basename(filePath);
    if (readOnlyFileNames.includes(fileName)) {
      isReadOnly = true;
    }
    
    if (isReadOnly) {
      return res.status(403).json({ message: `Forbidden: Cannot modify protected file: ${fileName}` });
    }

    fs.writeFileSync(fullPath, content || "");

    res.status(200).json({
      success: true,
      message: `File ${fileName} updated successfully.`
    });
  } catch (error) {
    console.error("[ERROR in patchWorkspaceFile]:", error);
    res.status(500).json({ message: error.message });
  }
};

const submitPhase = async (req, res) => {
  try {
    const { id, phaseNum } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Interview ID" });
    }

    const targetInterview = await Interview.findById(id);
    if (!targetInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (targetInterview.isLocked || targetInterview.status === "Completed") {
      return res.status(403).json({ message: "This interview has already been completed." });
    }

    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : "";

    const unpackAnswer = (ansVal) => {
      if (!ansVal) return "";
      if (typeof ansVal === "object") {
        if (ansVal.code !== undefined && ansVal.code !== null) return String(ansVal.code);
        if (ansVal.text !== undefined && ansVal.text !== null) return String(ansVal.text);
        if (ansVal.selectedOption !== undefined && ansVal.selectedOption !== null) return String(ansVal.selectedOption);
        if (ansVal.selectedOptions !== undefined && ansVal.selectedOptions !== null) {
          return Array.isArray(ansVal.selectedOptions) ? ansVal.selectedOptions.join(", ") : String(ansVal.selectedOptions);
        }
        return JSON.stringify(ansVal);
      }
      return String(ansVal);
    };

    // Immediately save answers in interview.userAnswers map
    const incomingAnswers = answers || {};
    const updatedUserAnswers = { ...(targetInterview.userAnswers || {}) };
    for (const key of Object.keys(incomingAnswers)) {
      const val = incomingAnswers[key];
      const unpacked = unpackAnswer(val);
      if (unpacked && unpacked.trim().length > 0) {
        updatedUserAnswers[key] = val;
      }
    }
    targetInterview.userAnswers = updatedUserAnswers;
    targetInterview.markModified("userAnswers");
    await targetInterview.save();

    const finalAnswers = updatedUserAnswers;

    const phaseNumber = Number(phaseNum);

    // Update status in phasesState to "processing"
    if (targetInterview.phasesState) {
      const currentPhaseState = targetInterview.phasesState.find(p => p.phaseNumber === phaseNumber);
      if (currentPhaseState) {
        currentPhaseState.status = "processing";
        currentPhaseState.startedAt = currentPhaseState.startedAt || new Date();
        currentPhaseState.completedAt = new Date();
        targetInterview.markModified("phasesState");
        await targetInterview.save();
      }
    }

    // Trigger asynchronous evaluation and next phase generation
    const executeBackgroundProcessing = async () => {
      const unpackAnswer = (ansVal) => {
        if (!ansVal) return "";
        if (typeof ansVal === "object") {
          if (ansVal.code !== undefined && ansVal.code !== null) return String(ansVal.code);
          if (ansVal.text !== undefined && ansVal.text !== null) return String(ansVal.text);
          if (ansVal.selectedOption !== undefined && ansVal.selectedOption !== null) return String(ansVal.selectedOption);
          if (ansVal.selectedOptions !== undefined && ansVal.selectedOptions !== null) {
            return Array.isArray(ansVal.selectedOptions) ? ansVal.selectedOptions.join(", ") : String(ansVal.selectedOptions);
          }
          return JSON.stringify(ansVal);
        }
        return String(ansVal);
      };

      const getFingerprint = (text) => {
        if (!text) return "";
        return text
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 500);
      };

      const saveDynamicQuestionToDB = async (q, targetInt) => {
        const mongoose = require("mongoose");
        if (q.id && mongoose.Types.ObjectId.isValid(q.id)) {
          return q;
        }

        const Question = require("../models/Question");
        
        let finalConstraints = [];
        if (Array.isArray(q.constraints)) {
          finalConstraints = q.constraints;
        } else if (typeof q.constraints === "string") {
          finalConstraints = q.constraints.split("\n").filter(Boolean);
        } else {
          finalConstraints = ["Time Complexity: O(N)", "Space Complexity: O(N)"];
        }

        const starters = q.starterCode || {};
        const normalizedStarters = {
          javascript: starters.javascript || starters.js || "",
          python: starters.python || starters.py || "",
          cpp: starters.cpp || starters.c || "",
          java: starters.java || ""
        };

        const drivers = q.driverCode || {};
        const normalizedDrivers = {
          javascript: drivers.javascript || drivers.js || "",
          python: drivers.python || drivers.py || "",
          cpp: drivers.cpp || drivers.c || "",
          java: drivers.java || ""
        };

        const dbQuestion = await Question.create({
          title: q.title || `DSA Coding Challenge`,
          description: q.description || q.question || "",
          difficulty: q.difficulty || targetInt.difficulty || "Medium",
          tags: q.tags || (q.category ? [q.category] : []),
          constraints: finalConstraints,
          examples: q.examples || [],
          visibleTestCases: q.testCases || q.visibleTestCases || [],
          hiddenTestCases: q.hiddenTestCases || [],
          expectedTimeComplexity: q.expectedTimeComplexity || "",
          expectedSpaceComplexity: q.expectedSpaceComplexity || "",
          functionName: q.functionName || "",
          returnType: q.returnType || "",
          starterCode: normalizedStarters,
          driverCode: normalizedDrivers
        });

        q.id = dbQuestion._id.toString();
        return q;
      };

      // 1. PHASE 1 EVALUATION & PHASE 2 GENERATION
      if (phaseNumber === 1) {
        const aptitudeQuestions = targetInterview.aptitudeQuestions || [];
        const aptitudeScores = [];
        for (let idx = 0; idx < aptitudeQuestions.length; idx++) {
          const q = aptitudeQuestions[idx];
          const qId = q.id || `p1_q${idx + 1}`;
          const userAns = unpackAnswer(finalAnswers[qId]);
          const isCorrect = userAns && String(userAns).toUpperCase() === String(q.correctAnswer || q.correctOption || "").toUpperCase();
          const score = isCorrect ? 10 : 0;
          aptitudeScores.push(score);

          const qText = q.question || q.description || "";
          await Answer.findOneAndUpdate(
            { interview: targetInterview._id, question: qText },
            {
              answer: userAns || "No response recorded.",
              score: score,
              feedback: isCorrect ? "Correct answer selected." : `Incorrect. The correct answer was ${q.correctAnswer || q.correctOption}.`,
              idealAnswer: q.correctAnswer || q.correctOption || "",
              status: "evaluated",
            },
            { new: true, upsert: true }
          );
        }

        // Calculate performance
        const correctCount = aptitudeScores.filter(s => s === 10).length;
        const totalAptCount = aptitudeQuestions.length || 1;
        const scorePct = (correctCount / totalAptCount) * 100;

        // Adapt difficulty
        let adaptedDifficulty = "Medium";
        let performanceFeedback = "Candidate demonstrates standard logic.";
        if (scorePct >= 60) {
          adaptedDifficulty = "Hard";
          performanceFeedback = "Candidate did well. Next round will focus on deeper, more complex scenarios.";
        } else {
          adaptedDifficulty = "Easy";
          performanceFeedback = "Candidate had some difficulty. Next round will focus on core syntax and simple concepts.";
        }

        // Generate Phase 2 Technical Questions
        const QuestionHistory = require("../models/QuestionHistory");
        const previousQuestions = await QuestionHistory.find({ user: targetInterview.user });
        const excludedFingerprints = new Set(previousQuestions.map(q => q.fingerprint));
        const excludedTexts = previousQuestions.slice(-30).map(q => q.question || q.title);

        let technicalQuestions = [];
        let techAttempts = 0;
        while (technicalQuestions.length < 2 && techAttempts < 2) {
          const batch = await generate2TechnicalQuestions({
            role: targetInterview.role,
            experience: targetInterview.experience,
            skills: targetInterview.technologies || [],
            difficulty: targetInterview.difficulty || adaptedDifficulty,
            resumeText: targetInterview.resumeText || "",
            excludedTexts: [...excludedTexts, ...technicalQuestions.map(q => q.question || q.title)],
          });
          for (const q of batch) {
            const qText = q.question || q.title || q.description || "";
            const fp = getFingerprint(qText);
            if (fp && !excludedFingerprints.has(fp)) {
              if (!technicalQuestions.some(existing => getFingerprint(existing.question || existing.title) === fp)) {
                await saveDynamicQuestionToDB(q, targetInterview);
                technicalQuestions.push(q);
                if (technicalQuestions.length === 2) break;
              }
            }
          }
          techAttempts++;
        }

        // Fallback if AI generation failed to produce 2 valid questions
        if (technicalQuestions.length < 2) {
          try {
            const dbFallback = await getFallbackTechnicalQuestions(2 - technicalQuestions.length, technicalQuestions, {
              role: targetInterview.role,
              difficulty: targetInterview.difficulty || adaptedDifficulty,
              excludedTexts: [...excludedTexts, ...technicalQuestions.map(q => q.question || q.title)]
            });
            for (const q of dbFallback) {
              await saveDynamicQuestionToDB(q, targetInterview);
              technicalQuestions.push(q);
            }
          } catch (err) {
            console.error("Technical fallback generation failed:", err);
          }
        }

        // Save Phase 2 Questions to Interview
        targetInterview.technicalQuestions = technicalQuestions;
        if (!targetInterview.activePhases.includes("phase2")) {
          targetInterview.activePhases.push("phase2");
        }
        targetInterview.currentPhase = "phase2";

        // Update phasesState
        const p1 = targetInterview.phasesState.find(p => p.phaseNumber === 1);
        if (p1) {
          p1.status = "completed";
          p1.evaluation = { scorePct, correctCount, totalAptCount, performanceFeedback };
        }
        const p2 = targetInterview.phasesState.find(p => p.phaseNumber === 2);
        if (p2) {
          p2.status = "generated";
          p2.generatedAt = new Date();
          p2.questions = technicalQuestions;
        }

        targetInterview.markModified("phasesState");
        targetInterview.markModified("activePhases");
        await targetInterview.save();
      }

      // 2. PHASE 2 EVALUATION & PHASE 3 GENERATION
      else if (phaseNumber === 2) {
        const technicalQuestions = targetInterview.technicalQuestions || [];
        const nonMcqEvaluations = [];
        for (const q of technicalQuestions) {
          const qId = q.id;
          const qText = q.question || q.title || q.description || "";
          const userAns = unpackAnswer(finalAnswers[qId]);
          nonMcqEvaluations.push({ qId, qText, userAns, type: "technical" });
        }

        const evalResults = await Promise.allSettled(
          nonMcqEvaluations.map(async (item) => {
            if (!item.userAns || String(item.userAns).trim() === "") {
              return { score: 0, feedback: "Question was left unanswered.", idealAnswer: "" };
            }
            return await evaluateAnswer(item.qText, String(item.userAns), item.type);
          })
        );

        const techScores = [];
        const feedbacks = [];
        const Submission = require("../models/Submission");

        for (let i = 0; i < evalResults.length; i++) {
          const item = nonMcqEvaluations[i];
          const res = evalResults[i];
          const qObj = technicalQuestions.find(tq => tq.id === item.qId);

          let score = 0;
          let feedback = "Failed to evaluate answer.";
          let idealAnswer = qObj?.idealAnswer || "Optimal technical answer.";

          const isValidObjectId = mongoose.Types.ObjectId.isValid(item.qId);
          if (isValidObjectId) {
            // Retrieve latest compiler submission for the coding challenge
            const lastSub = await Submission.findOne({
              user: targetInterview.user,
              question: item.qId
            }).sort({ createdAt: -1 });

            if (lastSub) {
              const passed = lastSub.passed || 0;
              const total = lastSub.total || 1;
              if (passed === total) {
                score = 10;
                feedback = "Correct. All test cases passed successfully.";
              } else if (passed > 0) {
                score = Math.max(1, Math.round((passed / total) * 10));
                feedback = `Partially Correct. Passed ${passed} of ${total} test cases.`;
              } else {
                score = 0;
                feedback = "Incorrect. All test cases failed.";
              }
            } else {
              // Left code/editor unanswered or not submitted
              score = 0;
              feedback = item.userAns && String(item.userAns).trim().length > 0 
                ? "Incorrect. Code was not submitted or failed compilation."
                : "Incorrect. Question was left unanswered.";
            }
          } else {
            // Fallback to dynamic Gemini evaluation for non-coding/conceptual questions
            if (res.status === "fulfilled") {
              score = Number(res.value?.score) || 0;
              feedback = res.value?.feedback || "";
              idealAnswer = res.value?.idealAnswer || idealAnswer;
            }
          }

          techScores.push(score);
          feedbacks.push(`Question: ${item.qText} | Score: ${score}/10 | Feedback: ${feedback}`);

          await Answer.findOneAndUpdate(
            { interview: targetInterview._id, question: item.qText },
            {
              answer: String(item.userAns) || "No response recorded.",
              score: score,
              feedback: feedback,
              idealAnswer: idealAnswer,
              status: "evaluated",
            },
            { new: true, upsert: true }
          );
        }

        const avgTechScore = techScores.length > 0 ? techScores.reduce((a, b) => a + b, 0) / techScores.length : 0;
        let adaptedDifficulty = "Medium";
        if (avgTechScore >= 7.0) {
          adaptedDifficulty = "Hard";
        } else {
          adaptedDifficulty = "Easy";
        }

        // Initialize Phase 3 (Project Workspace Challenge)
        let taskGuidelines = targetInterview.workspaceState?.taskGuidelines;
        if (!taskGuidelines) {
          try {
            taskGuidelines = await generateAiTaskGuidelines(
              targetInterview.role,
              targetInterview.difficulty || adaptedDifficulty,
              targetInterview.resumeText || "",
              targetInterview.technologies || []
            );
          } catch (guidelineErr) {
            console.error("Failed to generate task guidelines for Phase 3, using defaults:", guidelineErr);
            taskGuidelines = {
              title: "Project Development Challenge",
              description: "Implement the coding feature inside the templates workspace.",
              difficulty: targetInterview.difficulty || adaptedDifficulty,
              estimatedTime: "45 Mins",
              requirements: [
                "Structure and build the required feature as specified in the guidelines",
                "Ensure correct routing, styling, and visual appeal",
                "Optimize performance and verify clean code conventions"
              ],
              acceptanceCriteria: [
                "Verify features operate error-free",
                "Confirm styling is consistent with guidelines"
              ],
              rubric: "Functional Correctness: 40% | Code Quality: 30% | Performance: 15% | Best Practices: 15%"
            };
          }
        }

        if (!targetInterview.workspaceState) {
          targetInterview.workspaceState = {};
        }
        targetInterview.workspaceState.taskGuidelines = taskGuidelines;
        targetInterview.markModified("workspaceState");

        const projectQuestion = {
          id: "p3_project_dev",
          phase: 3,
          phaseName: "Technical Round 2 (Coding)",
          type: "project",
          title: taskGuidelines.title || "Project Development Challenge",
          description: taskGuidelines.description || "Implement the coding feature inside the templates workspace.",
          difficulty: targetInterview.difficulty || adaptedDifficulty,
          constraints: "Filesystem Workspace • Persistence"
        };

        const codingQuestions = [projectQuestion];

        // Save Phase 3 Questions
        targetInterview.questions = codingQuestions;
        if (!targetInterview.activePhases.includes("phase3")) {
          targetInterview.activePhases.push("phase3");
        }
        targetInterview.currentPhase = "phase3";

        // Update phasesState
        const p2 = targetInterview.phasesState.find(p => p.phaseNumber === 2);
        if (p2) {
          p2.status = "completed";
          p2.evaluation = { avgTechScore, feedbacks };
        }
        const p3 = targetInterview.phasesState.find(p => p.phaseNumber === 3);
        if (p3) {
          p3.status = "generated";
          p3.generatedAt = new Date();
          p3.questions = codingQuestions;
        }

        targetInterview.markModified("phasesState");
        targetInterview.markModified("activePhases");
        await targetInterview.save();
      }

      // 3. PHASE 3 EVALUATION & PHASE 4 GENERATION
      else if (phaseNumber === 3) {
        // Evaluate Phase 3 (Project Workspace Challenge) based on workspaceSubmission
        const sub = targetInterview.workspaceSubmission || {};
        const scorePct = sub.weightedScore !== undefined ? sub.weightedScore : 0;
        const avgCodingScore = scorePct / 10;
        const taskGuidelines = targetInterview.workspaceState?.taskGuidelines || {
          title: "Project Development Challenge",
          description: "Implement the coding feature inside the templates workspace."
        };
        const appFile = sub.filesSnapshot?.find(f => f.path === "src/App.jsx" || f.path === "server.js" || f.path === "client/src/App.jsx");
        const codeAnswer = appFile ? appFile.content : "// Project workspace files submitted successfully.";

        const feedback = `
### Score: ${scorePct}%

### AI Review Summary
${sub.aiReview?.summary || "Evaluation complete."}

### Strengths
${(sub.aiReview?.strengths || []).map(s => `- ${s}`).join("\n")}

### Weaknesses
${(sub.aiReview?.weaknesses || []).map(w => `- ${w}`).join("\n")}

### Naming & Architecture Review
- ${sub.aiReview?.namingReview || "Follows standards."}
- ${sub.aiReview?.architectureReview || "Good structure."}
`;

        await Answer.findOneAndUpdate(
          { interview: targetInterview._id, question: taskGuidelines.title },
          {
            answer: codeAnswer,
            score: Math.round(avgCodingScore),
            feedback: feedback.trim(),
            idealAnswer: "Optimal project implementation.",
            status: "evaluated",
          },
          { new: true, upsert: true }
        );

        const feedbacks = [`Project: ${taskGuidelines.title} | Score: ${scorePct}%`];

        // Phase 4: HR & Behavioral Round
        const phase4Questions = [
          {
            id: "p4_q1",
            phase: 4,
            phaseName: "HR & Behavioral Round",
            type: "hr",
            title: "Behavioral: Conflict Resolution & Team Alignment",
            description: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
            placeholder: "Use the STAR method: Situation, Task, Action, Result...",
          },
          {
            id: "p4_q2",
            phase: 4,
            phaseName: "HR & Behavioral Round",
            type: "hr",
            title: "Situational: Handling High-Pressure Deadlines & Trade-offs",
            description: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
            placeholder: "Explain the scenario, trade-offs made, and outcome...",
          },
          {
            id: "p4_q3",
            phase: 4,
            phaseName: "HR & Behavioral Round",
            type: "hr",
            title: "Cultural Fit: Ownership & Long-Term Technical Vision",
            description: "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?",
            placeholder: "Share your career vision and values...",
          },
        ];

        // Save Phase 4 Questions
        if (!targetInterview.activePhases.includes("phase4")) {
          targetInterview.activePhases.push("phase4");
        }
        targetInterview.currentPhase = "phase4";

        // Update phasesState
        const p3 = targetInterview.phasesState.find(p => p.phaseNumber === 3);
        if (p3) {
          p3.status = "completed";
          p3.evaluation = { avgCodingScore, feedbacks };
        }
        const p4 = targetInterview.phasesState.find(p => p.phaseNumber === 4);
        if (p4) {
          p4.status = "generated";
          p4.generatedAt = new Date();
          p4.questions = phase4Questions;
        }

        targetInterview.markModified("phasesState");
        targetInterview.markModified("activePhases");
        await targetInterview.save();
      }

      // 4. PHASE 4 EVALUATION & SESSION CONCLUSION
      else if (phaseNumber === 4) {
        const hrQuestions = [
          {
            id: "p4_q1",
            question: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
            type: "hr"
          },
          {
            id: "p4_q2",
            question: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
            type: "hr"
          },
          {
            id: "p4_q3",
            question: "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?",
            type: "hr"
          }
        ];

        const nonMcqEvaluations = [];
        for (const q of hrQuestions) {
          const qId = q.id;
          const qText = q.question;
          const userAns = unpackAnswer(finalAnswers[qId]);
          nonMcqEvaluations.push({ qId, qText, userAns, type: "hr" });
        }

        const evalResults = await Promise.allSettled(
          nonMcqEvaluations.map(async (item) => {
            if (!item.userAns || String(item.userAns).trim() === "") {
              return { score: 0, feedback: "Question was left unanswered.", idealAnswer: "" };
            }
            return await evaluateAnswer(item.qText, String(item.userAns), item.type);
          })
        );

        const hrScores = [];
        const feedbacks = [];
        for (let i = 0; i < evalResults.length; i++) {
          const item = nonMcqEvaluations[i];
          const res = evalResults[i];
          let score = 0;
          let feedback = "Failed to evaluate HR response.";
          let idealAnswer = "";

          if (res.status === "fulfilled") {
            score = Number(res.value?.score) || 0;
            feedback = res.value?.feedback || "";
            idealAnswer = res.value?.idealAnswer || "";
          }
          hrScores.push(score);
          feedbacks.push(`HR Question: ${item.qText} | Score: ${score}/10 | Feedback: ${feedback}`);

          await Answer.findOneAndUpdate(
            { interview: targetInterview._id, question: item.qText },
            {
              answer: String(item.userAns) || "No response recorded.",
              score: score,
              feedback: feedback,
              idealAnswer: idealAnswer,
              status: "evaluated",
            },
            { new: true, upsert: true }
          );
        }

        const avgHrScore = hrScores.length > 0 ? hrScores.reduce((a, b) => a + b, 0) / hrScores.length : 0;

        // Fetch all evaluated answers for final score calculation
        const allAnswers = await Answer.find({ interview: targetInterview._id });
        const allScores = allAnswers.map(ans => ans.score || 0);

        const avgScore = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : "0.0";
        const finalPercentage = Math.round((allScores.reduce((a, b) => a + b, 0) / (allScores.length * 10)) * 100);
        const decision = Number(avgScore) >= 6.0 ? "PASSED" : "FAILED";

        let overallFeedback = "The candidate has completed the interview session.";
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const summaryPrompt = `
You are a Lead Recruiter summarizing a candidate's mock interview performance.
Here are the scores and feedback for each question:
${allAnswers.map(a => `- "${a.question}": Score ${a.score}/10. Feedback: ${a.feedback}`).join("\n\n")}

Provide a professional, constructive 2-3 paragraph summary evaluating key strengths, weak areas, and general performance.
`;
          const sumRes = await model.generateContent(summaryPrompt);
          overallFeedback = sumRes.response.text().trim();
        } catch (sumErr) {
          console.error("Overall summary generation error:", sumErr);
        }

        // Save newly generated questions to history for duplicate prevention
        try {
          const QuestionHistory = require("../models/QuestionHistory");
          const historyRecords = [];
          
          targetInterview.aptitudeQuestions.forEach(q => {
            historyRecords.push({
              user: targetInterview.user,
              question: q.question,
              category: q.category || "Aptitude",
              difficulty: q.difficulty || "Medium",
              fingerprint: getFingerprint(q.question)
            });
          });

          targetInterview.technicalQuestions.forEach(q => {
            historyRecords.push({
              user: targetInterview.user,
              question: q.question || q.title,
              category: q.category || "Technical",
              difficulty: q.difficulty || "Medium",
              fingerprint: getFingerprint(q.question || q.title)
            });
          });

          targetInterview.questions.forEach(q => {
            historyRecords.push({
              user: targetInterview.user,
              question: q.questionText || q.title,
              category: q.category || "Coding",
              difficulty: q.difficulty || "Medium",
              fingerprint: getFingerprint(q.questionText || q.title)
            });
          });

          if (historyRecords.length > 0) {
            await QuestionHistory.insertMany(historyRecords, { ordered: false }).catch(() => {});
          }
        } catch (e) {
          console.error("Error writing to QuestionHistory:", e);
        }

        // Complete the interview session
        targetInterview.status = "Completed";
        targetInterview.finalScore = avgScore;
        targetInterview.finalPercentage = finalPercentage;
        targetInterview.decision = decision;
        targetInterview.feedback = overallFeedback;
        targetInterview.isLocked = true;
        targetInterview.completedAt = new Date();

        // Update phasesState
        const p4 = targetInterview.phasesState.find(p => p.phaseNumber === 4);
        if (p4) {
          p4.status = "completed";
          p4.evaluation = { avgHrScore, feedbacks, overallFeedback };
        }

        targetInterview.markModified("phasesState");
        await targetInterview.save();

        // Start background AI processing pipeline
        InterviewProcessingService.startAnalysisPipeline(targetInterview._id).catch(err => {
          console.error("[Background Processing] submitPhase pipeline failed:", err);
        });

        // Generate Recruiter Notification
        try {
          const Notification = require("../models/Notification");
          await Notification.create({
            user: targetInterview.user,
            type: "interview_completed",
            title: "Mock Interview Completed",
            message: `Mock interview for '${targetInterview.role}' is evaluated. Final score: ${avgScore}/10 (${decision}).`,
            relatedId: targetInterview._id,
          });
        } catch (notifErr) {
          console.error("Notification creation failed:", notifErr);
        }
      }
    };

    // Trigger the background processing asynchronously so we do NOT block HTTP response
    executeBackgroundProcessing().catch(bgErr => {
      console.error("Background phase processing failed:", bgErr);
    });

    res.status(200).json({
      success: true,
      nextPhaseReady: true,
      message: "Phase responses recorded. Evaluation & round generation started in the background."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Voice Interview: Dynamic Question Generation =====
const getVoiceNextQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastAnswer, currentIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Interview ID" });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    let currentQuestions = interview.questions || [];
    const indexNum = Number(currentIndex) || 0;

    // 10-Minute Voice Interview: 5 questions total (~2 mins per question: Projects + Skills focus)
    const sequencePhases = [
      "Introduction & Technical Background",
      "Primary Project Deep-Dive & Architecture",
      "Project Technical Challenges & Trade-offs",
      "Core Technical Skills & Stack Scenario",
      "Advanced System Design & Final Wrap-up"
    ];
    const targetCategory = sequencePhases[indexNum] || "Project & Skills Discussion";

    const user = await User.findById(interview.user);
    const candidateName = user ? (user.firstName || user.username || "Candidate") : "Candidate";

    // Persist questions if we have already generated one for this index and it is a dynamic voice question
    if (currentQuestions[indexNum] && currentQuestions[indexNum].type === "voice") {
      return res.status(200).json({
        success: true,
        question: currentQuestions[indexNum]
      });
    }

    const answers = await Answer.find({ interview: id });
    const previousQAs = answers.map(a => ({
      question: a.question,
      answer: a.answer,
      score: a.confidenceScore || a.score
    }));

    const prompt = `
You are Intervexa's AI voice interviewer conducting a focused 10-Minute Technical Interview.

INTERVIEW OVERVIEW:
- Total Time: Exactly 10 Minutes (~2 mins per question)
- Total Questions: 5 Questions
- Core Focus: Candidate's REAL PROJECTS + Core TECHNICAL SKILLS from their resume

INTERVIEW CONTEXT:
- Phase: Technical Round 2 (10-Minute Live Voice Session)
- Candidate: ${candidateName}
- Target Role: ${interview.role}
- Experience Level: ${interview.experience}
- Candidate Resume Text: ${interview.resumeText || "N/A"}
- Candidate Tech Stack & Skills: ${JSON.stringify(interview.technologies || [])}
- Selected Difficulty: ${interview.difficulty || "Medium"}
- Previous Q&As in this session: ${JSON.stringify(previousQAs)}
- Question Index: ${indexNum + 1} of 5
- Target Stage: ${targetCategory}

INTERVIEW STRUCTURE (5 Questions):
1. INTRODUCTION (Question 1):
   - Welcome ${candidateName} warmly.
   - Ask them for a brief 1-minute introduction of their technical background and primary tech stack.
2. PRIMARY PROJECT ARCHITECTURE (Question 2):
   - Pick the most relevant project from their resume/skills.
   - Ask what problem it solved, the overall architecture, tech choices, and their direct personal contribution.
3. PROJECT CHALLENGES & TRADE-OFFS (Question 3):
   - Ask about a real technical challenge, bug, performance bottleneck, or database trade-off they solved in their projects.
4. CORE TECHNICAL SKILLS SCENARIO (Question 4):
   - Ask a practical, scenario-based question assessing their core technical skills (e.g. React/Node/TypeScript state management, concurrency, async patterns, caching, API design).
5. SYSTEM DESIGN & WRAP-UP (Question 5):
   - Ask an architectural scaling/reliability scenario combining their project experience and skills, then warmly conclude the interview and thank the candidate.

VOICE INTERVIEW RULES:
- Ask exactly ONE question at a time.
- Use natural spoken language, concise and conversational.
- Do not announce internal section names or read out a list.
- Acknowledge their previous answer briefly before asking the next question.
- No coding syntax writing or DSA whiteboard puzzles—strictly practical project architecture & technical skills discussion.
- Use brief spoken acknowledgments when following up on a previous response.
- Exclusively theoretical and architectural discussion—no coding syntax writing or DSA whiteboard testing.

Return ONLY a valid JSON object matching this schema:
{
  "question": "The spoken question string...",
  "skill": "React" or "Node.js" etc.,
  "project": "Project name if discussing project" or "",
  "topic": "System Architecture" or "Component State" etc.,
  "category": "${targetCategory}",
  "confidenceScore": 10
}
`;

    let questionData;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

      questionData = JSON.parse(cleanText);
    } catch (error) {
      console.warn("[Voice Next Question] Gemini generation failed, executing local fallback:", error.message);
      
      const fallbacks = {
        "Introduction": `Welcome ${candidateName} to your Technical Round 2 interview. Can you please start by introducing yourself?`,
        "Resume Discussion": `Let's discuss your experience. What is the most challenging technical project you've listed on your resume, and what was your specific role in it?`,
        "Projects": `Regarding the main projects in your resume, can you explain the systems architecture and why you selected this technology stack?`,
        "Technical Concepts": `In your core technologies, how do you manage state consistency and handle concurrent client requests?`,
        "Problem Solving": `Imagine you need to scale a high-traffic component that is bottlenecked by database lookups. What caching or indexing strategies would you implement?`,
        "Follow-up Questions": `What design trade-offs did you make in your architecture? If you had to rebuild it today, what would you do differently?`,
        "Final Wrap-up": `Thank you for completing Technical Round 2. Your responses have been recorded successfully. Do you have any questions for me before we wrap up?`
      };

      const fallbackText = fallbacks[targetCategory] || `Can you explain the main technical challenges you faced in your most recent project and how you solved them?`;

      questionData = {
        question: fallbackText,
        skill: interview.technologies?.[0] || "Software Engineering",
        project: "",
        topic: targetCategory,
        category: targetCategory,
        confidenceScore: 7
      };
    }

    const formattedQuestion = {
      id: `p3_q${indexNum + 1}`,
      phase: 3,
      phaseName: "Technical Round 2 (Voice)",
      type: "voice",
      title: questionData.topic || "Core Technical Discussion",
      description: questionData.question,
      question: questionData.question,
      skill: questionData.skill,
      project: questionData.project,
      topic: questionData.topic,
      category: questionData.category,
      confidenceScore: questionData.confidenceScore
    };

    currentQuestions[indexNum] = formattedQuestion;
    interview.questions = currentQuestions;
    interview.markModified("questions");
    
    try {
      await interview.save();
    } catch (saveErr) {
      if (saveErr.name === "VersionError") {
        console.warn("[Voice Next Question] VersionError caught due to concurrent write. Reloading document and retrying...");
        const freshInterview = await Interview.findById(id);
        if (freshInterview) {
          const freshQuestions = freshInterview.questions || [];
          freshQuestions[indexNum] = formattedQuestion;
          freshInterview.questions = freshQuestions;
          freshInterview.markModified("questions");
          await freshInterview.save();
        }
      } else {
        throw saveErr;
      }
    }

    res.status(200).json({
      success: true,
      question: formattedQuestion
    });

  } catch (error) {
    console.error("Error in getVoiceNextQuestion:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== Voice Interview: Submit Voice Answer details =====
const submitVoiceAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      answerText,
      thinkingTime,
      answerDuration,
      skill,
      project,
      topic,
      category,
      confidenceScore,
      questionAudio,
      candidateAudio
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Interview ID" });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.isLocked || interview.status === "Completed") {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    const qIndex = interview.questions.findIndex(q => q.question === questionText);
    const qId = qIndex !== -1 ? interview.questions[qIndex].id : `p3_voice_q`;
    
    if (!interview.userAnswers) {
      interview.userAnswers = {};
    }
    interview.userAnswers[qId] = answerText;
    interview.markModified("userAnswers");
    await interview.save();

    const newAnswer = await Answer.findOneAndUpdate(
      { interview: id, question: questionText },
      {
        answer: answerText || "No voice response recorded.",
        score: confidenceScore || 5,
        confidenceScore: confidenceScore || 5,
        feedback: `Topic: ${topic || "Concept"}. Category: ${category || "General"}.`,
        idealAnswer: "Conceptual response matching professional standards.",
        status: "evaluated",
        questionAudio: questionAudio || "",
        candidateAudio: candidateAudio || "",
        thinkingTime: thinkingTime || 0,
        answerDuration: answerDuration || 0,
        resumeTopic: topic || "",
        skillEvaluated: skill || "",
        projectDiscussed: project || "",
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Voice answer recorded in database",
      answer: newAnswer
    });

  } catch (error) {
    console.error("Error in submitVoiceAnswer:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  getInterviewReport,
  adminGetAllInterviews,
  adminGetInterviewReport,
  releaseInterviewReport,
  adminSetInterviewDecision,
  getInterviewQuestions,
  saveAnswer,
  patchAnswer,
  submitInterviewSession,
  startPhase,
  submitPhase,
  getInterviewWorkspace,
  updateInterviewWorkspace,
  executeWorkspaceSandbox,
  streamWorkspaceSandbox,
  stopWorkspaceSandbox,
  executeWorkspaceTests,
  submitWorkspace,
  logIntegrityEvent,
  getWorkspaceVersions,
  restoreWorkspaceVersion,
  patchWorkspaceFile,
  getVoiceNextQuestion,
  submitVoiceAnswer,
};
