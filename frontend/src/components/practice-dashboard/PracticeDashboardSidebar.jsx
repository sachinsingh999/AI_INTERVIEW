import React from "react";

export default function PracticeDashboardSidebar({
  activeSection,
  setActiveSection,
  questions = [],
  myPractice = { bookmarked: [] },
  navigate,
}) {
  const bookmarkedList = myPractice.bookmarked || [];

  return (
    <>
      {/* Mobile/Tablet Horizontal Tabs Switcher (Sleek Glassmorphic Tab Bar) */}
      <div className="flex lg:hidden bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-md border border-brand-border dark:border-slate-800/80 p-1.5 rounded-2xl gap-1 shrink-0 shadow-lg">
        <button
          onClick={() => setActiveSection("library")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all duration-200 cursor-pointer ${
            activeSection === "library"
              ? "bg-gradient-to-r from-blue-655 to-indigo-600 text-white shadow-md shadow-indigo-650/15"
              : "text-brand-secondary dark:text-brand-secondary hover:text-brand-text dark:hover:text-slate-200 hover:bg-brand-bg/30 dark:hover:bg-slate-900/30"
          }`}
        >
          <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <span>Library</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide ${
            activeSection === "library" ? "bg-brand-card/20 text-white" : "bg-brand-bg dark:bg-slate-800 text-brand-secondary dark:text-brand-secondary"
          }`}>
            {questions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSection("favorites")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all duration-200 cursor-pointer ${
            activeSection === "favorites"
              ? "bg-gradient-to-r from-blue-655 to-indigo-600 text-white shadow-md shadow-indigo-650/15"
              : "text-brand-secondary dark:text-brand-secondary hover:text-brand-text dark:hover:text-slate-200 hover:bg-brand-bg/30 dark:hover:bg-slate-900/30"
          }`}
        >
          <svg className={`w-4 h-4 shrink-0 ${activeSection === "favorites" ? "text-white" : "text-amber-500 fill-current"}`} fill={activeSection === "favorites" ? "none" : "currentColor"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeSection === "favorites" ? "2.5" : "0"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.36.685-.36.832 0l2.354 4.77 5.264.765c.398.058.558.551.27.832l-3.807 3.71 1.0 5.23a.499.499 0 01-.724.526l-4.707-2.476-4.707 2.476a.499.499 0 01-.724-.526l1.002-5.23-3.807-3.71a.499.499 0 01.27-.832l5.264-.765 2.354-4.77z" />
          </svg>
          <span>Favorites</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide ${
            activeSection === "favorites" ? "bg-brand-card/20 text-white" : "bg-brand-bg dark:bg-slate-800 text-brand-secondary dark:text-brand-secondary"
          }`}>
            {bookmarkedList.length}
          </span>
        </button>
      </div>

      {/* Sticky Left Sidebar for Desktop (Premium Glassmorphism & Hover states) */}
      <aside className="hidden lg:block w-68 shrink-0 lg:sticky lg:top-[90px] h-fit space-y-6">
        {/* Navigation Card */}
        <div className="bg-brand-card/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2.5">
          <h3 className="text-[10px] font-black text-brand-secondary dark:text-brand-secondary uppercase tracking-widest px-2.5">
            Arena Navigation
          </h3>
          
          <div className="space-y-1.5">
            <button
              onClick={() => navigate("/practice")}
              className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-black text-slate-500 dark:text-slate-455 hover:text-slate-900 dark:hover:text-white hover:bg-brand-bg/50 dark:hover:bg-slate-800/50 transition-all duration-150 cursor-pointer"
            >
              <span>←</span>
              <span>Back to Hub</span>
            </button>

            <button
              onClick={() => setActiveSection("library")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition-all duration-150 cursor-pointer ${
                activeSection === "library"
                  ? "bg-gradient-to-r from-blue-650 to-indigo-600 text-white shadow-md shadow-indigo-650/15 scale-[1.01]"
                  : "text-brand-secondary dark:text-brand-secondary hover:text-brand-text dark:hover:text-white hover:bg-brand-bg/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span>Question Library</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                activeSection === "library" ? "bg-brand-card/20 text-white" : "bg-brand-bg dark:bg-slate-800 text-brand-secondary dark:text-brand-secondary"
              }`}>
                {questions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection("favorites")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition-all duration-150 cursor-pointer ${
                activeSection === "favorites"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/15 scale-[1.01]"
                  : "text-brand-secondary dark:text-brand-secondary hover:text-brand-text dark:hover:text-white hover:bg-brand-bg/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className={`w-4 h-4 shrink-0 ${activeSection === "favorites" ? "text-white" : "text-amber-500 fill-current"}`} fill={activeSection === "favorites" ? "none" : "currentColor"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeSection === "favorites" ? "2.5" : "0"}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.36.685-.36.832 0l2.354 4.77 5.264.765c.398.058.558.551.27.832l-3.807 3.71 1.0 5.23a.499.499 0 01-.724.526l-4.707-2.476-4.707 2.476a.499.499 0 01-.724-.526l1.002-5.23-3.807-3.71a.499.499 0 01.27-.832l5.264-.765 2.354-4.77z" />
                </svg>
                <span>My Favorites</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                activeSection === "favorites" ? "bg-brand-card/20 text-white" : "bg-brand-bg dark:bg-slate-800 text-brand-secondary dark:text-brand-secondary"
              }`}>
                {bookmarkedList.length}
              </span>
            </button>

            <button
              onClick={() => navigate("/practice/potd/archive")}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition-all duration-150 cursor-pointer text-brand-secondary dark:text-brand-secondary hover:text-brand-text dark:hover:text-white hover:bg-brand-bg/50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>POTD Archive</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick-Access Favorites Card */}
        <div className="bg-brand-card/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-brand-secondary dark:text-brand-secondary uppercase tracking-widest px-1">
            Quick Favorites
          </h3>
          
          {bookmarkedList.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-brand-border dark:border-slate-850 text-center">
              <p className="text-[11px] text-slate-455 dark:text-brand-secondary italic leading-relaxed">
                No bookmarked questions yet. Click the star on any problem to favorite it!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bookmarkedList.slice(0, 5).map((q) => {
                let diffStyle = "text-emerald-600 dark:text-[#10B981] bg-emerald-50 dark:bg-[#10B981]/10";
                if (q.difficulty === "Medium") diffStyle = "text-amber-600 dark:text-[#F59E0B] bg-amber-50 dark:bg-[#F59E0B]/10";
                if (q.difficulty === "Hard") diffStyle = "text-rose-600 dark:text-[#EF4444] bg-rose-50 dark:bg-[#EF4444]/10";

                return (
                  <div
                    key={q._id}
                    onClick={() => navigate(`/practice/coding/${q._id}`)}
                    className="group flex flex-col p-3 rounded-xl border border-brand-border dark:border-slate-800/50 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 bg-brand-bg/40 dark:bg-slate-950/40 hover:bg-brand-card dark:hover:bg-slate-900/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {q.title}
                      </span>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${diffStyle}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-brand-secondary dark:text-brand-secondary mt-2 font-bold">
                      <span>{(q.tags || [])[0] || "Coding"}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-200 font-extrabold uppercase tracking-wider">
                        Solve →
                      </span>
                    </div>
                  </div>
                );
              })}
              {bookmarkedList.length > 5 && (
                <button
                  onClick={() => setActiveSection("favorites")}
                  className="w-full text-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-755 dark:hover:text-indigo-350 hover:underline pt-2 border-t border-brand-border dark:border-slate-850 cursor-pointer bg-transparent border-none outline-none"
                >
                  View all {bookmarkedList.length} favorites
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
