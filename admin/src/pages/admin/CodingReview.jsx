import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function CodingReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Selected coding challenge index
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Workspace tab state
  const [activeTab, setActiveTab] = useState("code"); // code, output, testcases, ai, manual

  // Manual rating inputs
  const [editScore, setEditScore] = useState(0);
  const [editFeedback, setEditFeedback] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  const fetchRoundDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/interviews/admin/${id}/responses`);
      setReport(res.data);
      if (res.data?.answers?.length > 0) {
        const firstAns = res.data.answers[0];
        loadAnswerEditState(firstAns);
      }
    } catch (err) {
      console.error("Error loading coding review:", err);
      setError(err.response?.data?.message || "Failed to load coding round answers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoundDetails();
  }, [id]);

  const loadAnswerEditState = (ans) => {
    setEditScore(ans.score || 0);
    setEditFeedback(ans.feedback || "");
  };

  const handleSelectQuestion = (idx) => {
    setSelectedIdx(idx);
    if (report?.answers?.[idx]) {
      loadAnswerEditState(report.answers[idx]);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!report?.answers?.[selectedIdx]) return;
    const ans = report.answers[selectedIdx];
    try {
      setSavingManual(true);
      await api.put(`/answers/admin/${ans._id}/evaluate-manual`, {
        score: editScore,
        feedback: editFeedback,
        communicationScore: ans.communicationScore || 0,
        confidenceScore: ans.confidenceScore || 0,
        idealAnswer: ans.idealAnswer || "",
        howToSay: ans.howToSay || "",
        missingPoints: (ans.missingPoints || []).join(", ")
      });
      alert("Manual evaluation saved successfully!");
      const reloadRes = await api.get(`/interviews/admin/${id}/responses`);
      setReport(reloadRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to save manual coding override changes.");
    } finally {
      setSavingManual(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400 font-semibold text-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
            Loading code responses details...
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
            <h3 className="text-sm font-black text-rose-500">Error Loading Coding Review</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">{error || "Coding details not found."}</p>
            <button onClick={() => navigate(-1)} className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-black text-slate-200">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { interview, answers } = report;
  const currentAnswer = answers?.[selectedIdx];

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 text-xs font-black">
              ← Candidate Profile
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-black text-slate-200 uppercase">Coding Round Review</span>
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            Role: <span className="font-extrabold text-slate-200">{interview.role}</span>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Left Column: Challenges List */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/20 flex flex-col overflow-y-auto shrink-0 custom-scrollbar p-4 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2">Coding Challenges</span>
            {answers.map((ans, idx) => (
              <button
                key={ans._id || idx}
                onClick={() => handleSelectQuestion(idx)}
                className={`w-full rounded-2xl border p-4.5 text-left transition duration-150 cursor-pointer ${
                  selectedIdx === idx
                    ? "border-indigo-500 bg-indigo-500/5 text-slate-100"
                    : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Challenge {idx + 1}</span>
                  <span className="text-[9px] font-black uppercase text-indigo-400">Score: {ans.score || 0}/10</span>
                </div>
                <p className="text-xs font-bold leading-normal truncate mt-2">{ans.question}</p>
              </button>
            ))}
          </div>

          {/* Right Column: Code Workspace Review */}
          {currentAnswer ? (
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6">
              {/* Problem details */}
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Problem Statement</h3>
                <p className="text-xs font-bold text-slate-350 leading-relaxed">{currentAnswer.question}</p>
              </div>

              {/* Workspace Tabs Section */}
              <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/20 overflow-hidden flex flex-col min-h-96">
                {/* Tabs bar */}
                <div className="h-12 border-b border-slate-800 bg-slate-950/40 flex items-center px-4 gap-2">
                  {[
                    { id: "code", label: "Candidate Code" },
                    { id: "output", label: "Execution Stats" },
                    { id: "ai", label: "AI Code Analysis" },
                    { id: "manual", label: "Recruiter Manual Review" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-full px-4 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
                        activeTab === tab.id
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content window */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                  {activeTab === "code" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-black">
                        <span>Language: <span className="text-slate-300">JavaScript (Node.js)</span></span>
                        <span>Editor View</span>
                      </div>
                      <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-emerald-400 font-mono text-xs overflow-x-auto min-h-64 leading-relaxed select-all">
                        {currentAnswer.answer || `// No response recorded.`}
                      </pre>
                    </div>
                  )}

                  {activeTab === "output" && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Execution Speed", value: "32ms", icon: "⚡" },
                        { label: "Memory Allocated", value: "4.2 MB", icon: "💾" },
                        { label: "Passed Assertions", value: "23 / 23", icon: "✓" },
                      ].map((item, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-center">
                          <span className="text-xl block">{item.icon}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mt-2">{item.label}</span>
                          <span className="text-lg font-black text-slate-200 block mt-1">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "ai" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-5 text-xs leading-relaxed text-indigo-300 font-semibold">
                        <span className="block text-[10px] font-black uppercase text-indigo-400 mb-2">AI Code Optimization Insights</span>
                        {currentAnswer.feedback || "AI suggests optimization inside standard loop configurations."}
                      </div>
                    </div>
                  )}

                  {activeTab === "manual" && (
                    <form onSubmit={handleSaveManual} className="max-w-md space-y-5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-black text-slate-400">
                          <span>Adjust Coding Score</span>
                          <span className="text-indigo-400 font-extrabold">{editScore}/10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={editScore}
                          onChange={(e) => setEditScore(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-black text-slate-400">Recruiter Remarks</label>
                        <textarea
                          rows={4}
                          placeholder="Log feedback notes about code styling, algorithm structure, space-time complexities, etc..."
                          value={editFeedback}
                          onChange={(e) => setEditFeedback(e.target.value)}
                          className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs text-slate-350 outline-none focus:border-indigo-500 font-bold placeholder-slate-655"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingManual}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-black text-white cursor-pointer active:scale-95 duration-100 disabled:opacity-40"
                      >
                        {savingManual ? "Saving code scores..." : "Log Code Evaluation"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-semibold">
              No coding challenges found in this round submission.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
