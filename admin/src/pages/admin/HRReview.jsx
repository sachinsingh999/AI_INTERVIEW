import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function HRReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Selected question index
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Manual rating inputs
  const [editScore, setEditScore] = useState(0);
  const [editFeedback, setEditFeedback] = useState("");
  const [editComm, setEditComm] = useState(0);
  const [editConf, setEditConf] = useState(0);
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
      console.error("Error loading HR review:", err);
      setError(err.response?.data?.message || "Failed to load HR responses.");
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
    setEditComm(ans.communicationScore || 0);
    setEditConf(ans.confidenceScore || 0);
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
        communicationScore: editComm,
        confidenceScore: editConf,
        idealAnswer: ans.idealAnswer || "",
        howToSay: ans.howToSay || "",
        missingPoints: (ans.missingPoints || []).join(", ")
      });
      alert("Manual HR scores recorded successfully!");
      const reloadRes = await api.get(`/interviews/admin/${id}/responses`);
      setReport(reloadRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to save manual evaluation.");
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
            Loading HR round responses...
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
            <h3 className="text-sm font-black text-rose-500">Error Loading HR Review</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">{error || "HR details not found."}</p>
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
            <span className="text-xs font-black text-slate-200 uppercase">HR Recruiter Review</span>
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            Role: <span className="font-extrabold text-slate-200">{interview.role}</span>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Left Column: Questions List */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/20 flex flex-col overflow-y-auto shrink-0 custom-scrollbar p-4 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2">HR Questions</span>
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
                  <span className="text-[10px] font-black text-slate-500 uppercase">Q{idx + 1}</span>
                  <span className="text-[9px] font-black uppercase text-indigo-400">Score: {ans.score || 0}/10</span>
                </div>
                <p className="text-xs font-bold leading-normal truncate mt-2">{ans.question}</p>
              </button>
            ))}
          </div>

          {/* Right Column: Audio Workspace review */}
          {currentAnswer ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto custom-scrollbar p-6 gap-6">
              <div className="flex-1 space-y-6">
                {/* Question */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Question</h3>
                  <p className="text-sm font-black text-slate-200">{currentAnswer.question}</p>
                </div>

                {/* Video/Audio mockup simulator */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider text-left">Recruiter Audio/Video Player</h3>
                  <div className="h-44 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {/* Audio frequency waves */}
                      {[0.5, 0.8, 1.2, 0.6, 0.9, 0.4, 1.1, 0.7, 1.3, 0.5].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h * 24}px` }}
                          className="w-1 rounded-full bg-indigo-500 animate-pulse duration-1000"
                        />
                      ))}
                    </div>
                    <span className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950/60 rounded px-2 py-0.5">00:42 / 01:30</span>
                  </div>
                </div>

                {/* Candidate Voice Transcript */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Voice to Text Transcript</h3>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 font-semibold text-xs leading-relaxed text-slate-350 min-h-24">
                    "{currentAnswer.answer}"
                  </div>
                </div>
              </div>

              {/* Recruiter Evaluation Overrides */}
              <div className="w-full md:w-96 space-y-6 shrink-0">
                {/* AI Speech Metrics */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">AI Speech Analysis</h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    {[
                      { label: "AI Confidence", value: "82%" },
                      { label: "AI Fluency", value: "78%" },
                      { label: "AI Grammar Accuracy", value: "91%" },
                      { label: "AI Emotional Index", value: "Neutral" },
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-850 bg-slate-950/40 p-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">{item.label}</span>
                        <span className="text-xs font-black text-slate-200 block mt-1">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recruiter evaluation inputs */}
                <form onSubmit={handleSaveManual} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Human Recruiter Review</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-black text-slate-400">
                        <span>Communication</span>
                        <span className="text-indigo-400 font-extrabold">{editComm}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={editComm}
                        onChange={(e) => setEditComm(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-black text-slate-400">
                        <span>Confidence</span>
                        <span className="text-indigo-400 font-extrabold">{editConf}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={editConf}
                        onChange={(e) => setEditConf(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-black text-slate-400">
                        <span>Cultural Fit Score</span>
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
                      <label className="block text-[10px] uppercase font-black text-slate-450">Reviewer Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Log notes about speech clarity, tone, explanation skills, cultural alignment..."
                        value={editFeedback}
                        onChange={(e) => setEditFeedback(e.target.value)}
                        className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs text-slate-350 outline-none focus:border-indigo-500 font-bold placeholder-slate-655"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingManual}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-black text-white active:scale-95 duration-100 disabled:opacity-40"
                  >
                    {savingManual ? "Saving HR score..." : "Log HR Assessment"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-semibold">
              No answers responses found in this HR round submission.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
