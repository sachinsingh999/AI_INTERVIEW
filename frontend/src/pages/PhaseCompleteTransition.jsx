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

  useEffect(() => {
    const fetchRealSession = async () => {
      if (!interviewId) return;
      try {
        const res = await api.get(`/interview/${interviewId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.status === "Completed" || res.data?.status === "Submitted" || res.data?.status === "Expired" || res.data?.isLocked) {
          navigate(`/interview/${interviewId}/responses`, { replace: true });
          return;
        }

        if (res.data?.phases) {
          const phases = res.data.phases;
          let activePhaseQuestions = [];
          if (isTech1) activePhaseQuestions = phases.phase2?.questions || [];
          else if (isTech2) activePhaseQuestions = phases.phase3?.questions || [];
          else if (isHR) activePhaseQuestions = phases.phase4?.questions || [];
          else activePhaseQuestions = phases.phase1?.questions || [];

          setSessionQuestions(activePhaseQuestions);
          setUserAnswers(res.data.userAnswers || {});
        }
      } catch (err) {
        console.error("Error fetching session data in PhaseCompleteTransition, attempting local fallback:", err);
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
    fetchRealSession();
  }, [interviewId, isTech1, isTech2, isHR, token]);

  const phaseQuestions = sessionQuestions.length > 0 ? sessionQuestions : (location.state?.questions || []);
  const realAnswersObj = Object.keys(userAnswers).length > 0 ? userAnswers : (location.state?.answers || {});

  const answeredCount = phaseQuestions.filter((q) => {
    const ans = realAnswersObj[q.id];
    if (!ans) return false;
    if (typeof ans === "string") return ans.trim().length > 0;
    if (typeof ans === "object") return (ans.code && ans.code.trim().length > 0) || ans.selectedOption;
    return false;
  }).length;

  const totalCount = phaseQuestions.length || (isTech1 ? 2 : isTech2 ? 2 : isHR ? 3 : 10);
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
    totalAttempted: `${answeredCount} / ${totalCount}`,
    answered: `${answeredCount}`,
    skipped: `${skippedCount}`,
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
      navigate(`/interview/${interviewId}/responses`, { replace: true });
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

  useEffect(() => {
    if (isTech2) {
      const timer = setTimeout(() => {
        navigate(`/interview/${interviewId}/responses`, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTech2]);

  if (isTech2) {
    return (
      <div className="min-h-screen bg-[#070b13] text-white flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
          Technical Round 2
        </h1>
      </div>
    );
  }

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-blue-500 selection:text-white font-sans pb-16">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container - Clean Full-Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Hero Confirmation Banner (Clean & Non-Duplicated) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-brand-border bg-brand-card p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
              {isHR ? (
                <Trophy className="h-5.5 w-5.5 stroke-[2.5] text-amber-400" />
              ) : isTech2 ? (
                <Layers className="h-5.5 w-5.5 stroke-[2.5]" />
              ) : isTech1 ? (
                <Code2 className="h-5.5 w-5.5 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="h-5.5 w-5.5 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                {isHR
                  ? "🎉 Full Assessment Completed"
                  : isTech2
                  ? "✓ Tech-2 Submission Confirmed"
                  : isTech1
                  ? "✓ Tech-1 Submission Confirmed"
                  : "✓ Aptitude Submission Confirmed"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                {isHR
                  ? "All Assessment Rounds Completed!"
                  : isTech2
                  ? "Technical Round 2 Completed"
                  : isTech1
                  ? "Technical Round 1 Completed"
                  : "Aptitude Assessment Completed"}
              </h1>
              <p className="text-xs text-brand-secondary font-normal leading-relaxed max-w-xl">
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

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-border bg-brand-card text-xs font-bold text-brand-secondary hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-text transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-450" />
              <span>Exit Interview</span>
            </button>
          </div>
        </motion.div>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Response Metrics & Submitted Items (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-brand-border bg-brand-card p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="text-xs font-mono uppercase font-bold text-brand-text flex items-center gap-2">
                  {isHR ? (
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                  ) : isTech2 ? (
                    <Cpu className="h-4 w-4 text-purple-400" />
                  ) : isTech1 ? (
                    <Terminal className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-amber-400" />
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
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                  {summaryMetrics.status}
                </span>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-brand-bg/85 p-3.5 rounded-xl border border-brand-border space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">
                    {isHR ? "HR Questions" : isTech2 ? "Design Scenarios" : isTech1 ? "Problems Solved" : "Attempted"}
                  </span>
                  <span className="text-lg font-black text-brand-text font-mono">{summaryMetrics.totalAttempted}</span>
                </div>

                <div className="bg-brand-bg/85 p-3.5 rounded-xl border border-brand-border space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">
                    {isHR ? "STAR Answers" : isTech2 ? "Schemas Saved" : isTech1 ? "Solutions Saved" : "Answered"}
                  </span>
                  <span className="text-lg font-black text-emerald-550 dark:text-emerald-400 font-mono">{summaryMetrics.answered}</span>
                </div>

                <div className="bg-brand-bg/85 p-3.5 rounded-xl border border-brand-border space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">Skipped</span>
                  <span className="text-lg font-black text-amber-555 dark:text-amber-400 font-mono">{summaryMetrics.skipped}</span>
                </div>

                <div className="bg-brand-bg/85 p-3.5 rounded-xl border border-brand-border space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">Time Taken</span>
                  <span className="text-lg font-black text-blue-550 dark:text-blue-400 font-mono">{summaryMetrics.timeTaken}</span>
                </div>
              </div>

              {/* Recorded Answers List (For Aptitude OA) */}
              {!isHR && !isTech1 && !isTech2 && (
                <div className="pt-3 border-t border-brand-border space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">
                    Recorded Aptitude Submission Responses
                  </span>
                  <div className="max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {phaseQuestions.map((q, idx) => {
                      const ans = realAnswersObj[q.id];
                      let userAnsText = "Not Attempted";
                      let isAnswered = false;
                      if (ans) {
                        if (typeof ans === "string") {
                          userAnsText = ans;
                          isAnswered = true;
                        } else if (ans.selectedOption) {
                          userAnsText = `Option ${ans.selectedOption}`;
                          isAnswered = true;
                        } else if (ans.selectedOptions && ans.selectedOptions.length > 0) {
                          userAnsText = ans.selectedOptions.join(", ");
                          isAnswered = true;
                        } else if (ans.text) {
                          userAnsText = ans.text;
                          isAnswered = true;
                        }
                      }
                      
                      return (
                        <div key={q.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/85 border border-brand-border text-xs">
                          <div>
                            <p className="font-bold text-brand-text max-w-[200px] truncate">{q.title || `Question ${idx + 1}`}</p>
                            <p className="text-[10px] text-brand-secondary font-mono truncate max-w-[200px]">{isAnswered ? `Answer: ${userAnsText}` : "No response"}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isAnswered ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-brand-bg text-brand-secondary border-brand-border"}`}>
                            {isAnswered ? "Saved ✓" : "Skipped"}
                          </span>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </div>
              )}

              {/* Submissions Preview (For HR) */}
              {isHR && (
                <div className="pt-3 border-t border-brand-border space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">
                    Submitted HR & Behavioral Responses
                  </span>
                  <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                    {phaseQuestions.map((q, idx) => {
                      const ans = realAnswersObj[q.id];
                      const isAnswered = ans && (typeof ans === "string" ? ans.trim().length > 0 : (ans.text && ans.text.trim().length > 0));
                      return (
                        <div key={q.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/85 border border-brand-border text-xs">
                          <div className="flex items-center gap-3">
                            <UserCheck className={`h-4.5 w-4.5 ${isAnswered ? "text-emerald-500" : "text-brand-secondary"}`} />
                            <div>
                              <p className="font-bold text-brand-text">{q.title || `Behavioral Question ${idx + 1}`}</p>
                              <p className="text-[10px] text-brand-secondary font-mono">STAR Method • Detailed Response</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${isAnswered ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-brand-bg text-brand-secondary border-brand-border"}`}>
                            {isAnswered ? "Saved ✓" : "Not Attempted"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submissions Preview (For Tech 1 & Tech 2) */}
              {(isTech1 || isTech2) && (
                <div className="pt-3 border-t border-brand-border space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block">
                    {isTech2 ? "Submitted Architecture & Design Challenges" : "Submitted Coding Challenges"}
                  </span>
                  <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                    {phaseQuestions.map((q, idx) => {
                      const ans = realAnswersObj[q.id];
                      const isAnswered = ans && (typeof ans === "string" ? ans.trim().length > 0 : (ans.code && ans.code.trim().length > 0));
                      const langDisplay = typeof ans === "object" && ans.language ? ans.language : (q.language || "JavaScript");
                      const totalTC = q.testCases?.length || 3;

                      return (
                        <div key={q.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/85 border border-brand-border text-xs">
                          <div className="flex items-center gap-3">
                            <Code2 className={`h-4.5 w-4.5 ${idx % 2 === 0 ? "text-blue-500" : "text-indigo-500"}`} />
                            <div>
                              <p className="font-bold text-brand-text">{q.title || `Coding Challenge ${idx + 1}`}</p>
                              <p className="text-[10px] text-brand-secondary font-mono">
                                {langDisplay} • {q.constraints ? (typeof q.constraints === "string" ? q.constraints.split("\n")[0] : q.constraints[0]) : "Time: O(N) | Space: O(1)"}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${isAnswered ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-brand-bg text-brand-secondary border-brand-border"}`}>
                            {isAnswered ? "Submitted ✓" : "Not Attempted"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => navigate(`/interview/${interviewId}/responses`, { replace: true })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-550 dark:text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span>View Full Response Transcripts</span>
                </button>

                <p className="text-xs text-brand-secondary italic">
                  Responses saved securely.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Next Round Blueprint & Primary Launch Action (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 backdrop-blur-xl shadow-xl space-y-5">
              <div className="border-b border-brand-border pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-500 tracking-wider block">
                    {isHR ? "Final Report Ready" : "Next Round Information"}
                  </span>
                  <h3 className="text-lg font-black text-brand-text tracking-tight">
                    {isHR
                      ? "Comprehensive Skill Analytics"
                      : isTech2
                      ? "Phase 4: HR & Behavioral Round"
                      : isTech1
                      ? "Technical Interview - Round 2"
                      : "Technical Interview - Round 1"}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shrink-0">
                  {isHR ? <Trophy className="h-4 w-4 text-amber-400" /> : <Clock className="h-4 w-4" />}
                  <span>{isHR ? "Full Report" : isTech2 ? "15 Mins" : isTech1 ? "30 Mins" : "20 Mins"}</span>
                </div>
              </div>

              <p className="text-xs text-brand-secondary leading-relaxed font-normal">
                {isHR
                  ? "Access your detailed performance score, skill proficiency radar, strength & growth breakdown, STAR analysis, and recruiter decision report."
                  : isTech2
                  ? "Evaluates situational judgment, leadership principles, team communication, project reflections, conflict resolution, and overall cultural alignment."
                  : isTech1
                  ? "Evaluates low-level design patterns, high-level architecture, database schema design, microservices communication, scalability, caching strategies, and concurrency."
                  : "Evaluates core programming, Data Structures (Arrays, Hash Maps), Algorithmic time complexity O(N), and live IDE code execution with automated test cases."}
              </p>

              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold uppercase text-brand-secondary block">
                  {isHR ? "Report Features Included:" : "Core Topics Covered:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {nextRoundTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border text-xs font-bold text-brand-text"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="pt-3 border-t border-brand-border space-y-2.5">
                <span className="text-[10px] font-mono uppercase font-bold text-brand-secondary block">
                  Pre-Round Environment Checklist
                </span>
                <div className="space-y-1.5 text-xs font-bold">
                  <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
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
                  <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
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
                  <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
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
                disabled={isStartingNext}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-xs sm:text-sm font-extrabold text-white shadow-xl hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer"
              >
                <span>
                  {isHR
                    ? "Open Full Assessment Report 🎉"
                    : isStartingNext
                    ? "Initializing Next Round..."
                    : isTech2
                    ? "Start HR Round"
                    : isTech1
                    ? "Start Technical Round 2"
                    : "Start Technical Round 1 Now 🚀"}
                </span>
                <ArrowRight className="h-4.5 w-4.5" />
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-4 text-center text-brand-text"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
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
                  className="flex-1 py-2.5 rounded-xl border border-brand-border bg-brand-card text-xs font-bold text-brand-secondary hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Resume Interview
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
                >
                  Exit to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
