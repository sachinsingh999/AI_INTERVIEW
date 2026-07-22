import React from "react";

export default function POTDSection({
  potdLoading,
  potdData,
  countdown,
  formatCountdown,
  navigate,
  toggleBookmark,
  bookmarkedIds = new Set(),
}) {
  if (potdLoading) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 text-center text-brand-secondary font-bold text-sm">
        <svg className="animate-spin h-5 w-5 mx-auto text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading Daily Challenge...
      </div>
    );
  }

  if (!potdData?.potd?.question) {
    return null;
  }

  const q = potdData.potd.question;
  const isSolved = potdData.solved;
  const streak = potdData.streak || 0;
  
  let diffStyle = "text-emerald-600 dark:text-[#10B981] bg-emerald-50 dark:bg-[#10B981]/15";
  if (q.difficulty === "Medium") diffStyle = "text-amber-600 dark:text-[#F59E0B] bg-amber-50 dark:bg-[#F59E0B]/15";
  if (q.difficulty === "Hard") diffStyle = "text-rose-600 dark:text-[#EF4444] bg-rose-50 dark:bg-[#EF4444]/15";

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-6 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-brand-card via-brand-card to-brand-primary/[0.03]">
      {/* Left Side */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-brand-text tracking-tight">{q.title}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diffStyle}`}>
              {q.difficulty}
            </span>
            {isSolved && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-455 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                ✓ Solved
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-brand-secondary">
            <span>Acceptance Rate: {q.acceptance || "72%"}</span>
            <span>•</span>
            <span>Estimated Time: 15 Minutes</span>
          </div>
        </div>

        <p className="text-xs text-brand-secondary leading-relaxed">
          {q.description || "Given an array of integers, solve the challenge."}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => navigate(`/practice/coding/${q._id}`)}
            className="px-5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            {isSolved ? "Review Solution" : "Solve Challenge"}
          </button>
          <button
            onClick={() => toggleBookmark(q._id)}
            className={`p-1.5 rounded-lg border transition-colors duration-150 cursor-pointer ${
              bookmarkedIds.has(String(q._id)) 
                ? "bg-amber-500/10 border-amber-500/35 text-amber-500 hover:bg-amber-500/20" 
                : "bg-brand-bg border-brand-border text-brand-secondary hover:text-brand-text hover:bg-brand-zebra/20"
            }`}
            title={bookmarkedIds.has(String(q._id)) ? "Remove Bookmark" : "Bookmark Problem"}
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Side Statistics Panel */}
      <div className="grid grid-cols-2 gap-3 bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60">
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider">Solved Streak</span>
          <span className="text-sm font-extrabold text-brand-text mt-0.5 flex items-center gap-1">
            🔥 {streak} {streak === 1 ? "Day" : "Days"}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider">Topic</span>
          <span className="text-sm font-extrabold text-brand-text mt-0.5 truncate">{(q.tags || ["Arrays"])[0]}</span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider">Success Rate</span>
          <span className="text-sm font-extrabold text-brand-text mt-0.5">{q.acceptance || "72%"}</span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider">Completions</span>
          <span className="text-sm font-extrabold text-brand-text mt-0.5">{q.solvedCount || 1042} users</span>
        </div>
      </div>
    </div>
  );
}
