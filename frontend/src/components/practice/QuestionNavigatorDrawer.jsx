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
  userProfile,
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
        <svg className="w-3.5 h-3.5 text-brand-primary shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      );
    } else if (isSolved) {
      statusIcon = (
        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      );
    } else {
      statusIcon = (
        <svg className="w-3.5 h-3.5 text-brand-secondary/60 shrink-0 hover:text-brand-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    }

    // Difficulty badge
    const isEasy = q.difficulty === "Easy";
    const isMedium = q.difficulty === "Medium";
    const diffBadge = isEasy ? (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ml-3.5">
        Easy
      </span>
    ) : isMedium ? (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 shrink-0 ml-3.5">
        Medium
      </span>
    ) : (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0 ml-3.5">
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
        className={`w-full text-left py-1.5 px-2.5 flex items-center justify-between transition-all duration-200 cursor-pointer select-none rounded-xs border text-xs ${
          isSelected 
            ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40 font-bold shadow-xs" 
            : "border-transparent text-brand-secondary hover:text-brand-text hover:bg-brand-elevated hover:border-brand-border"
        }`}
      >
        <div className="min-w-0 flex items-center gap-2">
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
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />
      
      {/* Explorer Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-[340px] bg-brand-card border-r border-brand-border shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform translate-x-0">
        
        {/* Sidebar Header */}
        <div className="p-3 px-4 border-b border-brand-border flex items-center justify-between bg-brand-elevated shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text select-none">
              {isCoding ? "Workspace Explorer" : isAptitude ? "Aptitude Tests" : "Written Practice"}
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="text-brand-secondary hover:text-brand-text transition p-1 hover:bg-brand-card rounded-xs cursor-pointer"
            title="Close Sidebar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Compact Search Bar */}
        <div className="p-2.5 border-b border-brand-border bg-brand-card shrink-0">
          <div className="relative flex items-center">
            <svg 
              className="absolute left-2.5 w-3.5 h-3.5 text-brand-secondary pointer-events-none" 
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
              className="w-full bg-brand-elevated border border-brand-border rounded-xs pl-8 pr-3 py-1 text-xs text-brand-text placeholder-brand-secondary/60 outline-none focus:border-brand-primary transition font-medium"
            />
          </div>
        </div>

        {/* Dropdown Filters Bar */}
        <div className="p-2.5 border-b border-brand-border bg-brand-card flex gap-1.5 shrink-0">
          <div className="flex-1 min-w-[70px] relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full bg-brand-elevated text-brand-text border border-brand-border rounded-xs px-2 py-1 text-[10px] font-bold outline-none cursor-pointer hover:border-brand-primary transition"
            >
              <option value="All">Difficulty: All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex-1 min-w-[70px] relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-brand-elevated text-brand-text border border-brand-border rounded-xs px-2 py-1 text-[10px] font-bold outline-none cursor-pointer hover:border-brand-primary transition"
            >
              <option value="All">Status: All</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>

          <div className="flex-1 min-w-[70px] relative">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full bg-brand-elevated text-brand-text border border-brand-border rounded-xs px-2 py-1 text-[10px] font-bold outline-none cursor-pointer hover:border-brand-primary transition truncate"
            >
              <option value="All">Topic: All</option>
              {allTopics.filter(t => t !== "All").map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Scannable Problems list */}
        <div className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-3 bg-brand-card">
          
          {/* Section: Bookmarks */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection("bookmarks")}
              className="w-full flex items-center justify-between py-1.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-brand-secondary bg-brand-elevated hover:bg-brand-elevated/80 border border-brand-border rounded-xs hover:text-brand-text transition select-none cursor-pointer"
            >
              <span>Bookmarks ({bookmarkedIndices.length})</span>
              <svg 
                className={`w-3.5 h-3.5 text-brand-secondary transition-transform duration-200 ${
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
              <div className="mt-1 space-y-1">
                {bookmarkedIndices.length === 0 ? (
                  <p className="text-[10px] text-brand-secondary italic py-1 pl-2">No bookmarks</p>
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
              className="w-full flex items-center justify-between py-1.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-brand-secondary bg-brand-elevated hover:bg-brand-elevated/80 border border-brand-border rounded-xs hover:text-brand-text transition select-none cursor-pointer"
            >
              <span>Saved ({savedIndices.length})</span>
              <svg 
                className={`w-3.5 h-3.5 text-brand-secondary transition-transform duration-200 ${
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
              <div className="mt-1 space-y-1">
                {savedIndices.length === 0 ? (
                  <p className="text-[10px] text-brand-secondary italic py-1 pl-2">No saved questions</p>
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
              className="w-full flex items-center justify-between py-1.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-brand-secondary bg-brand-elevated hover:bg-brand-elevated/80 border border-brand-border rounded-xs hover:text-brand-text transition select-none cursor-pointer"
            >
              <span>Problems ({questionSet.length})</span>
              <svg 
                className={`w-3.5 h-3.5 text-brand-secondary transition-transform duration-200 ${
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
              <div className="mt-1 space-y-1">
                {getFilteredList(normalIndices).map(({ q, idx }) => renderQuestionButton(q, idx))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
