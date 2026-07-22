import React from "react";

export default function QuestionTable({
  loading,
  sortedQuestions = [],
  myPractice = { solved: [] },
  bookmarkedIds = new Set(),
  toggleBookmark,
  navigate,
  handleResetFilters,
}) {
  return (
    <div className="bg-brand-card/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-250/60 dark:border-slate-800/80 overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-[550px]">
        <table className="w-full text-left border-collapse table-fixed min-w-[750px]">
          <thead className="sticky top-0 z-10 bg-brand-bg/90 dark:bg-slate-950/90 border-b border-brand-border dark:border-slate-800">
            <tr className="text-brand-secondary dark:text-brand-secondary text-[10px] font-black uppercase tracking-widest">
              <th className="py-4 px-4 w-18 text-center">Status</th>
              <th className="py-4 px-4 w-14 text-center">Fav</th>
              <th className="py-4 px-4 w-[38%]">Problem</th>
              <th className="py-4 px-4 w-28 text-center">Difficulty</th>
              <th className="py-4 px-4">Topic</th>
              <th className="py-4 px-4 w-28 text-center">Acceptance</th>
              <th className="py-4 px-4 text-right w-28">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800/70 text-xs">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-16 text-center text-brand-secondary dark:text-slate-550 font-black tracking-wide">
                  <svg className="animate-spin h-5 w-5 mx-auto text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading question library...
                </td>
              </tr>
            ) : sortedQuestions.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-16 text-center text-brand-secondary dark:text-slate-550 space-y-4">
                  <div className="text-3xl opacity-35">🔍</div>
                  <p className="font-black text-brand-secondary dark:text-brand-secondary text-sm">No matching problems found</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-650/10 cursor-pointer inline-block border-none outline-none"
                  >
                    Clear Active Filters
                  </button>
                </td>
              </tr>
            ) : (
              sortedQuestions.map((q, idx) => {
                const isSolved = myPractice.solved?.some(s => (s._id || s) === q._id);
                
                // Difficulty styling
                let diffStyle = "text-emerald-650 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-500/10";
                if (q.difficulty === "Medium") diffStyle = "text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-500/10";
                if (q.difficulty === "Hard") diffStyle = "text-rose-650 dark:text-rose-450 bg-rose-50 dark:bg-rose-500/10";

                return (
                  <tr
                    key={q._id}
                    onClick={() => navigate(`/practice/coding/${q._id}`)}
                    className={`cursor-pointer transition-all duration-200 group border-l-2 border-l-transparent ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-brand-bg/10 dark:bg-slate-950/5"
                    } hover:bg-indigo-500/[0.03] dark:hover:bg-indigo-500/[0.02] hover:border-l-indigo-500`}
                  >
                    <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {isSolved ? (
                        <svg className="w-5 h-5 mx-auto text-emerald-500 shadow-sm shadow-emerald-500/5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mx-auto text-slate-300 dark:text-brand-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleBookmark(q._id)}
                        className="mx-auto flex items-center justify-center hover:scale-120 active:scale-90 transition-transform duration-100 cursor-pointer bg-transparent border-none p-0 outline-none"
                        title={bookmarkedIds.has(String(q._id)) ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        {bookmarkedIds.has(String(q._id)) ? (
                          <svg className="w-4.5 h-4.5 text-amber-500 fill-current transform hover:scale-110 active:scale-95 transition-all duration-150" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5 text-slate-400 dark:text-slate-655 hover:text-amber-500 fill-none transform hover:scale-110 active:scale-95 transition-all duration-150" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.36.685-.36.832 0l2.354 4.77 5.264.765c.398.058.558.551.27.832l-3.807 3.71 1.0 5.23a.499.499 0 01-.724.526l-4.707-2.476-4.707 2.476a.499.499 0 01-.724-.526l1.002-5.23-3.807-3.71a.499.499 0 01.27-.832l5.264-.765 2.354-4.77z" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {q.title}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block ${
                        q.difficulty === "Easy"
                          ? "text-emerald-500 dark:text-emerald-400 border border-emerald-500/25 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.03)]"
                          : q.difficulty === "Medium"
                            ? "text-amber-500 dark:text-amber-400 border border-amber-500/25 bg-amber-500/5 shadow-[0_0_8px_rgba(245,158,11,0.03)]"
                            : "text-rose-500 dark:text-rose-400 border border-rose-500/25 bg-rose-500/5 shadow-[0_0_8px_rgba(239,68,68,0.03)]"
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-brand-secondary dark:text-brand-secondary font-bold truncate">
                      {(q.tags || []).join(", ")}
                    </td>
                    <td className="py-4 px-4 text-center text-brand-secondary dark:text-brand-secondary font-semibold">
                      {q.acceptance || "72%"}
                    </td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/practice/coding/${q._id}`)}
                        className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 border-none outline-none ${
                          isSolved
                            ? "bg-brand-bg dark:bg-slate-800/80 hover:bg-brand-border dark:hover:bg-slate-750 border border-brand-border dark:border-slate-700/60 text-brand-secondary dark:text-slate-350"
                            : "bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white shadow-md shadow-indigo-650/10"
                        }`}
                      >
                        {isSolved ? "Review" : "Solve"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
