import React from "react";

export default function CompletedAssessmentsList({
  loadingSessions,
  completedSessions = [],
  openAnalysis,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
        Completed Assessments
      </h3>
      
      {loadingSessions ? (
        <div className="p-6 text-center text-slate-450 border border-dashed border-[#1E293B] rounded-2xl bg-slate-900/10">
          Loading history...
        </div>
      ) : completedSessions.length === 0 ? (
        <div className="p-6 text-center text-slate-450 border border-dashed border-[#1E293B] rounded-2xl bg-slate-900/10">
          <p className="text-xs font-semibold">No completed sets yet. Finish a practice set to view insights!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {completedSessions.map((session) => {
            const acc = session.analysis?.accuracy !== undefined ? session.analysis.accuracy : null;
            const total = session.questionCount;

            return (
              <div
                key={session._id}
                className="bg-slate-900/35 border border-[#1E293B] hover:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 transition"
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{session.topic}</span>
                  <span className="text-[10px] text-slate-455 mt-0.5 block">
                    {session.difficulty} • {total} Questions
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-2">
                  {acc !== null && (
                    <span className="text-xs font-black text-emerald-400">{acc}% Acc</span>
                  )}
                  <button
                    onClick={() => openAnalysis(session)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 transition cursor-pointer bg-transparent outline-none"
                  >
                    View Analysis
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
