import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Circle,
  Star,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function QuestionTable({
  loading,
  sortedQuestions = [],
  myPractice = { solved: [], attempted: [], bookmarked: [] },
  bookmarkedIds = new Set(),
  toggleBookmark,
  navigate,
  handleResetFilters,
  viewMode = "table",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const solvedSet = new Set((myPractice.solved || []).map(s => String(s._id || s)));
  const attemptedSet = new Set((myPractice.attempted || []).map(s => String(s._id || s)));

  // Pagination calculation
  const totalItems = sortedQuestions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = sortedQuestions.slice(startIndex, startIndex + itemsPerPage);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      case "Hard":
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25";
      case "Medium":
      default:
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25";
    }
  };

  // 1. LOADING SKELETON
  if (loading) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-xs p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-3.5 bg-brand-elevated rounded w-1/4" />
          <div className="h-3.5 bg-brand-elevated rounded w-1/6" />
        </div>
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-9 bg-brand-elevated/60 border border-brand-border/40 rounded-xs animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // 2. EMPTY STATE
  if (sortedQuestions.length === 0) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-xs p-6 text-center shadow-xs space-y-2">
        <div className="w-9 h-9 rounded-full bg-brand-elevated border border-brand-border flex items-center justify-center mx-auto text-brand-secondary">
          <Search className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-brand-text">No matching problems found</h3>
          <p className="text-xs text-brand-secondary max-w-xs mx-auto">
            Try adjusting your search keywords, difficulty filter, or topic tags.
          </p>
        </div>
        <button
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-black text-xs uppercase tracking-wider rounded-xs shadow-xs cursor-pointer transition-all active:scale-98"
        >
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      
      {/* 3. TABLE VIEW (Dense Compact Rows with High Legibility) */}
      {viewMode === "table" ? (
        <div className="bg-brand-card rounded-xs border border-brand-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
              
              <thead className="sticky top-0 z-10 bg-brand-elevated/90 backdrop-blur-sm border-b border-brand-border text-brand-secondary text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="py-2.5 px-2.5 w-12 text-center">Status</th>
                  <th className="py-2.5 px-1 w-10 text-center">Fav</th>
                  <th className="py-2.5 px-3 w-[45%]">Problem Title</th>
                  <th className="py-2.5 px-2.5 w-24 text-center">Difficulty</th>
                  <th className="py-2.5 px-2.5">Topic</th>
                  <th className="py-2.5 px-2.5 w-24 text-center">Acceptance</th>
                  <th className="py-2.5 px-3 text-right w-22">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-border/60 text-xs">
                {paginatedQuestions.map((q, idx) => {
                  const qId = String(q._id);
                  const isSolved = solvedSet.has(qId);
                  const isAttempted = attemptedSet.has(qId);
                  const isBookmarked = bookmarkedIds.has(qId);
                  const tags = q.tags && q.tags.length > 0 ? q.tags : ["General"];
                  const acceptanceVal = parseInt(q.acceptance, 10) || 72;

                  return (
                    <tr
                      key={q._id}
                      onClick={() => navigate(`/practice/coding/${q._id}`)}
                      className={`cursor-pointer transition-colors duration-150 group hover:bg-brand-elevated/80 ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-brand-bg/30"
                      }`}
                    >
                      {/* Status Column */}
                      <td className="py-2 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {isSolved ? (
                          <div className="inline-flex items-center justify-center text-emerald-500" title="Solved">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : isAttempted ? (
                          <div className="inline-flex items-center justify-center text-amber-500" title="Attempted">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center text-brand-secondary/35" title="Unsolved">
                            <Circle className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Bookmark / Favorite Column */}
                      <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleBookmark(q._id)}
                          className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer text-brand-secondary hover:text-amber-500"
                          title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>
                      </td>

                      {/* Problem Title */}
                      <td className="py-2 px-3">
                        <span className="font-bold text-sm text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
                          {q.title}
                        </span>
                      </td>

                      {/* Difficulty Column */}
                      <td className="py-2 px-2.5 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-xs uppercase tracking-wider border ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty || "Medium"}
                        </span>
                      </td>

                      {/* Topic Tags Column */}
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-1 overflow-hidden">
                          {tags.slice(0, 2).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-1.5 py-0.2 rounded-xs bg-brand-elevated text-brand-secondary text-[10px] sm:text-[11px] font-bold border border-brand-border truncate max-w-[110px]"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className="text-[10px] font-mono text-brand-secondary">
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acceptance Column */}
                      <td className="py-2 px-2.5 text-center">
                        <div className="space-y-0.5">
                          <span className="text-xs font-mono font-bold text-brand-secondary">
                            {q.acceptance || "72%"}
                          </span>
                          <div className="h-1 w-12 mx-auto bg-brand-elevated rounded-full overflow-hidden border border-brand-border/40">
                            <div
                              className="h-full bg-brand-primary rounded-full"
                              style={{ width: `${acceptanceVal}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/practice/coding/${q._id}`)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                            isSolved
                              ? "bg-brand-elevated hover:bg-brand-elevated/80 text-brand-secondary border border-brand-border"
                              : "bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] shadow-xs"
                          }`}
                        >
                          <span>{isSolved ? "Review" : "Solve"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      ) : (
        /* 4. GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {paginatedQuestions.map((q) => {
            const qId = String(q._id);
            const isSolved = solvedSet.has(qId);
            const isAttempted = attemptedSet.has(qId);
            const isBookmarked = bookmarkedIds.has(qId);
            const tags = q.tags && q.tags.length > 0 ? q.tags : ["General"];

            return (
              <div
                key={q._id}
                onClick={() => navigate(`/practice/coding/${q._id}`)}
                className="bg-brand-card border border-brand-border hover:border-brand-border/80 rounded-xs p-2.5 shadow-xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between space-y-2 cursor-pointer group"
              >
                {/* Top Row: Difficulty & Bookmark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-xs uppercase tracking-wider border ${getDifficultyBadge(q.difficulty)}`}>
                      {q.difficulty || "Medium"}
                    </span>
                    {isSolved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-xs border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(q._id);
                    }}
                    className="p-1 text-brand-secondary hover:text-amber-500 transition-colors cursor-pointer"
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                </div>

                {/* Problem Title & Brief */}
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
                    {q.title}
                  </h4>
                  <p className="text-xs text-brand-secondary line-clamp-1">
                    {q.description || "Solve this challenge."}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1 flex-wrap">
                  {tags.slice(0, 3).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-1.5 py-0.2 rounded-xs bg-brand-elevated text-brand-secondary text-[10px] sm:text-[11px] font-bold border border-brand-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-1.5 border-t border-brand-border/60">
                  <span className="text-[11px] font-mono font-bold text-brand-secondary">
                    Acc: {q.acceptance || "72%"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/practice/coding/${q._id}`);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                      isSolved
                        ? "bg-brand-elevated hover:bg-brand-elevated/80 text-brand-secondary border border-brand-border"
                        : "bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] shadow-xs"
                    }`}
                  >
                    <span>{isSolved ? "Review" : "Solve"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. PAGINATION FOOTER */}
      <div className="bg-brand-card border border-brand-border rounded-xs p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        
        {/* Counter Info */}
        <div className="text-xs text-brand-secondary font-semibold">
          Showing <span className="font-bold text-brand-text font-mono">{startIndex + 1}</span>-
          <span className="font-bold text-brand-text font-mono">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
          <span className="font-bold text-brand-text font-mono">{totalItems}</span>
        </div>

        {/* Page Navigators */}
        <div className="flex items-center gap-1.5">
          
          {/* Per Page Selector */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-0.5 text-xs font-bold text-brand-text outline-none cursor-pointer"
          >
            <option value={20}>20/p</option>
            <option value={50}>50/p</option>
            <option value={100}>100/p</option>
          </select>

          {/* Prev Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-xs bg-brand-elevated border border-brand-border text-brand-secondary hover:text-brand-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Info */}
          <span className="text-xs font-bold font-mono px-1 text-brand-text">
            {currentPage}/{totalPages}
          </span>

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-xs bg-brand-elevated border border-brand-border text-brand-secondary hover:text-brand-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
}
