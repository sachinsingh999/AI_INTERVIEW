import React, { useState } from "react";
import {
  Search,
  X,
  Sparkles,
  LayoutGrid,
  List,
  RotateCcw,
  Layers
} from "lucide-react";
import TopicsModal from "./TopicsModal";

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
  viewMode = "table",
  setViewMode,
  availableTags = [],
  questions = [],
}) {
  const [showTopicsModal, setShowTopicsModal] = useState(false);

  const popularTopics = [
    "All",
    "Arrays",
    "Strings",
    "Two Pointers",
    "Sliding Window",
    "Dynamic Programming",
    "Trees",
    "Graphs",
    "Stack",
    "Linked List",
    "Hash Table",
    "Binary Search"
  ];

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDifficulty !== "All" ||
    selectedTag !== "All" ||
    selectedStatus !== "All" ||
    sortKey !== "None";

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedTag("All");
    setSelectedStatus("All");
    setSortKey("None");
  };

  const isCustomTopicSelected =
    selectedTag !== "All" &&
    !popularTopics.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

  return (
    <div className="bg-brand-card border border-brand-border rounded-xs p-1.5 sm:p-2 shadow-xs space-y-1.5">
      
      {/* ROW 1: SEARCH INPUT + TOPIC PILLS + AI GENERATOR */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-brand-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search problems, topics, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 bg-brand-elevated border border-brand-border rounded-xs text-xs font-semibold text-brand-text placeholder:text-brand-secondary/60 outline-none focus:border-brand-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Topic Pills Inline Scroll */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full sm:max-w-md shrink-0">
          {popularTopics.map((topic) => {
            const isSelected = selectedTag.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                onClick={() => setSelectedTag(topic)}
                className={`px-2 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-text text-brand-bg font-black shadow-xs"
                    : "bg-brand-elevated text-brand-secondary hover:text-brand-text hover:bg-brand-elevated/80 border border-brand-border"
                }`}
              >
                {topic}
              </button>
            );
          })}

          {/* Active Custom Topic Pill if selected from modal */}
          {isCustomTopicSelected && (
            <button
              onClick={() => setSelectedTag("All")}
              className="px-2 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-black whitespace-nowrap bg-amber-500 text-slate-900 shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all"
              title="Click to clear active topic"
            >
              <span>{selectedTag}</span>
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          )}

          {/* "+ More" Button to open Topics Popup */}
          <button
            onClick={() => setShowTopicsModal(true)}
            className={`px-2 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1 ${
              showTopicsModal || isCustomTopicSelected
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/50 font-black"
                : "bg-brand-elevated text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:bg-brand-elevated/80 border border-amber-500/30"
            }`}
            title="Browse all DSA topics and categories"
          >
            <Layers className="w-2.5 h-2.5" />
            <span>+ More</span>
          </button>
        </div>

        {/* AI Generator Button */}
        <button
          onClick={() => setShowAiModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-[11px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-98 cursor-pointer shrink-0 ml-auto sm:ml-0"
        >
          <Sparkles className="w-3 h-3" />
          <span>AI Generate</span>
        </button>

      </div>

      {/* ROW 2: COMPACT CONTROLS & DROPDOWNS */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-brand-border/60">
        
        {/* Dropdowns Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-0.5 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value="All">Difficulty: All</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>

          {/* Topic Select */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-0.5 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value="All">Topic: All</option>
            {(availableTags.length > 0 ? availableTags : popularTopics.slice(1)).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-0.5 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Solved">✓ Solved</option>
            <option value="Attempted">⚡ Attempted</option>
            <option value="Unsolved">⭕ Unsolved</option>
          </select>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-0.5 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value="None">Sort: Default</option>
            <option value="Difficulty">Sort: Difficulty</option>
            <option value="Acceptance">Sort: Acceptance</option>
            <option value="Title">Sort: Name (A-Z)</option>
          </select>
        </div>

        {/* Right side: View Toggle & Reset */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* View Mode Toggle */}
          {setViewMode && (
            <div className="flex items-center gap-0.5 bg-brand-elevated p-0.5 rounded-xs border border-brand-border">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-brand-card text-amber-500 shadow-xs"
                    : "text-brand-secondary hover:text-brand-text"
                }`}
                title="Detailed Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-brand-card text-amber-500 shadow-xs"
                    : "text-brand-secondary hover:text-brand-text"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ALL TOPICS POPUP MODAL */}
      <TopicsModal
        isOpen={showTopicsModal}
        onClose={() => setShowTopicsModal(false)}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        questions={questions}
        availableTags={availableTags}
      />

    </div>
  );
}
