import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Check,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  Eye,
  AlertTriangle,
  ChevronRight,
  FileText,
  Code2,
  Terminal,
  Cpu,
  Layers,
  UserCheck,
  Trophy,
  Award,
  BarChart3,
  BookOpen,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

export default function PhaseCompleteTransition() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Determine active phase from state or URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const queryPhase = searchParams.get("phase");
  const rawPhase = location.state?.phase || queryPhase || "oa";

  const isTech1 = rawPhase === "tech1" || rawPhase === "technical_round_1" || rawPhase === "phase2";
  const isTech2 = rawPhase === "tech2" || rawPhase === "technical_round_2" || rawPhase === "phase3";
  const isHR = rawPhase === "hr" || rawPhase === "hr_round" || rawPhase === "phase4" || rawPhase === "completed";

  const [isStartingNext, setIsStartingNext] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Real session state fetched from backend
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [workspaceSubmission, setWorkspaceSubmission] = useState(null);

  useEffect(() => {
    let pollInterval = null;

    const checkStatus = async () => {
      if (!interviewId) return;

      if (interviewId.startsWith("session-")) {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        try {
          const localSession = localStorage.getItem(`interview_session_${interviewId}`);
          const localAnswers = localStorage.getItem(`interview_answers_${interviewId}`);
          if (localSession) {
            const sessionObj = JSON.parse(localSession);
            const answersObj = localAnswers ? JSON.parse(localAnswers) : {};
            const phases = sessionObj.phases || {};
            let activePhaseQuestions = [];
            if (isTech1) activePhaseQuestions = phases.phase2?.questions || [];
            else if (isTech2) activePhaseQuestions = phases.phase3?.questions || [];
            else if (isHR) activePhaseQuestions = phases.phase4?.questions || [];
            else activePhaseQuestions = phases.phase1?.questions || [];

            setSessionQuestions(activePhaseQuestions);
            setUserAnswers(answersObj);
          }
        } catch (e) {
          console.error("Local storage lookup failed in mock transition:", e);
        }
        return;
      }

      try {
        const res = await api.get(`/interview/${interviewId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Auto-navigate if interview is complete and we are not explicitly reviewing reports
        if (res.data?.status === "Completed" || res.data?.status === "Submitted" || res.data?.status === "Expired" || res.data?.isLocked) {
          navigate(`/interview/${interviewId}/completed`, { replace: true });
          return;
        }

        const activePhases = res.data?.activePhases || ["phase1"];
        const phases = res.data?.phases || {};

        let nextReady = false;
        if (isTech1) {
          nextReady = activePhases.includes("phase3") && (phases.phase3?.questions?.length > 0 || res.data?.questions?.length > 0);
        } else if (isTech2) {
          nextReady = activePhases.includes("phase4") && phases.phase4?.questions?.length > 0;
        } else if (isHR) {
          nextReady = true;
        } else {
          nextReady = activePhases.includes("phase2") && (phases.phase2?.questions?.length > 0 || res.data?.technicalQuestions?.length > 0);
        }

        if (nextReady) {
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          setWorkspaceSubmission(res.data?.workspaceSubmission || null);

          let activePhaseQuestions = [];
          if (isTech1) activePhaseQuestions = phases.phase2?.questions || [];
          else if (isTech2) {
            const taskTitle = res.data.workspaceState?.taskGuidelines?.title || "Project Development Challenge";
            const taskDesc = res.data.workspaceState?.taskGuidelines?.description || "Implement features in workspace templates.";
            activePhaseQuestions = [{
              id: "p3_project_dev",
              title: taskTitle,
              description: taskDesc,
              type: "project",
              difficulty: res.data.difficulty || "Medium",
              constraints: "Filesystem Workspace • Persistence"
            }];
            if (res.data.workspaceSubmission?.isSubmitted) {
              setUserAnswers({ p3_project_dev: "Submitted" });
            } else {
              setUserAnswers({});
            }
          }
          else if (isHR) activePhaseQuestions = phases.phase4?.questions || [];
          else activePhaseQuestions = phases.phase1?.questions || [];

          setSessionQuestions(activePhaseQuestions);
          if (!isTech2) {
            setUserAnswers(res.data.userAnswers || {});
          }
        }
      } catch (err) {
        console.error("Error checking session status, utilizing local storage fallback:", err);
        try {
          const localSession = localStorage.getItem(`interview_session_${interviewId}`);
          const localAnswers = localStorage.getItem(`interview_answers_${interviewId}`);
          if (localSession) {
            const sessionObj = JSON.parse(localSession);
            const answersObj = localAnswers ? JSON.parse(localAnswers) : {};
            const phases = sessionObj.phases || {};
            let activePhaseQuestions = [];
            if (isTech1) activePhaseQuestions = phases.phase2?.questions || [];
            else if (isTech2) activePhaseQuestions = phases.phase3?.questions || [];
            else if (isHR) activePhaseQuestions = phases.phase4?.questions || [];
            else activePhaseQuestions = phases.phase1?.questions || [];

            setSessionQuestions(activePhaseQuestions);
            setUserAnswers(answersObj);
          }
        } catch (e) {
          console.error("Local storage fallback failed in PhaseCompleteTransition:", e);
        }
      }
    };

    // Initial status check
    checkStatus();

    // Start polling status check
    pollInterval = setInterval(checkStatus, 3000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [interviewId, isTech1, isTech2, isHR, token]);

  const phaseQuestions = sessionQuestions.length > 0 ? sessionQuestions : (location.state?.questions || []);
  
  // Merge multiple sources of answers to ensure absolute correctness and robustness
  const realAnswersObj = {
    ...(location.state?.answers || {}),
    ...(() => {
      try {
        const localAnswers = localStorage.getItem(`interview_answers_${interviewId}`);
        return localAnswers ? JSON.parse(localAnswers) : {};
      } catch (e) {
        return {};
      }
    })(),
    ...(userAnswers || {})
  };

  const answeredCount = phaseQuestions.filter((q) => {
    const ans = realAnswersObj[q.id] || realAnswersObj[q._id];
    if (!ans) return false;
    if (typeof ans === "string") return ans.trim().length > 0;
    if (typeof ans === "object") {
      if (ans.selectedOption !== undefined && ans.selectedOption !== null) return true;
      if (ans.selectedOptions && ans.selectedOptions.length > 0) return true;
      if (ans.code && ans.code.trim().length > 0) return true;
      if (ans.text && ans.text.trim().length > 0) return true;
      return Object.keys(ans).length > 0;
    }
    return false;
  }).length;

  const totalCount = isTech2 ? 1 : (phaseQuestions.length || (isTech1 ? 2 : isHR ? 3 : 10));
  const skippedCount = Math.max(0, totalCount - answeredCount);
  let realStatsFromState = location.state?.realStats;
  if (!realStatsFromState && interviewId) {
    try {
      const storedStats = localStorage.getItem(`interview_stats_${interviewId}_${isTech1 ? "tech1" : isTech2 ? "tech2" : isHR ? "hr" : "oa"}`);
      if (storedStats) {
        realStatsFromState = JSON.parse(storedStats);
      }
    } catch (e) {}
  }

  const summaryMetrics = {
    totalAttempted: isTech2 ? (workspaceSubmission?.isSubmitted ? "1 / 1" : "0 / 1") : `${answeredCount} / ${totalCount}`,
    answered: isTech2 ? (workspaceSubmission?.weightedScore ? `${workspaceSubmission.weightedScore}%` : "Pending") : `${answeredCount}`,
    skipped: isTech2 ? (workspaceSubmission?.isSubmitted ? "0" : "1") : `${skippedCount}`,
    timeTaken: realStatsFromState?.timeTaken || "0 min 45 sec",
    status: realStatsFromState?.status || (isHR ? "All Assessment Rounds Completed 🎉" : isTech2 ? "Qualified for HR Round" : isTech1 ? "Qualified for Round 2" : "Qualified for Next Round"),
  };

  const nextRoundTopics = isHR
    ? [
        "Overall Performance Score",
        "Aptitude & Technical Breakdown",
        "System Architecture Radar",
        "Behavioral STAR Analysis",
        "Key Strengths & Growth Areas",
        "Final Hiring Recommendation",
      ]
    : isTech2
    ? [
        "Leadership & Ownership",
        "Conflict Resolution & Teamwork",
        "Project Deep Dives & Resume Verification",
        "Problem Solving Approach",
        "Work Ethics & Professionalism",
        "Career Aspirations & Culture Fit",
      ]
    : isTech1
    ? [
        "System Architecture",
        "Database Schema & Modeling",
        "Microservices & REST APIs",
        "Caching Strategies (Redis)",
        "Async Queues & Messaging",
        "Concurrency & Multithreading",
        "Low-Level Design (LLD)",
      ]
    : [
        "Data Structures & Algorithms (O(N) Complexity)",
        "Array Frequency Maps & Hash Tables",
        "Dynamic Programming (Kadane's Algorithm)",
        "Live IDE Execution & Automated Test Cases",
        "Edge Case Boundary Validations",
        "Clean Code Structure & Syntax",
      ];

  const handleStartNextRound = async () => {
    if (isHR) {
      navigate(`/interview/${interviewId}/completed`, { replace: true });
      return;
    }

    setIsStartingNext(true);
    const targetPhaseName = isTech2 ? "hr_round" : isTech1 ? "technical_round_2" : "technical_round_1";
    try {
      await api.post(
        "/interview/start-phase",
        {
          interviewId,
          phase: targetPhaseName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTimeout(() => {
        navigate(`/interview/session/${interviewId}?phase=${targetPhaseName}`);
      }, 700);
    } catch (err) {
      console.error("Start next phase error:", err);
      navigate(`/interview/session/${interviewId}?phase=${targetPhaseName}`);
    } finally {
      setIsStartingNext(false);
    }
  };


  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate("/dashboard");
  };

  const isReady = isHR || sessionQuestions.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text selection:bg-blue-500 selection:text-white font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container - Clean Full-Page Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-8 space-y-3.5 flex-1">
        {/* Hero Confirmation Banner (Clean & Non-Duplicated) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-md border border-brand-border bg-brand-card p-3.5 sm:p-4 backdrop-blur-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
        >
          {/* Subtle ambient glow in the banner background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex items-start sm:items-center gap-3 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-555/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-555/20 dark:border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] shrink-0">
              {isHR ? (
                <Trophy className="h-5.5 w-5.5 stroke-[2.5] text-amber-550 dark:text-amber-400" />
              ) : isTech2 ? (
                <Layers className="h-5.5 w-5.5 stroke-[2.5] text-indigo-500" />
              ) : isTech1 ? (
                <Code2 className="h-5.5 w-5.5 stroke-[2.5] text-blue-500" />
              ) : (
                <CheckCircle2 className="h-5.5 w-5.5 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold uppercase tracking-wider">
                  {isHR
                    ? "🎉 Full Assessment Completed"
                    : isTech2
                    ? "✓ Tech-2 Submission Confirmed"
                    : isTech1
                    ? "✓ Tech-1 Submission Confirmed"
                    : "✓ Aptitude Submission Confirmed"}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-brand-text tracking-tight leading-none">
                {isHR
                  ? "All Assessment Rounds Completed!"
                  : isTech2
                  ? "Technical Round 2 Completed"
                  : isTech1
                  ? "Technical Round 1 Completed"
                  : "Aptitude Assessment Completed"}
              </h1>
              <p className="text-[11px] text-brand-secondary font-medium leading-relaxed max-w-xl">
                {isHR
                  ? "Congratulations! You have completed all 4 assessment rounds (Aptitude, Tech 1, Tech 2, and HR). Your responses have been submitted for final score analysis."
                  : isTech2
                  ? "Your system architecture design, data models, and low-level design responses for Technical Round 2 have been recorded."
                  : isTech1
                  ? "Your coding solutions, complexity analysis, and live execution telemetry for Technical Round 1 have been recorded."
                  : "Your aptitude responses have been successfully recorded. Review your performance breakdown or proceed to the next round instructions."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-brand-border bg-brand-bg text-[11px] font-bold text-brand-secondary hover:bg-brand-border/20 hover:text-brand-text transition duration-200 cursor-pointer shadow-sm"
            >
              <LogOut className="h-3 w-3 text-rose-500" />
              <span>Exit Interview</span>
            </button>
          </div>
        </motion.div>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Response Metrics & Submitted Items (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-md border border-brand-border bg-brand-card p-4 backdrop-blur-xl shadow-md space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                <h3 className="text-[11px] font-mono uppercase font-bold text-brand-text flex items-center gap-1.5">
                  {isHR ? (
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  ) : isTech2 ? (
                    <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  ) : isTech1 ? (
                    <Terminal className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>
                    {isHR
                      ? "HR & Behavioral Session Summary"
                      : isTech2
                      ? "Technical Round 2 Architecture Summary"
                      : isTech1
                      ? "Technical Round 1 Execution Summary"
                      : "Aptitude Response Summary"}
                  </span>
                </h3>
                <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">
                  {summaryMetrics.status}
                </span>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Metric 1 */}
                <div className="border-l-4 border-l-blue-500 bg-brand-bg/40 p-2.5 rounded-sm hover:bg-brand-bg/60 transition-all duration-200 flex flex-col justify-between min-h-[72px] group">
                  <span className="text-[8.5px] font-mono font-bold uppercase text-brand-secondary block tracking-wider mb-0.5">
                    {isHR ? "HR Questions" : isTech2 ? "Project Tasks" : isTech1 ? "Problems Solved" : "Attempted"}
                  </span>
                  <span className="text-lg font-black text-brand-text font-mono tracking-tight group-hover:text-blue-500 transition-colors">{summaryMetrics.totalAttempted}</span>
                </div>

                {/* Metric 2 */}
                <div className="border-l-4 border-l-emerald-500 bg-brand-bg/40 p-2.5 rounded-sm hover:bg-brand-bg/60 transition-all duration-200 flex flex-col justify-between min-h-[72px] group">
                  <span className="text-[8.5px] font-mono font-bold uppercase text-brand-secondary block tracking-wider mb-0.5">
                    {isHR ? "STAR Answers" : isTech2 ? "AI Score" : isTech1 ? "Solutions Saved" : "Answered"}
                  </span>
                  <span className="text-lg font-black text-emerald-650 dark:text-emerald-400 font-mono tracking-tight group-hover:scale-105 transition-all origin-left">{summaryMetrics.answered}</span>
                </div>

                {/* Metric 3 */}
                <div className="border-l-4 border-l-amber-500 bg-brand-bg/40 p-2.5 rounded-sm hover:bg-brand-bg/60 transition-all duration-200 flex flex-col justify-between min-h-[72px] group">
                  <span className="text-[8.5px] font-mono font-bold uppercase text-brand-secondary block tracking-wider mb-0.5">Skipped</span>
                  <span className="text-lg font-black text-amber-650 dark:text-amber-400 font-mono tracking-tight group-hover:text-amber-550 transition-colors">{summaryMetrics.skipped}</span>
                </div>

                {/* Metric 4 */}
                <div className="border-l-4 border-l-purple-500 bg-brand-bg/40 p-2.5 rounded-sm hover:bg-brand-bg/60 transition-all duration-200 flex flex-col justify-between min-h-[72px] group">
                  <span className="text-[8.5px] font-mono font-bold uppercase text-brand-secondary block tracking-wider mb-0.5">Time Taken</span>
                  <span className="text-lg font-black text-purple-650 dark:text-purple-400 font-mono tracking-tight group-hover:text-purple-500 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">{summaryMetrics.timeTaken}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={async () => {
                    if (!isHR) {
                      const targetPhaseName = isTech2 ? "hr_round" : isTech1 ? "technical_round_2" : "technical_round_1";
                      try {
                        await api.post(
                          "/interview/start-phase",
                          {
                            interviewId,
                            phase: targetPhaseName,
                          },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                      } catch (e) {
                        console.error("Error advancing phase on backend:", e);
                      }
                    }
                    navigate(`/interview/${interviewId}/responses`, { replace: true });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition duration-200 cursor-pointer shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  <span>View Full Response Transcripts</span>
                </button>

                <p className="text-[11px] text-brand-secondary italic">
                  Responses saved securely.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Next Round Blueprint & Primary Launch Action (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-md border border-brand-border bg-brand-card p-4 backdrop-blur-xl shadow-md space-y-3.5 relative overflow-hidden">
              <div className="border-b border-brand-border pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[8.5px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
                    {isHR ? "Final Report Ready" : "Next Round Information"}
                  </span>
                  <h3 className="text-base font-black text-brand-text tracking-tight">
                    {isHR
                      ? "Comprehensive Skill Analytics"
                      : isTech2
                      ? "Phase 4: HR & Behavioral Round"
                      : isTech1
                      ? "Technical Interview - Round 2"
                      : "Technical Interview - Round 1"}
                  </h3>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold shrink-0 shadow-sm">
                  {isHR ? <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" /> : <Clock className="h-3.5 w-3.5" />}
                  <span>{isHR ? "Full Report" : isTech2 ? "15 Mins" : isTech1 ? "30 Mins" : "20 Mins"}</span>
                </div>
              </div>

              <p className="text-[11px] text-brand-secondary leading-relaxed font-medium">
                {isHR
                  ? "Access your detailed performance score, skill proficiency radar, strength & growth breakdown, STAR analysis, and recruiter decision report."
                  : isTech2
                  ? "Evaluates situational judgment, leadership principles, team communication, project reflections, conflict resolution, and overall cultural alignment."
                  : isTech1
                  ? "Evaluates low-level design patterns, high-level architecture, database schema design, microservices communication, scalability, caching strategies, and concurrency."
                  : "Evaluates core programming, Data Structures (Arrays, Hash Maps), Algorithmic time complexity O(N), and live IDE code execution with automated test cases."}
              </p>

              <div className="space-y-1.5">
                <span className="text-[8.5px] font-mono font-bold uppercase text-brand-secondary block">
                  {isHR ? "Report Features Included:" : "Core Topics Covered:"}
                </span>
                <div className="flex flex-wrap gap-1">
                  {nextRoundTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-sm bg-brand-bg/60 border border-brand-border text-[11px] font-bold text-brand-text hover:bg-brand-border/20 transition duration-150"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="pt-2.5 border-t border-brand-border space-y-2">
                <span className="text-[8.5px] font-mono uppercase font-bold text-brand-secondary block">
                  Pre-Round Environment Checklist
                </span>
                <div className="space-y-1 text-[11px] font-bold">
                  <div className="flex items-center gap-2 p-1.5 rounded-sm bg-emerald-500/5 border border-emerald-555/20 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-455 stroke-[3.5] shrink-0" />
                    <span>
                      {isHR
                        ? "All Assessment Rounds Completed ✓"
                        : isTech2
                        ? "Aptitude, Tech-1 & Tech-2 Completed ✓"
                        : isTech1
                        ? "Aptitude & Tech-1 Completed ✓"
                        : "Aptitude Assessment Passed ✓"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-sm bg-emerald-500/5 border border-emerald-555/20 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-455 stroke-[3.5] shrink-0" />
                    <span>
                      {isHR
                        ? "Evaluation Report Prepared ✓"
                        : isTech2
                        ? "HR STAR Interview Sandbox Active ✓"
                        : isTech1
                        ? "System Architecture Editor Active ✓"
                        : "Judge0 IDE Code Compiler Active ✓"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-sm bg-emerald-500/5 border border-emerald-555/20 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-455 stroke-[3.5] shrink-0" />
                    <span>
                      {isHR ? "Camera & Microphone Shut Down ✓" : "Camera & Microphone Active ✓"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Launch Action Button (Single, Non-Duplicated) */}
              <button
                type="button"
                onClick={handleStartNextRound}
                disabled={isStartingNext || !isReady}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[12px] sm:text-xs font-bold transition duration-200 cursor-pointer active:scale-95 border ${
                  isStartingNext || !isReady
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-550 border-brand-border cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 !text-white border-transparent"
                }`}
              >
                <span className={isStartingNext || !isReady ? "text-slate-400 dark:text-slate-550" : "!text-white"}>
                  {!isReady
                    ? "Preparing Next Round..."
                    : isHR
                    ? "Finish & View Report 🎉"
                    : isStartingNext
                    ? "Initializing Next Round..."
                    : isTech2
                    ? "Start HR Round"
                    : isTech1
                    ? "Start Technical Round 2"
                    : "Start Technical Round 1 Now 🚀"}
                </span>
                <ArrowRight className={`h-3.5 w-3.5 ${isStartingNext || !isReady ? "text-slate-400 dark:text-slate-550" : "!text-white"}`} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-sm border border-brand-border bg-brand-card p-6 shadow-2xl space-y-4 text-center text-brand-text"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-brand-text">Exit Active Interview?</h3>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  Your interview session is currently in progress. Exiting now will pause your evaluation until you resume.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2.5 rounded-sm border border-brand-border bg-brand-bg text-xs font-bold text-brand-secondary hover:bg-brand-border/25 cursor-pointer transition duration-200"
                >
                  Resume Interview
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex-1 py-2.5 rounded-sm bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer transition duration-200"
                >
                  Exit to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer onlyCopyright={true} />
    </div>
  );
}
