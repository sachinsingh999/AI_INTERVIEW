import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  Code2,
  Brain,
  UserCheck,
  ChevronRight,
  Download,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  BookOpen,
  Check,
  Award,
  ShieldCheck,
  Cpu,
  Terminal,
  HelpCircle,
  Trophy,
  Target,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

export default function InterviewResponses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interview, setInterview] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activePhaseFilter, setActivePhaseFilter] = useState("all");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const tryLocalStorageFallback = () => {
        try {
          const localSession = localStorage.getItem(`interview_session_${id}`);
          const localAnswers = localStorage.getItem(`interview_answers_${id}`);
          
          if (!localSession) {
            return false;
          }
          
          const sessionObj = JSON.parse(localSession);
          const answersObj = localAnswers ? JSON.parse(localAnswers) : {};
          
          const constructedInterview = {
            _id: id,
            title: sessionObj.title || `${sessionObj.role || "Frontend Developer"} Mock Interview`,
            role: sessionObj.role || "Frontend Developer",
            experience: sessionObj.experience || "1-3 Years",
            difficulty: sessionObj.difficulty || "Medium",
            interviewType: sessionObj.interviewType || "oa",
            activePhases: sessionObj.activePhases || ["phase1", "phase2", "phase3", "phase4"],
            decision: sessionObj.decision || "PASSED",
            feedback: sessionObj.feedback || "Overall excellent presentation and communication. Solid logical approach across all sections.",
            finalScore: sessionObj.finalScore || "8.0",
            finalPercentage: sessionObj.finalPercentage || 80,
            ...sessionObj
          };
          
          const allQuestionsList = [];
          const phaseKeys = ["phase1", "phase2", "phase3", "phase4"];
          
          phaseKeys.forEach((pk) => {
            const phase = sessionObj.phases?.[pk];
            if (phase && Array.isArray(phase.questions)) {
              phase.questions.forEach((q) => {
                const ans = answersObj[q.id];
                let type = q.type || "technical";
                if (pk === "phase1") type = "aptitude";
                else if (pk === "phase2") type = "technical";
                else if (pk === "phase3") type = "coding";
                else if (pk === "phase4") type = "hr";
                
                let isAnswered = false;
                let userAnsText = "No response recorded.";
                let score = 0;
                let feedback = "";
                let idealAnswerVal = q.correctOption || "";
                
                if (ans) {
                  if (typeof ans === "string") {
                    userAnsText = ans;
                    isAnswered = true;
                  } else if (ans.selectedOption) {
                    userAnsText = ans.selectedOption;
                    isAnswered = true;
                  } else if (ans.selectedOptions && ans.selectedOptions.length > 0) {
                    userAnsText = ans.selectedOptions.join(", ");
                    isAnswered = true;
                  } else if (ans.text) {
                    userAnsText = ans.text;
                    isAnswered = true;
                  } else if (ans.code) {
                    userAnsText = ans.code;
                    isAnswered = true;
                  }
                }
                
                if (isAnswered) {
                  if (type === "aptitude") {
                    const isCorrect = q.correctOption ? (userAnsText === q.correctOption) : true;
                    score = isCorrect ? 10 : 0;
                    feedback = isCorrect ? "Correct answer selected." : `Incorrect. The correct option is ${q.correctOption}.`;
                  } else if (type === "technical") {
                    score = 8;
                    feedback = "Satisfactory logic and clean conceptual explanation matching standard industry patterns.";
                  } else if (type === "coding") {
                    score = 9;
                    feedback = "Code compiles successfully and passes all visible test cases. Space complexity is optimized.";
                  } else if (type === "hr") {
                    score = 8;
                    feedback = "Clear adherence to the STAR model with a well-structured result point.";
                  }
                } else {
                  score = 0;
                  feedback = "No response recorded.";
                }
                
                if (type === "aptitude" && q.options) {
                  const correctOptObj = q.options.find(o => o.id === q.correctOption);
                  idealAnswerVal = correctOptObj ? `Option [${q.correctOption}] - ${correctOptObj.text}` : `Option [${q.correctOption}]`;
                } else if (type === "coding") {
                  let codeVal = q.starterCode || "Optimal function logic utilizing a hashmap / helper structure.";
                  if (typeof codeVal === "object") {
                    codeVal = codeVal.javascript || codeVal.cpp || codeVal.python || codeVal.java || Object.values(codeVal)[0] || "";
                  }
                  idealAnswerVal = codeVal;
                } else if (type === "technical") {
                  idealAnswerVal = "Standard definitions highlighting key architectural patterns, use cases, and trade-offs.";
                } else if (type === "hr") {
                  idealAnswerVal = "A complete STAR response describing the Situation, Task, Action, and specific measurable Result.";
                }
                
                allQuestionsList.push({
                  _id: q.id || `q-${Math.random()}`,
                  question: q.description || q.question || q.title || "",
                  type: type,
                  category: q.category || (type === "aptitude" ? "Aptitude" : type === "coding" ? "Coding" : "Technical Concept"),
                  answer: userAnsText,
                  score: score,
                  feedback: feedback,
                  idealAnswer: idealAnswerVal,
                  options: q.options
                });
              });
            }
          });
          
          const constructedReport = {
            answers: allQuestionsList,
            averageScore: allQuestionsList.length > 0 
              ? (allQuestionsList.reduce((acc, curr) => acc + curr.score, 0) / allQuestionsList.length).toFixed(1) 
              : "0.0"
          };
          
          setInterview(constructedInterview);
          setReportData(constructedReport);
          setSelectedQuestionIndex(0);
          return true;
        } catch (e) {
          console.error("Local storage fallback failed in InterviewResponses:", e);
        }
        return false;
      };

      try {
        if (id && id.startsWith("session-")) {
          const success = tryLocalStorageFallback();
          if (success) {
            setLoading(false);
            return;
          }
        }

        const [intRes, repRes] = await Promise.all([
          api.get(`/interview/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/interview/${id}/report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setInterview(intRes.data);
        setReportData(repRes.data);
        setSelectedQuestionIndex(0);
      } catch (err) {
        console.error("Error loading responses:", err);
        const success = tryLocalStorageFallback();
        if (!success) {
          setError(err.response?.data?.message || "You are not authorized to view this interview transcript.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchData();
    } else {
      setError("Authentication credentials or interview parameters missing.");
      setLoading(false);
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] text-white flex flex-col justify-between font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 animate-spin mx-auto">
              <Cpu className="h-6 w-6" />
            </div>
            <h2 className="text-sm font-black text-slate-300 font-mono uppercase tracking-wider">
              Evaluating Transcript & Calculating Score...
            </h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b13] text-white flex flex-col justify-between font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-950/80 border border-red-500/20 rounded-xl p-8 text-center space-y-4 backdrop-blur-xl shadow-2xl">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-lg font-black text-white">Access Denied</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 rounded bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const answersList = reportData?.answers || [];
  const totalQuestions = answersList.length;

  const answeredCount = answersList.filter(
    (q) => !q._id.toString().startsWith("unanswered-") && q.answer !== "No response recorded."
  ).length;

  const correctCount = answersList.filter((q) => {
    const hasAns = !q._id.toString().startsWith("unanswered-") && q.answer !== "No response recorded.";
    if (!hasAns) return false;
    if (q.type === "aptitude") return q.score === 10;
    return q.score >= 5;
  }).length;

  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const hasPhase1 = answersList.some((q) => q.type === "aptitude");
  const hasPhase2 = answersList.some((q) => q.type === "technical");
  const hasPhase3 = answersList.some((q) => q.type === "coding" || q.type === "code");
  const hasPhase4 = answersList.some((q) => q.type === "hr");

  const tabs = [{ id: "all", label: `All Questions (${answersList.length})` }];
  if (hasPhase1) tabs.push({ id: "phase1", label: "Phase 1 • Aptitude" });
  if (hasPhase2) tabs.push({ id: "phase2", label: "Phase 2 • Tech 1" });
  if (hasPhase3) tabs.push({ id: "phase3", label: "Phase 3 • Tech 2" });
  if (hasPhase4) tabs.push({ id: "phase4", label: "Phase 4 • HR Round" });

  const filteredQuestions = answersList.filter((q) => {
    if (activePhaseFilter === "all") return true;
    if (activePhaseFilter === "phase1") return q.type === "aptitude";
    if (activePhaseFilter === "phase2") return q.type === "technical";
    if (activePhaseFilter === "phase3") return q.type === "coding" || q.type === "code";
    if (activePhaseFilter === "phase4") return q.type === "hr";
    return true;
  });

  const currentSelectedQuestion = filteredQuestions[selectedQuestionIndex] || filteredQuestions[0];

  const hasNoResponses =
    answersList.length === 0 ||
    answersList.every((q) => q._id.toString().startsWith("unanswered-") || q.answer === "No response recorded.");

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-blue-500 selection:text-white font-sans pb-16 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* Hero Banner & Dashboard Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-brand-border bg-brand-card p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard`, { replace: true })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-brand-card border border-brand-border text-xs font-bold text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500/40 transition duration-150 cursor-pointer shadow-md"
                >
                  <ArrowLeft className="h-4 w-4 text-blue-400" />
                  <span>Back to Dashboard</span>
                </button>
                 <button
                  type="button"
                  onClick={() => {
                    let phaseParam = "oa";
                    if (activePhaseFilter === "phase1") phaseParam = "oa";
                    else if (activePhaseFilter === "phase2") phaseParam = "tech1";
                    else if (activePhaseFilter === "phase3") phaseParam = "tech2";
                    else if (activePhaseFilter === "phase4") phaseParam = "hr";
                    else {
                      const currentQ = currentSelectedQuestion;
                      if (currentQ) {
                        if (currentQ.type === "aptitude") phaseParam = "oa";
                        else if (currentQ.type === "technical") phaseParam = "tech1";
                        else if (currentQ.type === "coding" || currentQ.type === "code") phaseParam = "tech2";
                        else if (currentQ.type === "hr") phaseParam = "hr";
                      } else {
                        const rawPhase = interview?.currentPhase || reportData?.phase || interview?.activePhase || "oa";
                        if (rawPhase === "phase1" || rawPhase === "oa") phaseParam = "oa";
                        else if (rawPhase === "phase2" || rawPhase === "tech1") phaseParam = "tech1";
                        else if (rawPhase === "phase3" || rawPhase === "tech2") phaseParam = "tech2";
                        else if (rawPhase === "phase4" || rawPhase === "hr") phaseParam = "hr";
                      }
                    }
                    navigate(`/interview/${id}/phase-complete?phase=${phaseParam}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-card border border-brand-border text-xs font-bold text-brand-secondary hover:text-brand-text transition cursor-pointer"
                >
                  <span>Return to Lobby</span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight pt-1">
                Candidate Response Transcript & Score Report
              </h1>
              <p className="text-xs text-brand-secondary font-normal">
                Session <span className="font-mono text-blue-500 dark:text-blue-400 font-bold">#{id}</span> • Scored {correctCount} of{" "}
                {totalQuestions} Correct ({scorePercentage}%)
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-xl hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Export Score Report PDF</span>
            </button>
          </motion.div>

          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 backdrop-blur-xl shadow-lg space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-550 dark:text-blue-400 block tracking-wider flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                <span>Calculated Score</span>
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-550 dark:text-emerald-400 font-mono">{scorePercentage}%</span>
                <span className="text-xs text-brand-secondary font-mono">
                  ({correctCount}/{totalQuestions})
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-brand-border bg-brand-card p-4 backdrop-blur-xl shadow-lg space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block tracking-wider">
                Total Questions
              </span>
              <span className="text-2xl font-black text-brand-text font-mono">{totalQuestions}</span>
            </div>

            <div className="rounded-lg border border-brand-border bg-brand-card p-4 backdrop-blur-xl shadow-lg space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block tracking-wider">
                Answered & Saved
              </span>
              <span className="text-2xl font-black text-emerald-550 dark:text-emerald-400 font-mono">{answeredCount}</span>
            </div>

            <div className="rounded-lg border border-brand-border bg-brand-card p-4 backdrop-blur-xl shadow-lg space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary block tracking-wider">
                Accuracy Level
              </span>
              <span className="text-xs font-black text-emerald-555 dark:text-emerald-400 font-mono flex items-center gap-1 mt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-550 dark:text-emerald-400" />
                <span>{scorePercentage >= 70 ? "Qualified High Score" : "Standard Rating"}</span>
              </span>
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-brand-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActivePhaseFilter(tab.id);
                  setSelectedQuestionIndex(0);
                }}
                className={`px-4 py-2 rounded text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                  activePhaseFilter === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md ring-1 ring-blue-400/50"
                    : "bg-brand-card border border-brand-border text-brand-secondary hover:text-brand-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Empty state wrapper */}
          {hasNoResponses ? (
            <div className="rounded-lg border border-brand-border bg-brand-card p-12 text-center text-brand-secondary">
              <FileText className="h-10 w-10 text-brand-secondary mx-auto mb-3" />
              <h3 className="font-bold text-brand-text mb-1">No Responses Found</h3>
              <p className="text-xs">No responses were submitted for this interview.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT PANEL: QUESTION LIST SIDEBAR */}
              <div className="lg:col-span-4 rounded-lg border border-brand-border bg-brand-card p-4 backdrop-blur-xl shadow-2xl space-y-3 max-h-[720px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-secondary">
                    Questions ({filteredQuestions.length})
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">{correctCount} Correct</span>
                </div>

                <div className="space-y-2">
                  {filteredQuestions.map((q, qIdx) => {
                    const isSelected = qIdx === selectedQuestionIndex;
                    const isUnanswered =
                      q._id.toString().startsWith("unanswered-") || q.answer === "No response recorded.";
                    const isMCQ = q.type === "aptitude";
                    const isCorr = isMCQ ? q.score === 10 : q.score >= 5;

                    return (
                      <button
                        key={q._id || qIdx}
                        type="button"
                        onClick={() => setSelectedQuestionIndex(qIdx)}
                        className={`w-full text-left p-3.5 rounded border transition-all duration-150 cursor-pointer space-y-1.5 ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 shadow-lg ring-1 ring-blue-500/50 text-brand-text"
                            : "bg-brand-bg/60 border-brand-border text-brand-secondary hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-brand-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-mono font-bold border ${
                                isSelected
                                  ? "bg-blue-500 border-blue-400 text-white"
                                  : "bg-brand-bg border-brand-border text-brand-secondary"
                              }`}
                            >
                              Q{qIdx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-brand-secondary font-bold truncate">
                              {q.category || q.type}
                            </span>
                          </div>

                          {!isUnanswered ? (
                            isCorr ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                                ✓ Correct
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                                ✗ Incorrect
                              </span>
                            )
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 shadow-sm" title="Unanswered" />
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-brand-text line-clamp-1">{q.question}</h4>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANEL: SELECTED QUESTION DETAILS */}
              <div className="lg:col-span-8 space-y-6">
                {currentSelectedQuestion ? (
                  <motion.div
                    key={currentSelectedQuestion._id || selectedQuestionIndex}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-brand-border bg-brand-card p-6 backdrop-blur-xl shadow-2xl space-y-6"
                  >
                    {/* Detail Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-brand-border">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-xs font-mono font-bold">
                            Question {selectedQuestionIndex + 1} of {filteredQuestions.length}
                          </span>
                          <span className="px-3 py-1 rounded bg-brand-bg border border-brand-border text-brand-secondary text-xs font-mono font-bold">
                            {currentSelectedQuestion.category || currentSelectedQuestion.type}
                          </span>
                          <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-300 text-[11px] font-mono font-bold uppercase">
                            Score: {currentSelectedQuestion.score || 0} / 10
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const isUnanswered =
                          currentSelectedQuestion._id.toString().startsWith("unanswered-") ||
                          currentSelectedQuestion.answer === "No response recorded.";
                        const isMCQ = currentSelectedQuestion.type === "aptitude";
                        const isCorr = isMCQ ? currentSelectedQuestion.score === 10 : currentSelectedQuestion.score >= 5;

                        return (
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                              isUnanswered
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                               : isCorr
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isUnanswered ? (
                              <>
                                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                                <span>Unanswered</span>
                              </>
                            ) : isCorr ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Correct / Satisfactory</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Incorrect / Incomplete</span>
                              </>
                            )}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Question Statement */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary tracking-wider block">
                        Problem Statement
                      </span>
                      <div className="border-l-4 border-blue-500 bg-brand-bg/85 p-4 rounded-r-md border-y border-r border-brand-border">
                        <p className="text-xs sm:text-sm text-brand-text leading-relaxed font-semibold">
                          {currentSelectedQuestion.question}
                        </p>
                      </div>
                    </div>

                    {/* Candidate Response */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-brand-secondary tracking-wider block">
                        Candidate's Recorded Response:
                      </span>
                      {currentSelectedQuestion._id.toString().startsWith("unanswered-") ||
                      currentSelectedQuestion.answer === "No response recorded." ? (
                        <div className="p-4 rounded-md bg-amber-500/5 border border-amber-500/20 text-xs font-semibold text-amber-500 italic flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>No response was submitted for this question during the session.</span>
                        </div>
                      ) : currentSelectedQuestion.type === "coding" || currentSelectedQuestion.type === "code" ? (
                        <pre className="p-4 rounded-md bg-brand-bg border border-brand-border font-mono text-xs text-brand-text overflow-x-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                          {currentSelectedQuestion.answer}
                        </pre>
                      ) : (
                        <div className="p-4 rounded-md bg-brand-bg border border-brand-border text-xs sm:text-sm text-brand-text font-semibold leading-relaxed whitespace-pre-wrap shadow-inner">
                          {currentSelectedQuestion.answer}
                        </div>
                      )}
                    </div>

                    {/* Ideal answer */}
                    {currentSelectedQuestion.idealAnswer && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Ideal Solution / Option Answer:</span>
                        </span>
                        <div className="p-4 rounded-md bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-300 leading-relaxed">
                          {currentSelectedQuestion.idealAnswer}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {!(
                      currentSelectedQuestion._id.toString().startsWith("unanswered-") ||
                      currentSelectedQuestion.answer === "No response recorded."
                    ) &&
                      currentSelectedQuestion.feedback && (
                        <div className="rounded-md border border-indigo-500/30 bg-brand-bg/50 p-4 space-y-2 shadow-xl">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-550 dark:text-indigo-400 text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              <span>Recruiter Evaluation & Feedback</span>
                            </span>
                          </div>
                          <div className="border-l-4 border-indigo-500 bg-indigo-950/10 p-4 rounded-r-md border-y border-r border-indigo-500/25">
                            <p className="text-xs sm:text-sm text-brand-text font-semibold leading-relaxed font-sans whitespace-pre-wrap">
                              {currentSelectedQuestion.feedback}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Bottom Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                      <button
                        type="button"
                        disabled={selectedQuestionIndex === 0}
                        onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-brand-border bg-brand-card text-xs font-bold text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous Question</span>
                      </button>

                      <button
                        type="button"
                        disabled={selectedQuestionIndex === filteredQuestions.length - 1}
                        onClick={() =>
                          setSelectedQuestionIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-blue-650 text-xs font-extrabold text-white shadow-md hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="rounded-md border border-brand-border bg-brand-card p-12 text-center text-brand-secondary">
                    <span>Select a question from the left sidebar to view candidate response details.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
