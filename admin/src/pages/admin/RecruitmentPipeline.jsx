import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const COLUMNS = [
  { id: "applied", name: "Applied", border: "border-slate-800", bg: "bg-slate-900/10" },
  { id: "screening", name: "Screening", border: "border-indigo-900/40", bg: "bg-indigo-500/2" },
  { id: "oa_cleared", name: "OA Cleared", border: "border-teal-900/40", bg: "bg-teal-500/2" },
  { id: "technical", name: "Technical Round", border: "border-cyan-900/40", bg: "bg-cyan-500/2" },
  { id: "coding", name: "Coding Round", border: "border-purple-900/40", bg: "bg-purple-500/2" },
  { id: "hr", name: "HR Round", border: "border-orange-900/40", bg: "bg-orange-500/2" },
  { id: "hired", name: "Hired 🎉", border: "border-emerald-800/40", bg: "bg-emerald-500/5" },
  { id: "rejected", name: "Rejected", border: "border-rose-900/40", bg: "bg-rose-500/5" },
];

export default function RecruitmentPipeline() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/interviews/admin/all");
      const rounds = res.data || [];

      // Group rounds by unique user to represent candidates
      const grouped = {};
      rounds.forEach((round) => {
        if (!round.user) return;
        const uid = round.user._id;
        if (!grouped[uid]) {
          // Dynamically map pipeline stage based on completed child interview round types
          let stage = "applied";
          const types = rounds.filter(r => r.user?._id === uid).map(r => r.interviewType);
          
          if (types.includes("video")) stage = "hr";
          else if (types.includes("code")) stage = "coding";
          else if (types.includes("tech1")) stage = "technical";
          else if (types.includes("oa")) stage = "oa_cleared";

          grouped[uid] = {
            id: uid,
            name: round.user.name || "Anonymous",
            email: round.user.email || "",
            role: round.role || "Software Engineer",
            difficulty: round.difficulty || "Intermediate",
            stage,
          };
        }
      });

      setCandidates(Object.values(grouped));
    } catch (err) {
      console.error("Error loading pipeline:", err);
      setError("Failed to load candidate pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // HTML5 Drag and Drop events
  const handleDragStart = (e, candId) => {
    e.dataTransfer.setData("text/plain", candId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    const candId = e.dataTransfer.getData("text/plain");
    if (!candId) return;

    // Update candidate stage in state
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: colId } : c))
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0">
          <div>
            <h1 className="text-md font-black tracking-tight">Recruitment Pipeline</h1>
            <p className="text-[10px] font-semibold text-slate-400">Drag & drop candidates across hiring steps.</p>
          </div>
          <button
            onClick={fetchCandidates}
            className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 text-xs font-black text-slate-300 active:scale-95 duration-100 cursor-pointer"
          >
            ↻ Reload Pipeline
          </button>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400 font-semibold text-xs">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
              Loading pipeline boards...
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center font-bold text-xs text-rose-500">
              {error}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto flex gap-4 p-8 items-start custom-scrollbar">
            {COLUMNS.map((col) => {
              const colCandidates = candidates.filter((c) => c.stage === col.id);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`w-72 rounded-3xl border ${col.border} ${col.bg} p-4 flex flex-col max-h-[80vh] shrink-0 space-y-4`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-200">{col.name}</span>
                    <span className="rounded-full bg-slate-950/60 border border-slate-850 px-2 py-0.5 text-[10px] font-black text-slate-400">
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Candidates Cards scroll region */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[300px]">
                    {colCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, cand.id)}
                        className="rounded-2xl border border-slate-850 bg-slate-950/70 p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-slate-750 transition"
                      >
                        <div>
                          <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Applied Position</span>
                          <h4 className="text-xs font-black text-slate-200 mt-1">{cand.name}</h4>
                          <p className="text-[10px] text-indigo-400 font-bold mt-0.5">{cand.role}</p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 pt-2 border-t border-slate-900">
                          <span>Target: {cand.difficulty}</span>
                          <span className="text-slate-500">Draggable</span>
                        </div>
                      </div>
                    ))}
                    {colCandidates.length === 0 && (
                      <div className="py-12 text-center text-[10px] text-slate-600 font-bold border border-dashed border-slate-850 rounded-2xl select-none">
                        Drop Candidate Here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
