import React, { useState } from "react";
import { Clock, CheckCircle2, User, ShieldAlert, Award, Send, ChevronRight, ChevronLeft, Sliders } from "lucide-react";

export default function SessionSidebar({
  role,
  experience,
  difficulty,
  currentPhaseIndex,
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  visitedQuestions,
  onSelectQuestion,
  timeLeftSeconds,
  onSubmit,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = (questions || []).filter((q) => answers && (answers[q.id] || answers[q._id])).length;
  const progressPercent = questions.length > 0 ? Math.min(100, Math.round((answeredCount / questions.length) * 100)) : 0;

  if (isCollapsed) {
    return (
      <aside className="w-full lg:w-12 shrink-0 flex flex-col items-center py-3 px-1.5 bg-slate-950/90 border border-white/10 rounded-xl space-y-4">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          title="Expand Sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center font-mono text-[10px] font-black text-blue-400 rotate-90 py-6 tracking-widest uppercase">
          Sidebar
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
          title="Submit Assessment"
        >
          <Send className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-3 font-sans text-left">
      {/* Collapse Toggle Header */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/10 bg-slate-950/90">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-blue-400" />
          <span>Session Navigator</span>
        </span>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer hidden lg:block"
          title="Collapse Sidebar for Full Page Workspace"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Candidate Info Compact */}
      <div className="rounded-lg border border-white/10 bg-slate-950/90 p-3 space-y-2">
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="bg-slate-900/80 p-1.5 rounded border border-white/5">
            <span className="text-[8px] font-bold uppercase text-slate-500 block">Role</span>
            <span className="font-extrabold text-white text-[11px] truncate block">{role || "Dev"}</span>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-white/5">
            <span className="text-[8px] font-bold uppercase text-slate-500 block">Exp</span>
            <span className="font-extrabold text-white text-[11px] truncate block">{experience || "1-3Y"}</span>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-white/5">
            <span className="text-[8px] font-bold uppercase text-slate-500 block">Diff</span>
            <span className="font-extrabold text-emerald-400 text-[11px] truncate block">{difficulty || "Med"}</span>
          </div>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="rounded-lg border border-white/10 bg-slate-950/90 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="font-bold text-slate-400 uppercase">Progress</span>
          <span className="font-bold text-blue-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[9px] text-slate-400 block text-right font-mono">
          {answeredCount} / {questions.length} Done
        </span>
      </div>

      {/* Question Navigator Grid */}
      <div className="rounded-lg border border-white/10 bg-slate-950/90 p-3 space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block border-b border-white/5 pb-1">
          Questions ({questions.length})
        </span>

        {/* Compact Legend */}
        <div className="grid grid-cols-2 gap-1 text-[9px] font-medium text-slate-400">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-800 border border-white/10" />
            <span>Not Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Flagged</span>
          </div>
        </div>

        {/* Grid Circles */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isFlagged = !!flaggedQuestions[q.id];
            const isVisited = !!visitedQuestions[q.id];
            const isCurrent = currentIndex === idx;

            let stateClass = "bg-slate-900 border-white/10 text-slate-500";
            if (isFlagged) {
              stateClass = "bg-rose-500 text-white border-rose-400 shadow-sm";
            } else if (isAnswered) {
              stateClass = "bg-emerald-600 text-white border-emerald-400 shadow-sm";
            } else if (isVisited) {
              stateClass = "bg-blue-600 text-white border-blue-400";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-mono font-bold border transition duration-150 cursor-pointer ${stateClass} ${
                  isCurrent ? "ring-2 ring-white ring-offset-1 ring-offset-slate-950 scale-105" : ""
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Timer Card */}
      <div className="rounded-lg border border-white/10 bg-slate-950/90 p-3 text-center space-y-0.5">
        <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">
          Phase Timer
        </span>
        <div className="text-xl font-black font-mono text-white tracking-wider">
          {formatTime(timeLeftSeconds)}
        </div>
      </div>

      {/* Submit Action */}
      <button
        type="button"
        onClick={onSubmit}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-extrabold text-white shadow-md hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer"
      >
        <Send className="h-3.5 w-3.5" />
        <span>Submit Assessment</span>
      </button>
    </aside>
  );
}
