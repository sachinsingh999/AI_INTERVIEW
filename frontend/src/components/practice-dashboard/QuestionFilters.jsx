import React from "react";

export default function QuestionFilters({
  searchQuery,
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedTag,
  setSelectedTag,
  selectedStatus,
  setSelectedStatus,
  sortKey,
  setSortKey,
  setShowAiModal,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-brand-card/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-brand-border dark:border-slate-800/80 shadow-sm">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-secondary dark:text-brand-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search problems or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-brand-bg dark:bg-slate-950/40 border border-brand-border dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-brand-bg dark:bg-slate-950/40 text-brand-secondary dark:text-slate-300 border border-brand-border dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
        >
          <option value="All">Difficulty: All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="bg-brand-bg dark:bg-slate-950/40 text-brand-secondary dark:text-slate-300 border border-brand-border dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
        >
          <option value="All">Topics: All</option>
          {["Arrays", "Strings", "Linked List", "Trees", "Graphs", "Dynamic Programming", "Stack"].map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-brand-bg dark:bg-slate-950/40 text-brand-secondary dark:text-slate-300 border border-brand-border dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
        >
          <option value="All">Status: All</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="bg-brand-bg dark:bg-slate-950/40 text-brand-secondary dark:text-slate-300 border border-brand-border dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
        >
          <option value="None">Sort: Default</option>
          <option value="Difficulty">Sort: Difficulty</option>
          <option value="Acceptance">Sort: Acceptance</option>
          <option value="Title">Sort: Name</option>
        </select>

        <button
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-650 via-indigo-600 to-violet-650 text-white hover:opacity-95 text-xs font-black transition-all hover:scale-[1.01] active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-650/15"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.096 15 8.1 14.187 9 9l.813 5.187 5.096.817-5.096.9zM19.045 7.045L18.5 10.5l-.545-3.455L14.5 6.5l3.455-.545L18.5 2.5l.545 3.455 3.455.545-3.455.545z" />
          </svg>
          <span>Generate</span>
        </button>
      </div>
    </div>
  );
}
