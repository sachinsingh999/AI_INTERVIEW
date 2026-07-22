import { useParams, useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { getQuestionKey, getCodeTemplate, getCodeTestCases } from "../utils/interviewHelpers";
import { submitQuestionAnswer, submitRoundEvaluations } from "../services/answerService";
import { runCompilerTests } from "../services/compilerService";
import { toast } from "../utils/toast";

export function useInterviewActions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const {
    interview,
    parentInterview,
    answers,
    setAnswers,
    evaluations,
    setEvaluations,
    currentIndex,
    setCurrentIndex,
    isMuted,
    setQuestionStatus,
    setIsEvaluating,
    setSubmissionCount,
    setRunningTests,
    setRunCount,
    setCodeFeedback,
    setLiveCodeError,
    demoMode,
    violations,
    runCount,
    tabSwitchCount,
    copyPasteCount,
    setNotes,
    activeChildId,
    selectedLanguage,
  } = useInterview();



  const speakQuestion = (text) => {
    if (interview?.interviewType === "oa") return;
    if (!window.speechSynthesis || isMuted) return;
    window.speechSynthesis.cancel();
    
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_`#]/g, "")
      .replace(/constraints:/i, ". Constraints:")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.includes("Google")) || 
                          voices.find(v => v.lang.startsWith("en-"));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const submitAnswer = async (question, silent = false) => {
    const rawVal = answers[question];
    const isDesign = interview?.interviewType === "design" || parentInterview?.interviewType === "design";
    
    let answerText = "";
    if (isDesign) {
      try {
        const parsed = JSON.parse(rawVal || "{}");
        answerText = parsed.notes || "Sketch submitted with system design components.";
      } catch {
        answerText = rawVal || "Submitted design round details.";
      }
    } else {
      answerText = (rawVal ?? (interview?.interviewType === "code" ? getTemplateForCode() : "")).trim();
    }

    if (!answerText && !isDesign) {
      if (!silent) {
        toast.error("Please write or sketch an answer before submitting this question.", "Blank response");
        return;
      }
      answerText = "No response recorded.";
    }

    if (!silent) {
      setIsEvaluating(true);
    }

    const targetSaveId = activeChildId || (["tech1", "tech2", "hr", "code", "design", "video"].includes(interview?.interviewType) ? interview?._id : id);

    if (demoMode || (id && id.startsWith("demo-")) || (activeChildId && activeChildId.startsWith("demo-")) || (targetSaveId && targetSaveId.startsWith("demo-"))) {
      try {
        const storedAnswers = JSON.parse(sessionStorage.getItem(`answers-${targetSaveId}`) || "{}");
        storedAnswers[question] = answerText;
        sessionStorage.setItem(`answers-${targetSaveId}`, JSON.stringify(storedAnswers));

        const answerLen = answerText.trim().length;
        let score = 5;
        let feedback = "Response successfully evaluated in local practice sandbox mode.";
        let idealAnswer = `Ideal response for: "${question}". It should explain the conceptual principles, standard patterns, and implementation constraints.`;
        let keyPoints = ["Core architecture concept", "Usage guidelines", "Tradeoffs and optimizations"];
        let missingPoints = answerLen > 100 ? [] : answerLen > 40 ? ["Tradeoffs and optimizations"] : ["Usage guidelines", "Tradeoffs and optimizations"];
        let howToSay = "To ace this in an interview: 'First, introduce the core concept clearly. Then describe a scenario where you implemented it, and end with the advantages and drawbacks.'";
        
        if (answerLen > 100) {
          score = 8;
          feedback = "Excellent response! Your detail level is strong and covers all relevant aspects of the prompt.";
        } else if (answerLen > 40) {
          score = 7;
          feedback = "Good response, but could be improved by discussing runtime complexity or trade-offs.";
        } else if (answerLen === 0) {
          score = 0;
          feedback = "No answer recorded.";
        }
        
        const demoEvaluation = {
          interview: id,
          question,
          answer: answerText,
          score,
          feedback,
          idealAnswer,
          keyPoints,
          missingPoints,
          howToSay,
        };
        
        const storedEvaluations = JSON.parse(sessionStorage.getItem(`evaluations-${targetSaveId}`) || "{}");
        storedEvaluations[question] = demoEvaluation;
        sessionStorage.setItem(`evaluations-${targetSaveId}`, JSON.stringify(storedEvaluations));

        setEvaluations((prev) => ({
          ...prev,
          [question]: demoEvaluation,
        }));
        
        if (!silent) {
          toast.success("Response saved and evaluated locally.", "Demo response saved");
        }
        setQuestionStatus((prev) => ({ ...prev, [currentIndex]: "answered" }));
        setSubmissionCount((c) => c + 1);
      } catch (err) {
        console.error("Error saving demo answer:", err);
      } finally {
        if (!silent) {
          setIsEvaluating(false);
        }
      }
      return;
    }

    try {
      const data = await submitQuestionAnswer(
        { interview: targetSaveId, question, answer: answerText },
        token
      );
      
      setEvaluations((prev) => {
        const next = { ...prev, [question]: data };
        sessionStorage.setItem(`evaluations-${targetSaveId}`, JSON.stringify(next));
        return next;
      });

      if (!silent) {
        toast.success("Response recorded! It will be reviewed by the administrator.", "Response saved");
      }
      setQuestionStatus((prev) => ({ ...prev, [currentIndex]: "answered" }));
      setSubmissionCount((c) => c + 1);
    } catch (error) {
      if (error.response?.status === 401) return;
      setQuestionStatus((prev) => ({ ...prev, [currentIndex]: "answered" }));
      setSubmissionCount((c) => c + 1);
    } finally {
      if (!silent) {
        setIsEvaluating(false);
      }
    }
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
    setQuestionStatus((status) => ({
      ...status,
      [index]: status[index] || "notAnswered",
    }));
    const questionText = getQuestionKey(interview?.questions[index]);
    if (evaluations[questionText] && evaluations[questionText].status !== "pending") {
      setCodeFeedback({});
    }
  };

  const clearResponse = (initCanvasGrid) => {
    const prompt = interview.questions[currentIndex];
    const key = getQuestionKey(prompt);
    if (interview?.interviewType === "design" || parentInterview?.interviewType === "design") {
      if (initCanvasGrid) initCanvasGrid();
      setNotes("");
      setAnswers((prev) => ({ ...prev, [key]: "" }));
    } else {
      setAnswers((currentAnswers) => ({
        ...currentAnswers,
        [key]: interview?.interviewType === "code" ? getTemplateForCode() : "",
      }));
    }
    setQuestionStatus((status) => ({
      ...status,
      [currentIndex]: "notAnswered",
    }));
    setCodeFeedback({});
    setLiveCodeError("");
  };

  const saveAndNext = async () => {
    const prompt = interview.questions[currentIndex];
    const key = getQuestionKey(prompt);
    const rawVal = answers[key] || "";
    await submitAnswer(key, true);
    setQuestionStatus((status) => ({
      ...status,
      [currentIndex]: rawVal.trim() ? "answered" : "notAnswered",
    }));
    if (currentIndex < interview.questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const markForReview = async () => {
    const prompt = interview.questions[currentIndex];
    const key = getQuestionKey(prompt);
    const rawVal = answers[key] || "";
    await submitAnswer(key, true);
    setQuestionStatus((status) => ({
      ...status,
      [currentIndex]: rawVal.trim() ? "answeredReview" : "review",
    }));
    if (currentIndex < interview.questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const getTemplateForCode = (overrideLang) => {
    const lang = overrideLang || selectedLanguage || interview?.language || "JavaScript";
    const prompt = interview?.questions?.[currentIndex];
    
    const langKeyMap = {
      "C++": "cpp",
      Java: "java",
      Python: "python",
      JavaScript: "javascript",
      TypeScript: "typescript",
      C: "c",
      Go: "go",
      Rust: "rust",
    };
    const dbLangKey = langKeyMap[lang] || lang.toLowerCase();

    if (typeof prompt === "object" && prompt) {
      if (prompt.starterCode) {
        if (prompt.starterCode[dbLangKey]) return prompt.starterCode[dbLangKey];
        if (prompt.starterCode[lang]) return prompt.starterCode[lang];
      }
      if (prompt.template) return prompt.template;
    }
    return getCodeTemplate(lang);
  };

  const runCodeTests = async () => {
    const language = selectedLanguage || interview?.language || "JavaScript";
    const prompt = interview.questions[currentIndex];
    const questionKey = getQuestionKey(prompt);
    const key = `${questionKey}_${language}`;
    const code = answers[key] || answers[questionKey] || getTemplateForCode(language);

    const monacoLanguagesMap = {
      "C++": 54,
      Java: 62,
      Python: 71,
      JavaScript: 63,
      TypeScript: 74,
      C: 50,
      Go: 60,
      Rust: 73,
    };
    const languageId = monacoLanguagesMap[language] || 63;

    setRunningTests(true);
    setRunCount((count) => count + 1);

    try {
      const runResult = await runCompilerTests({
        questionId: typeof prompt === "object" ? (prompt.questionId || prompt._id || prompt.id) : undefined,
        title: typeof prompt === "object" ? prompt.title : (typeof prompt === "string" ? prompt : undefined),
        visibleTestCases: typeof prompt === "object" ? prompt.visibleTestCases : undefined,
        driverCode: typeof prompt === "object" ? prompt.driverCode : undefined,
        questionMetadata: typeof prompt === "object" ? prompt : undefined,
        sourceCode: code,
        languageId,
      });
      setCodeFeedback({
        type: runResult.passedCount === runResult.totalCount ? "success" : "error",
        title: runResult.verdict || (runResult.passedCount === runResult.totalCount ? "Passed" : "Failed"),
        text: `Passed ${runResult.passedCount}/${runResult.totalCount} public test cases (${runResult.totalRuntime}, ${runResult.maxMemory})`,
        results: runResult.results || [],
        verdict: runResult.verdict,
        totalRuntime: runResult.totalRuntime,
        maxMemory: runResult.maxMemory,
      });
    } catch (err) {
      setCodeFeedback({
        type: "error",
        title: "Compilation Error",
        text: err.response?.data?.message || "Code compilation failed. Check console logs.",
        results: [],
      });
    } finally {
      setRunningTests(false);
    }
  };

  return {
    speakQuestion,
    submitAnswer,
    goToQuestion,
    clearResponse,
    saveAndNext,
    markForReview,
    runCodeTests,
    getTemplateForCode,
  };
}
