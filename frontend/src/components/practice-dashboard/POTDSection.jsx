import React from "react";
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Zap
} from "lucide-react";

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
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-brand-elevated text-xs text-brand-secondary border border-brand-border animate-pulse">
        <div className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading POTD...</span>
      </div>
    );
  }

  if (!potdData?.potd?.question) {
    return null;
  }

  const q = potdData.potd.question;
  const isSolved = potdData.solved;
  const streak = potdData.streak || 0;
  const isBookmarked = bookmarkedIds.has(String(q._id));

  // Difficulty badge styling
  let diffBadge = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  if (q.difficulty === "Medium") {
    diffBadge = "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25";
  } else if (q.difficulty === "Hard") {
    diffBadge = "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25";
  }

  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0 bg-brand-elevated/70 border border-brand-border/80 px-2.5 py-1 rounded-xs">
      
      {/* POTD Badge */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B] text-[10px] font-black uppercase tracking-wider border border-[#F59E0B]/30 shrink-0">
        <Zap className="w-3 h-3 fill-current" />
        <span>POTD</span>
      </span>

      {/* Problem Title */}
      <button
        onClick={() => navigate(`/practice/coding/${q._id}`)}
        className="text-xs sm:text-sm font-black text-brand-text hover:text-brand-primary transition-colors truncate max-w-[160px] sm:max-w-[240px] cursor-pointer"
        title={q.title}
      >
        {q.title}
      </button>

      {/* Difficulty */}
      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-xs uppercase tracking-wider border ${diffBadge} shrink-0`}>
        {q.difficulty || "Easy"}
      </span>

      {/* Acceptance */}
      <span className="hidden sm:inline text-xs font-mono text-brand-secondary font-bold shrink-0">
        {q.acceptance || "74%"}
      </span>

      {/* Countdown Timer */}
      {countdown > 0 && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-brand-secondary font-bold shrink-0">
          <Clock className="w-3 h-3" />
          <span>{formatCountdown(countdown)}</span>
        </span>
      )}

      {/* Streak */}
      {streak > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-xs border border-amber-500/20 shrink-0">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span>{streak}d</span>
        </span>
      )}

      {/* Solved Status */}
      {isSolved && (
        <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-xs border border-emerald-500/20 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>Done</span>
        </span>
      )}

      {/* Solve / Review CTA */}
      <button
        onClick={() => navigate(`/practice/coding/${q._id}`)}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0 ml-auto"
      >
        <span>{isSolved ? "Review" : "Solve"}</span>
        <ArrowRight className="w-3 h-3" />
      </button>

      {/* Bookmark Toggle */}
      <button
        onClick={() => toggleBookmark(q._id)}
        className="p-1 text-brand-secondary hover:text-amber-500 transition-colors cursor-pointer shrink-0"
        title={isBookmarked ? "Remove Bookmark" : "Save POTD"}
      >
        <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
      </button>

    </div>
  );
}
