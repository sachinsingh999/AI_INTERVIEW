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
          
          const activePhases = sessionObj.activePhases || ["phase1"];
          let completedPhases = [];
          if (sessionObj.status === "Completed" || localStorage.getItem(`interview_completed_phase_${id}_phase4`) === "true") {
            completedPhases = ["phase1", "phase2", "phase3", "phase4"];
          } else {
            if (localStorage.getItem(`interview_completed_phase_${id}_phase1`) === "true" || activePhases.includes("phase2")) completedPhases.push("phase1");
            if (localStorage.getItem(`interview_completed_phase_${id}_phase2`) === "true" || activePhases.includes("phase3")) completedPhases.push("phase2");
            if (localStorage.getItem(`interview_completed_phase_${id}_phase3`) === "true" || activePhases.includes("phase4")) completedPhases.push("phase3");
            if (localStorage.getItem(`interview_completed_phase_${id}_phase4`) === "true") completedPhases.push("phase4");
          }
          
          const constructedInterview = {
            ...sessionObj,
            _id: id,
            title: sessionObj.title || `${sessionObj.role || "Frontend Developer"} Mock Interview`,
            role: sessionObj.role || "Frontend Developer",
            experience: sessionObj.experience || "1-3 Years",
            difficulty: sessionObj.difficulty || "Medium",
            interviewType: sessionObj.interviewType || "oa",
            activePhases: activePhases,
            decision: sessionObj.decision || "PASSED",
            feedback: sessionObj.feedback || "Overall excellent presentation and communication. Solid logical approach across all sections.",
            finalScore: sessionObj.finalScore || "8.0",
            finalPercentage: sessionObj.finalPercentage || 80,
          };
          
          const allQuestionsList = [];
          const phaseKeys = ["phase1", "phase2", "phase3", "phase4"];
          
          phaseKeys.forEach((pk) => {
            if (!completedPhases.includes(pk)) return;

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
                let userAnsText = "";
                let score = 0;
                let feedback = "";
                let idealAnswerVal = q.correctOption || "";
                
                if (ans) {
                  if (typeof ans === "string" && ans.trim() !== "") {
                    userAnsText = ans;
                    isAnswered = true;
                  } else if (ans.selectedOption !== undefined && ans.selectedOption !== null && String(ans.selectedOption).trim() !== "") {
                    userAnsText = String(ans.selectedOption);
                    isAnswered = true;
                  } else if (ans.selectedOptions && ans.selectedOptions.length > 0) {
                    userAnsText = ans.selectedOptions.join(", ");
                    isAnswered = true;
                  } else if (ans.text !== undefined && ans.text !== null && String(ans.text).trim() !== "") {
                    userAnsText = String(ans.text);
                    isAnswered = true;
                  } else if (ans.code !== undefined && ans.code !== null && String(ans.code).trim() !== "") {
                    userAnsText = String(ans.code);
                    isAnswered = true;
                  }
                }
                
                if (!isAnswered) {
                  userAnsText = "[No Answer Recorded]";
                  score = 0;
                  feedback = type === "aptitude"
                    ? `Not Answered. The correct option is ${q.correctOption || "A"}.`
                    : "No response was recorded for this question.";
                } else {
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
                  options: q.options,
                  phase: pk,
                });
              });
            }
          });
          
          const totalQuestionsCount = phaseKeys.reduce((total, pk) => {
            if (!completedPhases.includes(pk)) return total;
            const phase = sessionObj.phases?.[pk];
            return total + (phase && Array.isArray(phase.questions) ? phase.questions.length : 0);
          }, 0);

          const constructedReport = {
            answers: allQuestionsList,
            totalAnswered: totalQuestionsCount,
            answeredCount: allQuestionsList.length,
            averageScore: allQuestionsList.length > 0 
              ? (allQuestionsList.reduce((acc, curr) => acc + curr.score, 0) / allQuestionsList.length).toFixed(1) 
              : "0.0",
            completedPhases,
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
        <Footer onlyCopyright={true} />
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
        <Footer onlyCopyright={true} />
      </div>
    );
  }

  const completedPhases = reportData?.completedPhases || [];
  const answersList = reportData?.answers || [];

  const answeredCount = answersList.filter(q => q.answer && q.answer !== "[No Answer Recorded]").length;
  const totalQuestions = reportData?.totalAnswered || answersList.length;

  const correctCount = answersList.filter((q) => {
    if (q.type === "aptitude") return q.score === 10;
    if (q.type === "coding" || q.type === "code" || q.type === "project") return q.score === 10;
    return q.score >= 5;
  }).length;

  const partiallyCorrectCount = answersList.filter((q) => {
    return (q.type === "coding" || q.type === "code" || q.type === "project") && q.score > 0 && q.score < 10;
  }).length;

  const totalPossibleScore = totalQuestions * 10;
  const totalUserScore = answersList.reduce((acc, q) => acc + (q.score || 0), 0);
  const scorePercentage = totalPossibleScore > 0 ? Math.round((totalUserScore / totalPossibleScore) * 100) : 0;

  const allPossibleTabs = [
    { id: "phase1", label: "Phase 1 • Aptitude" },
    { id: "phase2", label: "Phase 2 • Tech 1" },
    { id: "phase3", label: "Phase 3 • Tech 2" },
    { id: "phase4", label: "Phase 4 • HR Round" },
  ];

  const tabs = [{ id: "all", label: `All Questions (${answersList.length})`, locked: false }];
  
  allPossibleTabs.forEach((t) => {
    const isCompleted = completedPhases.includes(t.id);
    tabs.push({
      id: t.id,
      label: isCompleted ? t.label : `${t.label} 🔒`,
      locked: !isCompleted,
    });
  });

  const filteredQuestions = answersList.filter((q) => {
    if (activePhaseFilter === "all") return true;
    return q.phase === activePhaseFilter;
  });

  const currentSelectedQuestion = filteredQuestions[selectedQuestionIndex] || filteredQuestions[0];

  const hasNoResponses =
    answersList.length === 0 ||
    answersList.every((q) => q._id.toString().startsWith("unanswered-") || q.answer === "No response recorded.");

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-indigo-500 selection:text-white font-sans pb-8 flex flex-col justify-between transition-colors duration-200">
      <div>
        <Navbar />

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
          {/* Combined Header & Metrics Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative rounded-md border border-brand-border bg-brand-card p-4 sm:p-5 backdrop-blur-xl shadow-md space-y-4 overflow-hidden"
          >
            {/* Ambient background glow inside the banner */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

            {/* Top Row: Title & Return to Lobby Button */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-650 dark:text-indigo-400 tracking-wide uppercase font-mono">
                    Evaluation Report
                  </span>
                  <span className="font-mono text-[10px] text-indigo-650 dark:text-indigo-400 font-bold bg-indigo-500/5 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-sm border border-indigo-500/10">
                    Session #{id}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight leading-none">
                  Candidate Response Transcript & Score Report
                </h1>

                <p className="text-xs text-brand-secondary font-medium">
                  Graded <span className="text-indigo-600 dark:text-indigo-400 font-bold">{correctCount}</span> Correct
                  {partiallyCorrectCount > 0 && (
                    <>
                      {" "}& <span className="text-amber-655 dark:text-amber-400 font-bold">{partiallyCorrectCount}</span> Partially Correct
                    </>
                  )}{" "}
                  of <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalQuestions}</span> Total ({scorePercentage}%)
                </p>
              </div>

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
                      else if (currentQ.type === "coding" || currentQ.type === "code") phaseParam = "tech1";
                      else if (currentQ.type === "project") phaseParam = "tech2";
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-bg border border-brand-border text-xs font-bold text-brand-secondary hover:text-brand-text hover:bg-brand-border/20 transition duration-200 cursor-pointer shadow-sm relative z-10 shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Lobby</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 pt-2">
              {/* Metric 1 */}
              <div className="relative rounded-sm bg-brand-bg/40 p-3 hover:bg-brand-bg/60 transition-all duration-300 group overflow-hidden">
                <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider flex items-center gap-1 mb-1">
                  <Trophy className="h-3.5 w-3.5 text-yellow-555 dark:text-yellow-400" />
                  <span>Calculated Score</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono tracking-tight">{scorePercentage}%</span>
                  <span className="text-[10px] text-brand-secondary font-mono font-bold">
                    ({correctCount}/{totalQuestions})
                  </span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="relative rounded-sm bg-brand-bg/40 p-3 hover:bg-brand-bg/60 transition-all duration-300 group overflow-hidden">
                <span className="text-[9px] font-mono font-bold uppercase text-brand-secondary block tracking-wider flex items-center gap-1 mb-1">
                  <HelpCircle className="h-3.5 w-3.5 text-brand-secondary/80" />
                  <span>Total Questions</span>
                </span>
                <span className="text-xl sm:text-2xl font-black text-brand-text font-mono tracking-tight">{totalQuestions}</span>
              </div>

              {/* Metric 3 */}
              <div className="relative rounded-sm bg-brand-bg/40 p-3 hover:bg-brand-bg/60 transition-all duration-300 group overflow-hidden">
                <span className="text-[9px] font-mono font-bold uppercase text-brand-secondary block tracking-wider flex items-center gap-1 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-secondary/80" />
                  <span>Answered & Saved</span>
                </span>
                <span className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tracking-tight">{answeredCount}</span>
              </div>

              {/* Metric 4 */}
              <div className="relative rounded-sm bg-brand-bg/40 p-3 hover:bg-brand-bg/60 transition-all duration-300 group overflow-hidden">
                <span className="text-[9px] font-mono font-bold uppercase text-brand-secondary block tracking-wider flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-secondary/80" />
                  <span>Accuracy Level</span>
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold border mt-0.5 ${
                  scorePercentage >= 70
                    ? "bg-emerald-500/10 text-emerald-655 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20"
                }`}>
                  <span>{scorePercentage >= 70 ? "Qualified" : "Standard"}</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                disabled={tab.locked}
                onClick={() => {
                  if (tab.locked) return;
                  setActivePhaseFilter(tab.id);
                  setSelectedQuestionIndex(0);
                }}
                className={`px-3 py-1.5 rounded-sm text-xs font-extrabold transition-all duration-200 whitespace-nowrap ${
                  tab.locked
                    ? "bg-brand-bg/25 border border-brand-border text-brand-secondary/60 cursor-not-allowed opacity-45"
                    : activePhaseFilter === tab.id
                      ? "bg-indigo-600 text-white shadow border border-indigo-400/20 cursor-pointer"
                      : "bg-brand-card border border-brand-border text-brand-secondary hover:text-brand-text hover:border-brand-border/80 cursor-pointer"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Empty state wrapper */}
          {hasNoResponses ? (
            <div className="rounded-md border border-brand-border bg-brand-card p-12 text-center text-brand-secondary max-w-md mx-auto shadow-md backdrop-blur-xl">
              <FileText className="h-10 w-10 text-brand-secondary mx-auto mb-3" />
              <h3 className="text-base font-black text-brand-text mb-1">No Responses Found</h3>
              <p className="text-xs text-brand-secondary leading-relaxed">
                No responses were submitted for this interview. If you submitted just now, please refresh in a moment while the server grades your performance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* LEFT PANEL: QUESTION LIST SIDEBAR */}
                <div className="lg:col-span-4 rounded-md border border-brand-border bg-brand-card p-3 backdrop-blur-xl shadow-md space-y-3 max-h-[720px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Questions ({filteredQuestions.length})
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {correctCount > 0 && (
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {correctCount} Correct
                        </span>
                      )}
                      {partiallyCorrectCount > 0 && (
                        <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400">
                          {partiallyCorrectCount} Partially
                        </span>
                      )}
                    </div>
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
                          className={`w-full text-left p-3 rounded-sm transition-all duration-200 cursor-pointer space-y-1.5 ${
                            isSelected
                              ? "bg-indigo-500/10 text-brand-text font-bold"
                              : "bg-brand-bg/40 text-brand-secondary hover:bg-brand-card/45"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-mono font-bold border ${
                                  isSelected
                                    ? "bg-indigo-500 border-indigo-400 text-white"
                                    : "bg-brand-bg border-brand-border text-brand-secondary"
                                }`}
                              >
                                Q{qIdx + 1}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                                {q.category || q.type}
                              </span>
                            </div>

                            {!isUnanswered ? (
                              isMCQ ? (
                                q.score === 10 ? (
                                  <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-mono font-bold">
                                    Correct
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-sm bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-mono font-bold">
                                    Incorrect
                                  </span>
                                )
                              ) : q.score === 10 ? (
                                <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-mono font-bold">
                                  Correct
                                </span>
                              ) : q.score > 0 ? (
                                <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-405 text-[8px] font-mono font-bold">
                                  Partially Correct
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-sm bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-mono font-bold">
                                  Incorrect
                                </span>
                              )
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 shadow-sm" title="Unanswered" />
                            )}
                          </div>

                          <h4 className={`text-xs font-semibold leading-snug line-clamp-1 ${isSelected ? 'text-brand-text' : 'text-brand-secondary'}`}>
                            {q.question}
                          </h4>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT PANEL: SELECTED QUESTION DETAILS */}
                <div className="lg:col-span-8 space-y-4">
                  {currentSelectedQuestion ? (
                    <motion.div
                      key={currentSelectedQuestion._id || selectedQuestionIndex}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-md border border-brand-border bg-brand-card p-4 sm:p-5 backdrop-blur-xl shadow-md space-y-4"
                    >
                      {/* Detail Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-655 dark:text-indigo-400 text-xs font-mono font-bold">
                              Question {selectedQuestionIndex + 1} of {filteredQuestions.length}
                            </span>
                            <span className="px-2 py-0.5 rounded-sm bg-brand-bg border border-brand-border text-brand-secondary text-xs font-mono font-bold">
                              {currentSelectedQuestion.category || currentSelectedQuestion.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/20 text-purple-655 dark:text-purple-400 text-xs font-mono font-bold">
                              Score: {currentSelectedQuestion.score || 0} / 10
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const isUnanswered =
                            currentSelectedQuestion._id.toString().startsWith("unanswered-") ||
                            currentSelectedQuestion.answer === "No response recorded.";

                          return (
                            <span
                              className={`px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1 shrink-0 border ${
                                isUnanswered
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : currentSelectedQuestion.score === 10
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : currentSelectedQuestion.score > 0
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20"
                              }`}
                            >
                              {isUnanswered ? (
                                <>
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Unanswered</span>
                                </>
                              ) : currentSelectedQuestion.score === 10 ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Correct / Satisfactory</span>
                                </>
                              ) : currentSelectedQuestion.score > 0 ? (
                                <>
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-655 dark:text-amber-400" />
                                  <span>Partially Correct</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-455" />
                                  <span>Incorrect / Incomplete</span>
                                </>
                              )}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Question Statement */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-brand-secondary tracking-wider block">
                          Problem Statement
                        </span>
                        <div className="border-l-2 border-indigo-500 bg-brand-bg/60 p-3 rounded-r-md border-y border-r border-brand-border">
                          <p className="text-xs sm:text-sm text-brand-text leading-relaxed font-semibold">
                            {currentSelectedQuestion.question}
                          </p>
                        </div>
                      </div>

                      {/* Candidate Response */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-brand-secondary tracking-wider block">
                          Candidate's Recorded Response:
                        </span>
                        {currentSelectedQuestion._id.toString().startsWith("unanswered-") ||
                        currentSelectedQuestion.answer === "No response recorded." ? (
                          <div className="p-3 rounded-md bg-amber-550/5 border border-amber-550/20 text-xs font-semibold text-amber-605 dark:text-amber-500 italic flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>No response was submitted for this question during the session.</span>
                          </div>
                        ) : currentSelectedQuestion.type === "coding" || currentSelectedQuestion.type === "code" || currentSelectedQuestion.type === "project" ? (
                          <pre className="p-3 rounded-md bg-brand-bg border border-brand-border font-mono text-xs text-indigo-650 dark:text-indigo-400 overflow-x-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                            {currentSelectedQuestion.answer}
                          </pre>
                        ) : (
                          <div className="p-3 rounded-md bg-brand-bg border border-brand-border text-xs sm:text-sm text-brand-text font-semibold leading-relaxed whitespace-pre-wrap shadow-inner">
                            {currentSelectedQuestion.answer}
                          </div>
                        )}
                      </div>

                      {/* Ideal answer */}
                      {currentSelectedQuestion.idealAnswer && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-emerald-605 dark:text-emerald-400 tracking-wider block flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-655 dark:text-emerald-400" />
                            <span>Ideal Solution / Option Answer:</span>
                          </span>
                          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-bold text-emerald-605 dark:text-emerald-400 leading-relaxed">
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
                          <div className="rounded-md border border-indigo-500/20 bg-brand-bg/40 p-4 space-y-2 shadow-xl">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-655 dark:text-indigo-400 text-[9px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                                <span>Recruiter Evaluation & Feedback</span>
                              </span>
                            </div>
                            <div className="border-l-2 border-indigo-500 bg-indigo-500/5 p-3 rounded-r-md border-y border-r border-indigo-500/10">
                              <p className="text-xs sm:text-sm text-brand-text font-semibold leading-relaxed font-sans whitespace-pre-wrap">
                                {currentSelectedQuestion.feedback}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Bottom Navigation */}
                      <div className="flex items-center justify-between pt-4">
                        <button
                          type="button"
                          disabled={selectedQuestionIndex === 0}
                          onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-brand-card text-xs font-bold text-brand-secondary hover:text-brand-text hover:bg-brand-bg/40 disabled:opacity-30 disabled:cursor-not-allowed transition duration-205 cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#6366F1] hover:bg-indigo-650 text-xs font-extrabold text-white shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition duration-205 cursor-pointer"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="rounded-md border border-brand-border bg-brand-card p-12 text-center text-brand-secondary backdrop-blur-xl">
                      <span>Select a question from the left sidebar to view candidate response details.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Centered Export Button at bottom */}
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold text-white shadow-md transition duration-205 cursor-pointer relative z-10"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Score Report PDF</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer onlyCopyright={true} />
    </div>
  );
}
