import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function OAReview() {
  const { id } = useParams(); // candidate's user ID
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [oaRound, setOaRound] = useState(null);
  const [report, setReport] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationSummary, setEvaluationSummary] = useState(null);

  // Recruiter notes and decision states
  const [notes, setNotes] = useState("");
  const [savingDecision, setSavingDecision] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch all interviews to find the OA round for this candidate
      const res = await api.get("/interviews/admin/all");
      const sortedRounds = (res.data || [])
        .filter((r) => r.user?._id === id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const oa = sortedRounds.find((r) => r.interviewType === "oa");

      if (!oa) {
        setError("No Online Assessment (OA) round found for this candidate.");
        setLoading(false);
        return;
      }

      setOaRound(oa);

      // 2. Fetch responses for the OA interview
      const reportRes = await api.get(`/interviews/admin/${oa._id}/responses`);
      setReport(reportRes.data);

      // Populate notes if notification already exists
      if (reportRes.data?.notification) {
        const notif = reportRes.data.notification;
        setNotes(notif.message || "");
      }
    } catch (err) {
      console.error("Error fetching OA data:", err);
      setError(err.response?.data?.message || "Failed to load candidate OA responses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEvaluate = async () => {
    if (!oaRound) return;
    try {
      setEvaluating(true);
      const res = await api.post(`/answers/admin/interview/${oaRound._id}/evaluate-oa`);
      setEvaluationSummary(res.data.summary);
      
      // Reload report to refresh question scores
      const reportRes = await api.get(`/interviews/admin/${oaRound._id}/responses`);
      setReport(reportRes.data);
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Failed to evaluate assessment.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinalDecision = async (decision) => {
    if (!oaRound) return;
    try {
      setSavingDecision(true);
      setDecisionSuccess("");

      let totalScore = 0;
      let totalMarks = 0;

      // Calculate score based on correct answers
      const questionsList = report?.interview?.questions || [];
      questionsList.forEach((q) => {
        const qText = q.questionText || q.question || "";
        const ans = report?.answers?.find(
          (a) => normalizeString(a.question) === normalizeString(qText)
        );
        const marks = q.marks || 1;
        totalMarks += marks;
        if (ans && ans.score === 10) {
          totalScore += marks;
        }
      });

      if (totalMarks === 0) {
        totalMarks = questionsList.length || 1;
      }

      const scoreString = `${totalScore}/${totalMarks}`;
      const percentage = Math.round((totalScore / totalMarks) * 100);

      await api.post(`/answers/admin/interview/${oaRound._id}/finalize-decision`, {
        decision,
        scoreString,
        percentage,
        evaluatorName: "Admin Name",
      });

      setDecisionSuccess(`Successfully finalized decision: ${decision}!`);
      
      // Reload to get fresh locked data
      await fetchData();
    } catch (err) {
      console.error("Decision finalize error:", err);
      alert(err.response?.data?.message || "Failed to finalize decision.");
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400 font-semibold text-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
            Loading Online Assessment Responses...
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-sm font-black text-rose-500">Error Loading Round</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {error || "Interview details not found."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-black text-slate-200 cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { interview, answers, notification } = report;
  const questions = interview?.questions || [];

  // Local helper to map correct index to A, B, C, D string option
  const getCorrectAnswerLabel = (q) => {
    if (!q || !q.options) return "";
    const correctIdx = q.correctOptionIndex;
    const correctText = q.options[correctIdx];
    return correctText;
  };

  const normalizeString = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[\r\n\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getQuestionResult = (q, index) => {
    const qText = q.questionText || q.question || "";
    const ans = answers.find(
      (a) => normalizeString(a.question) === normalizeString(qText)
    );

    if (!ans || !ans.answer || ans.answer === "No response recorded.") {
      return "Skipped";
    }

    const correctOption = q.options[q.correctOptionIndex];
    if (normalizeString(ans.answer) === normalizeString(correctOption)) {
      return "Correct";
    }
    return "Incorrect";
  };

  const getAnswerText = (qText) => {
    const ans = answers.find(
      (a) => normalizeString(a.question) === normalizeString(qText)
    );
    return ans ? ans.answer : "No response recorded.";
  };

  // Calculate local stats
  const totalQuestions = questions.length;
  let attemptedCount = 0;
  let skippedCount = 0;
  let correctCount = 0;

  questions.forEach((q) => {
    const resType = getQuestionResult(q, 0);
    if (resType === "Skipped") skippedCount++;
    else {
      attemptedCount++;
      if (resType === "Correct") correctCount++;
    }
  });

  const percentageLocal = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Determine current evaluation status
  let statusText = "Response Recorded";
  if (notification) {
    statusText = notification.eligible ? "Passed" : "Failed / Reattempt Needed";
  }

  // Combined AI Insights (either from live evaluation summary or fallback if evaluated)
  const aiInsights = evaluationSummary?.aiInsights || (answers.every(a => a.status === "evaluated") ? {
    strongTopics: Array.from(new Set(questions.filter(q => getQuestionResult(q) === "Correct").map(q => q.category || "Aptitude"))).slice(0, 3),
    weakTopics: Array.from(new Set(questions.filter(q => getQuestionResult(q) === "Incorrect").map(q => q.category || "Aptitude"))).slice(0, 3),
    observations: "Candidate completed the multiple choice assessment. Evaluation is updated and saved."
  } : null);

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">
              Admin-Assisted OA Evaluation
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              ID: {id}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Summary Banner */}
          <div className="grid gap-6 md:grid-cols-[1.8fr_1.2fr]">
            <div className="rounded-3xl border border-slate-800 bg-[#0d1627] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-indigo-500/5 blur-2xl" />
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                    statusText.includes("Passed")
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : statusText.includes("Failed")
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-455"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusText.includes("Passed") ? "bg-emerald-500" : statusText.includes("Failed") ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
                    {statusText}
                  </span>
                  <h2 className="text-2xl font-black text-slate-100 mt-3">
                    {interview?.user?.name || "Candidate Name"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Applied Role: <span className="text-slate-200">{interview?.role || "Software Engineer"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Submission Time</span>
                    <span className="text-slate-200 mt-0.5 block">
                      {new Date(interview?.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Attempted</span>
                    <span className="text-slate-200 mt-0.5 block">{attemptedCount} / {totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Skipped</span>
                    <span className="text-slate-200 mt-0.5 block">{skippedCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Auto-Grader Status</span>
                    <span className={`mt-0.5 block font-bold ${answers.every(a => a.status === "evaluated") ? "text-emerald-400" : "text-amber-400"}`}>
                      {answers.every(a => a.status === "evaluated") ? "Evaluated" : "Awaiting Evaluation"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Evaluation Panel */}
            <div className="rounded-3xl border border-slate-800 bg-[#0d1627] p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Assessment Evaluation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-2">
                  Trigger the OA autograder to compare the candidate's answers against correct keys, calculate scores, and generate AI profile observations.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || report?.interview?.isLocked}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-850 px-5 py-3 text-xs font-black text-white cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {evaluating ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white" />
                      Evaluating Answers...
                    </>
                  ) : report?.interview?.isLocked ? (
                    "Autograder Locked"
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Evaluate Assessment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary & AI Insights */}
          {(evaluationSummary || answers.every(a => a.status === "evaluated")) && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Score breakdown */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Evaluation Metrics Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
                    <span className="text-slate-400 block font-black uppercase text-[10px]">Correct Answers</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">{correctCount}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
                    <span className="text-slate-400 block font-black uppercase text-[10px]">Incorrect Answers</span>
                    <span className="text-2xl font-black text-rose-500 mt-1 block">{attemptedCount - correctCount}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
                    <span className="text-slate-400 block font-black uppercase text-[10px]">Clearance Score</span>
                    <span className="text-2xl font-black text-slate-200 mt-1 block">{correctCount} / {totalQuestions}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
                    <span className="text-slate-400 block font-black uppercase text-[10px]">Clearance Percentage</span>
                    <span className={`text-2xl font-black mt-1 block ${percentageLocal >= 60 ? "text-emerald-400" : "text-amber-400"}`}>
                      {percentageLocal}%
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Optional AI Observations</h3>
                {aiInsights ? (
                  <div className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">Strong Topics</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {aiInsights.strongTopics?.length > 0 ? (
                            aiInsights.strongTopics.map((topic, index) => (
                              <span key={index} className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {topic}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">No clear strengths identified</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">Weak Topics</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {aiInsights.weakTopics?.length > 0 ? (
                            aiInsights.weakTopics.map((topic, index) => (
                              <span key={index} className="bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {topic}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">No clear weaknesses identified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 leading-relaxed font-semibold">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">AI Insights / observations</span>
                      {aiInsights.observations}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-slate-400 font-semibold text-center leading-relaxed">
                    AI profile insights will be calculated and displayed once autograding runs successfully.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Review List */}
          <div className="rounded-3xl border border-slate-800 bg-[#0d1627] p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Question Review details</h3>
            
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-black uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">Question Details</th>
                    <th className="p-4 w-64">Candidate Answer</th>
                    <th className="p-4 w-64">Correct Answer</th>
                    <th className="p-4 w-32 text-center">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                  {questions.map((q, idx) => {
                    const qText = q.questionText || q.question || "";
                    const candAns = getAnswerText(qText);
                    const correctAns = getCorrectAnswerLabel(q);
                    const resType = getQuestionResult(q, idx);

                    let statusBg = "bg-rose-500/5 hover:bg-rose-500/10";
                    let badgeColor = "bg-rose-500/10 text-rose-455 border-rose-500/20";
                    if (resType === "Correct") {
                      statusBg = "bg-emerald-500/5 hover:bg-emerald-500/10";
                      badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                    } else if (resType === "Skipped") {
                      statusBg = "bg-amber-500/5 hover:bg-amber-500/10";
                      badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    }

                    return (
                      <tr key={idx} className={`${statusBg} transition-colors`}>
                        <td className="p-4 text-center font-bold text-slate-400 border-r border-slate-800/40">
                          {idx + 1}
                        </td>
                        <td className="p-4 space-y-1.5 border-r border-slate-800/40">
                          <span className="inline-block text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {q.category || "Aptitude"}
                          </span>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 ml-2">
                            {q.marks || 1} Marks
                          </span>
                          <p className="text-slate-100 font-bold whitespace-pre-wrap leading-relaxed pt-1.5 text-xs">
                            {qText}
                          </p>
                          {q.explanation && (
                            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/30 mt-1 font-medium">
                              <span className="font-extrabold text-slate-300 block mb-0.5 text-[8px] uppercase tracking-wider">Explanation</span>
                              {q.explanation}
                            </p>
                          )}
                        </td>
                        <td className="p-4 border-r border-slate-800/40 align-middle">
                          <div className={`p-2 rounded-lg bg-slate-950 border border-slate-850 font-bold text-[11px] max-w-xs break-words ${resType === "Correct" ? "text-emerald-400" : resType === "Skipped" ? "text-amber-400" : "text-rose-455"}`}>
                            {candAns}
                          </div>
                        </td>
                        <td className="p-4 border-r border-slate-800/40 align-middle">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 font-bold text-[11px] max-w-xs break-words text-emerald-400">
                            {correctAns}
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                            {resType === "Correct" ? "✅ Correct" : resType === "Skipped" ? "⚠️ Skipped" : "❌ Incorrect"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Decision Panel */}
          {report?.interview?.isLocked ? (
            <div className="rounded-3xl border border-slate-800 bg-[#0d1627] p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Evaluation Completed</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Decision Locked</p>
                </div>
                <span className="px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-455 text-[10px] font-black uppercase tracking-wider">
                  Locked
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-xs font-semibold">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Candidate</span>
                  <p className="text-slate-100 font-bold text-sm">{report?.interview?.user?.name || "Sachin Kumar"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Role</span>
                  <p className="text-slate-100 font-bold text-sm">{report?.interview?.role || "Frontend Developer"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Score</span>
                  <p className="text-slate-100 font-bold text-sm">{report?.interview?.finalScore || "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Percentage</span>
                  <p className="text-slate-100 font-bold text-sm">{report?.interview?.finalPercentage ? `${report.interview.finalPercentage}%` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Final Decision</span>
                  <p className={`font-black text-sm uppercase ${
                    report?.interview?.decision === "PASSED"
                      ? "text-emerald-400"
                      : report?.interview?.decision === "FAILED"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}>
                    {report?.interview?.decision}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Evaluated By</span>
                  <p className="text-slate-100 font-bold text-sm">{report?.interview?.evaluatorName || "Admin Name"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Evaluation Date</span>
                  <p className="text-slate-100 font-bold text-sm">
                    {report?.interview?.evaluationDate ? new Date(report.interview.evaluationDate).toLocaleDateString() : "Today"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status</span>
                  <p className="text-rose-455 font-black text-sm uppercase tracking-widest">LOCKED</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-[#0d1627] p-6 space-y-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Admin Evaluation & Recruitment Decision Panel
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Update the final recruitment timeline decision. Selecting an option will lock/unlock future rounds and notify the candidate.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Recruiter Evaluation Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter remarks, feedback, or custom notes regarding candidate score or reattempt request details..."
                  className="w-full min-h-28 p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs font-bold leading-relaxed focus:outline-none transition-all placeholder:text-slate-600 text-slate-100"
                />
              </div>

              {decisionSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  {decisionSuccess}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleFinalDecision("PASSED")}
                  disabled={savingDecision}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/40 px-5 py-3.5 text-xs font-black text-white hover:scale-[1.02] active:scale-95 duration-100 cursor-pointer shadow-md shadow-emerald-500/10 transition-all"
                >
                  Pass Candidate
                </button>
                <button
                  onClick={() => handleFinalDecision("FAILED")}
                  disabled={savingDecision}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800/40 px-5 py-3.5 text-xs font-black text-white hover:scale-[1.02] active:scale-95 duration-100 cursor-pointer shadow-md shadow-rose-500/10 transition-all"
                >
                  Fail Candidate
                </button>
                <button
                  onClick={() => handleFinalDecision("REATTEMPT_REQUIRED")}
                  disabled={savingDecision}
                  className="rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:bg-slate-950 px-5 py-3.5 text-xs font-black hover:scale-[1.02] active:scale-95 duration-100 cursor-pointer transition-all"
                >
                  Reattempt Required
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
