import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  X,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Code2,
  Check,
  Target,
  Brain,
  Cpu,
  MessageSquare,
  Layers,
  Sparkles
} from "lucide-react";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";

// Static Archive Items for Aptitude, Technical, and Behavioral tracks
const STATIC_TRACK_CHALLENGES = [
  // Aptitude
  {
    _id: "apt_potd_1",
    category: "Aptitude",
    categoryLabel: "Aptitude & Reasoning",
    categoryIcon: "brain",
    problemId: "apt_2026_06_11",
    title: "Number Series, Ratios & Logical Deductions",
    difficulty: "Medium",
    tags: ["Quantitative", "Number Series", "Ratios"],
    publishedAt: "2026-06-11T00:00:00.000Z",
    description: "Solve a 5-question daily workout covering arithmetic progression, percentage profit, and syllogism logic.",
    duration: "8 mins",
    questionCount: 5,
    path: "/practice/aptitude",
    solved: true
  },
  {
    _id: "apt_potd_2",
    category: "Aptitude",
    categoryLabel: "Aptitude & Reasoning",
    categoryIcon: "brain",
    problemId: "apt_2026_06_10",
    title: "Permutations, Combinations & Probability Challenge",
    difficulty: "Hard",
    tags: ["Probability", "Combinatorics", "Math"],
    publishedAt: "2026-06-10T00:00:00.000Z",
    description: "Daily quantitative problem set focusing on conditional probability, card selections, and circular arrangements.",
    duration: "10 mins",
    questionCount: 5,
    path: "/practice/aptitude",
    solved: false
  },
  {
    _id: "apt_potd_3",
    category: "Aptitude",
    categoryLabel: "Aptitude & Reasoning",
    categoryIcon: "brain",
    problemId: "apt_2026_06_09",
    title: "Speed, Time & Distance Rapid Sprint",
    difficulty: "Easy",
    tags: ["Speed & Distance", "Relative Speed", "Trains"],
    publishedAt: "2026-06-09T00:00:00.000Z",
    description: "High-speed mental math exercises for relative speed, train crossings, and river currents.",
    duration: "6 mins",
    questionCount: 5,
    path: "/practice/aptitude",
    solved: true
  },
  {
    _id: "apt_potd_4",
    category: "Aptitude",
    categoryLabel: "Aptitude & Reasoning",
    categoryIcon: "brain",
    problemId: "apt_2026_06_08",
    title: "Blood Relations & Direction Sense Workout",
    difficulty: "Medium",
    tags: ["Logical Reasoning", "Direction Sense", "Puzzles"],
    publishedAt: "2026-06-08T00:00:00.000Z",
    description: "Family tree mapping and compass bearing reasoning scenarios frequently asked in technical screenings.",
    duration: "7 mins",
    questionCount: 5,
    path: "/practice/aptitude",
    solved: false
  },

  // CS Fundamentals / Technical MCQ
  {
    _id: "tech_potd_1",
    category: "Technical",
    categoryLabel: "CS Fundamentals",
    categoryIcon: "cpu",
    problemId: "tech_2026_06_11",
    title: "Database Indexing: B-Trees vs LSM Trees & Query Optimization",
    difficulty: "Medium",
    tags: ["DBMS", "SQL", "Indexing", "Storage"],
    publishedAt: "2026-06-11T00:00:00.000Z",
    description: "5 conceptual MCQs analyzing composite indexes, index selectivity, and B+Tree branching factor.",
    duration: "6 mins",
    questionCount: 5,
    path: "/practice/technical",
    solved: false
  },
  {
    _id: "tech_potd_2",
    category: "Technical",
    categoryLabel: "CS Fundamentals",
    categoryIcon: "cpu",
    problemId: "tech_2026_06_10",
    title: "Operating Systems: Deadlock Detection & Semaphores",
    difficulty: "Hard",
    tags: ["OS", "Concurrency", "Semaphores", "Memory"],
    publishedAt: "2026-06-10T00:00:00.000Z",
    description: "Banker's algorithm, mutex lock ordering, and thread context switching concepts.",
    duration: "7 mins",
    questionCount: 5,
    path: "/practice/technical",
    solved: true
  },
  {
    _id: "tech_potd_3",
    category: "Technical",
    categoryLabel: "CS Fundamentals",
    categoryIcon: "cpu",
    problemId: "tech_2026_06_09",
    title: "Computer Networks: TCP 3-Way Handshake & HTTP/3 QUIC",
    difficulty: "Medium",
    tags: ["Networks", "TCP/IP", "HTTP/3", "Security"],
    publishedAt: "2026-06-09T00:00:00.000Z",
    description: "Flow control, sliding window protocol, and UDP vs TCP connection establishment.",
    duration: "5 mins",
    questionCount: 5,
    path: "/practice/technical",
    solved: false
  },

  // Behavioral & Communication
  {
    _id: "hr_potd_1",
    category: "Behavioral",
    categoryLabel: "Behavioral & HR",
    categoryIcon: "message",
    problemId: "hr_2026_06_11",
    title: "Handling Conflicting Architectural Decisions in a Team",
    difficulty: "Medium",
    tags: ["Behavioral", "Teamwork", "Conflict Resolution", "STAR"],
    publishedAt: "2026-06-11T00:00:00.000Z",
    description: "Practice articulating a structured response using the STAR method for resolving technical disputes.",
    duration: "5 mins",
    questionCount: 1,
    path: "/practice/hr",
    solved: false
  },
  {
    _id: "hr_potd_2",
    category: "Behavioral",
    categoryLabel: "Behavioral & HR",
    categoryIcon: "message",
    problemId: "hr_2026_06_10",
    title: "Explaining a Complex System Outage to Non-Technical Stakeholders",
    difficulty: "Easy",
    tags: ["Communication", "Stakeholder Management", "Clarity"],
    publishedAt: "2026-06-10T00:00:00.000Z",
    description: "Formulate concise verbal updates translating technical jargon into business impact and mitigations.",
    duration: "5 mins",
    questionCount: 1,
    path: "/practice/hr",
    solved: true
  }
];

export default function DailyChallenges() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  // Active Category Filter for Daily Tracks: 'All' | 'Coding' | 'Aptitude' | 'Technical' | 'Behavioral'
  const [activeCategory, setActiveCategory] = useState("All");

  // POTD Current State (Coding)
  const [potdData, setPotdData] = useState(null);
  const [potdLoading, setPotdLoading] = useState(true);

  // Archive & History State
  const [codingArchive, setCodingArchive] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Fetch current POTD
  const fetchCurrentPOTD = async () => {
    try {
      setPotdLoading(true);
      const res = await api.get("/potd/current");
      if (res.data?.success) {
        setPotdData(res.data);
      }
    } catch (err) {
      console.error("Error loading current POTD:", err);
      toast.error("Failed to load today's daily coding challenge.");
    } finally {
      setPotdLoading(false);
    }
  };

  // Fetch POTD Archive
  const fetchArchive = async () => {
    try {
      setArchiveLoading(true);
      const res = await api.get("/potd/archive");
      setCodingArchive(res.data || []);
    } catch (err) {
      console.error("Error loading POTD archive:", err);
    } finally {
      setArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPOTD();
    fetchArchive();
  }, []);

  // Live countdown timer ticking down to next UTC midnight
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0,
          0
        )
      );
      const diff = Math.max(0, nextMidnight.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      if (diff <= 1000) {
        fetchCurrentPOTD();
        fetchArchive();
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Coding Archive Items
  const formattedCodingArchive = useMemo(() => {
    return codingArchive.map((item) => ({
      _id: item._id,
      category: "Coding",
      categoryLabel: "DSA & Coding",
      categoryIcon: "code",
      problemId: item.problemId,
      title: item.question?.title || "Coding Challenge",
      difficulty: item.question?.difficulty || "Medium",
      tags: item.question?.tags || ["DSA"],
      publishedAt: item.publishedAt,
      description: item.question?.description || "Algorithmic challenge.",
      duration: "25 mins",
      questionCount: 1,
      path: `/practice/coding/${item.question?._id}`,
      solved: item.solved,
      rawItem: item
    }));
  }, [codingArchive]);

  // Combined Archive: Coding + Aptitude + Technical + Behavioral
  const allChallenges = useMemo(() => {
    return [...formattedCodingArchive, ...STATIC_TRACK_CHALLENGES].sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [formattedCodingArchive]);

  // Filtered list
  const filteredChallenges = useMemo(() => {
    return allChallenges.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags || []).some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesDifficulty =
        selectedDifficulty === "All" || item.difficulty === selectedDifficulty;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Solved" && item.solved) ||
        (selectedStatus === "Unsolved" && !item.solved);

      return matchesCategory && matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [allChallenges, activeCategory, searchQuery, selectedDifficulty, selectedStatus]);

  // Calendar calculations
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();

  const monthName = currentCalendarDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  // Solved POTD dictionary mapped by YYYY-MM-DD
  const solvedDateMap = useMemo(() => {
    const map = {};
    allChallenges.forEach((item) => {
      if (item.publishedAt) {
        const d = new Date(item.publishedAt);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        if (!map[key] || item.solved) {
          map[key] = {
            solved: item.solved,
            item,
          };
        }
      }
    });
    return map;
  }, [allChallenges]);

  const streak = potdData?.streak || 0;
  const isTodayCodingSolved = potdData?.solved || false;
  const todayCodingQuestion = potdData?.potd?.question;

  // Active Today's Challenges across the 4 tracks
  const todayChallenges = useMemo(() => {
    return [
      {
        id: "coding",
        category: "Coding",
        categoryLabel: "DSA & Coding POTD",
        icon: <Code2 className="w-4 h-4 text-blue-500" />,
        title: todayCodingQuestion?.title || "Daily Coding Challenge",
        difficulty: todayCodingQuestion?.difficulty || "Medium",
        tags: todayCodingQuestion?.tags || ["Arrays", "Algorithms"],
        description: todayCodingQuestion?.description || "Solve today's featured algorithmic challenge to maintain your coding streak.",
        duration: "25 mins",
        solved: isTodayCodingSolved,
        actionLabel: isTodayCodingSolved ? "Review in Studio" : "Solve in Studio ➔",
        onAction: () => todayCodingQuestion?._id && navigate(`/practice/coding/${todayCodingQuestion._id}`)
      },
      {
        id: "aptitude",
        category: "Aptitude",
        categoryLabel: "Aptitude Daily Workout",
        icon: <Brain className="w-4 h-4 text-amber-500" />,
        title: "Number Series, Ratios & Logical Deductions",
        difficulty: "Medium",
        tags: ["Quantitative", "Number Series", "Ratios"],
        description: "Practice 5 fast-paced quantitative & logical reasoning questions to sharp your mental speed.",
        duration: "8 mins",
        solved: true,
        actionLabel: "Start Aptitude ➔",
        onAction: () => navigate("/practice/aptitude")
      },
      {
        id: "technical",
        category: "Technical",
        categoryLabel: "CS Fundamentals Quiz",
        icon: <Cpu className="w-4 h-4 text-purple-500" />,
        title: "Database Indexing & Query Optimization",
        difficulty: "Medium",
        tags: ["DBMS", "SQL", "B-Trees"],
        description: "5 targeted MCQs covering B-Tree indexes, composite keys, and execution plans.",
        duration: "6 mins",
        solved: false,
        actionLabel: "Start Technical ➔",
        onAction: () => navigate("/practice/technical")
      },
      {
        id: "behavioral",
        category: "Behavioral",
        categoryLabel: "Daily Behavioral Prompt",
        icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
        title: "Handling Conflicting Architectural Decisions",
        difficulty: "Easy",
        tags: ["Behavioral", "Teamwork", "STAR"],
        description: "Practice structuring a verbal or written pitch explaining how you resolve disagreements.",
        duration: "5 mins",
        solved: false,
        actionLabel: "Practice Response ➔",
        onAction: () => navigate("/practice/hr")
      }
    ];
  }, [todayCodingQuestion, isTodayCodingSolved]);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return "N/A";
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
      case "Hard":
        return "text-rose-500 bg-rose-500/10 border-rose-500/25";
      case "Medium":
      default:
        return "text-amber-500 bg-amber-500/10 border-amber-500/25";
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case "Aptitude":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25";
      case "Technical":
        return "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25";
      case "Behavioral":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      case "Coding":
      default:
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25";
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedStatus("All");
    setActiveCategory("All");
  };

  const displayedTodayChallenges = useMemo(() => {
    if (activeCategory === "All") return todayChallenges;
    return todayChallenges.filter((c) => c.category === activeCategory);
  }, [todayChallenges, activeCategory]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans antialiased transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full px-3 sm:px-4 lg:px-5 py-2.5 space-y-2">
        {/* HEADER BAR */}
        <section className="bg-brand-card border border-brand-border rounded-sm px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Target className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-brand-text tracking-tight">
                  Daily Challenges Hub
                </h1>
                <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider border border-amber-500/20">
                  4 Active Tracks
                </span>
              </div>
              <p className="text-[11px] text-brand-secondary font-medium">
                Coding, Aptitude, Technical MCQs & Behavioral daily practice sets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Streak Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-brand-bg border border-brand-border text-xs font-black text-brand-text">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{streak} {streak === 1 ? "Day" : "Days"} Streak</span>
              {isTodayCodingSolved && <span className="text-emerald-500 text-[10px] ml-1">✓</span>}
            </div>

            <button
              onClick={() => navigate("/practice")}
              className="px-3 py-1.5 rounded-sm bg-brand-bg hover:bg-brand-bg/80 text-brand-text border border-brand-border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Practice Arena</span>
            </button>

            <button
              onClick={() => {
                fetchCurrentPOTD();
                fetchArchive();
                toast.success("Challenges refreshed!");
              }}
              className="p-1.5 rounded-sm bg-brand-bg hover:bg-brand-bg/80 text-brand-secondary hover:text-brand-text border border-brand-border transition-all cursor-pointer"
              title="Refresh challenges"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* TRACK SELECTOR TABS */}
        <section className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "All", label: "All Challenge Tracks (4)", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "Coding", label: "Coding POTD", icon: <Code2 className="w-3.5 h-3.5" /> },
            { id: "Aptitude", label: "Aptitude & Reasoning", icon: <Brain className="w-3.5 h-3.5" /> },
            { id: "Technical", label: "CS Fundamentals (MCQ)", icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: "Behavioral", label: "Behavioral & HR", icon: <MessageSquare className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === tab.id
                  ? "bg-[#F59E0B] text-[#0F172A] font-black shadow-xs"
                  : "bg-brand-card hover:bg-brand-elevated text-brand-secondary hover:text-brand-text border border-brand-border"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </section>

        {/* TODAY'S FEATURED CHALLENGES GRID + CALENDAR ROW */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.75fr] gap-1.5 items-stretch">
          {/* Left: Active Today's Challenge Cards Grid */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {displayedTodayChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-brand-card border border-brand-border rounded-sm p-4 shadow-sm flex flex-col justify-between h-52 transition-all hover:border-brand-border/90"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-brand-bg border border-brand-border/40">
                          {challenge.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase text-brand-secondary tracking-wider">
                          {challenge.categoryLabel}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-wider border ${getDifficultyBadge(
                          challenge.difficulty
                        )}`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs.5 font-black text-brand-text tracking-tight line-clamp-1">
                        {challenge.title}
                      </h3>
                      <p className="text-[10px] text-brand-secondary font-medium leading-relaxed mt-1 line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {challenge.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded-xs bg-brand-bg border border-brand-border/50 text-brand-secondary text-[8.5px] font-mono font-bold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-secondary">
                      <Clock className="w-3 h-3 text-brand-secondary" />
                      <span>{challenge.duration}</span>
                      {challenge.solved && (
                        <span className="text-emerald-500 font-black ml-1.5">✓ Solved</span>
                      )}
                    </div>

                    <button
                      onClick={challenge.onAction}
                      className={`px-3 py-1.5 rounded-sm font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        challenge.solved
                          ? "bg-brand-bg hover:bg-brand-bg/80 text-brand-text border border-brand-border"
                          : "bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A]"
                      }`}
                    >
                      <span>{challenge.actionLabel}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Streak & Attendance Calendar */}
          <div className="bg-brand-card border border-brand-border rounded-sm p-4 shadow-sm flex flex-col justify-between space-y-2.5">
            <div>
              {/* Calendar Switcher */}
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
                <span className="text-xs font-black text-brand-text flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {monthName}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentCalendarDate(
                        new Date(calendarYear, calendarMonth - 1, 1)
                      )
                    }
                    className="p-1 rounded-sm bg-brand-bg border border-brand-border hover:bg-brand-bg/80 text-brand-secondary hover:text-brand-text cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentCalendarDate(
                        new Date(calendarYear, calendarMonth + 1, 1)
                      )
                    }
                    className="p-1 rounded-sm bg-brand-bg border border-brand-border hover:bg-brand-bg/80 text-brand-secondary hover:text-brand-text cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Countdown Bar */}
              <div className="flex items-center justify-between text-[10px] font-bold text-brand-secondary my-1.5 bg-brand-bg/60 px-2 py-1 rounded-sm border border-brand-border/40">
                <span>Next challenges in:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-black">
                  {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[8.5px] font-black uppercase text-brand-secondary tracking-wider mt-1 mb-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-6.5 rounded-sm bg-transparent" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const dayData = solvedDateMap[key];

                  const today = new Date();
                  const isToday =
                    today.getUTCFullYear() === calendarYear &&
                    today.getUTCMonth() === calendarMonth &&
                    today.getUTCDate() === dayNum;

                  let cellStyle = "bg-brand-bg/40 text-brand-secondary border-brand-border/40";
                  let isClickable = false;

                  if (dayData?.solved) {
                    cellStyle = "bg-emerald-500 text-white font-black border-emerald-600 shadow-xs";
                    isClickable = true;
                  } else if (dayData && !dayData.solved) {
                    cellStyle = "bg-amber-500/10 text-amber-500 border-amber-500/30";
                    isClickable = true;
                  }

                  if (isToday) {
                    cellStyle += " ring-2 ring-amber-500";
                  }

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => {
                        if (dayData?.item?.path) {
                          navigate(dayData.item.path);
                        } else if (isToday && todayCodingQuestion?._id) {
                          navigate(`/practice/coding/${todayCodingQuestion._id}`);
                        }
                      }}
                      disabled={!isClickable && !isToday}
                      className={`h-6.5 rounded-sm border text-[10px] flex flex-col items-center justify-center transition-all ${cellStyle} ${
                        isClickable || isToday ? "cursor-pointer hover:scale-105" : "cursor-default opacity-60"
                      }`}
                      title={
                        dayData?.item?.title
                          ? `${dayData.item.title} (${dayData.solved ? "Solved" : "Unsolved"})`
                          : `Day ${dayNum}`
                      }
                    >
                      <span>{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[8.5px] font-bold text-brand-secondary">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-emerald-500" />
                <span>Solved</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-amber-500/20 border border-amber-500" />
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs border-2 border-amber-500" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — ALL CHALLENGES ARCHIVE & EXPLORER */}
        <section className="space-y-1.5">
          {/* Filter Toolbar */}
          <div className="bg-brand-card border border-brand-border rounded-sm p-2.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-brand-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search all challenges by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-brand-elevated border border-brand-border rounded-xs text-xs font-semibold text-brand-text placeholder:text-brand-secondary/60 outline-none focus:border-amber-500 transition-colors"
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

            <div className="flex items-center gap-1.5 flex-wrap">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-1.5 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
              >
                <option value="All">All Tracks</option>
                <option value="Coding">Coding (DSA)</option>
                <option value="Aptitude">Aptitude & Reasoning</option>
                <option value="Technical">CS Fundamentals (MCQ)</option>
                <option value="Behavioral">Behavioral & HR</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-1.5 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-brand-elevated border border-brand-border rounded-xs px-2 py-1.5 text-xs font-bold text-brand-text outline-none focus:border-amber-500 cursor-pointer transition-colors"
              >
                <option value="All">All Status</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
              </select>

              {(searchQuery || selectedDifficulty !== "All" || selectedStatus !== "All" || activeCategory !== "All") && (
                <button
                  onClick={handleResetFilters}
                  className="p-1.5 bg-brand-elevated border border-brand-border text-brand-secondary hover:text-brand-text rounded-xs cursor-pointer"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-brand-card rounded-sm border border-brand-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed min-w-[660px]">
                <thead className="sticky top-0 z-10 bg-brand-elevated/95 backdrop-blur-sm border-b border-brand-border text-brand-secondary text-[9px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Status</th>
                    <th className="py-2.5 px-3 w-28 text-center">Track</th>
                    <th className="py-2.5 px-3 w-24">Date</th>
                    <th className="py-2.5 px-4 w-[40%]">Challenge Title</th>
                    <th className="py-2.5 px-3 w-20 text-center">Difficulty</th>
                    <th className="py-2.5 px-3">Topics</th>
                    <th className="py-2.5 px-4 text-right w-24">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-brand-border/40 text-xs font-medium">
                  {archiveLoading ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-brand-secondary font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          <span>Loading challenges...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredChallenges.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-brand-secondary space-y-1.5">
                        <p className="font-bold text-xs text-brand-text">No challenges match your filter</p>
                        <button
                          onClick={handleResetFilters}
                          className="px-3 py-1 bg-[#F59E0B] text-[#0F172A] font-bold text-xs rounded-xs cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredChallenges.map((item, idx) => {
                      const isSolved = item.solved;

                      return (
                        <tr
                          key={item._id}
                          onClick={() => navigate(item.path)}
                          className={`cursor-pointer transition-colors duration-150 group hover:bg-brand-elevated/80 ${
                            idx % 2 === 0 ? "bg-transparent" : "bg-brand-bg/30"
                          }`}
                        >
                          <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            {isSolved ? (
                              <div className="inline-flex items-center justify-center text-emerald-500" title="Solved">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center text-brand-secondary/40" title="Unsolved">
                                <Circle className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </td>

                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block text-[8.5px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-wider border ${getCategoryBadge(
                                item.category
                              )}`}
                            >
                              {item.categoryLabel}
                            </span>
                          </td>

                          <td className="py-2 px-3 font-mono font-semibold text-brand-secondary whitespace-nowrap text-[10px]">
                            {formatDate(item.publishedAt)}
                          </td>

                          <td className="py-2 px-4 font-bold text-brand-text group-hover:text-amber-500 transition-colors truncate">
                            {item.title}
                          </td>

                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block text-[9px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-wider border ${getDifficultyBadge(
                                item.difficulty
                              )}`}
                            >
                              {item.difficulty}
                            </span>
                          </td>

                          <td className="py-2 px-3 text-brand-secondary font-medium truncate text-[10.5px]">
                            {(item.tags || []).join(", ") || "General"}
                          </td>

                          <td className="py-2 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(item.path)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[9.5px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                                isSolved
                                  ? "bg-brand-elevated hover:bg-brand-elevated/80 text-brand-secondary border border-brand-border"
                                  : "bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] shadow-xs"
                              }`}
                            >
                              <span>{isSolved ? "Review" : "Solve"}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
