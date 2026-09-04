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
      {/* Mobile/Tablet Horizontal Tabs Switcher (Solid Premium Tab Bar) */}
      <div className="flex lg:hidden bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 p-1.5 rounded-sm gap-1 shrink-0 shadow-sm">
        <button
          onClick={() => setActiveSection("library")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-black transition-all duration-150 cursor-pointer ${
            activeSection === "library"
              ? "bg-[#F59E0B] text-[#0F172A] shadow-sm font-extrabold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
          }`}
        >
          <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <span>Library</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wide ${
            activeSection === "library" ? "bg-black/15 text-[#0F172A]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}>
            {questions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSection("favorites")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-black transition-all duration-150 cursor-pointer ${
            activeSection === "favorites"
              ? "bg-[#F59E0B] text-[#0F172A] shadow-sm font-extrabold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
          }`}
        >
          <svg className={`w-4 h-4 shrink-0 ${activeSection === "favorites" ? "text-[#0F172A]" : "text-amber-500 fill-current"}`} fill={activeSection === "favorites" ? "none" : "currentColor"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeSection === "favorites" ? "2.5" : "0"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.36.685-.36.832 0l2.354 4.77 5.264.765c.398.058.558.551.27.832l-3.807 3.71 1.0 5.23a.499.499 0 01-.724.526l-4.707-2.476-4.707 2.476a.499.499 0 01-.724-.526l1.002-5.23-3.807-3.71a.499.499 0 01.27-.832l5.264-.765 2.354-4.77z" />
          </svg>
          <span>Favorites</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wide ${
            activeSection === "favorites" ? "bg-black/15 text-[#0F172A]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}>
            {bookmarkedList.length}
          </span>
        </button>
      </div>

      {/* Sticky Left Sidebar for Desktop (Solid Premium Cards) */}
      <aside className="hidden lg:block w-68 shrink-0 lg:sticky lg:top-[90px] h-fit space-y-6">
        {/* Navigation Card */}
        <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800/80 rounded-sm p-4 shadow-sm space-y-2.5">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5">
            Arena Navigation
          </h3>
          
          <div className="space-y-1.5">
            <button
              onClick={() => navigate("/practice")}
              className="w-full flex items-center gap-2.5 rounded-sm px-3.5 py-2 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-155 cursor-pointer"
            >
              <span>←</span>
              <span>Back to Hub</span>
            </button>

            <button
              onClick={() => setActiveSection("library")}
              className={`w-full flex items-center justify-between rounded-sm px-3.5 py-2.5 text-xs font-black transition-all duration-150 cursor-pointer ${
                activeSection === "library"
                  ? "bg-[#F59E0B] text-[#0F172A] shadow-sm font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span>Question Library</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold ${
                activeSection === "library" ? "bg-black/15 text-[#0F172A]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}>
                {questions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection("favorites")}
              className={`w-full flex items-center justify-between rounded-sm px-3.5 py-2.5 text-xs font-black transition-all duration-150 cursor-pointer ${
                activeSection === "favorites"
                  ? "bg-[#F59E0B] text-[#0F172A] shadow-sm font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className={`w-4 h-4 shrink-0 ${activeSection === "favorites" ? "text-[#0F172A]" : "text-amber-500 fill-current"}`} fill={activeSection === "favorites" ? "none" : "currentColor"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeSection === "favorites" ? "2.5" : "0"}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.36.685-.36.832 0l2.354 4.77 5.264.765c.398.058.558.551.27.832l-3.807 3.71 1.0 5.23a.499.499 0 01-.724.526l-4.707-2.476-4.707 2.476a.499.499 0 01-.724-.526l1.002-5.23-3.807-3.71a.499.499 0 01.27-.832l5.264-.765 2.354-4.77z" />
                </svg>
                <span>My Favorites</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold ${
                activeSection === "favorites" ? "bg-black/15 text-[#0F172A]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}>
                {bookmarkedList.length}
              </span>
            </button>

            <button
              onClick={() => navigate("/practice/potd/archive")}
              className="w-full flex items-center justify-between rounded-sm px-3.5 py-2.5 text-xs font-black transition-all duration-150 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
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
      </aside>
    </>
  );
}
