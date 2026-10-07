import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/toast";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import Message from "../components/Message";
import api from "../services/api";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { 
  Code2, 
  Video, 
  Trophy, 
  Activity, 
  CheckCircle2, 
  Lock, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  TrendingDown
} from "lucide-react";

// Inline Sparkline visualization component to make dashboards look premium (Stripe/Notion style)
const Sparkline = ({ color, points }) => (
  <svg className="w-16 h-8 opacity-80" viewBox="0 0 100 30" fill="none">
    <path
      d={points}
      stroke={color === "green" ? "#10B981" : color === "blue" ? "#3B82F6" : color === "purple" ? "#A78BFA" : "#F59E0B"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [streak, setStreak] = useState(0);
  const { resolvedTheme } = useTheme();
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user")) || null;
  const userDisplayName = user?.name || "User";

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const res = await api.get("/interviews");
        setInterviews(res.data);
      } catch (error) {
        if (error.response?.status === 401) return;
        const localHistory = JSON.parse(sessionStorage.getItem("localInterviews") || "[]");
        setInterviews(localHistory);
      }
    };

    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await api.get("/users/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    const fetchStreak = async () => {
      if (!token) return;
      try {
        const res = await api.get("/potd/current");
        if (res.data?.success) {
          setStreak(res.data.streak || 0);
        }
      } catch (err) {
        console.error("Error loading streak:", err);
      }
    };

    fetchHistoryData();
    fetchNotifications();
    fetchStreak();
  }, [token]);

  const startNewInterview = () => {
    navigate("/create-interview");
  };

  // Dynamic calculations based on real interviews data
  const totalAnswered = interviews.reduce(
    (total, iv) => total + (iv.answeredCount || 0),
    0
  );

  const completedInterviews = interviews.filter((iv) => {
    const total = iv.questionCount || iv.questions?.length || 0;
    return total > 0 && (iv.answeredCount || 0) >= total;
  }).length;

  const activeParent = interviews.find(i => i.interviewType === "oa" && (!i.isLocked || i.decision === "PASSED")) || interviews.find(i => i.interviewType === "oa");

  // Calculate scores for each interview dynamically based on difficulty and completed answers
  const scoredInterviews = interviews
    .filter((iv) => {
      if (["tech1", "tech2", "hr"].includes(iv.interviewType)) return false;
      return true;
    })
    .map((iv) => {
      const total = iv.questionCount || iv.questions?.length || 1;
      const answered = iv.answeredCount || 0;
      const isOa = iv.interviewType === "oa";
      
      const isCompleted = isOa 
        ? !!(iv.phasesMetadata?.oa?.completed || (total > 0 && answered >= total))
        : !!(total > 0 && answered >= total);

      const completionRatio = answered / total;
      
      let baseScore = 65;
      if (iv.difficulty === "Medium") baseScore = 75;
      if (iv.difficulty === "Hard") baseScore = 85;
      
      const finalScore = Math.round(baseScore * (0.5 + 0.5 * completionRatio));
      return {
        ...iv,
        isCompleted,
        score: isCompleted ? Math.min(finalScore, 100) : null,
      };
    });

  const overallScore = scoredInterviews.length > 0
    ? Math.round(scoredInterviews.reduce((sum, iv) => sum + (iv.score || 0), 0) / scoredInterviews.length)
    : 0; 

  const placementReadiness = overallScore;
  const userStreak = streak;
  const currentRating = interviews.length > 0 ? 1200 + overallScore * 5 : 0;
  const currentRanking = interviews.length > 0 ? (placementReadiness >= 85 ? "Top 5%" : placementReadiness >= 75 ? "Top 15%" : "Top 25%") : "Unranked";

  // Skill indicators from history
  const dsaCount = interviews.filter(iv => iv.interviewType === "code").length;
  const videoCount = interviews.filter(iv => iv.interviewType === "video").length;
  const systemCount = interviews.filter(iv => (iv.role || "").toLowerCase().includes("backend") || (iv.role || "").toLowerCase().includes("system")).length;
  const standardCount = interviews.filter(iv => iv.interviewType === "standard").length;

  const dsaScore = dsaCount > 0 ? Math.min(70 + dsaCount * 8, 98) : 0;
  const commScore = videoCount > 0 ? Math.min(65 + videoCount * 10, 98) : 0;
  const systemDesignScore = systemCount > 0 ? Math.min(60 + systemCount * 12, 98) : 0;
  const confidenceScore = standardCount > 0 ? Math.min(68 + standardCount * 8, 98) : 0;
  const problemSolvingScore = Math.round((dsaScore + systemDesignScore) / 2);
  const technicalKnowledgeScore = Math.round((dsaScore + commScore) / 2);

  const radarData = [
    { subject: "DSA", value: dsaScore },
    { subject: "Communication", value: commScore },
    { subject: "Confidence", value: confidenceScore },
    { subject: "System Design", value: systemDesignScore },
    { subject: "Problem Solving", value: problemSolvingScore },
    { subject: "Technical Knowledge", value: technicalKnowledgeScore },
  ];

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Check which domains are cleared in dynamic roadmap
  const hasFrontend = activeParent?.phasesMetadata?.tech1?.cleared || false;
  const hasBackend = activeParent?.phasesMetadata?.tech2?.cleared || false;
  const hasSystemDesign = activeParent?.phasesMetadata?.hr?.cleared || false;

  // Generate active recruitment pipeline nodes dynamically
  const roadmapNodes = [
    { key: "oa", label: "OA Round" },
    { key: "tech1", label: "Technical 1" },
    { key: "tech2", label: "Technical 2" },
    { key: "hr", label: "HR Round" }
  ].map((phase, idx, arr) => {
    const meta = activeParent?.phasesMetadata?.[phase.key];
    const completed = meta?.completed || false;
    const cleared = meta?.cleared || false;
    
    let isCurrent = false;
    if (!completed) {
      if (idx === 0) {
        isCurrent = true;
      } else {
        const prevKey = arr[idx - 1].key;
        const prevMeta = activeParent?.phasesMetadata?.[prevKey];
        if (prevMeta?.cleared) {
          isCurrent = true;
        }
      }
    }
    
    const active = activeParent ? (idx === 0 || activeParent.phasesMetadata?.[arr[idx - 1].key]?.cleared) : false;
    
    let status = "Upcoming";
    if (completed) {
      status = cleared ? "Passed" : "Failed";
    } else if (isCurrent && activeParent) {
      status = "Current";
    }

    return {
      label: phase.label,
      status,
      active,
      cleared,
      current: isCurrent && !!activeParent
    };
  });

  // Calculate activeParent completed rounds count and completion percentage dynamically
  let completedRoundsCount = 0;
  if (activeParent?.phasesMetadata) {
    if (activeParent.phasesMetadata.oa?.completed) completedRoundsCount++;
    if (activeParent.phasesMetadata.tech1?.completed) completedRoundsCount++;
    if (activeParent.phasesMetadata.tech2?.completed) completedRoundsCount++;
    if (activeParent.phasesMetadata.hr?.completed) completedRoundsCount++;
  }
  const completionPercentage = activeParent ? Math.min(Math.max(completedRoundsCount * 25, 10), 100) : 0;

  // Dynamic recommendations based on user scores
  const getDynamicRecommendations = () => {
    const recs = [];
    if (dsaScore < 75) {
      recs.push({
        title: "Focus on Algorithms & DSA",
        desc: "Your recursion and algorithm competency indices can be improved. Practice binary trees, DFS/BFS and sorting algorithms.",
        badge: "DSA Practice"
      });
    }
    if (systemDesignScore < 75) {
      recs.push({
        title: "Study Scalable Architectures",
        desc: "Learn load balancer configurations, CDN caching patterns, microservices and relational vs non-relational database design.",
        badge: "Scalability"
      });
    }
    if (commScore < 75) {
      recs.push({
        title: "Practice Behavioral Scenarios",
        desc: "Build structured answers using the STAR method (Situation, Task, Action, Result) for leadership and behavioral mock scenarios.",
        badge: "Communication"
      });
    }
    // Fallback default recommendations if scores are high or no interviews taken yet
    if (recs.length < 3) {
      recs.push({
        title: "Configure Next Mock Interview",
        desc: "Setup and configure a new assessment session targeting your desired role profile to refresh metrics.",
        badge: "System"
      });
    }
    return recs.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans antialiased selection:bg-blue-500/20 selection:text-blue-300 transition-colors duration-200">
      
      {/* Smart Navbar Component */}
      <Navbar />

      <main className="flex-1 w-full px-3 sm:px-4 lg:px-5 py-2 space-y-1.5">
        
        {/* SECTION 2 — HERO WELCOME PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-1.5 items-stretch">
          {/* Left Panel: Welcomer & Stats Cards */}
          <section className="relative overflow-hidden rounded-sm border border-brand-border bg-brand-card/85 backdrop-blur-md p-6 md:p-7 shadow-sm flex flex-col justify-between">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-900/60 dark:bg-slate-950/60 border border-white/5 text-slate-400 w-fit">
                Good to see you again! 👋
              </div>

              <div>
                <h1 className="text-3xl md:text-3.5xl font-black tracking-tight text-brand-text">
                  Welcome Back, <span className="text-amber-600 dark:text-amber-400">{userDisplayName}</span> 👏
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary font-medium mt-1.5 max-w-lg leading-relaxed">
                  Continue building your interview readiness and career growth journey.
                </p>
              </div>

              {/* Status metric cards row (4 cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                {[
                  { title: "Current Rank", value: currentRanking, icon: <Award className="w-4 h-4 text-amber-500" />, trend: true },
                  { title: "Current Rating", value: currentRating, icon: <Trophy className="w-4 h-4 text-amber-500" />, trend: true },
                  { title: "Daily Streak", value: `${userStreak} Days`, icon: <Zap className="w-4 h-4 text-orange-400" />, trend: true },
                  { title: "Status", value: interviews.length > 0 ? "Interview Ready" : "Getting Started", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, trend: false, highlight: interviews.length > 0 }
                ].map((card, idx) => (
                  <div key={idx} className="bg-brand-bg/85 border border-brand-border/60 rounded-sm p-3 flex flex-col justify-between h-22.5 shadow-sm hover:border-brand-border/90 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="p-1 rounded-sm bg-brand-card border border-brand-border/40 text-slate-400">
                        {card.icon}
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-[8.5px] font-black uppercase text-brand-secondary tracking-wider block">{card.title}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[12px] font-black tracking-tight leading-none ${card.highlight ? "text-emerald-500" : "text-brand-text"}`}>
                          {card.value}
                        </span>
                        {card.trend && interviews.length > 0 && (
                          <span className="text-[10px] font-black text-emerald-500 leading-none">↑</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insight Card */}
              <div className="bg-brand-bg/45 hover:bg-brand-bg/80 border border-brand-border/50 hover:border-brand-border rounded-sm p-3.5 flex items-center justify-between gap-1.5 transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.1)] group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">AI Insight</span>
                    <p className="text-[10.5px] font-black text-brand-text mt-0.5">
                      You're outperforming {placementReadiness}% of candidates this week.
                    </p>
                    <p className="text-[9px] text-brand-secondary font-medium mt-0.5">
                      Keep up the amazing momentum! 🚀
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-secondary group-hover:text-brand-text transition-colors transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* CTAs Row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-1 relative z-10">
              <button
                onClick={() => navigate("/practice")}
                className="px-4 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-black text-[11px] flex items-center gap-2 transition duration-200 shadow-md cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Continue Interview Journey ➔
              </button>
              
              <button
                onClick={() => navigate("/analytics")}
                className="px-4 py-2.5 rounded-sm bg-brand-bg hover:bg-brand-bg/85 text-brand-text hover:text-white border border-brand-border/80 hover:border-brand-border font-black text-[11px] flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                View Analytics
              </button>
            </div>
          </section>

          {/* Right Panel: Overall Readiness Ring & Stage Timeline */}
          <section className="relative overflow-hidden rounded-lg border border-brand-border bg-brand-card/85 backdrop-blur-md p-6 shadow-sm flex flex-col justify-between">
            <div className="relative z-10 space-y-4">
              {/* Info Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase text-brand-secondary tracking-widest flex items-center gap-1">
                  Overall Readiness Score
                  <span className="text-[10px] text-slate-500 cursor-help" title="Weighted competency score across standard interview assessment rounds">ⓘ</span>
                </h3>
              </div>

              {/* Progress Ring & Skill Pointers */}
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
                
                {/* Left Pointers */}
                <div className="flex flex-col gap-3 text-right">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-brand-secondary font-black block">DSA</span>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[11px] font-black text-brand-text">{dsaScore}%</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)] animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-brand-secondary font-black block">System Design</span>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[11px] font-black text-brand-text">{systemDesignScore}%</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Center SVG Ring */}
                <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke={resolvedTheme === "dark" ? "#161f30" : "#e2e8f0"} strokeWidth="5" fill="transparent" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="#3B82F6"
                      strokeWidth="6.5"
                      fill="transparent"
                      strokeDasharray="301.6"
                      strokeDashoffset={301.6 - (301.6 * placementReadiness) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center px-1">
                    <span className="text-2.5xl font-black text-brand-text leading-none">{placementReadiness}%</span>
                    <span className="text-[8px] font-black text-emerald-500 mt-0.5 uppercase tracking-widest">Ready</span>
                    {interviews.length > 0 && (
                      <span className="text-[7.5px] font-bold text-emerald-500 mt-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">↑ active</span>
                    )}
                  </div>
                </div>

                {/* Right Pointers */}
                <div className="flex flex-col gap-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-brand-secondary font-black block">Communication</span>
                    <div className="flex items-center justify-start gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)] animate-pulse" />
                      <span className="text-[11px] font-black text-brand-text">{commScore}%</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-brand-secondary font-black block">Confidence</span>
                    <div className="flex items-center justify-start gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse" />
                      <span className="text-[11px] font-black text-brand-text">{confidenceScore}%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recruitment Stage tracker card */}
              {activeParent ? (
                <div className="border-t border-brand-border/40 pt-3.5 space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-brand-secondary text-[9px] font-black uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>Current Recruitment Stage</span>
                  </div>
                  <div className="text-center space-y-0.5">
                    <h4 className="text-base font-black text-indigo-600 dark:text-indigo-400 truncate max-w-full">
                      {activeParent.role}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase bg-blue-500/10 border border-blue-500/20 text-blue-500">
                      Round {completedRoundsCount + 1} ⊙
                    </span>
                  </div>

                  {/* Progress bar slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-brand-secondary uppercase tracking-wider">
                      <span>Round {completedRoundsCount} of 4</span>
                      <span>{completionPercentage}% Completed</span>
                    </div>
                    <div className="w-full bg-brand-bg border border-brand-border/40 rounded-full h-1.5">
                      <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }} />
                    </div>
                  </div>

                  {/* Horizontal stage roadmap dots */}
                  <div className="grid grid-cols-4 gap-1 relative pt-1.5">
                    {/* connector bar */}
                    <div className="absolute top-[13px] left-6 right-6 h-0.5 bg-brand-border/40 z-0" />
                    {roadmapNodes.map((node, i) => {
                      let nodeStyle = "bg-brand-bg border-brand-border/40 text-slate-400 dark:text-slate-300";
                      let statusColor = "text-slate-500 dark:text-slate-400";
                      
                      if (node.cleared) {
                        nodeStyle = "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                        statusColor = "text-emerald-555 dark:text-emerald-400 font-bold";
                      } else if (node.current) {
                        nodeStyle = "bg-brand-bg border-2 border-indigo-500 text-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] animate-pulse";
                        statusColor = "text-indigo-550 dark:text-indigo-400 font-black";
                      }
                      
                      return (
                        <div key={i} className="flex flex-col items-center text-center relative z-10 space-y-1">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[8.5px] ${nodeStyle}`}>
                            {node.cleared ? "✓" : i + 1}
                          </div>
                          <div>
                            <h5 className="text-[8px] font-black text-brand-text truncate max-w-[65px] sm:max-w-none leading-none">{node.label}</h5>
                            <span className={`text-[7.5px] font-black uppercase tracking-wider block mt-0.5 ${statusColor}`}>{node.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="border-t border-brand-border/40 pt-3.5 text-center py-4">
                  <span className="text-[10px] text-brand-secondary font-medium">No active recruitment pipeline</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SECTION 3 — PERFORMANCE OVERVIEW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
          {[
            { 
              title: "Questions Solved", 
              metric: totalAnswered, 
              trend: interviews.length > 0 ? `+${Math.max(1, Math.round(totalAnswered * 0.1))} solved recently` : "No solved questions", 
              icon: <Code2 className="w-4 h-4 text-emerald-500" />,
              color: "green",
              sparkPoints: interviews.length > 0 ? "M0 25 C10 20, 20 10, 30 22 C40 34, 50 5, 60 18 C70 31, 80 8, 90 20 L100 12" : "M0 15 L100 15" 
            },
            { 
              title: "Sessions Completed", 
              metric: completedInterviews, 
              trend: interviews.length > 0 ? `+${completedInterviews} completed` : "No sessions completed", 
              icon: <Video className="w-4 h-4 text-blue-500" />,
              color: "blue",
              sparkPoints: interviews.length > 0 ? "M0 15 C15 5, 25 25, 45 10 C60 5, 70 30, 85 15 L100 28" : "M0 15 L100 15" 
            },
            { 
              title: "Current Rating", 
              metric: currentRating, 
              trend: interviews.length > 0 ? `+${Math.round(overallScore * 0.5)} rating points` : "Rating inactive", 
              icon: <Trophy className="w-4 h-4 text-purple-500" />,
              color: "purple",
              sparkPoints: interviews.length > 0 ? "M0 30 C20 28, 40 15, 60 22 C70 5, 80 12, 90 2 L100 5" : "M0 15 L100 15" 
            },
            { 
              title: "Current Ranking", 
              metric: currentRanking, 
              trend: interviews.length > 0 ? `Active in ${currentRanking}` : "Unranked", 
              icon: <Activity className="w-4 h-4 text-amber-500" />,
              color: "yellow",
              sparkPoints: interviews.length > 0 ? "M0 5 C15 15, 30 22, 50 8 C65 25, 80 10, 95 20 L100 15" : "M0 15 L100 15" 
            }
          ].map((card, i) => (
            <div 
              key={i} 
              className="bg-brand-card border border-brand-border rounded-md p-4.5 flex items-center justify-between shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-sm bg-brand-bg border border-brand-border/40 shadow-inner">
                    {card.icon}
                  </div>
                  <span className="text-[10px] uppercase font-black text-brand-secondary tracking-wider">
                    {card.title}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl.5 font-black text-brand-text group-hover:text-blue-500 transition-colors duration-300">
                    {card.metric}
                  </h3>
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-555 dark:text-emerald-400 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{card.trend}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Sparkline color={card.color} points={card.sparkPoints} />
              </div>
            </div>
          ))}
        </section>

        {/* SECTION 4 — CAREER DOMAIN PROGRESSION */}
        <section className="bg-brand-card border border-brand-border rounded-lg p-6 shadow-sm transition-all duration-300">
          <div className="mb-4">
            <h3 className="text-sm font-black text-brand-text">Career Domain Progression</h3>
            <p className="text-[11px] text-brand-secondary font-medium mt-0.5">Clear standard round assessments to master domain requirements.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {[
              { label: "Frontend", active: hasFrontend, desc: "Design & UX Architecture" },
              { label: "Backend", active: hasBackend, desc: "API & Process Control" },
              { label: "System Design", active: hasSystemDesign, desc: "Scalable Infrastructure" },
              { label: "Database", active: overallScore >= 70, desc: "SQL/NoSQL Storage" },
              { label: "DevOps", active: overallScore >= 80, desc: "CI/CD & Cloud Launch" },
              { label: "Communication", active: overallScore >= 65, desc: "Proctor & Tech Pitch" }
            ].map((domain, i) => (
              <div 
                key={i} 
                className={`p-3.5 rounded-md border text-left flex flex-col justify-between h-28 transition-all duration-300 ${
                  domain.active
                    ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.06)]"
                    : "bg-brand-bg/45 border-brand-border/40 hover:border-brand-border opacity-75"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1 rounded-sm ${domain.active ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-bg text-brand-secondary border border-brand-border/40"}`}>
                    {domain.active ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${domain.active ? "text-emerald-500" : "text-brand-secondary"}`}>
                    {domain.active ? "Passed" : "Pending"}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-text tracking-tight">{domain.label}</h4>
                  <p className="text-[9px] text-brand-secondary mt-0.5 font-medium leading-none truncate">{domain.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5 — QUICK ACTION CENTER */}
        <section className="space-y-1.5">
          <h2 className="text-base font-black text-brand-text tracking-tight">Quick Action Center</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {[
              { 
                title: "Start AI Interview", 
                desc: "Configure and launch a custom practice round.", 
                icon: <Zap className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />, 
                path: "/create-interview",
                color: "bg-blue-500/5 border-blue-500/15 hover:border-blue-500/45 dark:bg-blue-950/15 dark:border-blue-900/35"
              },
              { 
                title: "Continue Last Session", 
                desc: interviews[0] ? `Resume preparation for ${interviews[0].role.substring(0, 12)}...` : "Jump back to active practice.", 
                icon: <Clock className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform" />, 
                path: "/practice",
                color: "bg-indigo-500/5 border-indigo-500/15 hover:border-indigo-500/45 dark:bg-indigo-950/15 dark:border-indigo-900/35"
              },
              { 
                title: "AI Career Coach", 
                desc: "Analyze resume feedback, insights and scoring logs.", 
                icon: <Sparkles className="w-5 h-5 text-violet-500" />, 
                path: "/practice",
                color: "bg-violet-500/5 border-violet-500/15 hover:border-violet-500/45 dark:bg-violet-950/15 dark:border-violet-900/35"
              },
              { 
                title: "Performance Report", 
                desc: "Review comprehensive radar charts and AI feedback reports.", 
                icon: <Activity className="w-5 h-5 text-pink-500" />, 
                path: "/analytics",
                color: "bg-pink-500/5 border-pink-500/15 hover:border-pink-500/45 dark:bg-pink-950/15 dark:border-pink-900/35"
              }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`p-5 rounded-md border text-left ${action.color} flex flex-col justify-between h-36 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm group cursor-pointer relative overflow-hidden`}
              >
                <div className="p-2 rounded bg-brand-bg/85 border border-brand-border/40 w-fit shadow-sm">
                  {action.icon}
                </div>
                <div className="space-y-1 mt-4">
                  <h4 className="text-xs font-black text-brand-text flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                    {action.title}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h4>
                  <p className="text-[10px] text-brand-secondary font-medium leading-relaxed">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 6 — SKILL INTELLIGENCE DASHBOARD */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.2fr] gap-1.5">
          {/* Skill Radar Card */}
          <div className="bg-brand-card border border-brand-border rounded-lg p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-black text-brand-text">Skill Intelligence Radar</h3>
              <p className="text-[11px] text-brand-secondary font-medium mt-0.5">Real-time analytical representation of competency indicators.</p>
            </div>

            <div className="h-68 my-3 flex items-center justify-center select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke={resolvedTheme === "dark" ? "#1e293b" : "#cbd5e1"} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: resolvedTheme === "dark" ? "#94a3b8" : "#475569", fontSize: 9.5, fontWeight: "bold" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Candidate" 
                    dataKey="value" 
                    stroke={resolvedTheme === "dark" ? "#4F46E5" : "#4f46e5"} 
                    fill={resolvedTheme === "dark" ? "#6366F1" : "#6366f1"} 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-brand-border/40 pt-3.5 flex justify-between items-center text-[10px] text-brand-secondary font-semibold">
              <span>Updated automatically based on scoring metrics</span>
              <button onClick={() => navigate("/analytics")} className="text-xs font-black text-blue-500 hover:text-blue-600 flex items-center gap-1">
                View Deep Report <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Competency Card Metrics */}
          <div className="bg-brand-card border border-brand-border rounded-lg p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-black text-brand-text">Competency Scores</h3>
              <p className="text-[11px] text-brand-secondary font-medium mt-0.5">Evaluated proficiency parameters across targeted interview modules.</p>
            </div>

            <div className="space-y-4 my-4">
              {[
                { label: "Data Structures & Algorithms", value: dsaScore, color: "bg-blue-500", trend: "+4% vs last week" },
                { label: "Technical Communication", value: commScore, color: "bg-emerald-500", trend: "+2.5% vs last week" },
                { label: "Confidence & Presentation", value: confidenceScore, color: "bg-purple-500", trend: "+5% vs last week" },
                { label: "System Design & Scalability", value: systemDesignScore, color: "bg-violet-500", trend: "+6% vs last week" }
              ].map((skill, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-black text-brand-secondary">
                    <span className="truncate text-brand-text font-bold">{skill.label}</span>
                    <span className="text-brand-text font-extrabold">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-brand-bg border border-brand-border/40 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${skill.color} transition-all duration-1000`} 
                      style={{ width: `${skill.value}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-slate-300 font-bold">
                    <span>Target: 85%</span>
                    <span className="text-emerald-555 dark:text-emerald-450">{skill.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-brand-bg/50 rounded-md p-3 border border-brand-border/40 text-center">
              <span className="text-[10px] text-brand-secondary font-semibold block">Average Score: <strong className="text-brand-text font-black">{overallScore || 78}%</strong></span>
            </div>
          </div>
        </section>

        {/* SECTION 7 — ACHIEVEMENTS & AI INSIGHTS */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.5fr] gap-1.5">
          
          {/* Achievement Box */}
          <div className="bg-brand-card border border-brand-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-black text-brand-text mb-4">Achievements</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { title: `${interviews.length} Completed`, label: "Interviews Completed", desc: "Total prep sessions", color: "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                { title: `${completedInterviews} Cleared`, label: "Rounds Cleared", desc: "100% submission rate", color: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
                { title: currentRanking, label: "Top Ranking", desc: "Global ranking", color: "bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20" },
                { title: `${userStreak} Days`, label: "Longest Streak", desc: "Daily practice streak", color: "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20" }
              ].map((ach, idx) => (
                <div key={idx} className={`bg-brand-card ${ach.color} border p-3 rounded-md flex flex-col justify-between h-26 shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black tracking-tight">{ach.title}</span>
                    <Award className="w-4 h-4 opacity-75" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-brand-text tracking-tight leading-none">{ach.label}</h4>
                    <p className="text-[8.5px] text-brand-secondary mt-1 font-medium leading-none">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Recommendations */}
          <div className="bg-brand-card border border-brand-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-brand-text flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Today's AI Recommendations
              </h3>
              <p className="text-[11px] text-brand-secondary font-medium mt-0.5">Intelligent focus suggestions compiled from your latest scoring vectors.</p>
            </div>

            <div className="space-y-3.5 my-4">
              {getDynamicRecommendations().map((rec, i) => (
                <div key={i} className="flex gap-3 bg-brand-bg/45 p-3 rounded-md border border-brand-border/40 hover:border-brand-border transition duration-200">
                  <div className="h-6 w-6 rounded bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20 text-violet-500 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-brand-text truncate">{rec.title}</h4>
                      <span className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border/40 text-[8px] font-black text-brand-secondary uppercase tracking-wider">{rec.badge}</span>
                    </div>
                    <p className="text-[9.5px] text-brand-secondary mt-1 font-medium leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate("/practice")}
               className="w-full py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] rounded-sm font-black text-xs transition duration-150 cursor-pointer shadow-md"
            >
              Start Recommended Action ➔
            </button>
          </div>
        </section>

        {/* SECTION 8 — TARGET COMPANY PREPARATION */}
        <section className="space-y-1.5">
          <div>
            <h2 className="text-base font-black text-brand-text tracking-tight">Target Company Preparation</h2>
            <p className="text-xs text-brand-secondary font-medium mt-0.5">Resume custom prep guides mapped directly to matching recruitment requirements.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5">
            {[
              { name: "Google", offset: -3, focus: "Graphs & DSA", gap: "DFS/BFS trees", color: "border-blue-500/25 hover:border-blue-500 bg-blue-500/5" },
              { name: "Amazon", offset: 5, focus: "Leadership Principles", gap: "LP scenarios", color: "border-orange-500/25 hover:border-orange-500 bg-orange-500/5" },
              { name: "Meta", offset: -8, focus: "System Design", gap: "Distributed caching", color: "border-purple-500/25 hover:border-purple-500 bg-purple-500/5" },
              { name: "Microsoft", offset: 2, focus: "OOP & Architecture", gap: "Thread safety", color: "border-cyan-500/25 hover:border-cyan-500 bg-cyan-500/5" },
              { name: "Netflix", offset: -12, focus: "Scalability & Design", gap: "HLS video streaming", color: "border-rose-500/25 hover:border-rose-500 bg-rose-500/5" }
            ].map((comp, idx) => {
              const compScore = overallScore > 0 ? Math.min(Math.max(overallScore + comp.offset, 0), 99) : 0;
              return (
                <div key={idx} className={`bg-brand-card border ${comp.color} rounded-sm p-4.5 flex flex-col justify-between h-48 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm group`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[9px] font-black text-brand-secondary uppercase tracking-widest">{comp.name}</h4>
                      <h3 className="text-xs.5 sm:text-xs font-black text-brand-text mt-1 group-hover:text-amber-500 transition-colors">{comp.focus}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-brand-secondary font-black uppercase tracking-wider block">Score</span>
                      <span className="text-xs.5 font-black text-brand-text block mt-0.5">{compScore}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 border-t border-brand-border/40 pt-2.5">
                    <span className="text-[8px] text-brand-secondary font-black uppercase tracking-wider block">Skill Gap</span>
                    <p className="text-[9px] text-brand-secondary truncate font-semibold leading-none">{comp.gap}</p>
                  </div>
                  
                  <button
                    onClick={startNewInterview}
                    className="w-full py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] border border-[#F59E0B]/30 rounded-sm font-black text-[10px] transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Start Mock Interview
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 9 — ACTIVE RECRUITMENT PIPELINE */}
        <section className="bg-brand-card border border-brand-border rounded-sm p-6 shadow-sm transition-all duration-300">
          {activeParent ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-4">
                <div>
                  <h3 className="text-sm font-black text-brand-text">
                    Active Recruitment Pipeline: {activeParent.role}
                  </h3>
                  <p className="text-[11px] text-brand-secondary font-medium mt-0.5">
                    Track your recruitment progression, review round evaluations, and resume outstanding stages.
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/interview/${activeParent._id}/lobby`)}
                  className="px-4 py-2 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-black text-xs transition duration-150 shadow-md cursor-pointer self-start sm:self-center"
                >
                  Resume Interview Journey ➔
                </button>
              </div>

              <div className="relative pt-2 pb-6">
                {/* Animated horizontal connecter */}
                <div className="hidden md:block absolute top-[23px] left-12 right-12 h-1 bg-brand-bg border-t border-b border-brand-border/45 z-0 rounded-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 relative z-10">
                  {[
                    { key: "oa", label: "1. OA Round", desc: "Written Cognitive & Coding" },
                    { key: "tech1", label: "2. Technical Round 1", desc: "DSA & Interactive Live IDE" },
                    { key: "tech2", label: "3. Technical Round 2", desc: "System Design & Architecture" },
                    { key: "hr", label: "4. HR Round", desc: "Behavioral & Culture Fit" }
                  ].map((round, idx) => {
                    const metadata = activeParent?.phasesMetadata?.[round.key] || { completed: false, cleared: false, pending: false, score: 0 };
                    
                    // Lock logic
                    let unlocked = false;
                    if (round.key === "oa") unlocked = true;
                    else if (round.key === "tech1") unlocked = activeParent?.phasesMetadata?.oa?.cleared || false;
                    else if (round.key === "tech2") unlocked = activeParent?.phasesMetadata?.tech1?.cleared || false;
                    else if (round.key === "hr") unlocked = activeParent?.phasesMetadata?.tech2?.cleared || false;

                    let badgeColor = "text-slate-500 dark:text-slate-400 bg-brand-bg/40 border border-brand-border/40";
                    let stateText = "Locked 🔒";
                    let checkGlow = "border-brand-border/40 bg-brand-bg/40 text-slate-400 dark:text-slate-300";

                    if (!unlocked) {
                      stateText = "Locked 🔒";
                      badgeColor = "text-slate-500 dark:text-slate-400 bg-brand-bg/40 border border-brand-border/40";
                      checkGlow = "border-brand-border/40 bg-brand-bg/40 text-slate-400 dark:text-slate-300";
                    } else if (metadata.completed) {
                      if (metadata.pending) {
                        stateText = "Under Review ⏳";
                        badgeColor = "text-amber-500 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]";
                        checkGlow = "border-amber-500/30 bg-amber-500/10 text-amber-500";
                      } else if (metadata.cleared) {
                        stateText = round.key === "hr" ? "Hired 🎉" : "Passed ✓";
                        badgeColor = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]";
                        checkGlow = "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 animate-pulse";
                      } else {
                        stateText = "Failed ❌";
                        badgeColor = "text-rose-500 bg-rose-500/10 border border-rose-500/20";
                        checkGlow = "border-rose-500/30 bg-rose-500/10 text-rose-500";
                      }
                    } else {
                      stateText = "Available 📅";
                      badgeColor = "text-amber-600 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]";
                      checkGlow = "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-bounce";
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center text-center space-y-3 bg-brand-bg/45 p-4.5 rounded-sm border border-brand-border/40">
                        {/* Ring timeline connector node */}
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center border shadow-sm shrink-0 z-10 ${checkGlow}`}>
                          <span className="text-xs font-black">{idx + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-brand-text">{round.label}</h4>
                          <p className="text-[9px] text-brand-secondary font-semibold mt-0.5 leading-tight">{round.desc}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[8.5px] font-black uppercase tracking-wider mt-2.5 ${badgeColor}`}>
                            {stateText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center max-w-md mx-auto space-y-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-brand-text">No Active Recruitment Pipeline</h3>
                <p className="text-xs text-brand-secondary font-medium leading-relaxed">
                  Start an interview assessment to automatically generate and track your recruitment timeline here.
                </p>
              </div>
              <button
                onClick={startNewInterview}
                className="px-4 py-2 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-black text-xs transition duration-150 shadow-md cursor-pointer"
              >
                Configure Interview Assessment
              </button>
            </div>
          )}
        </section>

        {/* SECTION 10 — RECENT INTERVIEWS FEED */}
        <section className="space-y-1.5">
          <div>
            <h2 className="text-base font-black text-brand-text tracking-tight">Recent Interviews</h2>
            <p className="text-xs text-brand-secondary font-medium mt-0.5">Review history of standard sessions, score reports and evaluations.</p>
          </div>
          
          <div className="overflow-hidden rounded-sm border border-brand-border bg-brand-card p-1 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-secondary font-black uppercase tracking-widest text-[9px] bg-brand-bg/45">
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {scoredInterviews.slice(0, 5).map((iv, idx) => {
                    const isCompleted = iv.isCompleted;
                    const scorePct = iv.score;
                    
                    let status = "In Progress";
                    let statusColor = "text-amber-500 bg-amber-500/10 border border-amber-500/20";
                    
                    if (isCompleted) {
                      status = scorePct >= 80 ? "Passed" : scorePct >= 60 ? "Refining" : "Needs Prep";
                      statusColor = scorePct >= 80 
                        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" 
                        : scorePct >= 60 
                          ? "text-blue-500 bg-blue-500/10 border border-blue-500/20" 
                          : "text-purple-500 bg-purple-500/10 border border-purple-500/20";
                    }
                    
                    return (
                      <tr key={iv._id || idx} className="hover:bg-brand-bg/30 transition-colors font-medium">
                        <td className="py-3 px-4 font-bold text-brand-text flex items-center gap-2">
                          <div className="h-6 w-6 rounded-sm bg-brand-bg border border-brand-border/40 flex items-center justify-center shrink-0">
                            <Code2 className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          {iv.role}
                        </td>
                        <td className="py-3 px-4 text-brand-secondary font-bold uppercase text-[10px] tracking-wider">{iv.difficulty}</td>
                        <td className="py-3 px-4 text-brand-secondary font-bold">{formatDate(iv.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-sm text-[8.5px] font-black uppercase tracking-wider ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-brand-text text-[13px]">{isCompleted ? `${scorePct}/100` : "--"}</td>
                        <td className="py-3 px-4 text-right">
                          {isCompleted ? (
                            <button
                              onClick={() => navigate(`/interview/${iv._id}/responses`)}
                              className="px-3.5 py-1.5 bg-brand-bg hover:bg-brand-bg/85 text-brand-text rounded-sm border border-brand-border/40 transition-colors cursor-pointer"
                            >
                              View Analysis
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (iv.interviewType === "oa") {
                                  navigate(`/interview/${iv._id}/lobby`);
                                } else {
                                  navigate(`/interview/${iv._id}`);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-bold rounded-sm transition-colors cursor-pointer shadow-sm"
                            >
                              Resume
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {scoredInterviews.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400 font-semibold">
                        Launch an interview above to see dynamic dashboard data here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      {/* SECTION 11 — FOOTER */}
      <footer className="bg-brand-bg border-t border-brand-border px-4 py-3 mt-1.5 transition-colors duration-150">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider text-brand-secondary">
          <p>© 2026 Evalora AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-text transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-text transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-text transition-colors">System Status</a>
            <a href="#" className="hover:text-brand-text transition-colors">Support Center</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Dashboard;
