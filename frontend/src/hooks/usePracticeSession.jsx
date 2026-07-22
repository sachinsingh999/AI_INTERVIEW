import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import ConsoleTabContent from "../components/practice/ConsoleTabContent";

// Static constants and helpers
import {
  aptitudeQuestions,
  writtenPractice,
  codingProblems,
  modeShell,
  languageOptions,
  formatTime,
  getAnswerQuality,
  renderMarkdown,
  getOriginalStarter,
  extractUserSolution,
  getEditorialContent,
  getSolutionContent,
  parseTestCaseInput,
  serializeTestCaseInput,
} from "../utils/practiceUtils.jsx";

export default function usePracticeSession({ safeMode, questionId }) {
  const { resolvedTheme } = useTheme();
  const isAptitude = safeMode === "aptitude";
  const isCoding = safeMode === "coding";
  const writtenConfig = writtenPractice[safeMode];
  const shell = modeShell[safeMode] || writtenConfig;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [questions, setQuestions] = useState([]);
  const [userProfile, setUserProfile] = useState({ saved: [], bookmarked: [] });

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/compiler/questions/my-practice");
      setUserProfile(res.data || { saved: [], bookmarked: [] });
    } catch (err) {
      console.error("Error loading user profile lists:", err);
    }
  };

  const toggleBookmark = async (id) => {
    try {
      const res = await api.post(`/compiler/questions/${id}/bookmark`);
      toast.success(res.data.bookmarked ? "Bookmarked question!" : "Removed bookmark");
      fetchUserProfile();
    } catch (err) {
      console.error(err);
      toast.error("Failed to bookmark question.");
    }
  };

  const toggleSave = async (id) => {
    try {
      const res = await api.post(`/compiler/questions/${id}/save`);
      toast.success(res.data.saved ? "Saved question!" : "Removed from saved");
      fetchUserProfile();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save question.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (isAptitude && questionId) {
      const fetchAptitudeSession = async () => {
        try {
          const res = await api.get(`/aptitude/session/${questionId}`);
          if (res.data?.success) {
            const { session, questions: qList } = res.data;
            setSessionData(session);
            setQuestions(qList);
            
            // Restore current index
            setCurrentIndex(session.currentIndex || 0);
            
            // Restore timer
            setTimeLeft(session.timeLeft !== undefined ? session.timeLeft : session.questionCount * 60);

            // Restore selected options
            const restoredOptions = {};
            const restoredReviewed = {};
            const restoredVisited = { [session.currentIndex || 0]: true };

            qList.forEach((q) => {
              if (q.userSelectedAnswer !== null && q.userSelectedAnswer !== undefined) {
                restoredOptions[q.questionNumber] = q.userSelectedAnswer;
                restoredVisited[q.questionNumber] = true;
              }
              if (q.questionNumber <= (session.currentIndex || 0)) {
                restoredVisited[q.questionNumber] = true;
              }
            });
            setSelectedOptions(restoredOptions);
            setVisited(restoredVisited);

            // Check if completed
            if (session.status === "completed") {
              setSubmitted(true);
              setShowReview(true);
            }
          }
        } catch (err) {
          console.error("Error loading aptitude session:", err);
          toast.error("Failed to load aptitude practice session.");
          navigate("/practice/aptitude");
        }
      };
      fetchAptitudeSession();
    } else if (isCoding) {
      const fetchQuestions = async () => {
        try {
          const res = await api.get("/compiler/questions");
          const questionList = res.data && res.data.length > 0 ? res.data : codingProblems;
          setQuestions(questionList);
          
          if (questionId) {
            const idx = questionList.findIndex(q => q._id === questionId);
            if (idx !== -1) {
              setCurrentIndex(idx);
            }
          } else {
            // Restore last active question/session state from database
            try {
              const activeRes = await api.get("/compiler/get-last-active");
              if (activeRes.data?.success && activeRes.data.lastActive) {
                const la = activeRes.data.lastActive;
                const activeQ = la.question;
                const idx = questionList.findIndex(q => q._id === (activeQ?._id || activeQ));
                if (idx !== -1) {
                  setCurrentIndex(idx);
                  setSelectedLanguage(la.language);
                  navigate(`/practice/coding/${activeQ?._id || activeQ}`, { replace: true });
                }
              }
            } catch (err) {
              console.error("Failed to restore last active progress:", err);
            }
          }
        } catch (error) {
          console.error("Error fetching database questions, falling back to static:", error);
          setQuestions(codingProblems);
          if (questionId) {
            const idx = codingProblems.findIndex(q => q.title === questionId || q._id === questionId);
            if (idx !== -1) {
              setCurrentIndex(idx);
            }
          }
        }
      };
      fetchQuestions();
    }
  }, [isCoding, isAptitude, questionId]);

  const questionSet = isAptitude
    ? (questions.length > 0 ? questions : [])
    : isCoding
      ? (questions.length > 0 ? questions : codingProblems)
      : writtenConfig.questions;

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [visited, setVisited] = useState({ 0: true });
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(isAptitude ? 25 * 60 : 18 * 60);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [codeByProblem, setCodeByProblem] = useState({});
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const safeCurrentIndex = Math.min(currentIndex, Math.max(0, questionSet.length - 1));
  const currentQuestion = questionSet[safeCurrentIndex];
  const currentCode = useMemo(() => {
    if (!isCoding || !currentQuestion) return "";
    const editedCode = codeByProblem[safeCurrentIndex]?.[selectedLanguage];
    if (editedCode) return editedCode;
    const original = getOriginalStarter(currentQuestion, selectedLanguage);
    return extractUserSolution(original, selectedLanguage);
  }, [isCoding, currentQuestion, safeCurrentIndex, selectedLanguage, codeByProblem]);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const ignoreChange = useRef(false);

  const safeCurrentIndexRef = useRef(safeCurrentIndex);
  const selectedLanguageRef = useRef(selectedLanguage);

  safeCurrentIndexRef.current = safeCurrentIndex;
  selectedLanguageRef.current = selectedLanguage;

  const prevIndexRef = useRef(currentIndex);
  const prevLangRef = useRef(selectedLanguage);

  if (prevIndexRef.current !== currentIndex || prevLangRef.current !== selectedLanguage) {
    ignoreChange.current = true;
    prevIndexRef.current = currentIndex;
    prevLangRef.current = selectedLanguage;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      ignoreChange.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, selectedLanguage]);

  // Auto Save States and Refs
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "failed" | "unsaved"
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    const saved = localStorage.getItem("auto_save_enabled");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("auto_save_enabled", autoSaveEnabled);
  }, [autoSaveEnabled]);

  const lastSavedCodeRef = useRef({});
  const debounceTimerRef = useRef(null);
  const editorViewStatesRef = useRef({});
  const [timeAgoText, setTimeAgoText] = useState("");

  // relative time ago update
  useEffect(() => {
    if (!lastSavedTime) {
      setTimeAgoText("");
      return;
    }
    const updateText = () => {
      const diffSecs = Math.round((new Date() - lastSavedTime) / 1000);
      if (diffSecs < 5) {
        setTimeAgoText("Just now");
      } else if (diffSecs < 60) {
        setTimeAgoText(`${diffSecs}s ago`);
      } else {
        const mins = Math.floor(diffSecs / 60);
        setTimeAgoText(`${mins}m ago`);
      }
    };
    updateText();
    const interval = setInterval(updateText, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  const saveProgressApi = async (codeToSave, force = false) => {
    if (!currentQuestion?._id) return;
    const activeLang = selectedLanguage;
    const key = `${currentQuestion._id}_${activeLang}`;
    
    // Avoid saving if identical to last saved
    if (!force && lastSavedCodeRef.current[key] === codeToSave) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    try {
      await api.post("/compiler/save-progress", {
        questionId: currentQuestion._id,
        language: activeLang,
        code: codeToSave,
        autoSaveEnabled,
      });
      lastSavedCodeRef.current[key] = codeToSave;
      setSaveStatus("saved");
      setLastSavedTime(new Date());
    } catch (err) {
      console.error("Failed to save progress:", err);
      setSaveStatus("failed");
    }
  };

  const handleManualSave = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      saveProgressApi(value, true);
    }
  };

  const saveAptitudeProgressApi = async (currentIndexVal, optionsVal, questionsList, timeLeftVal) => {
    if (!questionId || !isAptitude || questionsList.length === 0) return;
    
    setSaveStatus("saving");
    const questionsProgress = questionsList.map((q) => {
      const selected = optionsVal[q.questionNumber];
      return {
        questionId: q._id,
        userSelectedAnswer: selected !== undefined ? selected : null,
        isAnswered: selected !== undefined,
        timeSpent: q.timeSpent || 0
      };
    });

    try {
      await api.post("/aptitude/save-progress", {
        sessionId: questionId,
        currentIndex: currentIndexVal,
        timeLeft: timeLeftVal,
        questionsProgress
      });
      setSaveStatus("saved");
      setLastSavedTime(new Date());
    } catch (err) {
      console.error("Failed to auto-save aptitude progress:", err);
      setSaveStatus("failed");
    }
  };

  const handleAptitudeSubmit = async () => {
    if (!questionId || !isAptitude) return;
    try {
      await saveAptitudeProgressApi(currentIndex, selectedOptions, questions, timeLeft);
      const res = await api.post("/aptitude/submit", {
        sessionId: questionId,
        timeLeft
      });
      if (res.data?.success) {
        toast.success("Practice set submitted successfully!");
        setSessionData(res.data.session);
        setQuestions(res.data.questions);
        setSubmitted(true);
        setShowReview(true);
      }
    } catch (err) {
      console.error("Error submitting aptitude session:", err);
      toast.error("Failed to submit practice set.");
    }
  };

  // Debounced Auto Save watcher for Aptitude
  useEffect(() => {
    if (!isAptitude || !questionId || questions.length === 0 || submitted) return;

    const delayDebounce = setTimeout(() => {
      saveAptitudeProgressApi(currentIndex, selectedOptions, questions, timeLeft);
    }, 4000); // 4 seconds debounce

    return () => clearTimeout(delayDebounce);
  }, [currentIndex, selectedOptions, timeLeft, isAptitude, questionId, submitted]);

  // Window unload / unmount watcher for Aptitude
  useEffect(() => {
    if (!isAptitude || !questionId || questions.length === 0 || submitted) return;
    
    const handleUnload = () => {
      saveAptitudeProgressApi(currentIndex, selectedOptions, questions, timeLeft);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [currentIndex, selectedOptions, timeLeft, isAptitude, questionId, submitted, questions]);

  // Debounced Auto Save watcher
  useEffect(() => {
    if (!isCoding || !currentQuestion || !currentCode) return;
    
    const activeLang = selectedLanguage;
    const activeQId = currentQuestion._id;
    const key = `${activeQId}_${activeLang}`;
    
    // Prevent trigger on initial template loading
    if (lastSavedCodeRef.current[key] === undefined) {
      return;
    }

    if (lastSavedCodeRef.current[key] === currentCode) {
      return;
    }

    if (!autoSaveEnabled) {
      setSaveStatus("unsaved");
      return;
    }

    setSaveStatus("saving");
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveProgressApi(currentCode);
    }, 4000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentCode, autoSaveEnabled, selectedLanguage, currentQuestion?._id]);

  // Load progress from Database
  const loadProgressFromDb = async () => {
    if (!currentQuestion?._id) return;
    const activeLang = selectedLanguage;
    const activeIdx = safeCurrentIndex;
    const key = `${currentQuestion._id}_${activeLang}`;
    
    try {
      const res = await api.get(`/compiler/get-progress/${currentQuestion._id}/${activeLang}`);
      if (res.data?.success && res.data.progress) {
        const savedCode = res.data.progress.code;
        const autoSaveEnabledFromDb = res.data.progress.autoSaveEnabled;
        
        setAutoSaveEnabled(autoSaveEnabledFromDb !== undefined ? autoSaveEnabledFromDb : true);
        lastSavedCodeRef.current[key] = savedCode;
        
        setCodeByProblem((prev) => ({
          ...prev,
          [activeIdx]: {
            ...(prev[activeIdx] || {}),
            [activeLang]: savedCode,
          },
        }));

        if (editorRef.current) {
          ignoreChange.current = true;
          editorRef.current.setValue(savedCode);
          ignoreChange.current = false;
          
          // Restore cursor/scroll state if any
          const viewState = editorViewStatesRef.current[key];
          if (viewState) {
            editorRef.current.restoreViewState(viewState);
          }
        }
        
        setSaveStatus("saved");
        setLastSavedTime(new Date(res.data.progress.lastSavedAt || res.data.progress.updatedAt));
      } else {
        const original = getOriginalStarter(currentQuestion, activeLang);
        const starter = extractUserSolution(original, activeLang);
        lastSavedCodeRef.current[key] = starter;
        setSaveStatus("saved");
        setLastSavedTime(null);
      }
    } catch (err) {
      console.error("Failed to load saved progress:", err);
    }
  };

  useEffect(() => {
    if (isCoding && currentQuestion) {
      loadProgressFromDb();
    }
  }, [currentIndex, selectedLanguage, isCoding, currentQuestion?._id]);

  // Document level keydown shortcut for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion?._id, selectedLanguage]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add Ctrl+S / Cmd+S manual save to Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const value = editor.getValue();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      saveProgressApi(value, true);
    });

    editor.onDidChangeModelContent(() => {
      if (ignoreChange.current) return;

      const value = editor.getValue();
      const activeIdx = safeCurrentIndexRef.current;
      const activeLang = selectedLanguageRef.current;

      setCodeByProblem((prev) => {
        return {
          ...prev,
          [activeIdx]: {
            ...(prev[activeIdx] || {}),
            [activeLang]: value,
          },
        };
      });
    });
  };

  const [customInput, setCustomInput] = useState("");
  const [activeTestCases, setActiveTestCases] = useState([]);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);

  const handleGenerateQuestion = async () => {
    setGeneratingQuestion(true);
    try {
      const res = await api.post("/compiler/generate", {
        role: "Software Developer",
        difficulty: "Medium",
        category: "Algorithms"
      });

      if (res.data && res.data.success) {
        const newQuestion = res.data.question;
        setQuestions((prev) => [...prev, newQuestion]);
        setCurrentIndex(questions.length > 0 ? questions.length : 1);
        setResult(null);
      }
    } catch (error) {
      console.error("AI question generation failed", error);
      alert("Failed to generate coding question. Please verify backend configurations.");
    } finally {
      setGeneratingQuestion(false);
    }
  };

  const [consoleTab, setConsoleTab] = useState("testcases");
  const [consoleExpanded, setConsoleExpanded] = useState(true);
  const [editorTheme, setEditorTheme] = useState(resolvedTheme === "dark" ? "vs-dark" : "vs-light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setEditorTheme(resolvedTheme === "dark" ? "vs-dark" : "vs-light");
  }, [resolvedTheme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [fontSize, setFontSize] = useState(13);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftActiveTab, setLeftActiveTab] = useState("problem");
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const fetchSubmissions = async () => {
    if (!currentQuestion?._id) return;
    try {
      const res = await api.get("/compiler/submissions");
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    if (isCoding && currentQuestion) {
      fetchSubmissions();
    }
  }, [currentIndex, isCoding]);

  const selectedCount = Object.keys(selectedOptions).length;
  const writtenCount = Object.values(writtenAnswers).filter((value) => value?.trim()).length;
  const answeredCount = isAptitude ? selectedCount : isCoding ? 0 : writtenCount;
  const timeTaken = (isAptitude ? 25 * 60 : 18 * 60) - timeLeft;

  const aptitudeScore = useMemo(() => {
    return aptitudeQuestions.reduce((score, question, index) => {
      return score + (selectedOptions[index] === question.correct ? question.marks : 0);
    }, 0);
  }, [selectedOptions]);

  const aptitudePercentage = Math.round((aptitudeScore / aptitudeQuestions.length) * 100);
  const aptitudeWrong = aptitudeQuestions.length - aptitudeScore;
  
  const aptitudeBreakdown = ["Logical Reasoning", "Quantitative Aptitude", "Verbal Ability"].map((topic) => {
    const topicQuestions = aptitudeQuestions.filter((question) => question.topic === topic);
    const correct = topicQuestions.filter((question) => {
      const originalIndex = aptitudeQuestions.indexOf(question);
      return selectedOptions[originalIndex] === question.correct;
    }).length;

    return {
      topic,
      total: topicQuestions.length,
      correct,
      percentage: Math.round((correct / topicQuestions.length) * 100),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (submitted) return;

      setTimeLeft((seconds) => {
        if (seconds <= 1) {
          if (isAptitude) {
            handleAptitudeSubmit();
          } else {
            setSubmitted(true);
            setShowReview(true);
          }
          return 0;
        }
        return seconds - 1;
      });

      // Increment timeSpent for the current question in state if in aptitude mode
      if (isAptitude && questions.length > 0) {
        setQuestions(prevQuestions => {
          const updated = [...prevQuestions];
          if (updated[currentIndex]) {
            updated[currentIndex] = {
              ...updated[currentIndex],
              timeSpent: (updated[currentIndex].timeSpent || 0) + 1
            };
          }
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, isAptitude, questions.length, currentIndex]);

  useEffect(() => {
    if (isCoding && currentQuestion) {
      const visibleCases = currentQuestion.visibleTestCases || currentQuestion.tests || [];
      setActiveTestCases(visibleCases.map(tc => ({ ...tc })));
      setCustomInput(visibleCases[0]?.input || "");
      setSelectedTestCaseIndex(0);
      setResult(null);
      setConsoleTab("testcases");
    }
  }, [currentIndex, isCoding, currentQuestion]);

  const handleTestCaseValueChange = (idx, paramName, newValue) => {
    setActiveTestCases(prev => {
      const updated = [...prev];
      const tc = updated[idx];
      if (tc) {
        const fields = parseTestCaseInput(currentQuestion?.title, tc.input);
        const fieldToUpdate = fields.find(f => f.name === paramName);
        if (fieldToUpdate) {
          fieldToUpdate.value = newValue;
        }
        tc.input = serializeTestCaseInput(currentQuestion?.title, fields);
      }
      return updated;
    });
  };

  const handleAddTestCase = () => {
    const defaultInput = activeTestCases[0]?.input || "";
    const newCase = {
      label: `Case ${activeTestCases.length + 1}`,
      input: defaultInput,
      expected: activeTestCases[0]?.expected || ""
    };
    setActiveTestCases([...activeTestCases, newCase]);
    setSelectedTestCaseIndex(activeTestCases.length);
  };

  const goToQuestion = (index) => {
    const nextIndex = Math.min(Math.max(index, 0), questionSet.length - 1);
    setCurrentIndex(nextIndex);
    setVisited((prev) => ({ ...prev, [nextIndex]: true }));
  };

  const moveQuestion = (direction) => {
    goToQuestion(currentIndex + direction);
  };

  const questionState = (index) => {
    if (isAptitude && currentIndex === index) return "current";
    if (reviewed[index] && (selectedOptions[index] !== undefined || writtenAnswers[index]?.trim())) {
      return "reviewAnswered";
    }
    if (reviewed[index]) return "review";
    if (selectedOptions[index] !== undefined || writtenAnswers[index]?.trim()) return "answered";
    if (visited[index]) return "notAnswered";
    return "notVisited";
  };

  const stateClass = {
    current: "border-blue-600 bg-blue-600 text-white",
    answered: "border-emerald-500 bg-emerald-500 text-white",
    notAnswered: "border-amber-300 bg-amber-100 text-amber-800",
    notVisited: "border-brand-border bg-brand-bg text-brand-secondary",
    review: "border-violet-500 bg-violet-500 text-white",
    reviewAnswered: "border-indigo-500 bg-indigo-500 text-white",
  };

  const resetAptitude = () => {
    navigate("/practice/aptitude");
  };

  const runCode = async (submit = false) => {
    const problem = questionSet[safeCurrentIndex] || codingProblems[0];
    const activeLanguage = languageOptions.find((item) => item.id === selectedLanguage) || languageOptions[3];
    
    setRunning(true);
    setConsoleExpanded(true);
    setConsoleTab(submit ? "result" : "output");

    try {
      if (submit) {
        const res = await api.post("/compiler/submit", {
          questionId: problem._id,
          sourceCode: currentCode,
          languageId: activeLanguage.judge0Id,
          languageName: activeLanguage.label,
        });

        setResult({
          status: "completed",
          submit: true,
          results: res.data.results,
          passedCount: res.data.passed,
          totalCount: res.data.total,
          score: res.data.score,
          executionTime: res.data.runtime,
          memory: res.data.memory,
        });
        setLeftActiveTab("accepted");
        
        fetchSubmissions();
      } else {
        let stdin = "";
        let expected = "";
        if (selectedTestCaseIndex === "custom") {
          stdin = customInput;
        } else {
          const tc = activeTestCases[selectedTestCaseIndex] || {};
          stdin = tc.input || "";
          expected = tc.expected || "";
        }

        const res = await api.post("/compiler/run", {
          questionId: problem._id,
          sourceCode: currentCode,
          languageId: activeLanguage.judge0Id,
          stdin,
        });

        const { stdout, stderr, compile_output, executionTime, memory } = res.data;
        const actual = stdout ? stdout.trim() : "";
        const passed = selectedTestCaseIndex === "custom" ? true : (actual === String(expected).trim());

        setResult({
          status: "completed",
          submit: false,
          results: [
            {
              label: selectedTestCaseIndex === "custom" ? "Custom Case" : `Case ${selectedTestCaseIndex + 1}`,
              passed,
              input: stdin,
              expected,
              actual: actual || stderr || compile_output,
              error: stderr || compile_output,
            }
          ],
          passedCount: passed ? 1 : 0,
          totalCount: 1,
          executionTime,
          memory,
        });
      }
    } catch (error) {
      setResult({
        status: "error",
        submit,
        message: error.response?.data?.message || error.message,
        results: [],
      });
    } finally {
      setRunning(false);
    }
  };

  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code to the starter template? This will discard your current edits.")) {
      const original = getOriginalStarter(currentQuestion, selectedLanguage);
      const defaultCode = extractUserSolution(original, selectedLanguage);

      if (editorRef.current) {
        ignoreChange.current = true;
        editorRef.current.setValue(defaultCode);
        ignoreChange.current = false;
      }

      setCodeByProblem(prev => {
        const next = { ...prev };
        if (next[safeCurrentIndex]) {
          delete next[safeCurrentIndex][selectedLanguage];
        }
        return next;
      });
    }
  };

  const renderConsoleTabContent = (problem) => (
    <ConsoleTabContent
      consoleTab={consoleTab}
      problem={problem}
      activeTestCases={activeTestCases}
      setActiveTestCases={setActiveTestCases}
      selectedTestCaseIndex={selectedTestCaseIndex}
      setSelectedTestCaseIndex={setSelectedTestCaseIndex}
      customInput={customInput}
      setCustomInput={setCustomInput}
      result={result}
    />
  );

  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem("workspace_left_width");
    return saved ? Number(saved) : 30;
  });
  const [isFocusMode, setIsFocusMode] = useState(false);

  const containerRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const calculatedPct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const finalLeft = Math.max(15, Math.min(85, calculatedPct));
      setLeftWidth(finalLeft);
      localStorage.setItem("workspace_left_width", finalLeft);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const formatCode = () => {
    if (editorRef.current) {
      try {
        const action = editorRef.current.getAction('editor.action.formatDocument');
        if (action) {
          action.run();
          toast.success("Code Formatted!");
        } else {
          editorRef.current.trigger('editor', 'editor.action.formatDocument');
          toast.success("Formatting triggered");
        }
      } catch (err) {
        console.warn("Monaco format call failed, attempting trigger:", err);
        try {
          editorRef.current.trigger('editor', 'editor.action.formatDocument');
          toast.success("Formatting triggered");
        } catch (fallbackErr) {
          console.error("Format fallback trigger failed:", fallbackErr);
          toast.error("Formatting not supported for this language");
        }
      }
    }
  };

  const activeLanguage = languageOptions.find((item) => item.id === selectedLanguage) || languageOptions[3];
  const acceptance = 60 + ((currentQuestion?.title || "").length * 3) % 35;
  const detectedTopics = currentQuestion?.tags && currentQuestion.tags.length > 0 ? currentQuestion.tags : ["Arrays", "Variables"];
  const suggestedPatterns = detectedTopics.includes("Dynamic Programming") 
    ? ["Memoization", "Tabulation", "State Transition"] 
    : detectedTopics.includes("Graphs") 
      ? ["Breadth-First Search (BFS)", "Depth-First Search (DFS)"]
      : ["Two Pointers", "Sliding Window", "Hashing"];

  const solvedQuestionIds = useMemo(() => {
    const solved = new Set();
    submissions.forEach((sub) => {
      const qId = sub.question?._id || sub.question;
      if (qId && sub.passed === sub.total && sub.total > 0) {
        solved.add(qId.toString());
      }
    });
    return solved;
  }, [submissions]);

  return {
    drawerOpen,
    setDrawerOpen,
    isCoding,
    isAptitude,
    searchQuery,
    setSearchQuery,
    questionSet,
    currentIndex,
    goToQuestion,
    userProfile,
    solvedQuestionIds,
    question: currentQuestion,
    leftWidth,
    startResize,
    isFullscreen,
    setIsFullscreen,
    leftActiveTab,
    setLeftActiveTab,
    renderMarkdown,
    suggestedPatterns,
    getEditorialContent,
    getSolutionContent,
    selectedLanguage,
    setSelectedLanguage,
    setResult,
    editorTheme,
    setEditorTheme,
    languageOptions,
    activeLanguage,
    fontSize,
    setFontSize,
    handleResetCode,
    currentCode,
    handleEditorDidMount,
    consoleTab,
    setConsoleTab,
    consoleExpanded,
    setConsoleExpanded,
    renderConsoleTabContent,
    selectedTestCaseIndex,
    running,
    runCode,
    submissions,
    isFocusMode,
    setIsFocusMode,
    formatCode,
    aiDrawerOpen,
    setAiDrawerOpen,
    saveStatus,
    timeAgoText,
    autoSaveEnabled,
    setAutoSaveEnabled,
    handleManualSave,
    detectedTopics,
    result,
    timeLeft,
    formatTime,
    navigate,
    safeCurrentIndex,
    showSettings,
    setShowSettings,
    acceptance,
    containerRef,
    toggleBookmark,
    toggleSave,

    // Aptitude-specific extra props
    selectedOptions,
    setSelectedOptions,
    reviewed,
    setReviewed,
    visited,
    setVisited,
    submitted,
    setSubmitted,
    showReview,
    setShowReview,
    resetAptitude,
    moveQuestion,
    sessionData,
    handleAptitudeSubmit,

    // Written/Subjective specific extra props
    writtenAnswers,
    setWrittenAnswers,
    stateClass,
    questionState,
    writtenCount,
    safeMode,
    getAnswerQuality,
  };
}
