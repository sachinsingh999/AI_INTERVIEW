import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Brain,
  Layers,
  Database,
  Server,
  Network,
  Cpu,
  Mic,
  Building2,
  Sparkles,
  Zap,
  Flame,
  Search,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Target,
  FileText,
  Compass,
  ChevronDown
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";

export default function PracticeHub() {
  const navigate = useNavigate();

  const practiceModes = [
    {
      id: "daily",
      title: "Daily Coding Challenge (POTD)",
      description: "Solve today's 4 featured track problems, build active streaks, and review historical archives.",
      path: "/daily-challenges",
      topics: ["Problem of the Day", "Streak Calendar", "Monthly Heatmap", "Historical POTD Archive"],
      badge: "Daily Streak",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Flame,
      iconColor: "text-amber-500"
    },
    {
      id: "coding",
      title: "DSA & Algorithms Arena",
      description: "Solve DSA, Algorithms, System Design, and Company-Specific Coding Questions.",
      path: "/practice/coding",
      topics: ["Arrays & 2 Pointers", "Strings & Hashing", "Linked Lists", "Binary Trees & BST", "Graphs & BFS/DFS", "Dynamic Programming", "Heaps & Priority Queues", "Tries", "Backtracking & Recursion", "Sliding Window", "Greedy Algorithms", "Bit Manipulation"],
      badge: "500+ Problems",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: Code2,
      iconColor: "text-blue-500"
    },
    {
      id: "aptitude",
      title: "Quantitative Aptitude",
      description: "Master arithmetic reasoning, percentages, time & distance, probability, and numerical problem solving.",
      path: "/practice/aptitude",
      topics: ["Percentages & Profit/Loss", "Time, Speed & Distance", "Time & Work", "Permutations & Combinations", "Probability", "Simple & Compound Interest", "Ratios & Proportions", "Number Systems", "Data Interpretation"],
      badge: "OA Assessment",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: Brain,
      iconColor: "text-emerald-500"
    },
    {
      id: "logical",
      title: "Logical & Analytical Reasoning",
      description: "Practice pattern recognition, deductive reasoning, seating arrangements, and blood relations.",
      path: "/practice/aptitude",
      topics: ["Syllogisms", "Blood Relations", "Linear & Circular Seating", "Coding-Decoding", "Series Completion", "Direction Sense", "Data Sufficiency", "Analytical Puzzles"],
      badge: "Critical Thinking",
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: Target,
      iconColor: "text-purple-500"
    },
    {
      id: "verbal",
      title: "Verbal Ability & Comprehension",
      description: "Prepare English vocabulary, sentence correction, critical reasoning, and reading comprehension passages.",
      path: "/practice/aptitude",
      topics: ["Sentence Correction & Grammar", "Parajumbles & Sentence Order", "Reading Comprehension Passages", "Critical Reasoning", "Synonyms & Antonyms", "Idioms & Phrases"],
      badge: "Communication",
      badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      icon: FileText,
      iconColor: "text-indigo-500"
    },
    {
      id: "dbms",
      title: "DBMS & SQL Engineering",
      description: "Prepare SQL queries, database indexing, normalization (1NF-BCNF), and ACID transactions.",
      path: "/practice/technical",
      topics: ["Complex SQL Queries & Joins", "Indexing & Query Optimization", "ACID & Transactions", "Database Normalization (1NF-BCNF)", "NoSQL vs SQL", "Database Sharding & Replication"],
      badge: "Database Core",
      badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      icon: Database,
      iconColor: "text-cyan-500"
    },
    {
      id: "os",
      title: "Operating Systems & Concurrency",
      description: "Review process management, threads, mutex vs semaphores, deadlocks, and virtual memory.",
      path: "/practice/technical",
      topics: ["Process vs Thread & Lifecycle", "CPU Scheduling Algorithms", "Mutex & Semaphores Synchronization", "Deadlocks & Banker's Algorithm", "Virtual Memory & Paging", "Linux Commands & System Calls"],
      badge: "System Core",
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: Cpu,
      iconColor: "text-rose-500"
    },
    {
      id: "networks",
      title: "Computer Networks & Protocols",
      description: "Master TCP/IP, OSI 7-layer model, HTTP/HTTPS, DNS resolution, WebSockets, and SSL/TLS.",
      path: "/practice/technical",
      topics: ["TCP 3-Way Handshake & Congestion", "DNS Resolution & HTTP/2 / HTTP/3", "OSI 7-Layer Model vs TCP/IP", "Routing, IP & Subnetting", "WebSockets & Real-Time Sync", "SSL/TLS Security & Cryptography"],
      badge: "Networking",
      badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      icon: Network,
      iconColor: "text-teal-500"
    },
    {
      id: "oop",
      title: "OOP & SOLID Design Patterns",
      description: "Master object-oriented design, SOLID principles, Gang of Four (GoF) patterns, and Low-Level Design.",
      path: "/practice/technical",
      topics: ["SOLID Principles in Depth", "Factory & Abstract Factory", "Singleton & Builder Pattern", "Observer & Strategy Pattern", "Decorator & Adapter Pattern", "Low-Level Design (LLD) Problems"],
      badge: "Clean Architecture",
      badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      icon: Layers,
      iconColor: "text-violet-500"
    },
    {
      id: "system-design",
      title: "High-Level System Design (HLD)",
      description: "Architect scalable distributed systems, caching strategies, rate limiters, and message queues.",
      path: "/practice/coding",
      topics: ["Distributed Rate Limiter", "URL Shortener (TinyURL)", "Message Queue (Kafka Architecture)", "Real-Time Chat (WhatsApp/Slack)", "Video Streaming (Netflix/YouTube)", "Microservices & Caching Strategies"],
      badge: "Architecture",
      badgeColor: "bg-blue-600/10 text-blue-600 border-blue-600/20",
      icon: Server,
      iconColor: "text-blue-600"
    },
    {
      id: "interview",
      title: "AI Mock Interview (Multi-Round)",
      description: "Practice real-time behavior, technical, and HR questions with an AI interviewer.",
      path: "/create-interview",
      topics: ["HR & Leadership Prep Round", "Technical Coding Sandbox Round", "System Design & Architecture Round", "STAR Behavioral Drill", "Speech Pacing & Confidence Assessment"],
      badge: "Interactive AI",
      badgeColor: "bg-indigo-600/10 text-indigo-600 border-indigo-600/20",
      icon: Mic,
      iconColor: "text-indigo-600"
    },
    {
      id: "company",
      title: "FAANG & Tier-1 Company Packs",
      description: "Prepare specifically for interview questions asked at target FAANG companies.",
      path: "/practice/coding",
      topics: ["Google Top Interview Questions", "Amazon 14 Leadership Principles & DSA", "Microsoft System & Code", "Meta Core Algorithms", "Netflix High Scale Architecture", "Uber Graph & Geohash Problems", "Apple Hardware/Software Systems", "Goldman Sachs Math & Quant"],
      badge: "Target FAANG",
      badgeColor: "bg-amber-600/10 text-amber-600 border-amber-600/20",
      icon: Building2,
      iconColor: "text-amber-600"
    },
    {
      id: "forge-ai",
      title: "ForgeAI Custom Problem Studio",
      description: "Generate tailored interview questions and test suites on demand using custom parameters.",
      path: "/forge-ai",
      topics: ["Custom Role Alignment", "Company Style Replication", "Target Difficulty Tuning", "Instant Test Cases & Hints", "Live AI Evaluation"],
      badge: "Generative AI",
      badgeColor: "bg-purple-600/10 text-purple-600 border-purple-600/20",
      icon: Sparkles,
      iconColor: "text-purple-600"
    },
    {
      id: "roadmap",
      title: "Career & Skill Roadmaps",
      description: "Follow structured, milestone-driven curriculums engineered for software engineering roles.",
      path: "/roadmap",
      topics: ["Frontend Mastery Path", "Backend Architecture Path", "Full Stack Engineer", "DSA Zero-to-Hero", "System Design SDE II"],
      badge: "Curriculum",
      badgeColor: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
      icon: Compass,
      iconColor: "text-emerald-600"
    }
  ];

  const [selectedModeId, setSelectedModeId] = useState(practiceModes[0].id);
  const selectedMode = practiceModes.find((m) => m.id === selectedModeId) || practiceModes[0];
  const [selectedTopic, setSelectedTopic] = useState(selectedMode.topics[0]);

  const handleModeChange = (modeId) => {
    setSelectedModeId(modeId);
    const newMode = practiceModes.find((m) => m.id === modeId);
    if (newMode) {
      setSelectedTopic(newMode.topics[0]);
    }
  };

  const handleStartPractice = () => {
    if (selectedMode.id === "company") {
      toast.success(`Filtering questions for ${selectedTopic}`);
      navigate(`/practice/coding?search=${encodeURIComponent(selectedTopic)}`);
    } else {
      navigate(`${selectedMode.path}?topic=${encodeURIComponent(selectedTopic)}`);
    }
  };

  const SelectedIcon = selectedMode.icon;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* Main Choosing Box (Like Previous with All Expanded Options) */}
        <div className="w-full max-w-2xl mx-auto space-y-6">
          
          {/* Header Block */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider mb-1 select-none">
              ⚡ Practice Arena
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              Select Your <span className="text-[#F59E0B]">Practice Module</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Choose a practice mode and topic below to launch your customized assessment workspace.
            </p>
          </div>

          {/* Practice Selector Controls */}
          <div className="space-y-6 bg-brand-card border border-brand-border rounded-sm p-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Practice Mode Dropdown */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. Select Practice Mode ({practiceModes.length} Available)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SelectedIcon className={`h-5 w-5 ${selectedMode.iconColor}`} />
                  </div>
                  <select
                    value={selectedModeId}
                    onChange={(e) => handleModeChange(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-sm font-bold rounded-sm pl-11 pr-10 py-3 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
                  >
                    {practiceModes.map((mode) => (
                      <option key={mode.id} value={mode.id} className="bg-white dark:bg-[#0c1220] text-slate-800 dark:text-slate-100 font-semibold">
                        {mode.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 2. Topic / Focus Area Dropdown */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Select Focus Topic
                </label>
                <div className="relative">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-sm font-bold rounded-sm px-4 py-3 pr-10 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
                  >
                    {selectedMode.topics.map((topic) => (
                      <option key={topic} value={topic} className="bg-white dark:bg-[#0c1220] text-slate-800 dark:text-slate-100 font-semibold">
                        {topic}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Selected Module Summary Pill */}
            <div className="p-3 bg-brand-elevated/50 border border-brand-border/60 rounded-xs flex items-center justify-between text-xs">
              <span className="text-brand-muted truncate max-w-[340px]">
                {selectedMode.description}
              </span>
              <span className={`px-2 py-0.5 rounded-xs text-[10px] font-black uppercase tracking-wider border shrink-0 ${selectedMode.badgeColor}`}>
                {selectedMode.badge}
              </span>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-1">
              <button
                onClick={handleStartPractice}
                className="w-full py-3.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-sm font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-[0.99] duration-150 flex items-center justify-center gap-2"
              >
                <span>Start {selectedMode.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Quick Browse Grid (All Modules at a Glance) */}
        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
              Quick Launch by Module
            </h2>
            <span className="text-xs text-brand-muted font-medium">
              Click any module to select
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {practiceModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = mode.id === selectedModeId;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`p-3.5 rounded-sm border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? "bg-brand-elevated border-[#F59E0B] shadow-xs"
                      : "bg-brand-card border-brand-border hover:border-brand-primary/50 hover:bg-brand-elevated/40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xs flex items-center justify-center shrink-0 ${isSelected ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-brand-elevated text-brand-muted"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {mode.title}
                      </h3>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-brand-muted line-clamp-1 mt-0.5">
                      {mode.topics.length} topics • {mode.badge}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}


