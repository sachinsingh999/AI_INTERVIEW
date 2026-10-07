import React from "react";
import {
  Code2,
  Bookmark,
  Star,
  CheckCircle2,
  Clock,
  Zap,
  ArrowLeft,
  Flame,
  Shuffle,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  FolderArchive,
  BookOpen,
  Award
} from "lucide-react";

export default function PracticeDashboardSidebar({
  activeSection,
  setActiveSection,
  questions = [],
  myPractice = { solved: [], attempted: [], bookmarked: [] },
  navigate,
  onPracticeRandom,
  onOpenAiModal,
}) {
  const bookmarkedList = myPractice.bookmarked || [];
  const solvedList = myPractice.solved || [];
  const attemptedList = myPractice.attempted || [];

  const solvedCount = solvedList.length;
  const totalCount = questions.length || 1;
  const completionPercent = Math.round((solvedCount / totalCount) * 100);

  // Difficulty counts
  let easySolved = 0;
  let easyTotal = 0;
  let medSolved = 0;
  let medTotal = 0;
  let hardSolved = 0;
  let hardTotal = 0;

  questions.forEach(q => {
    const isSolved = solvedList.some(s => (s._id || s) === q._id);
    if (q.difficulty === "Easy") {
      easyTotal++;
      if (isSolved) easySolved++;
    } else if (q.difficulty === "Hard") {
      hardTotal++;
      if (isSolved) hardSolved++;
    } else {
      medTotal++;
      if (isSolved) medSolved++;
    }
  });

  const navItems = [
    {
      id: "library",
      label: "All Problems",
      icon: BookOpen,
      count: questions.length,
    },
    {
      id: "potd",
      label: "Daily Challenge",
      icon: Zap,
      badge: "Active",
      isPotd: true,
    },
    {
      id: "favorites",
      label: "My Favorites",
      icon: Star,
      count: bookmarkedList.length,
    },
    {
      id: "solved",
      label: "Mastered",
      icon: CheckCircle2,
      count: solvedCount,
    },
    {
      id: "attempted",
      label: "In Progress",
      icon: Clock,
      count: attemptedList.length,
    },
  ];

  const curatedPlaylists = [
    { id: "playlist_blind75", label: "Blind 75 Essentials", count: 75 },
    { id: "playlist_faang", label: "Top FAANG Questions", count: 50 },
    { id: "playlist_trees", label: "Trees & Binary Search", count: 40 },
    { id: "playlist_dp", label: "DP Mastery Path", count: 35 },
  ];

  return (
    <>
      {/* Mobile / Tablet Horizontal Navigation Tabs */}
      <div className="flex lg:hidden bg-brand-card border border-brand-border p-1 rounded-xs gap-1 overflow-x-auto no-scrollbar shadow-xs shrink-0 w-full sticky top-[98px] z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#F59E0B] text-[#0F172A] shadow-xs"
                  : "text-brand-secondary hover:text-brand-text hover:bg-brand-elevated"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold ${
                  isActive ? "bg-black/20 text-[#0F172A]" : "bg-brand-elevated text-brand-secondary"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Sticky Left Sidebar (Pinned to Viewport) */}
      <aside className="hidden lg:block w-60 shrink-0 sticky top-[102px] z-20 max-h-[calc(100vh-108px)] overflow-y-auto no-scrollbar space-y-2">
        
        {/* Hub Return & Navigation Box */}
        <div className="bg-brand-card border border-brand-border rounded-xs p-2.5 shadow-xs space-y-2">
          
          {/* Back link */}
          <button
            onClick={() => navigate("/practice")}
            className="w-full flex items-center gap-1.5 rounded-xs px-2 py-1 text-xs font-bold text-brand-secondary hover:text-brand-text hover:bg-brand-elevated transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Practice Hub</span>
          </button>

          <div className="border-t border-brand-border/60 pt-1.5 space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-secondary px-2 block mb-0.5">
              Arena Views
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between rounded-xs px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F59E0B] text-[#0F172A] shadow-xs"
                      : "text-brand-secondary hover:text-brand-text hover:bg-brand-elevated"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold font-mono ${
                      isActive ? "bg-black/20 text-[#0F172A]" : "bg-brand-elevated text-brand-secondary"
                    }`}>
                      {item.count}
                    </span>
                  )}

                  {item.badge && !item.count && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-xs font-black uppercase tracking-wider ${
                      isActive ? "bg-black/20 text-[#0F172A]" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Row */}
          <div className="border-t border-brand-border/60 pt-1.5 space-y-1">
            <button
              onClick={onPracticeRandom}
              className="w-full flex items-center justify-between rounded-xs px-2.5 py-1.5 text-xs font-bold text-brand-text hover:bg-brand-elevated border border-brand-border transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-amber-500" />
                <span>Practice Random</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-brand-secondary" />
            </button>

            <button
              onClick={onOpenAiModal}
              className="w-full flex items-center justify-between rounded-xs px-2.5 py-1.5 text-xs font-bold text-brand-text hover:bg-brand-elevated border border-brand-border transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>AI Problem Studio</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-brand-secondary" />
            </button>

            <button
              onClick={() => navigate("/daily-challenges")}
              className="w-full flex items-center justify-between rounded-xs px-2.5 py-1.5 text-xs font-bold text-brand-secondary hover:text-brand-text hover:bg-brand-elevated transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Daily Challenges & POTD</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-brand-secondary" />
            </button>
          </div>
        </div>

        {/* User Progress & Mastery Card */}
        <div className="bg-brand-card border border-brand-border rounded-xs p-2.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">
              Mastery Progress
            </span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {solvedCount}/{questions.length} ({completionPercent}%)
            </span>
          </div>

          {/* Overall Progress Bar */}
          <div className="h-1.5 w-full bg-brand-elevated rounded-full overflow-hidden border border-brand-border/60">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          {/* Difficulty Breakdown Bars */}
          <div className="space-y-1.5 pt-1 border-t border-brand-border/60">
            {/* Easy */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                <span className="text-brand-secondary font-mono">{easySolved}/{easyTotal || 1}</span>
              </div>
              <div className="h-1 w-full bg-brand-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${easyTotal ? (easySolved / easyTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-amber-600 dark:text-amber-400">Medium</span>
                <span className="text-brand-secondary font-mono">{medSolved}/{medTotal || 1}</span>
              </div>
              <div className="h-1 w-full bg-brand-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${medTotal ? (medSolved / medTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-rose-600 dark:text-rose-400">Hard</span>
                <span className="text-brand-secondary font-mono">{hardSolved}/{hardTotal || 1}</span>
              </div>
              <div className="h-1 w-full bg-brand-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${hardTotal ? (hardSolved / hardTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Curated Problem Playlists */}
        <div className="bg-brand-card border border-brand-border rounded-xs p-2.5 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-secondary px-0.5 block">
            Featured Sets
          </span>

          <div className="space-y-0.5">
            {curatedPlaylists.map((pl) => {
              const isActive = activeSection === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setActiveSection(pl.id)}
                  className={`w-full flex items-center justify-between rounded-xs px-2 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-brand-elevated text-brand-text border border-brand-border"
                      : "text-brand-secondary hover:text-brand-text hover:bg-brand-elevated"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span className="truncate">{pl.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-secondary shrink-0">
                    {pl.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </aside>
    </>
  );
}
