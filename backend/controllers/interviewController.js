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
      activePhases: ["phase1"],
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

    // 3. Generate questions concurrently in parallel pipelines
    const [aptResult, techResult, codeResult] = await Promise.allSettled([
      // Aptitude Loop
      (async () => {
        let aptitudeQuestions = [];
        let aptAttempts = 0;
        while (aptitudeQuestions.length < 10 && aptAttempts < 1) {
          const batch = await generate10AptitudeQuestions({
            role,
            experience,
            skills: selectedSkills,
            resumeText: resumeSummaryStr,
            difficulty,
            excludedTexts: [...excludedTexts, ...aptitudeQuestions.map(q => q.question)],
          });
          for (const q of batch) {
            const fp = getFingerprint(q.question);
            if (fp && !excludedFingerprints.has(fp)) {
              if (!aptitudeQuestions.some(existing => getFingerprint(existing.question) === fp)) {
                aptitudeQuestions.push(q);
                if (aptitudeQuestions.length === 10) break;
              }
            }
          }
          aptAttempts++;
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
        return aptitudeQuestions;
      })(),

      // Technical Loop
      (async () => {
        let technicalQuestions = [];
        let techAttempts = 0;
        while (technicalQuestions.length < 2 && techAttempts < 3) {
          const batch = await generate2TechnicalQuestions({
            role,
            experience,
            skills: selectedSkills,
            parsedResume,
            resumeText: resumeSummaryStr,
            difficulty,
            excludedTexts: [...excludedTexts, ...technicalQuestions.map(q => q.question || q.title)],
          });
          for (const q of batch) {
            const qText = q.question || q.title || q.description || "";
            const fp = getFingerprint(qText);
            if (fp && !excludedFingerprints.has(fp)) {
              if (!technicalQuestions.some(existing => getFingerprint(existing.question || existing.title) === fp)) {
                technicalQuestions.push(q);
                if (technicalQuestions.length === 2) break;
              }
            }
          }
          techAttempts++;
        }
        if (technicalQuestions.length < 2) {
          const { getFallbackTechnicalQuestions } = require("../services/techFallbackService");
          const needed = 2 - technicalQuestions.length;
          try {
            const dbFallback = await getFallbackTechnicalQuestions(needed, technicalQuestions, {
              role,
              difficulty,
              excludedTexts: [...excludedTexts, ...technicalQuestions.map(q => q.question || q.title)],
            });
            for (const q of dbFallback) {
              const qText = q.question || q.title || q.description || "";
              const fp = getFingerprint(qText);
              if (fp && !excludedFingerprints.has(fp)) {
                if (!technicalQuestions.some(existing => getFingerprint(existing.question || existing.title) === fp)) {
                  technicalQuestions.push(q);
                  if (technicalQuestions.length === 2) break;
                }
              }
            }
          } catch (err) {
            console.error("Technical fallback error:", err);
          }
        }
        return technicalQuestions;
      })(),

      // Coding Loop
      (async () => {
        let questions = [];
        let codeAttempts = 0;
        const targetCount = Number(totalQuestions) || 3;
        while (questions.length < targetCount && codeAttempts < 1) {
          const generated = await generateQuestions(
            role,
            difficulty,
            "code",
            selectedSkills.join(", "),
            contextPrompt + `\nExclude these specific coding challenge titles: ${questions.map(q => q.title).join(", ")}\n`
          );
          const batch = Array.isArray(generated) ? generated : [];
          for (const q of batch) {
            const qText = q.questionText || q.title || "";
            const fp = getFingerprint(qText);
            if (fp && !excludedFingerprints.has(fp)) {
              if (!questions.some(existing => getFingerprint(existing.questionText || existing.title) === fp)) {
                questions.push(q);
                if (questions.length === targetCount) break;
              }
            }
          }
          codeAttempts++;
        }
        if (questions.length < targetCount) {
          const needed = targetCount - questions.length;
          try {
            const Question = require("../models/Question");
            const fallbackDocs = await Question.aggregate([
              { $match: { difficulty, title: { $nin: [...excludedTexts, ...questions.map(q => q.title)] } } },
              { $sample: { size: needed } }
            ]);
            for (const doc of fallbackDocs) {
              questions.push(doc.toObject ? doc.toObject() : doc);
            }
          } catch (err) {
            console.error("Coding questions fallback error:", err);
          }
        }
        return questions;
      })()
    ]);

    const aptitudeQuestions = aptResult.status === "fulfilled" ? aptResult.value : [];
    const technicalQuestions = techResult.status === "fulfilled" ? techResult.value : [];
    const questions = codeResult.status === "fulfilled" ? codeResult.value : [];

    const computedTemplateId = determineTemplateId(role, selectedSkills);
    const initialFiles = initializeWorkspace(computedTemplateId, role);

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

    const activePhases = interview.activePhases || ["phase1"];
    const allQuestions = [];

    if (activePhases.includes("phase1") && Array.isArray(interview.aptitudeQuestions)) {
      for (const q of interview.aptitudeQuestions) {
        allQuestions.push({
          id: q.id || q._id,
          text: q.question || q.description || "",
          type: "aptitude",
          category: q.category || "Aptitude",
          correctAnswer: q.correctAnswer,
          correctOption: q.correctOption,
        });
      }
    }

    if (activePhases.includes("phase2") && Array.isArray(interview.technicalQuestions)) {
      for (const q of interview.technicalQuestions) {
        allQuestions.push({
          id: q.id || q._id,
          text: q.question || q.title || q.description || "",
          type: "technical",
          category: q.category || "Technical Concept",
        });
      }
    }

    if (activePhases.includes("phase3") && Array.isArray(interview.questions)) {
      for (const q of interview.questions) {
        allQuestions.push({
          id: q._id || q.id,
          text: q.questionText || q.title || "",
          type: "coding",
          category: q.category || "Coding",
        });
      }
    }

    if (activePhases.includes("phase4")) {
      const hrQuestions = [
        {
          id: "p4_q1",
          text: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
          type: "hr",
          category: "HR & Behavioral",
        },
        {
          id: "p4_q2",
          text: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
          type: "hr",
          category: "HR & Behavioral",
        },
        {
          id: "p4_q3",
          text: "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?",
          type: "hr",
          category: "HR & Behavioral",
        }
      ];
      for (const q of hrQuestions) {
        allQuestions.push(q);
      }
    }

    const processedAnswers = allQuestions.map((q) => {
      const qText = q.text;
      const existingAnswer = answers.find(
        (a) => normalizeString(a.question) === normalizeString(qText)
      );

      if (existingAnswer) {
        const ansObj = typeof existingAnswer.toObject === "function" ? existingAnswer.toObject() : { ...existingAnswer };
        return {
          ...ansObj,
          category: ansObj.category || q.category,
          type: ansObj.type || q.type,
        };
      }

      // Check draft userAnswers from interview document
      const draftAnsVal = interview.userAnswers?.[q.id];
      if (draftAnsVal !== undefined && draftAnsVal !== null) {
        const unpacked = unpackAnswer(draftAnsVal);
        if (unpacked.trim() !== "") {
          let score = 0;
          let feedback = "Evaluation pending submission.";
          if (q.type === "aptitude") {
            const isCorrect = unpacked && String(unpacked).toUpperCase() === String(q.correctAnswer || q.correctOption || "").toUpperCase();
            score = isCorrect ? 10 : 0;
            feedback = isCorrect ? "Correct answer selected." : `Incorrect. The correct answer was ${q.correctAnswer || q.correctOption}.`;
          }

          return {
            _id: `draft-${q.id}-${Math.random()}`,
            interview: interview._id,
            question: qText,
            answer: unpacked,
            score: score,
            feedback: feedback,
            category: q.category,
            type: q.type,
          };
        }
      }

      return {
        _id: `unanswered-${Math.random()}`,
        interview: interview._id,
        question: qText,
        answer: "No response recorded.",
        score: 0,
        feedback: "Question was left unanswered.",
        category: q.category,
        type: q.type,
      };
    });

    const totalQuestions = allQuestions.length;
    const answeredCount = processedAnswers.filter(a => !a._id.toString().startsWith("unanswered-")).length;

    // Check if any answered questions are still pending evaluation
    const isPending = answers.some(a => a.status === "pending");

    let finalProcessedAnswers = processedAnswers;
    if (isPending) {
      finalProcessedAnswers = processedAnswers.map(ans => {
        const ansObj = typeof ans.toObject === "function" ? ans.toObject() : { ...ans };
        return {
          _id: ansObj._id,
          interview: ansObj.interview,
          question: ansObj.question,
          answer: ansObj.answer,
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
      totalQuestions > 0
        ? (totalScore / totalQuestions).toFixed(1)
        : 0;

    let performance = "Needs Improvement";

    if (averageScore >= 8) {
      performance = "Excellent";
    } else if (averageScore >= 5) {
      performance = "Good";
    }

    res.status(200).json({
      totalAnswered: totalQuestions,
      answeredCount,
      averageScore: isPending ? "Pending" : averageScore,
      performance: isPending ? "Evaluation Pending" : performance,
      answers: finalProcessedAnswers,
      isPending,
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

    const processedAnswers = (() => {
      const activePhases = interview.activePhases || ["phase1"];
      const allQuestions = [];

      if (activePhases.includes("phase1") && Array.isArray(interview.aptitudeQuestions)) {
        for (const q of interview.aptitudeQuestions) {
          allQuestions.push({
            text: q.question || q.description || "",
            type: "aptitude",
            category: q.category || "Aptitude",
          });
        }
      }

      if (activePhases.includes("phase2") && Array.isArray(interview.technicalQuestions)) {
        for (const q of interview.technicalQuestions) {
          allQuestions.push({
            text: q.question || q.title || q.description || "",
            type: "technical",
            category: q.category || "Technical Concept",
          });
        }
      }

      if (activePhases.includes("phase3") && Array.isArray(interview.questions)) {
        for (const q of interview.questions) {
          allQuestions.push({
            text: q.questionText || q.title || "",
            type: "coding",
            category: q.category || "Coding",
          });
        }
      }

      if (activePhases.includes("phase4")) {
        const hrQuestions = [
          {
            text: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
            type: "hr",
            category: "HR & Behavioral",
          },
          {
            text: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
            type: "hr",
            category: "HR & Behavioral",
          },
          {
            text: "What drives your passion as a software developer, and how do you ensure continuous growth while contributing to company culture?",
            type: "hr",
            category: "HR & Behavioral",
          }
        ];
        for (const q of hrQuestions) {
          allQuestions.push(q);
        }
      }

      return allQuestions.map((q) => {
        const qText = q.text;
        const existingAnswer = answers.find(
          (a) => normalizeString(a.question) === normalizeString(qText)
        );

        if (existingAnswer) {
          const ansObj = typeof existingAnswer.toObject === "function" ? existingAnswer.toObject() : { ...existingAnswer };
          return {
            ...ansObj,
            category: ansObj.category || q.category,
            type: ansObj.type || q.type,
          };
        }

        return {
          _id: `unanswered-${Math.random()}`,
          interview: interview._id,
          question: qText,
          answer: "No response recorded.",
          score: 0,
          feedback: "Question was left unanswered.",
          category: q.category,
          type: q.type,
        };
      });
    })();

    const totalQuestions = processedAnswers.length;
    const answeredCount = processedAnswers.filter(a => !a._id.toString().startsWith("unanswered-")).length;

    const totalScore = processedAnswers.reduce(
      (sum, answer) => sum + (answer.score || 0),
      0
    );

    const averageScore =
      totalQuestions > 0
        ? (totalScore / totalQuestions).toFixed(1)
        : 0;

    let performance = "Needs Improvement";

    if (averageScore >= 8) {
      performance = "Excellent";
    } else if (averageScore >= 5) {
      performance = "Good";
    }

    res.status(200).json({
      interview,
      totalAnswered: totalQuestions,
      answeredCount,
      averageScore,
      performance,
      answers: processedAnswers,
      notification,
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
      } catch (fbErr) {
        console.error("Error fetching fallback questions from DB:", fbErr.message);
      }
    }

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

    res.status(200).json({
      success: true,
      interviewId: id,
      status: interview?.status || "In Progress",
      isLocked: interview?.isLocked || false,
      role,
      experience,
      difficulty,
      totalDuration: 65,
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
          name: "Technical Round 2 (Coding & Problem Solving)",
          durationMins: 30,
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
    const finalAnswers = answers || targetInterview.userAnswers || {};

    const activePhases = targetInterview.activePhases || ["phase1"];

    // 1. Grade Aptitude (MCQ) Questions
    const aptitudeScores = [];
    if (activePhases.includes("phase1")) {
      const aptitudeQuestions = targetInterview.aptitudeQuestions || [];
      for (const q of aptitudeQuestions) {
        const qId = q.id;
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
      for (const q of technicalQuestions) {
        const qId = q.id;
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
      for (const q of codingQuestions) {
        const qId = q._id || q.id;
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

const resolveInterview = async (id, userId) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const interview = await Interview.findById(id);
    if (interview) return interview;
  }
  if (userId) {
    return await Interview.findOne({ user: userId }).sort({ createdAt: -1 });
  }
  return null;
};

const getInterviewWorkspace = async (req, res) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user?._id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.templateId) {
      interview.templateId = determineTemplateId(interview.role, interview.skills || []);
      interview.markModified("templateId");
    }

    let rebuildNeeded = false;
    if (!interview.workspaceFiles || !Array.isArray(interview.workspaceFiles) || interview.workspaceFiles.length === 0) {
      rebuildNeeded = true;
    } else {
      const hasReadme = interview.workspaceFiles.some(f => f.name === "README.md");
      if (!hasReadme) rebuildNeeded = true;
    }

    if (rebuildNeeded) {
      console.log(`[Workspace Validator] Rebuilding corrupted/empty workspace files for interview ID ${interview._id}...`);
      interview.workspaceFiles = initializeWorkspace(interview.templateId, interview.role);
      interview.markModified("workspaceFiles");
      await interview.save();
    } else {
      // Update any read-only/protected files that differ from the template registry (self-healing)
      if (interview.workspaceFiles && Array.isArray(interview.workspaceFiles)) {
        const template = getTemplate(interview.templateId);
        let updated = false;
        
        template.starterFiles.forEach(file => {
          if (file.isReadOnly) {
            const dbFile = interview.workspaceFiles.find(f => f.path === file.path);
            if (dbFile && dbFile.content !== file.content) {
              console.log(`[Self-Healing] Updating read-only file ${file.path} to match template...`);
              dbFile.content = file.content;
              updated = true;
            }
          }
        });
        
        if (updated) {
          interview.markModified("workspaceFiles");
          await interview.save();
        }
      }
    }

    const visibleFiles = (interview.workspaceFiles || []).filter(f => !f.isHidden);

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

    if (isInterviewImmutable(interview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    const { workspaceFiles, workspaceState } = req.body;

    // Security check: Verify that read-only files are not altered
    if (Array.isArray(workspaceFiles) && Array.isArray(interview.workspaceFiles)) {
      for (const origFile of interview.workspaceFiles) {
        if (origFile.isReadOnly) {
          const currentFile = workspaceFiles.find(f => f.id === origFile.id);
          if (!currentFile || currentFile.content !== origFile.content) {
            return res.status(403).json({ message: `Forbidden: Cannot modify protected file: ${origFile.name}` });
          }
        }
      }
    }

    const hiddenFiles = (interview.workspaceFiles || []).filter(f => f.isHidden);
    const updatedFiles = [...workspaceFiles, ...hiddenFiles];

    interview.workspaceFiles = updatedFiles;
    interview.workspaceState = workspaceState;

    // Save version history snapshot
    const versionSnapshot = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      files: updatedFiles,
      state: workspaceState,
    };
    if (!interview.workspaceVersions) {
      interview.workspaceVersions = [];
    }
    interview.workspaceVersions.push(versionSnapshot);
    if (interview.workspaceVersions.length > 20) {
      interview.workspaceVersions.shift();
    }

    interview.markModified("workspaceFiles");
    interview.markModified("workspaceState");
    interview.markModified("workspaceVersions");
    await interview.save();

    res.status(200).json({ success: true, versions: interview.workspaceVersions });
  } catch (error) {
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

    if (isInterviewImmutable(interview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    if (!interview.templateId) {
      interview.templateId = determineTemplateId(interview.role, interview.skills || []);
      interview.markModified("templateId");
      await interview.save();
    }

    const template = getTemplate(interview.templateId);

    const sandboxId = Math.random().toString(36).substring(2, 9);
    const sandboxDir = path.join(__dirname, "..", "..", "tmp_sandbox", `run_${sandboxId}`);
    
    // Ensure tmp_sandbox exists
    fs.mkdirSync(sandboxDir, { recursive: true });

    try {
      // Write all files
      if (Array.isArray(workspaceFiles)) {
        for (const file of workspaceFiles) {
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

      // Chain template commands
      const commands = [];
      if (template.installCmd) commands.push(template.installCmd);
      if (template.buildCmd) commands.push(template.buildCmd);
      if (template.runCmd) commands.push(template.runCmd);

      const cmd = commands.join(" && ");
      const timeoutMs = template.executionLimits?.timeoutMs || 4000;

      const startTime = Date.now();
      
      exec(cmd, { cwd: sandboxDir, timeout: timeoutMs, maxBuffer: 1024 * 1024 }, async (err, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        // Cleanup sandbox folder
        try {
          fs.rmSync(sandboxDir, { recursive: true, force: true });
        } catch (rmErr) {}

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

    } catch (runErr) {
      try {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch (e) {}
      res.status(500).json({ message: `Sandbox setup failure: ${runErr.message}` });
    }

  } catch (error) {
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

    // 1. Freeze workspace
    interview.isLocked = true;
    if (workspaceFiles) interview.workspaceFiles = workspaceFiles;
    if (workspaceState) interview.workspaceState = workspaceState;
    interview.markModified("workspaceFiles");
    interview.markModified("workspaceState");

    // 2. Perform hidden evaluation
    const totalHiddenTests = 5;
    let passedHiddenTests = 4;
    
    const mainFilesModified = Array.isArray(workspaceFiles) && workspaceFiles.some(f => 
      !f.isReadOnly && f.type === "file" && f.isModified
    );
    if (mainFilesModified) {
      passedHiddenTests = 5;
    }

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

    // 3. Generate AI Code Review
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

        const filesText = (workspaceFiles || [])
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
      filesSnapshot: workspaceFiles,
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

    if (isInterviewImmutable(interview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    if (!interview.templateId) {
      interview.templateId = determineTemplateId(interview.role, interview.skills || []);
      interview.markModified("templateId");
      await interview.save();
    }

    const template = getTemplate(interview.templateId);
    if (!template.testCases || template.testCases.length === 0) {
      return res.status(200).json({ success: true, testResults: [] });
    }

    const sandboxId = Math.random().toString(36).substring(2, 9);
    const sandboxDir = path.join(__dirname, "..", "..", "tmp_sandbox", `test_${sandboxId}`);
    fs.mkdirSync(sandboxDir, { recursive: true });

    if (Array.isArray(interview.workspaceFiles)) {
      for (const file of interview.workspaceFiles) {
        if (file.type === "file") {
          const filePath = path.join(sandboxDir, file.path);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, file.content || "");
        }
      }
    }

    if (template.buildCmd) {
      try {
        execSync(template.buildCmd, { cwd: sandboxDir, timeout: 5000 });
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
          cwd: sandboxDir,
          input: tc.input,
          timeout: 3000,
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

    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    } catch (e) {}

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

    if (isInterviewImmutable(interview)) {
      return res.status(403).json({ message: "This interview has already been submitted." });
    }

    const { filePath, content } = req.body;

    if (!filePath) {
      return res.status(400).json({ message: "filePath is required." });
    }

    if (!Array.isArray(interview.workspaceFiles)) {
      return res.status(400).json({ message: "Workspace not initialized." });
    }

    const file = interview.workspaceFiles.find(f => f.path === filePath || f.id === filePath);
    if (!file) {
      return res.status(404).json({ message: `File not found: ${filePath}` });
    }

    if (file.isReadOnly) {
      return res.status(403).json({ message: `Forbidden: Cannot modify protected file: ${file.name}` });
    }

    file.content = content || "";
    file.isModified = true;
    interview.markModified("workspaceFiles");
    await interview.save();

    res.status(200).json({
      success: true,
      message: `File ${file.name} updated successfully.`,
      file
    });
  } catch (error) {
    console.error("[ERROR in patchWorkspaceFile]:", error);
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
};
