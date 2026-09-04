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
      <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
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
  
  let diffStyle = "text-emerald-605 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10";
  if (q.difficulty === "Medium") diffStyle = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10";
  if (q.difficulty === "Hard") diffStyle = "text-rose-605 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10";

  return (
    <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-6 shadow-sm">
      {/* Left Side */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{q.title}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${diffStyle}`}>
              {q.difficulty}
            </span>
            {isSolved && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                ✓ Solved
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-450 dark:text-slate-500">
            <span>Acceptance Rate: {q.acceptance || "72%"}</span>
            <span>•</span>
            <span>Estimated Time: 15 Minutes</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {q.description || "Given an array of integers, solve the challenge."}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => navigate(`/practice/coding/${q._id}`)}
            className="px-5 py-1.5 rounded-md bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            {isSolved ? "Review Solution" : "Solve Challenge"}
          </button>
          <button
            onClick={() => toggleBookmark(q._id)}
            className={`p-1.5 rounded-md border transition-colors duration-150 cursor-pointer ${
              bookmarkedIds.has(String(q._id)) 
                ? "bg-amber-500/10 border-amber-500/35 text-amber-500 hover:bg-amber-500/20" 
                : "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
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
      <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#070b13]/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Solved Streak</span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
            🔥 {streak} {streak === 1 ? "Day" : "Days"}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Topic</span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 truncate">{(q.tags || ["Arrays"])[0]}</span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Success Rate</span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">{q.acceptance || "72%"}</span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estimated Points</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            +50 XP
          </span>
        </div>
      </div>
    </div>
  );
}
