import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SessionNavbar from "../components/interview/session/SessionNavbar";
import QuestionPanel from "../components/interview/session/QuestionPanel";
import SessionSidebar from "../components/interview/session/SessionSidebar";
import PhaseTransitionModal from "../components/interview/session/PhaseTransitionModal";
import SubmitConfirmationModal from "../components/interview/session/SubmitConfirmationModal";
import TechnicalRound2Workspace from "../components/interview/session/TechnicalRound2Workspace";
import VoiceInterviewWorkspace from "../components/interview/session/VoiceInterviewWorkspace";
import api from "../services/api";

export default function InterviewSession() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const searchParams = new URLSearchParams(location.search);
  const requestedPhaseParam = searchParams.get("phase");
  let initialPhase = "phase1";
  if (requestedPhaseParam === "technical_round_1" || requestedPhaseParam === "tech1" || requestedPhaseParam === "phase2") {
    initialPhase = "phase2";
  } else if (requestedPhaseParam === "technical_round_2" || requestedPhaseParam === "tech2" || requestedPhaseParam === "phase3") {
    initialPhase = "phase3";
  } else if (requestedPhaseParam === "hr_round" || requestedPhaseParam === "hr" || requestedPhaseParam === "phase4") {
    initialPhase = "phase4";
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [currentPhaseKey, setCurrentPhaseKey] = useState(initialPhase);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lobbyCompleted, setLobbyCompleted] = useState(() => {
    try {
      return localStorage.getItem(`lobby_completed_${interviewId}`) === "true";
    } catch (e) {
      return false;
    }
  });

  // Sync currentPhaseKey with URL search parameter when phase changes
  useEffect(() => {
    let target = "phase1";
    if (requestedPhaseParam === "technical_round_1" || requestedPhaseParam === "tech1" || requestedPhaseParam === "phase2") {
      target = "phase2";
    } else if (requestedPhaseParam === "technical_round_2" || requestedPhaseParam === "tech2" || requestedPhaseParam === "phase3") {
      target = "phase3";
    } else if (requestedPhaseParam === "hr_round" || requestedPhaseParam === "hr" || requestedPhaseParam === "phase4") {
      target = "phase4";
    }
    setCurrentPhaseKey(target);
    setCurrentIndex(0);
  }, [requestedPhaseParam]);

  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({ p1_q1: true });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins default
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [completedPhaseName, setCompletedPhaseName] = useState("");
  const [nextPhaseName, setNextPhaseName] = useState("");

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Session & Questions Data
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/interview/${interviewId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.status === "Completed" || res.data?.status === "Submitted" || res.data?.status === "Expired" || res.data?.isLocked) {
          try {
            localStorage.removeItem(`interview_answers_${interviewId}`);
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith("interview_code_") || key.startsWith(`interview_timer_${interviewId}`))) {
                localStorage.removeItem(key);
                i--;
              }
            }
          } catch (e) {}

          alert("This interview has already been submitted and cannot be reopened.");
          navigate(`/interview/${interviewId}/responses`, { replace: true });
          return;
        }

        if (res.data?.phases) {
          const phasesData = { ...res.data.phases };
          if (!phasesData.phase4) {
            phasesData.phase4 = {
              phaseNumber: 4,
              name: "HR & Behavioral Round",
              durationMins: 15,
              questions: [
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
              ],
            };
          }
          setSessionData({ ...res.data, phases: phasesData });
          const activePhaseObj = phasesData[initialPhase] || phasesData.phase1;
          setTimeLeftSeconds((activePhaseObj.durationMins || 15) * 60);
        }
      } catch (err) {
        console.error("Error loading primary session questions, attempting public questions fetch:", err);
        try {
          const publicRes = await api.get("/interview/public/questions");
          if (publicRes.data?.phases) {
            const phasesData = { ...publicRes.data.phases };
            setSessionData({ ...publicRes.data, phases: phasesData });
            const activePhaseObj = phasesData[initialPhase] || phasesData.phase1;
            setTimeLeftSeconds((activePhaseObj.durationMins || 15) * 60);
            return;
          }
        } catch (pubErr) {
          console.error("Public questions endpoint also failed:", pubErr);
        }
        setError("Unable to load interview session questions. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [interviewId]);

  // Persist sessionData to localStorage for response/report fallback
  useEffect(() => {
    if (sessionData && interviewId) {
      try {
        localStorage.setItem(`interview_session_${interviewId}`, JSON.stringify(sessionData));
      } catch (e) {}
    }
  }, [sessionData, interviewId]);

  // Sync mockup questions for client-side local sessions if future phases are empty
  useEffect(() => {
    if (interviewId && interviewId.startsWith("session-") && sessionData) {
      let changed = false;
      const updatedPhases = { ...sessionData.phases };

      if (!updatedPhases.phase2?.questions?.length) {
        updatedPhases.phase2 = {
          ...updatedPhases.phase2,
          questions: [
            {
              id: "p2_q1",
              phase: 2,
              phaseName: "Technical Round 1",
              type: "coding",
              difficulty: "Medium",
              category: "JavaScript & Frontend",
              title: "Cloning Object with Circular References",
              description: "Write a function `deepClone(obj)` that creates a deep copy of a given object. It must handle circular references, nested arrays, and dates correctly.",
              starterCode: {
                javascript: "function deepClone(obj) {\n  // Write your code here\n}"
              }
            },
            {
              id: "p2_q2",
              phase: 2,
              phaseName: "Technical Round 1",
              type: "coding",
              difficulty: "Hard",
              category: "Algorithms & State",
              title: "Custom Event Emitter Pattern",
              description: "Implement a robust `EventEmitter` class with `subscribe`, `unsubscribe`, and `emit` capabilities. Multiple callbacks should be triggerable for the same event name.",
              starterCode: {
                javascript: "class EventEmitter {\n  // Write your code here\n}"
              }
            }
          ]
        };
        changed = true;
      }

      if (!updatedPhases.phase3?.questions?.length) {
        updatedPhases.phase3 = {
          ...updatedPhases.phase3,
          questions: [
            {
              id: "p3_q1",
              phase: 3,
              phaseName: "Technical Round 2 (Coding)",
              type: "coding",
              title: "Optimizing Real-time Search Autocomplete",
              description: "Write a high-performance debounced search autocomplete component logic. Focus on caching previous query results, handling out-of-order network responses, and aborting stale fetch requests.",
              starterCode: {
                javascript: "function debounce(func, wait) {\n  // Write your code here\n}"
              }
            }
          ]
        };
        changed = true;
      }

      if (!updatedPhases.phase4?.questions?.length) {
        updatedPhases.phase4 = {
          ...updatedPhases.phase4,
          questions: [
            {
              id: "p4_q1",
              phase: 4,
              phaseName: "HR & Behavioral Round",
              type: "hr",
              title: "Behavioral: Conflict Resolution & Team Alignment",
              description: "Describe a situation where you had a major technical disagreement with a colleague or team lead. How did you handle the situation, and what was the resolution?",
              placeholder: "Use the STAR method..."
            },
            {
              id: "p4_q2",
              phase: 4,
              phaseName: "HR & Behavioral Round",
              type: "hr",
              title: "Situational: Handling High-Pressure Deadlines & Trade-offs",
              description: "Tell us about a time when a critical bug or unexpected deadline shift threatened project delivery. How did you prioritize tasks and communicate under pressure?",
              placeholder: "Explain the scenario..."
            }
          ]
        };
        changed = true;
      }

      if (changed) {
        setSessionData(prev => ({
          ...prev,
          phases: updatedPhases
        }));
      }
    }
  }, [interviewId, sessionData]);

  // Prevent returning to completed phases
  useEffect(() => {
    if (!interviewId || !currentPhaseKey || !sessionData) return;
    try {
      // 1. Check local storage completion flags
      const isCompleted = localStorage.getItem(`interview_completed_phase_${interviewId}_${currentPhaseKey}`);
      
      // 2. Check active phases history from DB
      const activePhases = sessionData.activePhases || ["phase1"];
      const latestPhase = activePhases[activePhases.length - 1] || "phase1";
      
      const phaseOrders = { phase1: 1, phase2: 2, phase3: 3, phase4: 4 };
      const requestedPhaseOrder = phaseOrders[currentPhaseKey] || 1;
      const latestPhaseOrder = phaseOrders[latestPhase] || 1;

      if (isCompleted === "true" || requestedPhaseOrder < latestPhaseOrder) {
        let phaseCode = "oa";
        if (currentPhaseKey === "phase2") phaseCode = "tech1";
        else if (currentPhaseKey === "phase3") phaseCode = "tech2";
        else if (currentPhaseKey === "phase4") phaseCode = "hr";
        
        navigate(`/interview/${interviewId}/phase-complete?phase=${phaseCode}`, { replace: true });
      }
    } catch (e) {}
  }, [interviewId, currentPhaseKey, sessionData, navigate]);

  // Countdown Timer Ticker
  useEffect(() => {
    if (loading || !sessionData) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, sessionData, currentPhaseKey]);

  // Active Questions for current phase
  const currentPhaseObj = sessionData?.phases?.[currentPhaseKey] || {};
  const currentQuestions = currentPhaseObj.questions || [];
  const activeQuestion = currentQuestions[currentIndex];

  // Load initial answers from localStorage & DB if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`interview_answers_${interviewId}`);
      let localAns = {};
      if (stored) {
        localAns = JSON.parse(stored);
      }
      const dbAns = sessionData?.userAnswers || {};
      
      // Merge: local answers override DB answers (in case there are newer unsaved local edits),
      // but DB answers act as the baseline
      setAnswers({
        ...dbAns,
        ...localAns
      });
    } catch (e) {}
  }, [interviewId, sessionData?.userAnswers]);

  // Auto-save Answer Handler
  const handleAnswerChange = (valData) => {
    if (!activeQuestion) return;
    if (sessionData?.status === "Completed" || sessionData?.isLocked) {
      return; // read-only when completed or locked
    }

    const newAnswers = {
      ...answers,
      [activeQuestion.id]: valData,
    };
    setAnswers(newAnswers);
    try {
      localStorage.setItem(`interview_answers_${interviewId}`, JSON.stringify(newAnswers));
    } catch (e) {}

    // Auto-save API trigger
    setAutoSaveStatus("saving");
    setTimeout(async () => {
      try {
        await api.patch(
          `/interview/${interviewId}/answer`,
          {
            questionId: activeQuestion.id,
            answer: valData,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAutoSaveStatus("saved");
      } catch (err) {
        // silent auto-save catch
        setAutoSaveStatus("error");
      }
    }, 600);
  };

  // Toggle Flag
  const handleToggleFlag = () => {
    if (!activeQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [activeQuestion.id]: !prev[activeQuestion.id],
    }));
  };

  // Question Navigation
  const goToQuestion = (index) => {
    if (index >= 0 && index < currentQuestions.length) {
      setCurrentIndex(index);
      const q = currentQuestions[index];
      if (q) {
        setVisitedQuestions((prev) => ({ ...prev, [q.id]: true }));
      }
    }
  };

  const completeAptitudePhase = async () => {
    const answeredCount = currentQuestions.filter(q => {
      const a = answers?.[q.id] || answers?.[q._id];
      if (!a) return false;
      if (typeof a === "string") return a.trim().length > 0;
      if (typeof a === "object") {
        if (a.selectedOption !== undefined && a.selectedOption !== null) return true;
        if (a.selectedOptions && a.selectedOptions.length > 0) return true;
        if (a.code && a.code.trim().length > 0) return true;
        if (a.text && a.text.trim().length > 0) return true;
        return Object.keys(a).length > 0;
      }
      return false;
    }).length;
    const totalCount = currentQuestions.length || 10;
    const skippedCount = Math.max(0, totalCount - answeredCount);

    const phaseDurationSecs = (sessionData?.phases?.phase1?.durationMins || 15) * 60;
    const timeSpentSecs = Math.max(0, phaseDurationSecs - timeLeftSeconds);
    const mins = Math.floor(timeSpentSecs / 60);
    const secs = timeSpentSecs % 60;
    const formattedTime = `${mins} min ${secs.toString().padStart(2, "0")} sec`;

    const realStats = {
      phase: "oa",
      totalAttempted: `${answeredCount} / ${totalCount}`,
      answered: `${answeredCount}`,
      skipped: `${skippedCount}`,
      timeTaken: formattedTime,
      status: "Qualified for Next Round",
    };

    try {
      localStorage.setItem(`interview_completed_phase_${interviewId}_phase1`, "true");
      localStorage.setItem(`interview_stats_${interviewId}_oa`, JSON.stringify(realStats));
    } catch (e) {}

    try {
      await api.post(
        `/interview/${interviewId}/phase/1/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to submit Phase 1:", err);
    }

    navigate(`/interview/${interviewId}/phase-complete?phase=oa`, {
      state: { realStats, phase: "oa", questions: currentQuestions, answers }
    });
  };

  const completeTech1Phase = async () => {
    const answeredCount = currentQuestions.filter(q => {
      const a = answers?.[q.id] || answers?.[q._id];
      if (!a) return false;
      if (typeof a === "string") return a.trim().length > 0;
      if (typeof a === "object") {
        if (a.code && a.code.trim().length > 0) return true;
        if (a.text && a.text.trim().length > 0) return true;
        return Object.keys(a).length > 0;
      }
      return false;
    }).length;
    const totalCount = currentQuestions.length || 2;
    const skippedCount = Math.max(0, totalCount - answeredCount);

    const phaseDurationSecs = (sessionData?.phases?.phase2?.durationMins || 20) * 60;
    const timeSpentSecs = Math.max(0, phaseDurationSecs - timeLeftSeconds);
    const mins = Math.floor(timeSpentSecs / 60);
    const secs = timeSpentSecs % 60;
    const formattedTime = `${mins} min ${secs.toString().padStart(2, "0")} sec`;

    const realStats = {
      phase: "tech1",
      totalAttempted: `${answeredCount} / ${totalCount}`,
      answered: `${answeredCount}`,
      skipped: `${skippedCount}`,
      timeTaken: formattedTime,
      status: "Qualified for Round 2",
    };

    try {
      localStorage.setItem(`interview_completed_phase_${interviewId}_phase2`, "true");
      localStorage.setItem(`interview_stats_${interviewId}_tech1`, JSON.stringify(realStats));
    } catch (e) {}

    try {
      await api.post(
        `/interview/${interviewId}/phase/2/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to submit Phase 2:", err);
    }

    navigate(`/interview/${interviewId}/phase-complete?phase=tech1`, {
      state: { realStats, phase: "tech1", questions: currentQuestions, answers }
    });
  };

  const completeTech2Phase = async () => {
    const answeredCount = currentQuestions.filter(q => {
      const a = answers?.[q.id] || answers?.[q._id];
      if (!a) return false;
      if (typeof a === "string") return a.trim().length > 0;
      if (typeof a === "object") {
        if (a.code && a.code.trim().length > 0) return true;
        if (a.text && a.text.trim().length > 0) return true;
        return Object.keys(a).length > 0;
      }
      return false;
    }).length;
    const totalCount = currentQuestions.length || 2;
    const skippedCount = Math.max(0, totalCount - answeredCount);

    const phaseDurationSecs = (sessionData?.phases?.phase3?.durationMins || 30) * 60;
    const timeSpentSecs = Math.max(0, phaseDurationSecs - timeLeftSeconds);
    const mins = Math.floor(timeSpentSecs / 60);
    const secs = timeSpentSecs % 60;
    const formattedTime = `${mins} min ${secs.toString().padStart(2, "0")} sec`;

    const realStats = {
      phase: "tech2",
      totalAttempted: `${answeredCount} / ${totalCount}`,
      answered: `${answeredCount}`,
      skipped: `${skippedCount}`,
      timeTaken: formattedTime,
      status: "Qualified for HR Round",
    };

    try {
      localStorage.setItem(`interview_completed_phase_${interviewId}_phase3`, "true");
      localStorage.setItem(`interview_stats_${interviewId}_tech2`, JSON.stringify(realStats));
    } catch (e) {}

    try {
      await api.post(
        `/interview/${interviewId}/phase/3/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to submit Phase 3:", err);
    }

    navigate(`/interview/${interviewId}/phase-complete?phase=tech2`, {
      state: { realStats, phase: "tech2", questions: currentQuestions, answers }
    });
  };

  const completeHRPhase = async () => {
    const answeredCount = currentQuestions.filter(q => {
      const a = answers?.[q.id] || answers?.[q._id];
      if (!a) return false;
      if (typeof a === "string") return a.trim().length > 0;
      if (typeof a === "object") {
        if (a.text && a.text.trim().length > 0) return true;
        if (a.code && a.code.trim().length > 0) return true;
        return Object.keys(a).length > 0;
      }
      return false;
    }).length;
    const totalCount = currentQuestions.length || 3;
    const skippedCount = Math.max(0, totalCount - answeredCount);

    const phaseDurationSecs = (sessionData?.phases?.phase4?.durationMins || 15) * 60;
    const timeSpentSecs = Math.max(0, phaseDurationSecs - timeLeftSeconds);
    const mins = Math.floor(timeSpentSecs / 60);
    const secs = timeSpentSecs % 60;
    const formattedTime = `${mins} min ${secs.toString().padStart(2, "0")} sec`;

    const realStats = {
      phase: "hr",
      totalAttempted: `${answeredCount} / ${totalCount}`,
      answered: `${answeredCount}`,
      skipped: `${skippedCount}`,
      timeTaken: formattedTime,
      status: "All Assessment Rounds Completed 🎉",
    };

    try {
      localStorage.setItem(`interview_completed_phase_${interviewId}_phase4`, "true");
      localStorage.setItem(`interview_stats_${interviewId}_hr`, JSON.stringify(realStats));
    } catch (e) {}

    try {
      await api.post(
        `/interview/${interviewId}/phase/4/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to submit Phase 4:", err);
    }

    navigate(`/interview/${interviewId}/phase-complete?phase=hr`, {
      state: { realStats, phase: "hr", questions: currentQuestions, answers },
      replace: true
    });
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      // End of active phase questions
      if (currentPhaseKey === "phase1") {
        completeAptitudePhase();
      } else if (currentPhaseKey === "phase2") {
        completeTech1Phase();
      } else if (currentPhaseKey === "phase3") {
        completeTech2Phase();
      } else if (currentPhaseKey === "phase4") {
        completeHRPhase();
      } else {
        setShowSubmitModal(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  // Phase Transition Continue
  const handleContinueNextPhase = () => {
    setShowPhaseModal(false);
    if (currentPhaseKey === "phase1") {
      setCurrentPhaseKey("phase2");
      setCurrentIndex(0);
      setTimeLeftSeconds((sessionData?.phases?.phase2?.durationMins || 20) * 60);
      const q1 = sessionData?.phases?.phase2?.questions?.[0];
      if (q1) setVisitedQuestions((prev) => ({ ...prev, [q1.id]: true }));
    } else if (currentPhaseKey === "phase2") {
      setCurrentPhaseKey("phase3");
      setCurrentIndex(0);
      setTimeLeftSeconds((sessionData?.phases?.phase3?.durationMins || 30) * 60);
      const q1 = sessionData?.phases?.phase3?.questions?.[0];
      if (q1) setVisitedQuestions((prev) => ({ ...prev, [q1.id]: true }));
    }
  };

  // Submit Interview Handler
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post(
        "/interview/submit",
        {
          interviewId,
          answers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear localStorage cache for this interview immediately if not fallback!
      try {
        if (!interviewId.startsWith("session-")) {
          localStorage.removeItem(`interview_answers_${interviewId}`);
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("interview_code_") || key.startsWith(`interview_timer_${interviewId}`))) {
              localStorage.removeItem(key);
              i--;
            }
          }
        }
      } catch (e) {}
    } catch (err) {
      console.error("Submit interview error:", err);
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
      completeHRPhase();
    }
  };

  const handleTriggerSubmit = () => {
    if (currentPhaseKey === "phase1") {
      completeAptitudePhase();
    } else if (currentPhaseKey === "phase2") {
      completeTech1Phase();
    } else if (currentPhaseKey === "phase3") {
      completeTech2Phase();
    } else if (currentPhaseKey === "phase4") {
      completeHRPhase();
    } else {
      setShowSubmitModal(true);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-rose-500 font-black text-xl">⚠️ Error Loading Session</div>
          <p className="text-brand-secondary text-sm font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-650 rounded text-xs font-bold hover:bg-blue-600 transition cursor-pointer text-white"
          >
            Retry Session Loading
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold font-mono">Loading Assessment Environment...</h2>
        </div>
      </div>
    );
  }

  if (currentPhaseKey === "phase3" || currentPhaseKey === "technical_round_2") {
    if (!lobbyCompleted) {
      return (
        <TechnicalRound2Workspace
          interviewId={interviewId}
          role={sessionData?.role || "Frontend React Developer"}
          difficulty={sessionData?.difficulty || "Medium"}
          timeLeftSeconds={timeLeftSeconds}
          resumeAnalysis={sessionData?.resumeAnalysis}
          onCompletePhase={() => {
            setLobbyCompleted(true);
            try {
              localStorage.setItem(`lobby_completed_${interviewId}`, "true");
            } catch (e) {}
          }}
        />
      );
    }
    return (
      <VoiceInterviewWorkspace
        interviewId={interviewId}
        role={sessionData?.role || "Frontend React Developer"}
        difficulty={sessionData?.difficulty || "Medium"}
        timeLeftSeconds={timeLeftSeconds}
        resumeAnalysis={sessionData?.resumeAnalysis}
        onCompletePhase={() => {
          try {
            localStorage.removeItem(`lobby_completed_${interviewId}`);
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith(`interview_notes_${interviewId}_`) || k.startsWith(`interview_draft_${interviewId}_`))) {
                localStorage.removeItem(k);
                i--;
              }
            }
          } catch (e) {}
          completeTech2Phase();
        }}
        sessionData={sessionData}
      />
    );
  }

  return (
    <div className="h-screen bg-brand-bg text-brand-text selection:bg-blue-500 selection:text-white font-sans flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <SessionNavbar
        interviewTitle={sessionData?.role ? `${sessionData.role} Assessment` : "AI Assessment Session"}
        currentPhaseName={currentPhaseObj.name || "Assessment Round"}
        timeLeftSeconds={timeLeftSeconds}
        autoSaveStatus={autoSaveStatus}
      />

      {/* Main 2-Column Assessment Layout */}
      <div className={(activeQuestion?.type === "coding" || activeQuestion?.type === "technical" || activeQuestion?.starterCode)
        ? "flex-1 w-full flex flex-col overflow-hidden bg-brand-bg"
        : "flex-1 w-full max-w-[1600px] mx-auto px-4 py-3 flex flex-col lg:flex-row gap-4 overflow-y-auto"
      }>
        {/* Left: Question Panel */}
        <QuestionPanel
          question={activeQuestion}
          currentIndex={currentIndex}
          totalQuestions={currentQuestions.length}
          currentPhaseName={currentPhaseObj.name}
          answer={activeQuestion ? answers[activeQuestion.id] : null}
          onAnswerChange={handleAnswerChange}
          isFlagged={activeQuestion ? !!flaggedQuestions[activeQuestion.id] : false}
          onToggleFlag={handleToggleFlag}
          onPrev={handlePrev}
          onNext={handleNext}
          onSubmit={handleTriggerSubmit}
          isFirst={currentIndex === 0}
          isLast={currentIndex === currentQuestions.length - 1}
          isLocked={sessionData?.status === "Completed" || sessionData?.isLocked}
          questions={currentQuestions}
          answers={answers}
          visitedQuestions={visitedQuestions}
          flaggedQuestions={flaggedQuestions}
          onSelectQuestion={goToQuestion}
        />

        {/* Right: Side Panel (Hidden for coding/technical code mode to maximize workspace) */}
        {!(activeQuestion?.type === "coding" || activeQuestion?.type === "technical" || activeQuestion?.starterCode) && (
          <SessionSidebar
            role={sessionData?.role}
            experience={sessionData?.experience}
            difficulty={sessionData?.difficulty}
            currentPhaseIndex={currentPhaseObj.phaseNumber}
            questions={currentQuestions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            visitedQuestions={visitedQuestions}
            onSelectQuestion={goToQuestion}
            timeLeftSeconds={timeLeftSeconds}
            onSubmit={handleTriggerSubmit}
          />
        )}
      </div>

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        isOpen={showPhaseModal}
        completedPhaseName={completedPhaseName}
        nextPhaseName={nextPhaseName}
        onContinue={handleContinueNextPhase}
      />

      {/* Submit Confirmation Modal */}
      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        answeredCount={Object.keys(answers).length}
        totalCount={currentQuestions.length}
      />
    </div>
  );
}
