import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Bookmark,
  Star,
  Zap,
  Sparkles,
  Shuffle,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen
} from "lucide-react";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import PracticeDashboardSidebar from "../components/practice-dashboard/PracticeDashboardSidebar";
import POTDSection from "../components/practice-dashboard/POTDSection";
import QuestionFilters from "../components/practice-dashboard/QuestionFilters";
import QuestionTable from "../components/practice-dashboard/QuestionTable";
import AiQuestionModal from "../components/practice-dashboard/AiQuestionModal";

export default function PracticeDashboard() {
  const navigate = useNavigate();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Candidate" };

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortKey, setSortKey] = useState("None");
  const [activeSection, setActiveSection] = useState("library"); // 'library' | 'potd' | 'favorites' | 'solved' | 'attempted' | 'playlist_*'
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  // AI Generator states
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRole, setAiRole] = useState("Frontend Developer");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiTopic, setAiTopic] = useState("Arrays");
  const [aiCompany, setAiCompany] = useState("Google");
  const [generating, setGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // User solved data
  const [myPractice, setMyPractice] = useState({ solved: [], attempted: [], saved: [], bookmarked: [] });

  // POTD states
  const [potdData, setPotdData] = useState(null);
  const [potdLoading, setPotdLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Fetch POTD
  const fetchPOTD = async () => {
    try {
      setPotdLoading(true);
      const res = await api.get("/potd/current");
      if (res.data && res.data.success) {
        setPotdData(res.data);
        setCountdown(res.data.countdownMs || 0);
      }
    } catch (err) {
      console.error("Error loading POTD:", err);
    } finally {
      setPotdLoading(false);
    }
  };

  // POTD Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          fetchPOTD();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Load Question Library
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/compiler/questions");
      if (res.data && Array.isArray(res.data)) {
        setQuestions(res.data);
      }
    } catch (err) {
      console.error("Error loading question library:", err);
      const fallbackQuestions = [
        { _id: "665efb773663a8a3a96cd840", title: "Two Sum", difficulty: "Easy", tags: ["Arrays", "Hash Table"], acceptance: "81%", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." },
        { _id: "665efb773663a8a3a96cd841", title: "Valid Parentheses", difficulty: "Easy", tags: ["Stack", "Strings"], acceptance: "74%", description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid." },
        { _id: "665efb773663a8a3a96cd842", title: "Merge Intervals", difficulty: "Medium", tags: ["Arrays", "Sorting"], acceptance: "58%", description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals." },
        { _id: "665efb773663a8a3a96cd843", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", tags: ["Arrays", "Dynamic Programming"], acceptance: "69%", description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit." },
        { _id: "665efb773663a8a3a96cd844", title: "Longest Palindromic Substring", difficulty: "Medium", tags: ["Strings", "Dynamic Programming"], acceptance: "52%", description: "Given a string s, return the longest palindromic substring in s." },
        { _id: "665efb773663a8a3a96cd845", title: "Trapping Rain Water", difficulty: "Hard", tags: ["Arrays", "Two Pointers", "Stack"], acceptance: "44%", description: "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining." }
      ];
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  // Load User Stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/compiler/questions/my-practice");
      setMyPractice(res.data || { solved: [], attempted: [], saved: [], bookmarked: [] });
    } catch (err) {
      console.error("Error loading my practice stats:", err);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = async (id) => {
    try {
      const res = await api.post(`/compiler/questions/${id}/bookmark`);
      toast.success(res.data.bookmarked ? "Bookmarked question!" : "Removed from favorites");
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bookmark.");
    }
  };

  useEffect(() => {
    fetchLibrary();
    fetchStats();
    fetchPOTD();

    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Handle AI Question Generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setValidationErrors([]);
    try {
      const res = await api.post("/compiler/generate", {
        role: aiRole,
        difficulty: aiDifficulty,
        topic: aiTopic,
        company: aiCompany,
      });
      if (res.data && res.data.success) {
        toast.success("✨ AI Challenge generated successfully!");
        setShowAiModal(false);
        fetchLibrary();
        fetchStats();
      }
    } catch (err) {
      console.error("AI question generation failed:", err);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        toast.error("Question failed validation checks.");
      } else {
        toast.error(err.response?.data?.message || "Failed to generate question.");
      }
    } finally {
      setGenerating(false);
    }
  };

  // Extract all available tags dynamically
  const availableTags = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => {
      (q.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [questions]);

  // Solved and Bookmark sets
  const solvedIds = useMemo(() => new Set((myPractice.solved || []).map((s) => String(s._id || s))), [myPractice.solved]);
  const attemptedIds = useMemo(() => new Set((myPractice.attempted || []).map((a) => String(a._id || a))), [myPractice.attempted]);
  const bookmarkedIds = useMemo(() => new Set((myPractice.bookmarked || []).map((b) => String(b._id || b))), [myPractice.bookmarked]);

  // Filter problems
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const qId = String(q._id);
      const isSolved = solvedIds.has(qId);
      const isAttempted = attemptedIds.has(qId);
      const isBookmarked = bookmarkedIds.has(qId);

      // Section filtering
      if (activeSection === "favorites" && !isBookmarked) return false;
      if (activeSection === "solved" && !isSolved) return false;
      if (activeSection === "attempted" && !isAttempted) return false;
      if (activeSection === "potd") {
        const isPotdQ = potdData?.potd?.question?._id === q._id;
        if (!isPotdQ) return false;
      }
      if (activeSection === "playlist_blind75" && !(q.tags || []).includes("Arrays")) return false;
      if (activeSection === "playlist_faang" && !(q.tags || []).includes("Dynamic Programming") && q.difficulty === "Easy") return false;
      if (activeSection === "playlist_trees" && !(q.tags || []).includes("Trees")) return false;
      if (activeSection === "playlist_dp" && !(q.tags || []).includes("Dynamic Programming")) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesTags = (q.tags || []).some((tag) => tag.toLowerCase().includes(query));
        const matchesDesc = (q.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesTags && !matchesDesc) return false;
      }

      // Difficulty
      if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Tag
      if (selectedTag !== "All") {
        const hasTag = (q.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }

      // Status
      if (selectedStatus === "Solved" && !isSolved) return false;
      if (selectedStatus === "Attempted" && !isAttempted) return false;
      if (selectedStatus === "Unsolved" && isSolved) return false;

      return true;
    });
  }, [questions, activeSection, searchQuery, selectedDifficulty, selectedTag, selectedStatus, solvedIds, attemptedIds, bookmarkedIds, potdData]);

  // Sort logic
  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      if (sortKey === "Title") {
        return a.title.localeCompare(b.title);
      }
      if (sortKey === "Acceptance") {
        const aVal = parseInt(a.acceptance, 10) || 0;
        const bVal = parseInt(b.acceptance, 10) || 0;
        return bVal - aVal;
      }
      if (sortKey === "Difficulty") {
        const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
      }
      return 0;
    });
  }, [filteredQuestions, sortKey]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedTag("All");
    setSelectedStatus("All");
    setSortKey("None");
  };

  // Practice Random Unsolved Problem
  const handlePracticeRandom = () => {
    const unsolvedList = questions.filter((q) => !solvedIds.has(String(q._id)));
    const targetList = unsolvedList.length > 0 ? unsolvedList : questions;

    if (targetList.length === 0) {
      toast.info("No questions available in the arena.");
      return;
    }

    const randomQ = targetList[Math.floor(Math.random() * targetList.length)];
    toast.info(`Opening random challenge: "${randomQ.title}"`);
    navigate(`/practice/coding/${randomQ._id}`);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full px-2 sm:px-3 lg:px-4 py-1.5 space-y-1.5">
        
        {/* STICKY TOP HEADER + INLINE POTD STRIP */}
        <section className="sticky top-[58px] z-30 bg-brand-card/95 dark:bg-[#0d1424]/95 backdrop-blur-md border border-brand-border rounded-xs px-2.5 py-1.5 shadow-xs transition-all duration-200 flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Arena Title & Stats */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xs bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-xs shrink-0">
              <Code2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black text-brand-text tracking-tight whitespace-nowrap">
                Coding Arena
              </h1>
              <span className="text-xs font-mono text-brand-secondary font-bold">
                ({solvedIds.size}/{questions.length})
              </span>
            </div>
          </div>

          {/* Center: Integrated Low-Profile POTD Ticker */}
          <POTDSection
            potdLoading={potdLoading}
            potdData={potdData}
            countdown={countdown}
            formatCountdown={formatCountdown}
            navigate={navigate}
            toggleBookmark={toggleBookmark}
            bookmarkedIds={bookmarkedIds}
          />

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={handlePracticeRandom}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-98 cursor-pointer"
              title="Practice a random unsolved problem"
            >
              <Shuffle className="w-3 h-3" />
              <span>Random</span>
            </button>

            <button
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-xs font-bold border border-brand-border transition-all active:scale-98 cursor-pointer"
              title="Generate AI challenge"
            >
              <Sparkles className="w-3 h-3 text-brand-primary" />
              <span className="hidden sm:inline">AI Studio</span>
            </button>

            <button
              onClick={() => navigate("/bookmarks")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-xs font-bold border border-brand-border transition-all active:scale-98 cursor-pointer"
              title="Bookmarks"
            >
              <Bookmark className="w-3 h-3 text-amber-500" />
              <span className="hidden md:inline">Bookmarks</span>
            </button>
          </div>

        </section>

        {/* MAIN ARENA LAYOUT: STICKY SIDEBAR + STICKY FILTERS & SCROLLABLE CONTENT */}
        <div className="flex flex-col lg:flex-row gap-1.5 items-start">
          
          {/* Left Sticky Navigation & Mastery Sidebar */}
          <PracticeDashboardSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            questions={questions}
            myPractice={myPractice}
            navigate={navigate}
            onPracticeRandom={handlePracticeRandom}
            onOpenAiModal={() => setShowAiModal(true)}
          />

          {/* Right Main Content Area */}
          <div className="flex-1 w-full min-w-0 space-y-1.5">
            
            {/* Sticky Multi-Filter Bar */}
            <div className="sticky top-[102px] z-20 bg-brand-bg/95 backdrop-blur-md pb-0.5">
              <QuestionFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                sortKey={sortKey}
                setSortKey={setSortKey}
                setShowAiModal={setShowAiModal}
                viewMode={viewMode}
                setViewMode={setViewMode}
                availableTags={availableTags}
                questions={questions}
              />
            </div>

            {/* Problem Table / Grid View */}
            <QuestionTable
              loading={loading}
              sortedQuestions={sortedQuestions}
              myPractice={myPractice}
              bookmarkedIds={bookmarkedIds}
              toggleBookmark={toggleBookmark}
              navigate={navigate}
              handleResetFilters={handleResetFilters}
              viewMode={viewMode}
            />

          </div>

        </div>

      </main>

      {/* AI Question Modal */}
      <AiQuestionModal
        showAiModal={showAiModal}
        setShowAiModal={setShowAiModal}
        generating={generating}
        handleGenerate={handleGenerate}
        aiTopic={aiTopic}
        setAiTopic={setAiTopic}
        aiDifficulty={aiDifficulty}
        setAiDifficulty={setAiDifficulty}
        aiRole={aiRole}
        setAiRole={setAiRole}
        aiCompany={aiCompany}
        setAiCompany={setAiCompany}
        validationErrors={validationErrors}
      />

    </div>
  );
}
