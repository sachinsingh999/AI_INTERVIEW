import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Star,
  Search,
  Filter,
  Code2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Trash2,
  ExternalLink,
  BookOpen,
  Eye,
  Edit3,
  Save,
  X,
  Share2,
  ChevronRight,
  TrendingUp,
  Tag,
  Building2,
  Check,
  LayoutGrid,
  List,
  Flame,
  HelpCircle,
  Download,
  Shuffle
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "../utils/toast";

// Popular curated questions for recommendations when bookmarks are empty or sparse
const CURATED_RECOMMENDATIONS = [
  {
    _id: "rec_two_sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    companies: ["Google", "Amazon", "Meta"],
    acceptance: "81%",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
    starterRole: "Software Engineer"
  },
  {
    _id: "rec_valid_parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    companies: ["Amazon", "Microsoft", "Meta"],
    acceptance: "74%",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterRole: "Software Engineer"
  },
  {
    _id: "rec_lru_cache",
    title: "LRU Cache Design",
    difficulty: "Medium",
    tags: ["Hash Table", "Linked List", "Design"],
    companies: ["Google", "Microsoft", "Amazon", "Apple"],
    acceptance: "62%",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    starterRole: "Software Engineer"
  },
  {
    _id: "rec_merge_intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Arrays", "Sorting"],
    companies: ["Meta", "Google", "Amazon"],
    acceptance: "58%",
    description: "Given an array of `intervals` where intervals[i] = [starti, endi], merge all overlapping intervals.",
    starterRole: "Software Engineer"
  },
  {
    _id: "rec_longest_substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Meta", "Bloomberg"],
    acceptance: "65%",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    starterRole: "Software Engineer"
  },
  {
    _id: "rec_trapping_rain_water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Arrays", "Two Pointers", "Dynamic Programming"],
    companies: ["Google", "Amazon", "Meta", "Apple"],
    acceptance: "44%",
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    starterRole: "Software Engineer"
  }
];

export default function Bookmarks() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);
  const [myPractice, setMyPractice] = useState({ solved: [], attempted: [], saved: [], bookmarked: [] });

  // Filtering and Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // 'all', 'saved', 'unsolved', 'solved'
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'diff-asc', 'diff-desc', 'title', 'acceptance'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Modals & Drawers
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [notesQuestion, setNotesQuestion] = useState(null);
  const [personalNotes, setPersonalNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("codeforge_question_notes") || "{}");
    } catch {
      return {};
    }
  });
  const [currentNoteText, setCurrentNoteText] = useState("");

  // Fetch practice data & questions
  const fetchData = async () => {
    try {
      setLoading(true);
      const [practiceRes, questionsRes] = await Promise.allSettled([
        api.get("/compiler/questions/my-practice"),
        api.get("/compiler/questions")
      ]);

      if (practiceRes.status === "fulfilled" && practiceRes.value?.data) {
        setMyPractice(practiceRes.value.data);
      }

      if (questionsRes.status === "fulfilled" && Array.isArray(questionsRes.value?.data)) {
        setAllQuestions(questionsRes.value.data);
      }
    } catch (err) {
      console.error("Error fetching bookmarks data:", err);
      toast.error("Could not load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save personal notes to localStorage
  const handleSaveNote = (questionId) => {
    const updated = {
      ...personalNotes,
      [questionId]: currentNoteText.trim()
    };
    if (!currentNoteText.trim()) {
      delete updated[questionId];
    }
    setPersonalNotes(updated);
    localStorage.setItem("codeforge_question_notes", JSON.stringify(updated));
    toast.success("Personal study note saved!");
    setNotesQuestion(null);
  };

  // Toggle bookmark
  const handleToggleBookmark = async (id, title) => {
    // If it's a recommendation dummy ID, we handle locally with toast
    if (String(id).startsWith("rec_")) {
      toast.info(`Added "${title || 'problem'}" to bookmarks!`);
      return;
    }

    try {
      const res = await api.post(`/compiler/questions/${id}/bookmark`);
      const isBookmarked = res.data?.bookmarked;
      toast.success(isBookmarked ? `Bookmarked "${title || 'problem'}"` : `Removed from bookmarks`);
      
      // Update local state optimistically
      setMyPractice((prev) => {
        const bookmarked = prev.bookmarked || [];
        if (isBookmarked) {
          const matchingQ = allQuestions.find(q => String(q._id) === String(id));
          return {
            ...prev,
            bookmarked: matchingQ ? [...bookmarked, matchingQ] : bookmarked
          };
        } else {
          return {
            ...prev,
            bookmarked: bookmarked.filter(b => String(b._id || b) !== String(id))
          };
        }
      });
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      toast.error("Could not update bookmark.");
    }
  };

  // Toggle Save / Watchlist
  const handleToggleSave = async (id, title) => {
    if (String(id).startsWith("rec_")) {
      toast.info(`Added to watchlist!`);
      return;
    }

    try {
      const res = await api.post(`/compiler/questions/${id}/save`);
      const isSaved = res.data?.saved;
      toast.success(isSaved ? `Added "${title || 'problem'}" to Watchlist` : `Removed from Watchlist`);
      
      setMyPractice((prev) => {
        const saved = prev.saved || [];
        if (isSaved) {
          const matchingQ = allQuestions.find(q => String(q._id) === String(id));
          return {
            ...prev,
            saved: matchingQ ? [...saved, matchingQ] : saved
          };
        } else {
          return {
            ...prev,
            saved: saved.filter(s => String(s._id || s) !== String(id))
          };
        }
      });
    } catch (err) {
      console.error("Failed to toggle save:", err);
      toast.error("Could not update saved status.");
    }
  };

  // Compute sets for fast status checking
  const solvedSet = useMemo(() => {
    return new Set((myPractice.solved || []).map(q => String(q._id || q)));
  }, [myPractice.solved]);

  const attemptedSet = useMemo(() => {
    return new Set((myPractice.attempted || []).map(q => String(q._id || q)));
  }, [myPractice.attempted]);

  const savedSet = useMemo(() => {
    return new Set((myPractice.saved || []).map(q => String(q._id || q)));
  }, [myPractice.saved]);

  const bookmarkedSet = useMemo(() => {
    return new Set((myPractice.bookmarked || []).map(q => String(q._id || q)));
  }, [myPractice.bookmarked]);

  // Merge populated bookmarked questions with any stored in question library
  const populatedBookmarks = useMemo(() => {
    const rawList = myPractice.bookmarked || [];
    const result = [];
    const seenIds = new Set();

    rawList.forEach(item => {
      const id = String(item._id || item);
      if (seenIds.has(id)) return;
      seenIds.add(id);

      // Check if item is already fully populated
      if (item.title) {
        result.push(item);
      } else {
        const fullQ = allQuestions.find(q => String(q._id) === id);
        if (fullQ) result.push(fullQ);
        else result.push({ _id: id, title: "Custom Coding Challenge", difficulty: "Medium", tags: ["DSA"] });
      }
    });

    return result;
  }, [myPractice.bookmarked, allQuestions]);

  // Extract unique topics and companies from bookmarks for filters
  const { allTopics, allCompanies } = useMemo(() => {
    const topics = new Set();
    const companies = new Set();

    populatedBookmarks.forEach(q => {
      (q.tags || []).forEach(t => topics.add(t));
      (q.companies || []).forEach(c => companies.add(c));
    });

    // Default common topics if few
    ["Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs", "Hash Table", "Stack", "Design"].forEach(t => topics.add(t));
    ["Google", "Amazon", "Meta", "Microsoft", "Apple", "Uber"].forEach(c => companies.add(c));

    return {
      allTopics: Array.from(topics).sort(),
      allCompanies: Array.from(companies).sort()
    };
  }, [populatedBookmarks]);

  // Filter and Sort Bookmarks
  const filteredBookmarks = useMemo(() => {
    return populatedBookmarks.filter(q => {
      const qId = String(q._id);
      const isSolved = solvedSet.has(qId);
      const isSaved = savedSet.has(qId);

      // Category filter
      if (activeCategory === "saved" && !isSaved) return false;
      if (activeCategory === "unsolved" && isSolved) return false;
      if (activeCategory === "solved" && !isSolved) return false;

      // Difficulty filter
      if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== "All") {
        const tags = q.tags || [];
        if (!tags.some(t => t.toLowerCase() === selectedTopic.toLowerCase())) {
          return false;
        }
      }

      // Company filter
      if (selectedCompany !== "All") {
        const companies = q.companies || [];
        if (!companies.some(c => c.toLowerCase() === selectedCompany.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (q.title || "").toLowerCase().includes(query);
        const matchTags = (q.tags || []).some(t => t.toLowerCase().includes(query));
        const matchCompanies = (q.companies || []).some(c => c.toLowerCase().includes(query));
        const matchNote = (personalNotes[qId] || "").toLowerCase().includes(query);
        if (!matchTitle && !matchTags && !matchCompanies && !matchNote) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "diff-asc") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
      }
      if (sortBy === "diff-desc") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[b.difficulty] || 2) - (order[a.difficulty] || 2);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "acceptance") {
        const accA = parseInt(a.acceptance || "50", 10);
        const accB = parseInt(b.acceptance || "50", 10);
        return accB - accA;
      }
      // default: recent (original list order)
      return 0;
    });
  }, [
    populatedBookmarks,
    activeCategory,
    selectedDifficulty,
    selectedTopic,
    selectedCompany,
    searchQuery,
    sortBy,
    solvedSet,
    savedSet,
    personalNotes
  ]);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = populatedBookmarks.length;
    let solvedCount = 0;
    let attemptedCount = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    populatedBookmarks.forEach(q => {
      const id = String(q._id);
      if (solvedSet.has(id)) solvedCount++;
      else if (attemptedSet.has(id)) attemptedCount++;

      if (q.difficulty === "Easy") easyCount++;
      else if (q.difficulty === "Hard") hardCount++;
      else mediumCount++;
    });

    const completionRate = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

    return {
      total,
      solvedCount,
      attemptedCount,
      unsolvedCount: Math.max(0, total - solvedCount),
      completionRate,
      easyCount,
      mediumCount,
      hardCount
    };
  }, [populatedBookmarks, solvedSet, attemptedSet]);

  // Practice Random Unsolved Question
  const handlePracticeRandom = () => {
    const unsolvedList = populatedBookmarks.filter(q => !solvedSet.has(String(q._id)));
    const targetList = unsolvedList.length > 0 ? unsolvedList : populatedBookmarks;

    if (targetList.length === 0) {
      toast.info("No questions in bookmarks. Select a recommended problem below!");
      navigate("/practice/coding");
      return;
    }

    const randomQ = targetList[Math.floor(Math.random() * targetList.length)];
    navigate(`/practice/coding/${randomQ._id}`);
  };

  // Export Bookmarks as Markdown / JSON
  const handleExportBookmarks = () => {
    if (populatedBookmarks.length === 0) {
      toast.info("No bookmarks to export.");
      return;
    }

    const markdownContent = `# My CodeForge Bookmarks\nGenerated: ${new Date().toLocaleDateString()}\n\n` +
      populatedBookmarks.map((q, idx) => {
        const note = personalNotes[String(q._id)] ? `\n> **My Notes**: ${personalNotes[String(q._id)]}` : "";
        const status = solvedSet.has(String(q._id)) ? "✅ Solved" : attemptedSet.has(String(q._id)) ? "⚡ Attempted" : "⭕ Unsolved";
        return `### ${idx + 1}. ${q.title} [${q.difficulty}] - ${status}\n- **Tags**: ${(q.tags || []).join(", ") || "General"}\n- **Acceptance**: ${q.acceptance || "N/A"}${note}\n`;
      }).join("\n");

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `codeforge_bookmarks_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Bookmarks exported as Markdown!");
  };

  // Difficulty badge styling helper
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Hard":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "Medium":
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full px-3.5 sm:px-5 lg:px-6 py-3 space-y-3">
        
        {/* COMBINED UNIFIED HEADER, STATS & FILTER CARD */}
        <section className="relative rounded-sm border border-brand-border bg-brand-card shadow-xs overflow-hidden">
          {/* 1. TOP HEADER BANNER */}
          <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-sm shrink-0">
                <Bookmark className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                    Bookmarks & Saved Library
                  </h1>
                  <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-black border border-amber-500/30">
                    {stats.total} {stats.total === 1 ? "Problem" : "Problems"}
                  </span>
                </div>
                <p className="text-xs text-brand-secondary font-medium">
                  Your personal curated revision list, favorite algorithms, and high-priority interview problems.
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handlePracticeRandom}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-amber-500/20 active:scale-98 cursor-pointer"
                title="Open a random unsolved bookmarked problem"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Practice Random</span>
              </button>

              <button
                onClick={handleExportBookmarks}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-xs font-bold border border-brand-border transition-all active:scale-98 cursor-pointer"
                title="Export list as Markdown"
              >
                <Download className="w-3.5 h-3.5 text-brand-secondary" />
                <span className="hidden sm:inline">Export Notes</span>
              </button>

              <button
                onClick={() => navigate("/practice/coding")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-xs font-bold border border-brand-border transition-all active:scale-98 cursor-pointer"
                title="Browse Full Practice Library"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-secondary" />
                <span>Browse All</span>
              </button>
            </div>
          </div>

          {/* 2. STATS & MASTERY ROW (Integrated Seamlessly) */}
          <div className="border-t border-brand-border/60 bg-brand-bg/40 px-4 sm:px-5 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-brand-border/60">
            
            {/* Stat 1: Total Bookmarked */}
            <div className="flex items-center justify-between sm:pr-3 pt-1.5 sm:pt-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary block">
                  Total Bookmarks
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-brand-text">{stats.total}</span>
                  <span className="text-[11px] text-brand-secondary font-semibold">items</span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>

            {/* Stat 2: Mastery Rate */}
            <div className="sm:px-3 pt-2.5 sm:pt-0 space-y-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                  Mastery Rate
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {stats.solvedCount} / {stats.total} ({stats.completionRate}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-brand-elevated rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-semibold text-brand-secondary">
                <span>{stats.unsolvedCount} remaining</span>
                <span>{stats.attemptedCount} in progress</span>
              </div>
            </div>

            {/* Stat 3: Watchlist Saved */}
            <div className="flex items-center justify-between sm:px-3 pt-2.5 sm:pt-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary block">
                  Watchlist Items
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-brand-text">{savedSet.size}</span>
                  <span className="text-[11px] text-brand-secondary font-semibold">saved</span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-sm bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <Bookmark className="w-4 h-4 fill-indigo-500" />
              </div>
            </div>

            {/* Stat 4: Difficulty Split */}
            <div className="sm:pl-3 pt-2.5 sm:pt-0 space-y-1 flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary block">
                Difficulty Split
              </span>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20 flex-1 text-center">
                  {stats.easyCount} Easy
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/20 flex-1 text-center">
                  {stats.mediumCount} Med
                </span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-500/20 flex-1 text-center">
                  {stats.hardCount} Hard
                </span>
              </div>
            </div>

          </div>

          {/* 3. CATEGORY TABS & MULTI-FILTER CONTROL BAR */}
          <div className="border-t border-brand-border/60 bg-brand-card p-4 sm:p-5 space-y-3">
            
            {/* Category Tabs & View Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Bookmarks", count: stats.total, icon: Star },
                  { id: "saved", label: "Watchlist", count: savedSet.size, icon: Bookmark },
                  { id: "unsolved", label: "To Solve", count: stats.unsolvedCount, icon: Clock },
                  { id: "solved", label: "Mastered", count: stats.solvedCount, icon: CheckCircle2 }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-3.5 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? "bg-[#F59E0B] text-[#0F172A] shadow-sm"
                          : "text-brand-secondary hover:text-brand-text hover:bg-brand-elevated"
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? "bg-black/20 text-[#0F172A]" : "bg-brand-elevated text-brand-secondary"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle Switch */}
              <div className="flex items-center gap-1 bg-brand-elevated p-1 rounded-sm border border-brand-border shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-brand-card text-amber-500 shadow-xs" : "text-brand-secondary hover:text-brand-text"
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                    viewMode === "list" ? "bg-brand-card text-amber-500 shadow-xs" : "text-brand-secondary hover:text-brand-text"
                  }`}
                  title="Detailed Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search & Select Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* Live Search Input (Span 4) */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search title, tag, company, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-elevated border border-brand-border rounded-sm pl-9 pr-8 py-2 text-xs font-semibold text-brand-text placeholder:text-brand-secondary/60 outline-none focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Difficulty Filter (Span 2) */}
              <div className="lg:col-span-2">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-brand-elevated border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>

              {/* Topic Filter (Span 2) */}
              <div className="lg:col-span-2">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-brand-elevated border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Topics ({allTopics.length})</option>
                  {allTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Company Filter (Span 2) */}
              <div className="lg:col-span-2">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-brand-elevated border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Companies</option>
                  {allCompanies.map((comp) => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter (Span 2) */}
              <div className="lg:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-brand-elevated border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
                >
                  <option value="recent">Recently Added</option>
                  <option value="diff-asc">Difficulty: Low to High</option>
                  <option value="diff-desc">Difficulty: High to Low</option>
                  <option value="acceptance">Highest Acceptance</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>

            </div>

            {/* Active Filter Chips / Reset */}
            {(selectedDifficulty !== "All" || selectedTopic !== "All" || selectedCompany !== "All" || searchQuery.trim()) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                  Active Filters:
                </span>

                {selectedDifficulty !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-elevated text-xs font-bold text-brand-text border border-brand-border">
                    <span>Difficulty: {selectedDifficulty}</span>
                    <button onClick={() => setSelectedDifficulty("All")} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedTopic !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-elevated text-xs font-bold text-brand-text border border-brand-border">
                    <span>Topic: {selectedTopic}</span>
                    <button onClick={() => setSelectedTopic("All")} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCompany !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-elevated text-xs font-bold text-brand-text border border-brand-border">
                    <span>Company: {selectedCompany}</span>
                    <button onClick={() => setSelectedCompany("All")} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-elevated text-xs font-bold text-brand-text border border-brand-border">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery("")} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setSelectedDifficulty("All");
                    setSelectedTopic("All");
                    setSelectedCompany("All");
                    setSearchQuery("");
                  }}
                  className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer ml-auto"
                >
                  Clear all filters
                </button>
              </div>
            )}

          </div>
        </section>

        {/* 4. BOOKMARKED PROBLEMS DISPLAY (GRID or LIST) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 rounded-sm bg-brand-card border border-brand-border animate-pulse p-5 space-y-3">
                <div className="h-5 w-3/4 bg-brand-elevated rounded" />
                <div className="h-4 w-1/2 bg-brand-elevated rounded" />
                <div className="h-10 w-full bg-brand-elevated rounded mt-6" />
              </div>
            ))}
          </div>
        ) : filteredBookmarks.length > 0 ? (
          viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBookmarks.map((q) => {
                const qId = String(q._id);
                const isSolved = solvedSet.has(qId);
                const isAttempted = attemptedSet.has(qId);
                const isSaved = savedSet.has(qId);
                const note = personalNotes[qId];

                return (
                  <div
                    key={qId}
                    className="group rounded-sm border border-brand-border bg-brand-card hover:border-amber-500/40 p-4 shadow-xs transition-all duration-200 flex flex-col justify-between space-y-3 hover:shadow-md"
                  >
                    {/* Card Top: Title, Status, and Difficulty */}
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h3
                            onClick={() => navigate(`/practice/coding/${qId}`)}
                            className="text-sm font-black text-brand-text group-hover:text-amber-600 dark:group-hover:text-amber-400 cursor-pointer transition-colors line-clamp-1 leading-snug"
                          >
                            {q.title || "Coding Challenge"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getDifficultyBadge(q.difficulty)}`}>
                              {q.difficulty || "Medium"}
                            </span>
                            {isSolved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" /> Solved
                              </span>
                            ) : isAttempted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                                <Clock className="w-3 h-3" /> In Progress
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-brand-secondary">
                                Not started
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Top Right Bookmark / Watchlist Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleSave(qId, q.title)}
                            className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                              isSaved ? "text-indigo-500 hover:text-indigo-600" : "text-brand-secondary hover:text-brand-text"
                            }`}
                            title={isSaved ? "Remove from Watchlist" : "Save to Watchlist"}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-indigo-500" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleToggleBookmark(qId, q.title)}
                            className="p-1.5 rounded-sm text-amber-500 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove from Bookmarks"
                          >
                            <Star className="w-4 h-4 fill-amber-500" />
                          </button>
                        </div>
                      </div>

                      {/* Problem Statement Snippet if available */}
                      {q.description && (
                        <p className="text-xs text-brand-secondary line-clamp-2 leading-relaxed">
                          {q.description}
                        </p>
                      )}

                      {/* Topic Tags & Companies */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(q.tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-xs bg-brand-elevated text-brand-secondary text-[10px] font-bold border border-brand-border/60"
                          >
                            {tag}
                          </span>
                        ))}
                        {(q.companies || []).slice(0, 2).map((comp) => (
                          <span
                            key={comp}
                            className="px-2 py-0.5 rounded-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-500/20"
                          >
                            {comp}
                          </span>
                        ))}
                        {q.acceptance && (
                          <span className="text-[10px] font-semibold text-brand-secondary ml-auto">
                            Acc: {q.acceptance}
                          </span>
                        )}
                      </div>

                      {/* Personal Study Note Indicator */}
                      {note && (
                        <div
                          onClick={() => {
                            setNotesQuestion(q);
                            setCurrentNoteText(note);
                          }}
                          className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2 cursor-pointer hover:bg-amber-500/15 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                          <p className="text-[11px] font-medium line-clamp-1 italic">
                            "{note}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="pt-3 border-t border-brand-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewQuestion(q)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-[11px] font-bold border border-brand-border transition-colors cursor-pointer"
                          title="Quick Preview statement & hints"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-secondary" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => {
                            setNotesQuestion(q);
                            setCurrentNoteText(personalNotes[qId] || "");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-[11px] font-bold border border-brand-border transition-colors cursor-pointer"
                          title="Add personal study note or revision tips"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-secondary" />
                          <span>{note ? "Note" : "+ Note"}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/practice/coding/${qId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST / TABLE VIEW */
            <div className="rounded-sm border border-brand-border bg-brand-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-elevated/60 text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                      <th className="py-3 px-4 w-12 text-center">Status</th>
                      <th className="py-3 px-4">Problem Title</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Topics / Companies</th>
                      <th className="py-3 px-4">Study Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {filteredBookmarks.map((q) => {
                      const qId = String(q._id);
                      const isSolved = solvedSet.has(qId);
                      const isAttempted = attemptedSet.has(qId);
                      const isSaved = savedSet.has(qId);
                      const note = personalNotes[qId];

                      return (
                        <tr
                          key={qId}
                          className="hover:bg-brand-elevated/40 transition-colors group"
                        >
                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" title="Solved" />
                            ) : isAttempted ? (
                              <Clock className="w-4 h-4 text-amber-500 mx-auto" title="Attempted" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full border border-brand-secondary mx-auto" title="Unsolved" />
                            )}
                          </td>

                          {/* Title & Description */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span
                                onClick={() => navigate(`/practice/coding/${qId}`)}
                                className="font-bold text-brand-text group-hover:text-amber-600 dark:group-hover:text-amber-400 cursor-pointer block"
                              >
                                {q.title || "Coding Challenge"}
                              </span>
                              {q.acceptance && (
                                <span className="text-[10px] text-brand-secondary font-semibold">
                                  Acceptance: {q.acceptance}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Difficulty */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getDifficultyBadge(q.difficulty)}`}>
                              {q.difficulty || "Medium"}
                            </span>
                          </td>

                          {/* Tags */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(q.tags || []).slice(0, 2).map((t) => (
                                <span key={t} className="px-2 py-0.5 rounded-xs bg-brand-elevated text-brand-secondary text-[10px] font-semibold border border-brand-border">
                                  {t}
                                </span>
                              ))}
                              {(q.companies || []).slice(0, 1).map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-xs bg-indigo-500/10 text-indigo-500 text-[10px] font-semibold">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Personal Notes */}
                          <td className="py-3.5 px-4">
                            {note ? (
                              <button
                                onClick={() => {
                                  setNotesQuestion(q);
                                  setCurrentNoteText(note);
                                }}
                                className="text-[11px] text-amber-600 dark:text-amber-400 font-medium italic truncate max-w-[140px] block hover:underline cursor-pointer"
                              >
                                "{note}"
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setNotesQuestion(q);
                                  setCurrentNoteText("");
                                }}
                                className="text-[10px] text-brand-secondary hover:text-brand-text font-bold cursor-pointer"
                              >
                                + Add Note
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewQuestion(q)}
                                className="p-1.5 rounded-sm bg-brand-elevated text-brand-secondary hover:text-brand-text transition-colors cursor-pointer"
                                title="Quick Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleBookmark(qId, q.title)}
                                className="p-1.5 rounded-sm text-amber-500 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Remove Bookmark"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                              </button>

                              <button
                                onClick={() => navigate(`/practice/coding/${qId}`)}
                                className="px-2.5 py-1 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-[11px] font-black uppercase cursor-pointer"
                              >
                                Solve
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* 5. EMPTY STATE (When no bookmarks exist or search returns 0) */
          <div className="rounded-sm border border-brand-border bg-brand-card p-10 text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
              <Star className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-black text-brand-text tracking-tight">
                {searchQuery.trim() || selectedDifficulty !== "All" || selectedTopic !== "All"
                  ? "No matching bookmarked questions"
                  : "You haven't bookmarked any questions yet"}
              </h3>
              <p className="text-xs text-brand-secondary font-medium leading-relaxed">
                {searchQuery.trim()
                  ? "Try adjusting your search terms or filters above to find what you're looking for."
                  : "Star questions while practicing in the IDE or exploring the question library to build your personalized study deck."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/practice/coding")}
                className="px-5 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Explore Practice Library
              </button>
            </div>
          </div>
        )}

        {/* 6. RECOMMENDED MUST-SOLVE QUESTIONS SECTION */}
        <section className="space-y-3 pt-3 border-t border-brand-border">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xs sm:text-sm font-black text-brand-text uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Recommended High-Frequency Interview Problems</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-brand-secondary font-medium">
                Top interview questions frequently asked by Tier-1 tech companies.
              </p>
            </div>

            <button
              onClick={() => navigate("/practice/coding")}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View 500+ Problems</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CURATED_RECOMMENDATIONS.map((rec) => {
              const isAlreadyBookmarked = bookmarkedSet.has(String(rec._id));

              return (
                <div
                  key={rec._id}
                  className="p-3.5 rounded-sm bg-brand-card border border-brand-border hover:border-amber-500/40 shadow-xs flex flex-col justify-between space-y-2.5 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-brand-text leading-snug">
                        {rec.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border shrink-0 ${getDifficultyBadge(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                    </div>

                    <p className="text-[11px] text-brand-secondary line-clamp-2 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {rec.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.2 rounded-xs bg-brand-elevated text-brand-secondary text-[9px] font-bold">
                          {t}
                        </span>
                      ))}
                      {rec.companies.slice(0, 2).map((c) => (
                        <span key={c} className="px-1.5 py-0.2 rounded-xs bg-indigo-500/10 text-indigo-500 text-[9px] font-bold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-brand-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleBookmark(rec._id, rec.title)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{isAlreadyBookmarked ? "Bookmarked" : "+ Bookmark"}</span>
                    </button>

                    <button
                      onClick={() => navigate("/practice/coding")}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-sm bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-[11px] font-bold border border-brand-border transition-colors cursor-pointer"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 7. QUICK PREVIEW MODAL */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setPreviewQuestion(null)}
          />

          <div className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-sm shadow-2xl p-6 space-y-5 animate-dropdown-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-brand-border pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-black text-brand-text">
                    {previewQuestion.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getDifficultyBadge(previewQuestion.difficulty)}`}>
                    {previewQuestion.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(previewQuestion.tags || []).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-xs bg-brand-elevated text-brand-secondary text-[10px] font-semibold border border-brand-border">
                      {t}
                    </span>
                  ))}
                  {(previewQuestion.companies || []).map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-xs bg-indigo-500/10 text-indigo-500 text-[10px] font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-sm text-brand-secondary hover:text-brand-text transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statement */}
            <div className="space-y-3 text-xs leading-relaxed text-brand-body font-normal">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1">
                  Problem Description
                </h4>
                <p className="whitespace-pre-line bg-brand-elevated/40 p-3.5 rounded border border-brand-border/60">
                  {previewQuestion.description || "No description provided."}
                </p>
              </div>

              {/* Examples */}
              {previewQuestion.examples && previewQuestion.examples.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                    Example Test Cases
                  </h4>
                  {previewQuestion.examples.map((ex, i) => (
                    <div key={i} className="p-3 bg-brand-elevated rounded border border-brand-border space-y-1 text-xs">
                      {ex.input && <div><span className="font-bold text-brand-text">Input:</span> <code className="text-amber-500">{ex.input}</code></div>}
                      {ex.output && <div><span className="font-bold text-brand-text">Output:</span> <code className="text-emerald-500">{ex.output}</code></div>}
                      {ex.explanation && <div className="text-brand-secondary text-[11px] pt-1 italic">{ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {previewQuestion.constraints && previewQuestion.constraints.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                    Constraints
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-brand-secondary bg-brand-elevated/30 p-2.5 rounded border border-brand-border/50">
                    {previewQuestion.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 rounded-sm text-xs font-bold text-brand-secondary hover:text-brand-text cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => navigate(`/practice/coding/${previewQuestion._id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
              >
                <span>Launch in IDE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PERSONAL STUDY NOTES MODAL */}
      {notesQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setNotesQuestion(null)}
          />

          <div className="relative w-full max-w-lg bg-brand-card border border-brand-border rounded-sm shadow-2xl p-6 space-y-4 animate-dropdown-in">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-brand-text uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  <span>Personal Study Note</span>
                </h3>
                <p className="text-[11px] font-bold text-brand-secondary truncate max-w-sm">
                  {notesQuestion.title}
                </p>
              </div>

              <button
                onClick={() => setNotesQuestion(null)}
                className="p-1 rounded-sm text-brand-secondary hover:text-brand-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-secondary block">
                Key takeaway, pattern, or edge cases to remember
              </label>
              <textarea
                rows={5}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="e.g., Use two-pointer approach from both ends. Watch out for negative values or empty array inputs..."
                className="w-full bg-brand-elevated border border-brand-border rounded-sm p-3 text-xs font-semibold text-brand-text outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-brand-border">
              {personalNotes[String(notesQuestion._id)] ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNoteText("");
                    handleSaveNote(String(notesQuestion._id));
                  }}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Delete Note
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNotesQuestion(null)}
                  className="px-3.5 py-1.5 rounded-sm text-xs font-bold text-brand-secondary hover:text-brand-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNote(String(notesQuestion._id))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
