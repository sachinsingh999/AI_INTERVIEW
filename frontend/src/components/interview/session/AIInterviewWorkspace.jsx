import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Check,
  Bot,
  FileText,
  Brain,
  Volume2,
  Mic,
  Video,
  Wifi,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Lock,
  ChevronRight,
  Sliders,
  GitFork,
  Target,
  Activity,
  Award,
  User,
  GraduationCap,
  Briefcase,
  Clock,
  HelpCircle,
  Shield,
  Layers,
  Sparkles,
  ChevronLeft,
  XCircle,
  Play
} from "lucide-react";
import api from "../../../services/api";

export default function AIInterviewWorkspace({
  interviewId,
  role = "Software Engineer",
  difficulty = "Adaptive",
  timeLeftSeconds: initialTimeLeft = 1800,
  onCompletePhase,
  sessionData: initialSessionData
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(""); // "", "saving", "recorded", "error"
  const [error, setError] = useState(null);
  
  // State from backend APIs
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [interviewDetails, setInterviewDetails] = useState(initialSessionData || null);

  // Input states
  const [textAnswer, setTextAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle", "saving", "saved", "error"

  // AI states
  const [aiState, setAiState] = useState("speaking"); // "speaking", "thinking", "listening", "typing"
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  
  // Auto-expand textarea ref
  const textareaRef = useRef(null);

  // Local storage keys
  const notesKey = `interview_notes_${interviewId}_`;
  const draftKey = `interview_draft_${interviewId}_`;

  // Fetch session data & questions
  useEffect(() => {
    const fetchQuestionsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        // 1. Fetch details
        const detailsRes = await api.get(`/interview/${interviewId}`);
        setInterviewDetails(detailsRes.data);

        // 2. Fetch questions
        const questionsRes = await api.get(`/interview/${interviewId}/questions`);
        
        let phase3Qs = [];
        if (questionsRes.data?.phases?.phase3?.questions) {
          phase3Qs = questionsRes.data.phases.phase3.questions;
        } else if (questionsRes.data?.questions) {
          phase3Qs = questionsRes.data.questions;
        }

        // Standard fallback if phase 3 questions array is empty
        if (phase3Qs.length === 0) {
          phase3Qs = [
            {
              id: "p3_q1",
              title: "Optimizing Real-time Search Autocomplete",
              description: "Explain how you would design a high-performance autocomplete query service. Focus on client-side debounce mechanisms, cache invalidation strategies, network abort techniques (AbortController), and backend indexing to support sub-50ms responses.",
              category: "Backend Architecture",
              difficulty: "Hard",
              skills: ["React", "Node.js", "Redis"]
            },
            {
              id: "p3_q2",
              title: "Handling Concurrent Updates & Sockets",
              description: "Suppose multiple users attempt to edit the same resource concurrently. Describe standard conflict-free resolution algorithms (CRDTs or Operational Transformation) and outline how you would deploy secure WebSockets handling state-sync over REST API fallbacks.",
              category: "System Design",
              difficulty: "Hard",
              skills: ["WebSockets", "Node.js", "JWT"]
            }
          ];
        }

        setQuestions(phase3Qs);

        // 3. Load answers already saved in DB to recover progress
        const dbAnswers = detailsRes.data?.userAnswers || {};
        setAnswers(dbAnswers);

        // Recover saved drafts if any or load from DB answers
        let resumeIndex = 0;
        for (let i = 0; i < phase3Qs.length; i++) {
          const qId = phase3Qs[i].id || phase3Qs[i]._id;
          const savedAnswer = dbAnswers[qId] || localStorage.getItem(`${draftKey}${qId}`) || "";
          
          if (!savedAnswer) {
            resumeIndex = i;
            break;
          }
        }
        
        setCurrentIndex(resumeIndex);
        
        // Set initial draft text for the resumed index
        const currentQId = phase3Qs[resumeIndex]?.id || phase3Qs[resumeIndex]?._id;
        const initialText = dbAnswers[currentQId] || localStorage.getItem(`${draftKey}${currentQId}`) || "";
        setTextAnswer(initialText);

        // Restore private notes
        const restoredNotes = localStorage.getItem(`${notesKey}${currentQId}`) || "";
        setNotes(restoredNotes);

      } catch (err) {
        console.error("Error loading interview details:", err);
        setError("Unable to initialize interview workspace. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsData();
  }, [interviewId]);

  // Handle countdown timer
  useEffect(() => {
    if (loading || error || isAiAnalyzing) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [loading, error, isAiAnalyzing]);

  // Handle auto-expanding textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textAnswer]);

  // Save draft locally to localStorage & DB on manual trigger or changes
  const handleSaveDraft = async () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id || currentQuestion._id;
    setSaveStatus("saving");

    try {
      localStorage.setItem(`${draftKey}${qId}`, textAnswer);

      // Trigger standard API patch for drafting
      await api.patch(`/interview/${interviewId}/answer`, {
        questionId: qId,
        answer: textAnswer
      });

      setAnswers((prev) => ({ ...prev, [qId]: textAnswer }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Draft save failed:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // Sync state when loading next/previous questions
  const loadQuestionData = (index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    const targetQ = questions[index];
    const qId = targetQ.id || targetQ._id;

    // Load text answer (Draft or DB)
    const existing = answers[qId] || localStorage.getItem(`${draftKey}${qId}`) || "";
    setTextAnswer(existing);

    // Load private notes
    const existingNotes = localStorage.getItem(`${notesKey}${qId}`) || "";
    setNotes(existingNotes);
    
    setAiState("speaking");
  };

  // Submit Answer flow
  const handleSubmitAnswer = async () => {
    if (!textAnswer.trim()) return;
    const currentQ = questions[currentIndex];
    const qId = currentQ.id || currentQ._id;

    setSubmitting(true);
    setSubmitStatus("saving");
    setAiState("thinking");

    try {
      // Save answer in DB
      await api.patch(`/interview/${interviewId}/answer`, {
        questionId: qId,
        answer: textAnswer
      });

      // Update local answers list
      setAnswers((prev) => ({ ...prev, [qId]: textAnswer }));
      setSubmitStatus("recorded");
      
      // Simulate connecting to AI evaluator & thinking delay
      setTimeout(() => {
        setIsAiAnalyzing(true);
        setSubmitStatus("");
        
        // Staggered AI feedback sequence (represents the conversational delay)
        setTimeout(() => {
          setIsAiAnalyzing(false);
          setSubmitting(false);
          
          if (currentIndex < questions.length - 1) {
            // Move to next question and refresh inputs
            loadQuestionData(currentIndex + 1);
          } else {
            // All questions answered, trigger complete callback
            handleFinishRound();
          }
        }, 2200);

      }, 1200);

    } catch (err) {
      console.error("Submit answer error:", err);
      setSubmitStatus("error");
      setSubmitting(false);
      setAiState("speaking");
    }
  };

  // Complete round and advance to next phase
  const handleFinishRound = async () => {
    setLoading(true);
    try {
      // 1. Submit the overall phase responses on backend
      await api.post(`/interview/${interviewId}/phase/3/submit`, {
        answers: answers
      });

      // 2. Call parent callback
      if (onCompletePhase) {
        onCompletePhase();
      }
    } catch (err) {
      console.error("Failed completing phase 3:", err);
      setError("An error occurred while compiling your final session report.");
      setLoading(false);
    }
  };

  // Save notes locally
  const handleNotesChange = (val) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id || currentQuestion._id;
    setNotes(val);
    localStorage.setItem(`${notesKey}${qId}`, val);
  };

  // Helper formatting for timer
  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-brand-card border border-brand-border rounded-xl p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-md">
            <XCircle className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-brand-text">System Error</h3>
            <p className="text-xs text-brand-secondary leading-relaxed font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition duration-200 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-brand-secondary uppercase">
            Synchronizing Workspace state...
          </h2>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id || currentQuestion?._id;
  const isQuestionAnswered = !!answers[currentQuestionId];

  // Dynamic context skills checker: checks if active question description mentions any skills
  const skillsList = ["React", "Node.js", "MongoDB", "Express", "Java", "C++", "Tailwind CSS", "JWT", "REST API", "WebSockets", "Redis", "TypeScript"];
  const highlightedSkills = skillsList.filter(skill => 
    currentQuestion?.description?.toLowerCase().includes(skill.toLowerCase()) ||
    currentQuestion?.title?.toLowerCase().includes(skill.toLowerCase())
  );

  // Dynamic progress tracker timeline status
  const progressTimelineSteps = [
    { title: "Introduction", status: "completed" },
    { title: "Resume Discussion", status: currentIndex === 0 ? "current" : currentIndex > 0 ? "completed" : "upcoming" },
    { title: "Technical Skills", status: currentIndex === 1 ? "current" : currentIndex > 1 ? "completed" : "upcoming" },
    { title: "Projects", status: currentIndex === 2 ? "current" : currentIndex > 2 ? "completed" : "upcoming" },
    { title: "Problem Solving", status: currentIndex >= 3 ? "current" : "upcoming" },
    { title: "Interview Summary", status: "upcoming" }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-card/85 backdrop-blur-md px-6 py-4">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-indigo-600 flex items-center justify-center shadow-md border border-indigo-400/30">
              <Cpu className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-brand-text">CodeForge</span>
                <span className="h-1 w-1 rounded-full bg-brand-border" />
                <span className="text-[10px] font-mono font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                  Live Session
                </span>
              </div>
            </div>
          </div>

          {/* Question Counter (Middle) */}
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-brand-bg border border-brand-border text-xs font-mono font-bold text-brand-text">
            <span>Round 2</span>
            <span className="text-brand-secondary opacity-40">•</span>
            <span className="text-indigo-500 dark:text-indigo-400">Question {currentIndex + 1} of {questions.length}</span>
          </div>

          {/* Right Status / Timer */}
          <div className="flex items-center gap-4">
            
            {/* Live status indicators */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-mono font-bold">
              <div className="flex items-center gap-1 text-emerald-555 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1 w-1 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                AI Agent Online
              </div>
              <div className="flex items-center gap-1 text-brand-secondary bg-brand-bg border border-brand-border px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                Connected
              </div>
            </div>

            {/* Countdown timer */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-xs transition duration-300 ${
              timeLeft < 300
                ? "bg-rose-500/15 border-rose-500/30 text-rose-550 dark:text-rose-400 animate-pulse"
                : "bg-brand-bg border-brand-border text-brand-text"
            }`}>
              <Clock className={`h-3.5 w-3.5 ${timeLeft < 300 ? "text-rose-500" : "text-indigo-500 dark:text-indigo-400"}`} />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Container */}
      <div className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
               {/* Left Progress Timeline Sidebar (2 cols) */}
        <aside className="lg:col-span-2 space-y-6 flex flex-col justify-start">
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              Progress Tracker
            </h3>

            {/* Steps Timeline */}
            <div className="space-y-4.5 relative pl-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-brand-border">
              {progressTimelineSteps.map((step) => {
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div key={step.title} className="relative flex flex-col text-xs leading-normal">
                    {/* Circle Node */}
                    <div className="absolute -left-[14px] -translate-x-1/2 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-card z-10">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 fill-brand-card z-20" />
                      ) : isCurrent ? (
                        <span className="relative flex h-2.5 w-2.5 items-center justify-center bg-brand-card rounded-full z-20">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400/30 opacity-75 animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                        </span>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-brand-border z-20" />
                      )}
                    </div>

                    <span className={`font-bold ${
                      isCurrent ? "text-brand-text font-black" : isCompleted ? "text-brand-text/90" : "text-brand-secondary/60"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Percentage Bar */}
            <div className="pt-4 border-t border-brand-border space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-brand-secondary font-mono">
                <span>R2 COMPLETION</span>
                <span>{Math.round(((currentIndex) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-brand-bg border border-brand-border overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Conversation & Textarea Panel (7 cols) */}
        <main className="lg:col-span-7 space-y-6 flex flex-col justify-start relative">
          
          {/* AI Header & Conversation Bubble Area */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            
            {/* Robot/Agent status bar */}
            <div className="flex items-center justify-between border-b border-brand-border/65 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-455 relative shadow-inner">
                  <Bot className="h-5.5 w-5.5" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 border-2 border-brand-card rounded-full" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-text block">Interview Agent</span>
                  <span className="text-[10px] text-brand-secondary block font-semibold font-mono">AI Assessment Engine</span>
                </div>
              </div>

              {/* Speak State Badge */}
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-indigo-550 dark:text-indigo-400 uppercase tracking-widest">
                  {isAiAnalyzing ? "Analyzing" : submitting ? "Thinking" : textAnswer ? "Listening" : "Speaking"}
                </span>
              </div>
            </div>

            {/* Question Display Screen */}
            <div className="min-h-[140px] flex items-center py-2 relative">
              <AnimatePresence mode="wait">
                {isAiAnalyzing ? (
                  <motion.div
                    key="analyzing-state"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col items-center justify-center w-full space-y-3 py-6"
                  >
                    <div className="flex space-x-1.5">
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400 animate-pulse">
                      AI is analyzing your previous answer...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 w-full"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold text-brand-secondary bg-brand-bg border border-brand-border rounded">
                        {currentQuestion?.category || "Technical concepts"}
                      </span>
                      <span className="text-[10px] text-brand-secondary font-mono">{currentQuestion?.difficulty || difficulty} Difficulty</span>
                    </div>
                    <h2 className="text-lg font-bold text-brand-text tracking-tight">
                      {currentQuestion?.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed font-medium">
                      {currentQuestion?.description || currentQuestion?.question}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Response Area (Text / Speech placeholder) */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
            
            {/* Tabs & Draft indicators */}
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-brand-text">Your Answer</span>
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded">
                    Text Mode
                  </span>
                </div>
              </div>

              {/* Saved Status Indicator */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-brand-secondary">
                {saveStatus === "saving" ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                    <span className="text-indigo-400">Saving...</span>
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Draft Saved</span>
                  </>
                ) : (
                  <span>Auto-saved in browser</span>
                )}
              </div>
            </div>

            {/* Answer Input Panel */}
            <div className="space-y-4">
              
              {/* Textarea */}
              <div className="relative rounded-lg border border-brand-border bg-slate-50 dark:bg-slate-950 overflow-hidden focus-within:border-indigo-500/50 transition duration-200">
                <textarea
                  ref={textareaRef}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={submitting || isQuestionAnswered}
                  rows={4}
                  placeholder="Type your answer here. Provide a detailed explanation, technical design principles, and concrete examples..."
                  className="w-full bg-transparent px-4 py-3.5 text-xs text-brand-text placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none resize-none min-h-[120px] font-sans leading-relaxed"
                />
              </div>
              {/* Voice Mode placeholder */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100/50 dark:bg-slate-950/60 border border-brand-border text-brand-secondary">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-brand-secondary/80" />
                  <span className="text-xs font-bold">Voice Input Mode</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Coming Soon
                </span>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between gap-3 pt-1">
                
                {/* Clear / Reset */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTextAnswer("")}
                    disabled={submitting || isQuestionAnswered || !textAnswer}
                    className="px-3 py-1.5 rounded-lg border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-brand-secondary hover:text-brand-text transition duration-150 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={submitting || isQuestionAnswered || !textAnswer}
                    className="px-3 py-1.5 rounded-lg bg-brand-bg border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-brand-secondary hover:text-brand-text transition duration-150 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    Save Draft
                  </button>
                </div>

                {/* Submit actions */}
                <div className="flex items-center gap-2">
                  {/* Status checklist check */}
                  {submitStatus === "saving" && (
                    <span className="text-xs font-mono font-bold text-indigo-400 animate-pulse">
                      Sending...
                    </span>
                  )}
                  {submitStatus === "recorded" && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Answer Recorded
                    </span>
                  )}
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || isQuestionAnswered || !textAnswer.trim()}
                    className={`px-5 py-2 rounded-lg text-xs font-black text-white transition duration-200 cursor-pointer ${
                      submitting || isQuestionAnswered || !textAnswer.trim()
                        ? "bg-slate-205 dark:bg-slate-800 border border-brand-border text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    }`}
                  >
                    Submit Answer
                  </button>

                  <button
                    onClick={() => loadQuestionData(currentIndex + 1)}
                    disabled={currentIndex === questions.length - 1 || (!isQuestionAnswered && submitting)}
                    className="p-2 rounded-lg border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition duration-150 disabled:opacity-20 cursor-pointer"
                    title="Next Question"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </main>

        {/* Right Info Panel (3 cols): Context & Private Notes */}
        <aside className="lg:col-span-3 space-y-6 flex flex-col justify-start">
          
          {/* Interview Context Card */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2 border-b border-brand-border pb-2.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              Round Properties
            </h3>

            <div className="space-y-3.5 text-[11px] font-medium">
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary">Interview Type</span>
                <span className="text-brand-text font-bold">Resume Based</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary">Difficulty</span>
                <span className="text-brand-text font-mono font-bold capitalize">{interviewDetails?.difficulty || difficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary">Category Focus</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentQuestion?.category || "Core Concepts"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary">Evaluations Complete</span>
                <span className="text-brand-text font-bold">{Object.keys(answers).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary">Questions Left</span>
                <span className="text-brand-text font-bold">{Math.max(0, questions.length - Object.keys(answers).length)}</span>
              </div>
            </div>
          </div>

          {/* Resume Context Card */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4.5">
            <div className="border-b border-brand-border pb-2.5">
              <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                Resume Evaluator Context
              </h3>
              <span className="text-[10px] text-brand-secondary/80 block mt-1 font-medium leading-normal">
                Highlight shows skill related to the active question context.
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill) => {
                const isHighlighted = highlightedSkills.some(s => s.toLowerCase() === skill.toLowerCase());

                return (
                  <span
                    key={skill}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition duration-200 ${
                      isHighlighted
                        ? "bg-indigo-500/20 border border-indigo-500 text-indigo-650 dark:text-indigo-350 shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                        : "bg-brand-bg border border-brand-border text-brand-secondary"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Private Notes Panel */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3.5">
            <h3 className="text-xs font-mono uppercase font-bold text-brand-secondary tracking-wider flex items-center gap-2 border-b border-brand-border pb-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              Private Scratchpad
            </h3>
            
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Use this space for formulas, logic structures, or thoughts. Notes are saved locally and are not seen by the AI Interviewer."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-brand-border rounded-lg p-2.5 text-[11px] text-brand-text placeholder-slate-400 dark:placeholder-slate-655 focus:outline-none focus:border-indigo-500 resize-none h-[120px] font-sans leading-relaxed"
            />
            <div className="text-[10px] text-brand-secondary/60 italic leading-normal text-right">
              Autosaved in scratchpad
            </div>
          </div>

        </aside>

      </div>

      {/* Horizontal Footer Status Checklist */}
      <footer className="border-t border-brand-border bg-brand-card px-6 py-4">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Timeline Nodes */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Resume Parsed
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              AI Configured
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Mic Operational
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Session Synchronized
            </div>
          </div>

          {/* Quick Nav Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadQuestionData(currentIndex - 1)}
              disabled={currentIndex === 0 || submitting}
              className="p-1.5 rounded border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-secondary disabled:opacity-20 transition cursor-pointer"
              title="Previous Question"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => loadQuestionData(currentIndex + 1)}
              disabled={currentIndex === questions.length - 1 || submitting}
              className="p-1.5 rounded border border-brand-border hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-secondary disabled:opacity-20 transition cursor-pointer"
              title="Next Question"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>

            {/* Manual complete override button visible if all are submitted */}
            {Object.keys(answers).length === questions.length && (
              <button
                onClick={handleFinishRound}
                className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black text-white rounded transition duration-150 cursor-pointer shadow-md"
              >
                Finish Assessment Round
              </button>
            )}
          </div>

        </div>
      </footer>

    </div>
  );
}
