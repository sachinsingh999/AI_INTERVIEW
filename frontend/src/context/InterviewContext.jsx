import React, { createContext, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const { id } = useParams();
  const [parentInterview, setParentInterview] = useState(null);
  const [activeChildId, setActiveChildId] = useState(null);
  const [activePhaseKey, setActivePhaseKey] = useState(null);
  const [lobbyState, setLobbyState] = useState(null);
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [examStarted, setExamStartedState] = useState(() => {
    return sessionStorage.getItem(`examStarted-${id}`) === "true";
  });
  const setExamStarted = (val) => {
    sessionStorage.setItem(`examStarted-${id}`, val);
    setExamStartedState(val);
  };

  const [instructionsAccepted, setInstructionsAcceptedState] = useState(() => {
    return sessionStorage.getItem(`instructionsAccepted-${id}`) === "true";
  });
  const setInstructionsAccepted = (val) => {
    sessionStorage.setItem(`instructionsAccepted-${id}`, val);
    setInstructionsAcceptedState(val);
  };

  const [autoRead, setAutoRead] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [questionStatus, setQuestionStatus] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [violations, setViolations] = useState([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState({});
  const [liveCodeError, setLiveCodeError] = useState("");
  const [runningTests, setRunningTests] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const [timeLeft, setTimeLeftState] = useState(() => {
    const saved = sessionStorage.getItem(`timeLeft-${id}`);
    return saved ? parseInt(saved, 10) : 45 * 60;
  });
  const setTimeLeft = (val) => {
    if (typeof val === "function") {
      setTimeLeftState((prev) => {
        const next = val(prev);
        sessionStorage.setItem(`timeLeft-${id}`, next);
        return next;
      });
    } else {
      sessionStorage.setItem(`timeLeft-${id}`, val);
      setTimeLeftState(val);
    }
  };

  // Proctored counts
  const [runCount, setRunCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteCount, setCopyPasteCount] = useState(0);

  // Canvas Whiteboard states
  const [drawColor, setDrawColor] = useState("#0f172a");
  const [brushWidth, setBrushWidth] = useState(4);
  const [toolMode, setToolMode] = useState("brush");
  const [notes, setNotes] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  React.useEffect(() => {
    if (activeChildId) {
      const stored = sessionStorage.getItem(`answers-${activeChildId}`);
      if (Object.keys(answers || {}).length > 0 || !stored) {
        sessionStorage.setItem(`answers-${activeChildId}`, JSON.stringify(answers));
      }
    }
  }, [answers, activeChildId]);

  React.useEffect(() => {
    if (activeChildId) {
      const stored = sessionStorage.getItem(`evaluations-${activeChildId}`);
      if (Object.keys(evaluations || {}).length > 0 || !stored) {
        sessionStorage.setItem(`evaluations-${activeChildId}`, JSON.stringify(evaluations));
      }
    }
  }, [evaluations, activeChildId]);

  React.useEffect(() => {
    if (activeChildId) {
      sessionStorage.setItem(`currentIndex-${activeChildId}`, currentIndex.toString());
    }
  }, [currentIndex, activeChildId]);

  React.useEffect(() => {
    if (activeChildId) {
      sessionStorage.setItem(`notes-${activeChildId}`, notes);
    }
  }, [notes, activeChildId]);

  React.useEffect(() => {
    if (activeChildId) {
      const savedNotes = sessionStorage.getItem(`notes-${activeChildId}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [activeChildId]);

  const value = {
    parentInterview, setParentInterview,
    activeChildId, setActiveChildId,
    activePhaseKey, setActivePhaseKey,
    lobbyState, setLobbyState,
    interview, setInterview,
    answers, setAnswers,
    evaluations, setEvaluations,
    currentIndex, setCurrentIndex,
    examStarted, setExamStarted,
    instructionsAccepted, setInstructionsAccepted,
    autoRead, setAutoRead,
    isMuted, setIsMuted,
    questionStatus, setQuestionStatus,
    isEvaluating, setIsEvaluating,
    violations, setViolations,
    cameraOn, setCameraOn,
    listening, setListening,
    demoMode, setDemoMode,
    codeFeedback, setCodeFeedback,
    liveCodeError, setLiveCodeError,
    runningTests, setRunningTests,
    selectedLanguage, setSelectedLanguage,
    timeLeft, setTimeLeft,
    runCount, setRunCount,
    submissionCount, setSubmissionCount,
    tabSwitchCount, setTabSwitchCount,
    copyPasteCount, setCopyPasteCount,
    drawColor, setDrawColor,
    brushWidth, setBrushWidth,
    toolMode, setToolMode,
    notes, setNotes,
    videoRef,
    streamRef,
    recognitionRef,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
}
