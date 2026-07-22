import React from "react";

export default function OngoingSessionsList({
  loadingSessions,
  activeSessions = [],
  navigate,
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
        Continue Practice
      </h3>
      {loadingSessions ? (
        <div className="p-6 text-center text-slate-450 border border-dashed border-[#1E293B] rounded-2xl bg-slate-900/10">
          Loading ongoing sessions...
        </div>
      ) : activeSessions.length === 0 ? (
        <div className="p-6 text-center text-slate-450 border border-dashed border-[#1E293B] rounded-2xl bg-slate-900/10">
          <p className="text-xs font-semibold">No ongoing sessions. Configure a set above to begin!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeSessions.map((session) => (
            <div
              key={session._id}
              className="bg-slate-900/35 border border-[#1E293B] hover:border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between gap-4 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{session.topic}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    session.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                    session.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                    "bg-rose-500/10 text-rose-400"
                  }`}>
                    {session.difficulty}
                  </span>
                </div>
                <p className="text-[10px] text-slate-455 mt-1">
                  Progress: {session.currentIndex + 1} / {session.questionCount} Questions
                </p>
              </div>
              <button
                onClick={() => navigate(`/practice/aptitude/${session._id}`)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold transition cursor-pointer border-none outline-none"
              >
                Resume Practice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
