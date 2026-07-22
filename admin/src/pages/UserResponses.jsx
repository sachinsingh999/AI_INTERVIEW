import { useState, useEffect } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function UserResponses() {
  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorList, setErrorList] = useState("");
  const [errorReport, setErrorReport] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // AI evaluation loading states for each answer
  const [aiLoading, setAiLoading] = useState({});

  // Manual editing form states
  const [activeEditId, setActiveEditId] = useState(null);
  const [editScore, setEditScore] = useState(0);
  const [editFeedback, setEditFeedback] = useState("");
  const [editIdeal, setEditIdeal] = useState("");
  const [editComm, setEditComm] = useState(0);
  const [editConf, setEditConf] = useState(0);
  const [editProf, setEditProf] = useState(0);
  const [editMissing, setEditMissing] = useState("");
  const [editHowToSay, setEditHowToSay] = useState("");

  // Report release state
  const [eligible, setEligible] = useState(true);
  const [customMsg, setCustomMsg] = useState("");
  const [releasing, setReleasing] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoadingList(true);
      setErrorList("");
      const res = await api.get("/interviews/admin/all");
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
      setErrorList(err.response?.data?.message || "Failed to load interviews list.");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchInterviewReport = async (id) => {
    try {
      setLoadingReport(true);
      setErrorReport("");
      setReport(null);
      setActiveEditId(null);
      const res = await api.get(`/interviews/admin/${id}/responses`);
      setReport(res.data);
      if (res.data?.notification) {
        setEligible(res.data.notification.eligible);
        setCustomMsg(res.data.notification.message);
      } else {
        setEligible(true);
        setCustomMsg("");
      }
    } catch (err) {
      console.error(err);
      setErrorReport(err.response?.data?.message || "Failed to load response details.");
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleSelectInterview = (id) => {
    setSelectedId(id);
    fetchInterviewReport(id);
  };

  const handleTriggerEdit = (answer) => {
    if (activeEditId === answer._id) {
      setActiveEditId(null);
    } else {
      setActiveEditId(answer._id);
      setEditScore(answer.score || 0);
      setEditFeedback(answer.feedback || "");
      setEditIdeal(answer.idealAnswer || "");
      setEditComm(answer.communicationScore || 0);
      setEditConf(answer.confidenceScore || 0);
      setEditProf(answer.professionalismScore || 0);
      setEditHowToSay(answer.howToSay || "");
      setEditMissing((answer.missingPoints || []).join(", "));
    }
  };

  const handleSaveManual = async (e, answerId) => {
    e.preventDefault();
    try {
      await api.put(`/answers/admin/${answerId}/evaluate-manual`, {
        score: editScore,
        feedback: editFeedback,
        idealAnswer: editIdeal,
        communicationScore: editComm,
        confidenceScore: editConf,
        professionalismScore: editProf,
        howToSay: editHowToSay,
        missingPoints: editMissing
      });
      alert("Manual evaluation saved successfully.");
      setActiveEditId(null);
      // Reload report and list
      fetchInterviewReport(selectedId);
      fetchInterviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save manual evaluation.");
    }
  };

  const handleAiEvaluate = async (answerId) => {
    try {
      setAiLoading(prev => ({ ...prev, [answerId]: true }));
      await api.post(`/answers/admin/${answerId}/evaluate-ai`);
      alert("AI evaluation completed successfully.");
      // Reload report and list
      fetchInterviewReport(selectedId);
      fetchInterviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to run AI evaluation.");
    } finally {
      setAiLoading(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const handleReleaseReport = async (e) => {
    e.preventDefault();
    try {
      setReleasing(true);
      await api.post(`/interviews/admin/${selectedId}/release-report`, {
        eligible,
        customMessage: customMsg
      });
      alert("Report released and candidate notified successfully.");
      fetchInterviewReport(selectedId);
      fetchInterviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to release evaluation report.");
    } finally {
      setReleasing(false);
    }
  };

  const handleAdminDecision = async (decision) => {
    if (!selectedId) return;
    try {
      setReleasing(true);
      const res = await api.post(`/interviews/admin/${selectedId}/decision`, {
        decision,
        customMessage: customMsg
      });
      alert(res.data?.message || `Candidate decision set to ${decision}!`);
      fetchInterviewReport(selectedId);
      fetchInterviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update decision.");
    } finally {
      setReleasing(false);
    }
  };

  const filteredInterviews = interviews.filter(item =>
    item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans antialiased">
      <Sidebar />

      {/* Main Content Split Area */}
      <div className="flex-1 min-w-0 flex h-screen overflow-hidden">
        {/* Left Side: Interviews List Panel */}
        <div className="w-96 border-r border-slate-200/50 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/20 backdrop-blur-xl flex flex-col h-full shrink-0 shadow-lg shadow-slate-100/10">
          {/* Header Panel */}
          <div className="p-5 border-b border-slate-200/40 dark:border-slate-800/40 space-y-4">
            <div>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Recruitment Desk</span>
              <h2 className="text-lg font-black tracking-tight mt-0.5">Candidate Reviews</h2>
              <p className="text-[11px] text-brand-secondary font-semibold mt-1">Select a mock session to evaluate responses.</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidate, role, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg/50 pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition duration-150 focus:border-indigo-500 focus:bg-brand-card focus:ring-4 focus:ring-indigo-500/10"
              />
              <svg className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* List scrollable section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-100 border-t-indigo-600" />
                <span className="text-[11px] text-brand-secondary font-bold mt-3">Loading sessions...</span>
              </div>
            ) : errorList ? (
              <div className="p-4 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-bold leading-relaxed">
                {errorList}
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="py-20 text-center text-xs text-brand-secondary font-semibold">
                No interview sessions found.
              </div>
            ) : (
              filteredInterviews.map((item) => {
                const isSelected = item._id === selectedId;
                return (
                  <button
                    key={item._id}
                    onClick={() => handleSelectInterview(item._id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] relative overflow-hidden ${
                      isSelected
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-50/50 via-purple-50/20 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 shadow-md ring-4 ring-indigo-500/5"
                        : "border-brand-border bg-brand-card hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-800"
                    }`}
                  >
                    {/* Selected state ambient accent bubble */}
                    {isSelected && (
                      <span className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        item.interviewType === "code" || item.interviewType === "oa"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                      }`}>
                        {item.interviewType} Round
                      </span>
                      <span className="text-[10px] text-brand-secondary font-extrabold">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <div className="font-black text-xs text-slate-800 dark:text-slate-100 truncate">
                      {item.user?.name || "Unknown Candidate"}
                    </div>
                    <div className="text-[11px] text-brand-secondary font-bold truncate mt-0.5">
                      {item.role} · <span className="opacity-80">{item.difficulty}</span>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between border-t border-brand-border/40 pt-2.5">
                      <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400">
                        Answered: {item.answeredCount} / {item.questionCount}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${
                        item.answeredCount === item.questionCount 
                          ? "bg-emerald-500 animate-pulse" 
                          : "bg-amber-500"
                      }`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Responses Detail View Panel */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-950/10 custom-scrollbar">
          {selectedId === null ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 shadow-md">
                <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">No Candidate Session Selected</h3>
              <p className="text-xs text-brand-secondary font-semibold mt-2 leading-relaxed">
                Review candidate mock interview logs, grade speech transcripts manually, or trigger the automated AI assessment models. Select a session from the list to begin.
              </p>
            </div>
          ) : loadingReport ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-100 border-t-indigo-650" />
              <p className="text-xs text-brand-secondary font-bold mt-4">Compiling interview responses...</p>
            </div>
          ) : errorReport ? (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-5 text-xs font-bold text-rose-500 leading-relaxed shadow-sm">
              {errorReport}
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* Header stats summary card */}
              <div className="rounded-3xl border border-brand-border bg-brand-card p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
                <span className="absolute top-0 right-0 -mr-24 -mt-24 w-52 h-52 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
                <span className="absolute bottom-0 left-0 -ml-24 -mb-24 w-52 h-52 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Candidate Dossier</span>
                  <h1 className="text-3xl font-black tracking-tight mt-1 text-slate-800 dark:text-white">{report.interview?.user?.name}</h1>
                  <p className="text-xs text-brand-secondary font-semibold mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="font-bold">{report.interview?.user?.email}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="uppercase text-[10px] font-black bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-2 py-0.5 rounded-md text-brand-text">
                      {report.interview?.interviewType}
                    </span>
                  </p>
                  <p className="text-xs text-brand-secondary font-bold mt-2">
                    Role: <span className="text-slate-700 dark:text-slate-300">{report.interview?.role}</span> ({report.interview?.difficulty}) 
                    {report.interview?.language && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700 mx-2">·</span>
                        Language: <span className="text-slate-700 dark:text-slate-300">{report.interview?.language}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-5 bg-slate-50 dark:bg-slate-950/40 p-5 border border-brand-border/40 rounded-2xl shadow-inner shrink-0">
                  <div className="text-center px-4 border-r border-brand-border/60">
                    <p className="text-[9px] font-black uppercase text-brand-secondary tracking-wider">Avg Rating</p>
                    <p className="text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-1.5 leading-none">{report.averageScore}/10</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[9px] font-black uppercase text-brand-secondary tracking-wider">Performance</p>
                    <span className={`inline-block mt-2 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider border ${
                      report.performance === "Excellent"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : report.performance === "Good"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}>
                      {report.performance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Release report and notification console */}
              <div className="rounded-3xl border border-brand-border bg-brand-card p-6 shadow-sm space-y-5 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/40 pb-3">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Release Report & Candidate Decision</h2>
                    <p className="text-[11px] text-brand-secondary font-semibold mt-0.5">Override decision or release custom notification feedback directly to candidate.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdminDecision("PASSED")}
                      disabled={releasing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>✓ Pass Candidate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminDecision("FAILED")}
                      disabled={releasing}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>✗ Fail Candidate</span>
                    </button>
                  </div>
                </div>

                {report.notification ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-black text-[10px] uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Evaluation Released</span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-secondary">{new Date(report.notification.createdAt).toLocaleString()}</span>
                    </div>
                    <blockquote className="font-semibold italic text-slate-700 dark:text-slate-350 bg-brand-bg/40 border-l-2 border-emerald-500 pl-3.5 py-1 leading-relaxed">
                      "{report.notification.message}"
                    </blockquote>
                    <div className="pt-2 flex items-center gap-3 border-t border-brand-border/40 text-[11px] font-bold">
                      <span className="text-brand-secondary">Decision Outcome:</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide border ${
                        report.interview?.decision === "PASSED" || report.notification.eligible
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                      }`}>
                        {report.interview?.decision || (report.notification.eligible ? "PASSED" : "FAILED")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleReleaseReport} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase text-brand-secondary mb-1.5">Eligibility Outcome</label>
                        <select
                          value={eligible ? "true" : "false"}
                          onChange={(e) => setEligible(e.target.value === "true")}
                          className="w-full rounded-xl border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                        >
                          <option value="true">Eligible for Next Round</option>
                          <option value="false">Not Eligible</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-brand-secondary mb-1.5">Custom Notification Message</label>
                        <input
                          type="text"
                          value={customMsg}
                          onChange={(e) => setCustomMsg(e.target.value)}
                          placeholder="e.g. Excellent conceptual structure, candidate has passed review..."
                          className="w-full rounded-xl border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={releasing}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-75 rounded-xl text-xs font-bold tracking-wider transition active:scale-95 duration-100 cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      {releasing ? "Releasing Report..." : "Release & Send Notification"}
                    </button>
                  </form>
                )}
              </div>

              {/* Questions & Responses List */}
              <div className="space-y-5">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Responses List</h2>
                {report.answers?.map((answer, index) => {
                  const isEditing = activeEditId === answer._id;
                  const isPending = answer.status === "pending";

                  return (
                    <div key={answer._id} className="rounded-3xl border border-brand-border bg-brand-card p-6 shadow-sm space-y-5 relative overflow-hidden transition-all duration-200 hover:border-slate-305 dark:hover:border-slate-800">
                      {/* Top Bar: Question details, status, & actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-brand-border/40 pb-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-black text-slate-400">QUESTION #{index + 1}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              isPending
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-450"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450"
                            }`}>
                              <span className={`h-1 w-1 rounded-full ${isPending ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                              {answer.status || "pending"}
                            </span>
                          </div>
                          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-relaxed">
                            {answer.question}
                          </h3>
                        </div>
                        
                        {/* Grade and Evaluate Controls */}
                        <div className="flex items-center sm:flex-col sm:items-end gap-3.5 shrink-0">
                          {!isPending && (
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-black uppercase text-brand-secondary tracking-wider block">Score</span>
                              <p className="text-xl font-black text-indigo-650 dark:text-indigo-400 mt-1 leading-none">{answer.score}/10</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTriggerEdit(answer)}
                              className="rounded-xl border border-brand-border bg-brand-card hover:bg-slate-50 dark:hover:bg-slate-900/60 px-3 py-2 text-[10px] font-black uppercase tracking-wider transition active:scale-95 duration-100 cursor-pointer shadow-sm"
                            >
                              {isEditing ? "Close Form" : "Manual Grade"}
                            </button>
                            <button
                              onClick={() => handleAiEvaluate(answer._id)}
                              disabled={aiLoading[answer._id]}
                              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-75 disabled:cursor-not-allowed px-3 py-2 text-[10px] font-black uppercase tracking-wider transition active:scale-95 duration-100 cursor-pointer shadow-md shadow-indigo-600/5"
                            >
                              {aiLoading[answer._id] ? "Evaluating..." : "Use AI Eval"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Transcribed user response */}
                      <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-brand-border/40 p-4.5 rounded-2xl relative">
                        <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Candidate Response</span>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-355 leading-relaxed mt-2 italic whitespace-pre-wrap pl-3 border-l-2 border-indigo-500/40">
                          "{answer.answer}"
                        </p>
                      </div>

                      {/* Manual Evaluation Form Drawer */}
                      {isEditing && (
                        <form onSubmit={(e) => handleSaveManual(e, answer._id)} className="bg-slate-100/50 dark:bg-slate-950/60 border border-indigo-500/20 p-6 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Manual Evaluation Form</span>
                            <button type="button" onClick={() => setActiveEditId(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-655 uppercase tracking-wide">Cancel</button>
                          </div>
                          
                          <div className="grid gap-4 sm:grid-cols-4">
                            <div>
                              <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Critique Score (0-10)</label>
                              <input type="number" min="0" max="10" step="0.1" value={editScore} onChange={e => setEditScore(e.target.value)} required className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Comm Score (0-10)</label>
                              <input type="number" min="0" max="10" step="1" value={editComm} onChange={e => setEditComm(e.target.value)} required className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Conf Score (0-10)</label>
                              <input type="number" min="0" max="10" step="1" value={editConf} onChange={e => setEditConf(e.target.value)} required className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Prof Score (0-10)</label>
                              <input type="number" min="0" max="10" step="1" value={editProf} onChange={e => setEditProf(e.target.value)} required className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Critique Feedback</label>
                            <textarea value={editFeedback} onChange={e => setEditFeedback(e.target.value)} required rows="3" className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Ideal Answer Guide</label>
                            <textarea value={editIdeal} onChange={e => setEditIdeal(e.target.value)} rows="2" className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">How to Say Suggestion</label>
                            <textarea value={editHowToSay} onChange={e => setEditHowToSay(e.target.value)} rows="2" className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase text-brand-secondary mb-1.5">Suggested Improvements (comma-separated list)</label>
                            <input type="text" value={editMissing} onChange={e => setEditMissing(e.target.value)} placeholder="e.g. Speed up response pacing, explain sharding keys" className="w-full rounded-xl border border-brand-border bg-brand-bg px-3.5 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5" />
                          </div>

                          <button type="submit" className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition active:scale-95 duration-100 cursor-pointer shadow-md shadow-indigo-650/10">
                            Save Manual Evaluation
                          </button>
                        </form>
                      )}

                      {/* Display current evaluation details if already evaluated */}
                      {!isPending && !isEditing && (
                        <>
                          {/* Compile test results (if code round) */}
                          {answer.results && answer.results.length > 0 && (
                            <div className="bg-slate-100/30 dark:bg-[#070b13]/60 border border-brand-border p-4.5 rounded-2xl space-y-3">
                              <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Compiler Results</span>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {answer.results.map((res, tcIdx) => (
                                  <div key={tcIdx} className="flex items-center justify-between text-xs font-bold bg-slate-50 dark:bg-slate-900/40 p-2 border border-brand-border/40 rounded-xl">
                                    <span className="text-slate-500">Case #{tcIdx + 1}:</span>
                                    <span className={res.passed ? "text-emerald-500 font-extrabold" : "text-rose-500 font-extrabold"}>
                                      {res.passed ? "PASSED" : `FAILED (${res.error || "Wrong Output"})`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI/Manual Feedback text */}
                          <div className="grid gap-5 md:grid-cols-2">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Feedback Details</span>
                              <p className="text-xs text-brand-secondary font-semibold leading-relaxed mt-2">
                                {answer.feedback}
                              </p>
                            </div>

                            {answer.idealAnswer && (
                              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl">
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Ideal Answer Guide</span>
                                <p className="text-xs text-brand-secondary font-semibold leading-relaxed mt-2">
                                  {answer.idealAnswer}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Detailed evaluation metrics */}
                          <div className="grid gap-4 sm:grid-cols-3">
                            {[
                              { label: "Communication", score: answer.communicationScore || 0, color: "text-indigo-650 dark:text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/10" },
                              { label: "Confidence", score: answer.confidenceScore || 0, color: "text-emerald-600 dark:text-emerald-450", bg: "bg-emerald-500/5 border-emerald-500/10" },
                              { label: "Professionalism", score: answer.professionalismScore || 0, color: "text-amber-600 dark:text-amber-455", bg: "bg-amber-500/5 border-amber-500/10" }
                            ].map((item, idx) => (
                              <div key={idx} className={`${item.bg} border p-4.5 rounded-2xl flex items-center justify-between`}>
                                <span className="text-[10px] font-extrabold text-slate-705 dark:text-slate-350">{item.label}</span>
                                <span className={`text-xs font-black ${item.color}`}>{item.score}/10</span>
                              </div>
                            ))}
                          </div>

                          {/* Missing points suggest list */}
                          {answer.missingPoints && answer.missingPoints.length > 0 && (
                            <div className="border-t border-brand-border/40 pt-4.5">
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">Suggested Improvements</span>
                              <ul className="grid gap-2 sm:grid-cols-2 mt-3 text-xs font-semibold text-brand-secondary">
                                {answer.missingPoints.map((pt, pIdx) => (
                                  <li key={pIdx} className="flex items-center gap-2 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-rose-900 dark:text-rose-450">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="truncate">{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default UserResponses;
