import React, { useState, useMemo } from "react";

export default function QuestionNavigatorDrawer({
  drawerOpen,
  setDrawerOpen,
  isCoding,
  isAptitude,
  searchQuery,
  setSearchQuery,
  questionSet = [],
  currentIndex,
  goToQuestion,
  userProfile, // contains userProfile.saved and userProfile.bookmarked
  solvedQuestionIds = new Set(),
}) {
  const [collapsedSections, setCollapsedSections] = useState({
    library: false,
    bookmarks: false,
    saved: false,
  });

  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Dynamic topics extractor
  const allTopics = useMemo(() => {
    const topics = new Set();
    questionSet.forEach((q) => {
      const tags = q.tags || (q.category ? [q.category] : []);
      tags.forEach((tag) => {
        if (tag) topics.add(tag);
      });
    });
    return ["All", ...Array.from(topics)];
  }, [questionSet]);

  // General Filtered List helper
  const getFilteredList = (list) => {
    return list.filter(({ q }) => {
      const title = q.title || q.question || q.prompt || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
      
      const qIdStr = q._id?.toString() || "";
      const isSolved = solvedQuestionIds.has(qIdStr);
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Solved" && isSolved) || 
        (statusFilter === "Unsolved" && !isSolved);
        
      const tags = q.tags || (q.category ? [q.category] : []);
      const matchesTopic = topicFilter === "All" || tags.includes(topicFilter);
      
      return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic;
    });
  };

  const renderQuestionButton = (q, originalIdx) => {
    const isSelected = originalIdx === currentIndex;
    const title = q.title || q.question || q.prompt || "";
    const qIdStr = q._id?.toString() || "";
    const isSolved = solvedQuestionIds.has(qIdStr);
    
    // Status indicators
    let statusIcon;
    if (isSelected) {
      statusIcon = (
        <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      );
    } else if (isSolved) {
      statusIcon = (
        <svg className="w-3.5 h-3.5 text-emerald-450 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      );
    } else {
      statusIcon = (
        <svg className="w-3.5 h-3.5 text-slate-600 shrink-0 hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    }

    // Difficulty badge
    const isEasy = q.difficulty === "Easy";
    const isMedium = q.difficulty === "Medium";
    const diffBadge = isEasy ? (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 shrink-0 ml-3.5">
        Easy
      </span>
    ) : isMedium ? (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15 shrink-0 ml-3.5">
        Medium
      </span>
    ) : (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-455 border border-rose-550/15 shrink-0 ml-3.5">
        Hard
      </span>
    );

    return (
      <button
        key={originalIdx}
        type="button"
        onClick={() => {
          goToQuestion(originalIdx);
          setDrawerOpen(false);
        }}
        className={`w-full text-left py-2 px-3 flex items-center justify-between transition-all duration-200 cursor-pointer select-none rounded-lg border text-xs ${
          isSelected 
            ? "bg-indigo-500/10 text-white border-indigo-500/40 font-semibold shadow-[0_0_12px_rgba(99,102,241,0.04)]" 
            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/35 hover:border-slate-800/50 hover:translate-x-0.5"
        }`}
      >
        <div className="min-w-0 flex items-center gap-2.5">
          {statusIcon}
          <span className="truncate">{originalIdx + 1}. {title}</span>
        </div>
        {diffBadge}
      </button>
    );
  };

  // Group mappings
  const bookmarkedIndices = [];
  const savedIndices = [];
  const normalIndices = [];

  questionSet.forEach((q, idx) => {
    const isBookmarked = userProfile?.bookmarked?.some(b => (b._id || b) === q._id);
    const isSaved = userProfile?.saved?.some(s => (s._id || s) === q._id);

    if (isBookmarked) bookmarkedIndices.push({ q, idx });
    if (isSaved) savedIndices.push({ q, idx });
    normalIndices.push({ q, idx });
  });

  if (!drawerOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1.5px] transition-opacity duration-300"
      />
      
      {/* Premium Compact Explorer Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-[360px] bg-gradient-to-b from-[#0F172A] to-[#0B1220] border-r border-[#1E293B]/70 shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform translate-x-0">
        
        {/* Sidebar Header */}
        <div className="p-3 px-4 border-b border-[#1E293B]/60 flex items-center justify-between bg-slate-900/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 select-none">
              {isCoding ? "Workspace Explorer" : isAptitude ? "Aptitude Tests" : "Written Practice"}
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-200 transition-all duration-200 p-1.5 hover:bg-slate-800/60 rounded-md cursor-pointer"
            title="Close Sidebar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Compact Search Bar */}
        <div className="p-3 border-b border-[#1E293B]/50 bg-slate-900/10 shrink-0">
          <div className="relative flex items-center">
            <svg 
              className="absolute left-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search problems..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/40 border border-[#1E293B] hover:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 font-medium"
            />
          </div>
        </div>

        {/* Dropdown Filters Bar */}
        <div className="p-3 border-b border-[#1E293B]/50 bg-slate-900/5 flex gap-2 shrink-0">
          <div className="flex-1 min-w-[75px] relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full bg-slate-950/30 text-slate-300 border border-[#1E293B] rounded-lg pl-2.5 pr-6 py-1.5 text-[10px] font-bold outline-none cursor-pointer hover:border-indigo-500/50 hover:text-slate-200 transition appearance-none bg-[right_8px_center] bg-no-repeat bg-[length:8px]"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
              }}
            >
              <option className="bg-[#0B1220] text-slate-300" value="All">Difficulty</option>
              <option className="bg-[#0B1220] text-slate-300" value="Easy">Easy</option>
              <option className="bg-[#0B1220] text-slate-300" value="Medium">Medium</option>
              <option className="bg-[#0B1220] text-slate-300" value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex-1 min-w-[75px] relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950/30 text-slate-300 border border-[#1E293B] rounded-lg pl-2.5 pr-6 py-1.5 text-[10px] font-bold outline-none cursor-pointer hover:border-indigo-500/50 hover:text-slate-200 transition appearance-none bg-[right_8px_center] bg-no-repeat bg-[length:8px]"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
              }}
            >
              <option className="bg-[#0B1220] text-slate-300" value="All">Status</option>
              <option className="bg-[#0B1220] text-slate-300" value="Solved">Solved</option>
              <option className="bg-[#0B1220] text-slate-300" value="Unsolved">Unsolved</option>
            </select>
          </div>

          <div className="flex-1 min-w-[75px] max-w-[95px] relative">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full bg-slate-950/30 text-slate-300 border border-[#1E293B] rounded-lg pl-2.5 pr-6 py-1.5 text-[10px] font-bold outline-none cursor-pointer hover:border-indigo-500/50 hover:text-slate-200 transition appearance-none bg-[right_8px_center] bg-no-repeat bg-[length:8px] truncate"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
              }}
            >
              <option className="bg-[#0B1220] text-slate-300" value="All">Topic</option>
              {allTopics.filter(t => t !== "All").map((topic) => (
                <option className="bg-[#0B1220] text-slate-300" key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Scannable Problems list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 bg-slate-900/10">
          
          {/* Section: Bookmarks */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection("bookmarks")}
              className="w-full flex items-center justify-between py-2 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 rounded-lg hover:text-slate-200 transition-all duration-200 select-none cursor-pointer"
            >
              <span>Bookmarks ({bookmarkedIndices.length})</span>
              <svg 
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  collapsedSections.bookmarks ? "-rotate-90" : "rotate-0"
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.bookmarks && (
              <div className="mt-2 space-y-1.5">
                {bookmarkedIndices.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-2 pl-3">No bookmarks</p>
                ) : (
                  getFilteredList(bookmarkedIndices).map(({ q, idx }) => renderQuestionButton(q, idx))
                )}
              </div>
            )}
          </div>

          {/* Section: Saved */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection("saved")}
              className="w-full flex items-center justify-between py-2 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 rounded-lg hover:text-slate-200 transition-all duration-200 select-none cursor-pointer"
            >
              <span>Saved ({savedIndices.length})</span>
              <svg 
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  collapsedSections.saved ? "-rotate-90" : "rotate-0"
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.saved && (
              <div className="mt-2 space-y-1.5">
                {savedIndices.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-2 pl-3">No saved questions</p>
                ) : (
                  getFilteredList(savedIndices).map(({ q, idx }) => renderQuestionButton(q, idx))
                )}
              </div>
            )}
          </div>

          {/* Section: Problems */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection("library")}
              className="w-full flex items-center justify-between py-2 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 rounded-lg hover:text-slate-200 transition-all duration-200 select-none cursor-pointer"
            >
              <span>Problems ({questionSet.length})</span>
              <svg 
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  collapsedSections.library ? "-rotate-90" : "rotate-0"
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.library && (
              <div className="mt-2 space-y-1.5">
                {getFilteredList(normalIndices).map(({ q, idx }) => renderQuestionButton(q, idx))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
