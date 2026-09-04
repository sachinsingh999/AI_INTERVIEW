import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  GraduationCap, 
  Link as LinkIcon, 
  Pencil, 
  Code2, 
  Star, 
  Target, 
  Flame, 
  Trophy, 
  Shield, 
  Rocket, 
  Bookmark, 
  CheckCircle2, 
  Quote, 
  X, 
  ArrowRight,
  LayoutDashboard,
  Activity,
  Sparkles,
  Calendar,
  BarChart3,
  Wrench,
  Award,
  FileText,
  UploadCloud
} from "lucide-react";
import { toast } from "../utils/toast";
import Navbar from "../components/Navbar";
import Message from "../components/Message";
import ContributionHeatmap from "../components/ContributionHeatmap";
import api from "../services/api";

const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF parser library."));
    document.head.appendChild(script);
  });
};

const extractTextFromPdf = async (file) => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(" ") + "\n";
  }
  return text;
};

const extractTextFromTxt = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEducation, setEditEducation] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Skill Add Input State
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Resume Analyzer States
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedResume, setParsedResume] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [analysisMode, setAnalysisMode] = useState("upload");

  // Fetch complete profile from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/profile");
      if (res.data) {
        setProfileData(res.data);
        const u = res.data.user || {};
        setEditName(u.name || "");
        setEditUsername(u.username || "");
        setEditBio(u.bio || "");
        setEditLocation(u.location || "");
        setEditEducation(u.education || "");
        setEditWebsite(u.website || "");

        if (u.resumeAnalysis) {
          setParsedResume(u.resumeAnalysis);
        }
        if (u.resumeText) {
          setResumeText(u.resumeText);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast.error("Could not fetch latest user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put("/users/profile", {
        name: editName,
        username: editUsername,
        bio: editBio,
        location: editLocation,
        education: editEducation,
        website: editWebsite
      });

      if (res.data) {
        toast.success("Profile details updated successfully!");
        setShowEditModal(false);
        fetchProfile();
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Skill Management (Add & Remove)
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim() || !profileData?.user) return;
    const currentSkills = profileData.user.skills || [];
    if (currentSkills.includes(newSkillInput.trim())) {
      toast.info("Skill already exists in your profile.");
      setNewSkillInput("");
      return;
    }

    const updatedSkills = [...currentSkills, newSkillInput.trim()];
    try {
      await api.put("/users/profile", { skills: updatedSkills });
      setProfileData(prev => ({
        ...prev,
        user: { ...prev.user, skills: updatedSkills }
      }));
      setNewSkillInput("");
      setShowSkillInput(false);
      toast.success(`Added ${newSkillInput.trim()} to your skills!`);
    } catch (err) {
      console.error("Error adding skill:", err);
      toast.error("Failed to add skill.");
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    if (!profileData?.user) return;
    const currentSkills = profileData.user.skills || [];
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);
    try {
      await api.put("/users/profile", { skills: updatedSkills });
      setProfileData(prev => ({
        ...prev,
        user: { ...prev.user, skills: updatedSkills }
      }));
      toast.success(`Removed ${skillToRemove}`);
    } catch (err) {
      console.error("Error removing skill:", err);
      toast.error("Failed to remove skill.");
    }
  };

  // Resume Parsing Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResume(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processResume(e.target.files[0]);
    }
  };

  const processResume = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'txt') {
      toast.warning("Supported formats are PDF and TXT.", "Format Warning");
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    try {
      let text = "";
      if (ext === 'pdf') {
        setUploadProgress(40);
        text = await extractTextFromPdf(file);
      } else {
        setUploadProgress(40);
        text = await extractTextFromTxt(file);
      }
      setUploadProgress(60);
      setResumeText(text);

      const res = await api.post("/users/analyze-resume", { resumeText: text });
      setUploadProgress(100);
      if (res.data && res.data.resumeAnalysis) {
        setParsedResume(res.data.resumeAnalysis);
        toast.success("Resume analyzed successfully!");
        fetchProfile();
      }
    } catch (err) {
      console.error("Resume error:", err);
      toast.error("Failed to parse resume.");
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          <div className="bg-brand-card border border-brand-border rounded-sm p-5 shadow-sm animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-brand-elevated" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-brand-elevated rounded-sm" />
                <div className="h-4 w-32 bg-brand-elevated rounded-sm" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const user = profileData?.user || {};
  const stats = profileData?.stats || {
    problemsSolved: profileData?.summary?.totalAnswered || 532,
    contestRating: 1640,
    mockInterviewsCompleted: 42,
    currentStreak: 136
  };
  const diff = profileData?.difficultyBreakdown || {
    easy: { solved: 312, total: 450 },
    medium: { solved: 180, total: 350 },
    hard: { solved: 40, total: 200 }
  };
  const activities = profileData?.recentActivities || [
    { id: "act-1", type: "Problem", title: "Solved Two Sum", subtitle: "2 hours ago", badge: "Easy", iconType: "check", badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    { id: "act-2", type: "Contest", title: "Participated in Weekly Contest 408", subtitle: "1 day ago", badge: "Contest", iconType: "trophy", badgeColor: "bg-brand-primary/15 text-brand-primary" },
    { id: "act-3", type: "Interview", title: "Completed a Mock Interview (Arrays)", subtitle: "2 days ago", badge: "Interview", iconType: "target", badgeColor: "bg-brand-secondary/15 text-brand-secondary" },
    { id: "act-4", type: "Problem", title: "Solved Binary Tree Maximum Path Sum", subtitle: "3 days ago", badge: "Hard", iconType: "check", badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
    { id: "act-5", type: "Bookmark", title: "Bookmarked System Design Notes", subtitle: "4 days ago", badge: "Resource", iconType: "bookmark", badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400" }
  ];

  const achievementBadges = [
    { id: "ach-1", title: "100 Problems", Icon: Shield, earned: true, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
    { id: "ach-2", title: "30 Day Streak", Icon: Flame, earned: true, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    { id: "ach-3", title: "5 Contests", Icon: Trophy, earned: true, color: "bg-brand-primary/10 text-brand-primary border-brand-primary/30" },
    { id: "ach-4", title: "Interview Pro", Icon: Target, earned: true, color: "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/30" },
    { id: "ach-5", title: "DSA Master", Icon: Star, earned: true, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    { id: "ach-6", title: "Early Adopter", Icon: Rocket, earned: true, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" }
  ];

  const renderActivityIcon = (iconType) => {
    if (iconType === "trophy") return <Trophy className="w-3.5 h-3.5" />;
    if (iconType === "target") return <Target className="w-3.5 h-3.5" />;
    if (iconType === "bookmark") return <Bookmark className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4">

        {/* 1. PROFILE HEADER CARD WITH COVER BANNER */}
        <section className="bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-slate-800/80 rounded-sm shadow-xs overflow-hidden space-y-0">
          
          {/* COVER BANNER */}
          <div className="h-44 sm:h-48 lg:h-52 bg-[#0B1120] relative flex items-start justify-between px-6 sm:px-10 pt-5 sm:pt-6 overflow-hidden select-none">
            
            {/* Left Banner Branding (Placed in top-left inline row with clean clearance) */}
            <div className="flex flex-wrap items-center gap-3 z-10">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="CodeForge Logo" className="h-8 w-auto object-contain shrink-0 filter drop-shadow-md" />
                <span className="text-white text-xl sm:text-2xl font-black tracking-wider font-sans">
                  CODEFORGE
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/15">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>DEVELOPER</span>
              </div>
            </div>

            {/* Center Banner Script Slogan */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
              <p className="font-serif italic text-slate-400/60 text-lg sm:text-xl tracking-widest leading-snug">
                Build. Solve. Grow.
              </p>
            </div>

            {/* Right Banner Mountain Silhouette & Moon Illustration */}
            <div className="relative z-10 flex items-center gap-6">
              {/* Slogan Text on Far Right */}
              <div className="text-right hidden sm:block">
                <p className="text-slate-300/80 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase leading-relaxed">
                  BETTER DEVELOPERS
                  <br />
                  BRIGHTER FUTURES
                </p>
                <div className="w-12 h-[2px] bg-indigo-500/80 ml-auto mt-1.5 rounded-full" />
              </div>

              {/* Glowing Purple Moon & Mountain Graphic (Blended) */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 relative shrink-0 overflow-hidden pointer-events-none -mr-2">
                <div className="absolute inset-0 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
                <svg className="w-full h-full relative z-10" viewBox="0 0 200 200" fill="none">
                  {/* Glowing Purple Moon */}
                  <circle cx="140" cy="65" r="35" fill="url(#moonGlow)" />
                  {/* Layered Mountains */}
                  <path d="M-20 200 L60 120 L130 180 L220 100 L240 200 Z" fill="#1E1B4B" opacity="0.7" />
                  <path d="M30 200 L120 90 L170 145 L220 200 Z" fill="#171435" opacity="0.9" />
                  <path d="M70 200 L140 75 L210 200 Z" fill="#0B1120" />
                  {/* Hiker Silhouette on Peak */}
                  <circle cx="138" cy="68" r="3" fill="#E0E7FF" />
                  <path d="M138 71 L138 79 M138 74 L134 78 M138 74 L142 77 M138 79 L135 85 M138 79 L141 85" stroke="#E0E7FF" strokeWidth="1.5" strokeLinecap="round" />
                  
                  <defs>
                    <radialGradient id="moonGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(140 65) rotate(90) scale(35)">
                      <stop stopColor="#A855F7" />
                      <stop offset="0.7" stopColor="#6366F1" />
                      <stop offset="1" stopColor="#312E81" stopOpacity="0.8" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Background Ambient Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#1E1B4B]/80 to-[#312E81]/60 pointer-events-none" />
          </div>

          {/* PROFILE IDENTITY & EDIT BUTTON ROW */}
          <div className="px-6 sm:px-10 pb-6 pt-0 relative space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              
              {/* Avatar & User Details */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
                
                {/* Circular Avatar (Only Avatar has negative top margin to overlap banner) */}
                <div className="relative shrink-0 w-36 h-36 sm:w-40 sm:h-40 rounded-full border-[5px] border-white dark:border-[#0B1120] shadow-lg bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#312E81] text-white flex items-center justify-center text-5xl sm:text-6xl font-extrabold overflow-hidden -mt-16 sm:-mt-20 z-20">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    (user.name || "T").charAt(0).toUpperCase()
                  )}
                  {/* Green Online Indicator */}
                  <span 
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-3 border-white dark:border-[#0B1120] shadow-xs" 
                    title="Online"
                  />
                </div>

                {/* User Info Column (Starts cleanly in white space below banner) */}
                <div className="space-y-2.5 pt-3 sm:pt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                      {user.name || "test"}
                    </h1>

                    <span className="px-3 py-1 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {user.username ? (user.username.startsWith("@") ? user.username : `@${user.username}`) : "@test"}
                    </span>

                    {/* Dynamic Rank Badge */}
                    <span className="bg-amber-50 dark:bg-amber-950/40 border border-amber-400/80 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-sm flex items-center gap-1.5 shadow-2xs">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>TOP 5% SOLVER</span>
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-normal text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {user.bio || "Software Engineer passionate about coding, algorithms, and system design."}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-5 pt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#F43F5E]" />
                      <span>{user.location || "San Francisco, CA"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#6366F1]" />
                      <span>{user.education || "B.S. Computer Science"}</span>
                    </span>
                    <a
                      href={(user.website || "github.com").startsWith("http") ? (user.website || "github.com") : `https://${user.website || "github.com"}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[#4F46E5] hover:underline transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 text-[#4F46E5]" />
                      <span>{(user.website || "github.com").replace(/^https?:\/\//, "")}</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Edit Profile Button (Positioned in white space on the right) */}
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-all shadow-md hover:shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 shrink-0 self-stretch sm:self-auto min-w-[160px] mt-4 sm:mt-6"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>

            </div>

            {/* DIVIDER */}
            <div className="h-[1px] w-full bg-[#E2E8F0] dark:bg-slate-800" />

            {/* STATISTICS SECTION (4 Equal-Width Cards matching reference layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Problems Solved */}
              <div className="p-4 rounded-sm bg-[#F0F5FF] dark:bg-slate-900/80 border border-indigo-100/80 dark:border-slate-800 flex items-center justify-between shadow-2xs group hover:border-indigo-300 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-sm bg-[#4F46E5] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none block">
                      {stats.problemsSolved}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-1">
                      Problems Solved
                    </span>
                  </div>
                </div>
                {/* Mini Bar Graph */}
                <div className="flex items-end gap-1 h-8 opacity-40 group-hover:opacity-75 transition-opacity">
                  <div className="w-1.5 h-3 bg-[#4F46E5] rounded-xs" />
                  <div className="w-1.5 h-5 bg-[#4F46E5] rounded-xs" />
                  <div className="w-1.5 h-4 bg-[#4F46E5] rounded-xs" />
                  <div className="w-1.5 h-7 bg-[#4F46E5] rounded-xs" />
                </div>
              </div>

              {/* Card 2: Contest Rating */}
              <div className="p-4 rounded-sm bg-[#F7F0FF] dark:bg-slate-900/80 border border-purple-100/80 dark:border-slate-800 flex items-center justify-between shadow-2xs group hover:border-purple-300 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-sm bg-[#7C3AED] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                    <Star className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none block">
                      {stats.contestRating}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-1">
                      Contest Rating
                    </span>
                  </div>
                </div>
                {/* Mini Wave Graph SVG */}
                <svg className="w-14 h-8 text-[#7C3AED] opacity-40 group-hover:opacity-75 transition-opacity" viewBox="0 0 60 30" fill="none">
                  <path d="M0 25 C15 25, 20 10, 35 15 C45 20, 50 5, 60 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 25 C15 25, 20 10, 35 15 C45 20, 50 5, 60 8 V30 H0 Z" fill="currentColor" opacity="0.2" />
                </svg>
              </div>

              {/* Card 3: Mock Interviews */}
              <div className="p-4 rounded-sm bg-[#FFF0F3] dark:bg-slate-900/80 border border-rose-100/80 dark:border-slate-800 flex items-center justify-between shadow-2xs group hover:border-rose-300 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-sm bg-[#F43F5E] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none block">
                      {stats.mockInterviewsCompleted}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-1">
                      Mock Interviews
                    </span>
                  </div>
                </div>
                {/* Mini Wave Graph SVG */}
                <svg className="w-14 h-8 text-[#F43F5E] opacity-40 group-hover:opacity-75 transition-opacity" viewBox="0 0 60 30" fill="none">
                  <path d="M0 20 C10 28, 25 5, 40 18 C50 25, 55 10, 60 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 20 C10 28, 25 5, 40 18 C50 25, 55 10, 60 12 V30 H0 Z" fill="currentColor" opacity="0.2" />
                </svg>
              </div>

              {/* Card 4: Day Streak */}
              <div className="p-4 rounded-sm bg-[#FFF8F0] dark:bg-slate-900/80 border border-amber-100/80 dark:border-slate-800 flex items-center justify-between shadow-2xs group hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-sm bg-[#F97316] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                    <Flame className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none block">
                      {stats.currentStreak}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-1">
                      Day Streak
                    </span>
                  </div>
                </div>
                {/* Mini Bar Graph */}
                <div className="flex items-end gap-1 h-8 opacity-40 group-hover:opacity-75 transition-opacity">
                  <div className="w-1.5 h-2 bg-[#F97316] rounded-xs" />
                  <div className="w-1.5 h-4 bg-[#F97316] rounded-xs" />
                  <div className="w-1.5 h-6 bg-[#F97316] rounded-xs" />
                  <div className="w-1.5 h-8 bg-[#F97316] rounded-xs" />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3. SUB-TAB NAVIGATION */}
        <div className="flex items-center gap-1.5 p-1 bg-brand-card border border-brand-border rounded-sm overflow-x-auto no-scrollbar shadow-xs">
          {[
            { id: "overview", label: "Overview", Icon: LayoutDashboard },
            { id: "solved", label: "Solved Problems", Icon: Code2 },
            { id: "contests", label: "Contests", Icon: Trophy },
            { id: "interviews", label: "Interviews", Icon: Target },
            { id: "activity", label: "Activity", Icon: Activity },
            { id: "resume", label: "AI Resume Intelligence", Icon: Sparkles }
          ].map((tab) => {
            const TabIcon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-xs cursor-pointer shrink-0 flex items-center gap-2 ${
                  isActive
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-elevated/70 font-bold"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. OVERVIEW TAB GRID */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* LEFT COLUMN (SPAN 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* SOLVING ACTIVITY HEATMAP */}
              <ContributionHeatmap 
                contributionData={profileData?.contributionHeatmap || {}} 
                streakCount={stats.currentStreak} 
              />

              {/* RECENT ACTIVITY FEED */}
              <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-sm font-black text-brand-text tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-primary" />
                    <span>Recent Activity</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab("activity")}
                    className="text-xs font-bold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-3.5 rounded-sm bg-brand-elevated border border-brand-border hover:border-brand-primary/30 transition-all gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center text-xs font-black shrink-0">
                          {renderActivityIcon(act.iconType)}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-brand-text">
                            {act.title}
                          </h4>
                          <p className="text-[10px] font-semibold text-brand-muted mt-0.5">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-brand-muted hidden sm:inline">
                          {act.date ? new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${act.badgeColor || "bg-brand-primary/15 text-brand-primary"}`}>
                          {act.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN (SPAN 4) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* CURRENT STATS (DIFFICULTY BREAKDOWN) */}
              <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-sm font-black text-brand-text tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-brand-primary" />
                    <span>Current Stats</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab("solved")}
                    className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Easy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Easy
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-body font-extrabold">
                          {diff.easy.solved} / {diff.easy.total}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                          {Math.round((diff.easy.solved / diff.easy.total) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-brand-input rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((diff.easy.solved / diff.easy.total) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-brand-primary">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" /> Medium
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-body font-extrabold">
                          {diff.medium.solved} / {diff.medium.total}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-black">
                          {Math.round((diff.medium.solved / diff.medium.total) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-brand-input rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((diff.medium.solved / diff.medium.total) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Hard */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hard
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-body font-extrabold">
                          {diff.hard.solved} / {diff.hard.total}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                          {Math.round((diff.hard.solved / diff.hard.total) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-brand-input rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((diff.hard.solved / diff.hard.total) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SKILLS CARD */}
              <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                  <h3 className="text-sm font-black text-brand-text tracking-tight flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-brand-primary" />
                    <span>Skills</span>
                  </h3>
                  <button
                    onClick={() => setShowSkillInput(!showSkillInput)}
                    className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    {showSkillInput ? "Cancel" : "Edit"}
                  </button>
                </div>

                {showSkillInput && (
                  <form onSubmit={handleAddSkill} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. C++, Python, System Design..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      className="flex-1 bg-brand-input border border-brand-border text-xs font-bold rounded-sm px-3 py-1.5 outline-none focus:border-brand-primary text-brand-text"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black uppercase rounded-sm cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                )}

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {(user.skills || ["C++", "Python", "Java", "Data Structures", "Algorithms", "System Design", "SQL", "Web Development"]).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-elevated border border-brand-border hover:border-brand-primary/40 text-xs font-bold text-brand-body shadow-2xs transition-colors"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-brand-muted hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </section>

              {/* ACHIEVEMENTS GRID CARD */}
              <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                  <h3 className="text-sm font-black text-brand-text tracking-tight flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-primary" />
                    <span>Achievements</span>
                  </h3>
                  <span className="text-xs font-bold text-brand-primary flex items-center gap-1 cursor-pointer">
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {achievementBadges.map((ach) => {
                    const IconComp = ach.Icon;
                    return (
                      <div
                        key={ach.id}
                        className={`p-2.5 rounded-sm border text-center space-y-1.5 transition-all hover:scale-[1.03] shadow-2xs flex flex-col items-center justify-center ${ach.color}`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] font-black block leading-tight truncate w-full">
                          {ach.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* GOALS CARD */}
              <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                  <h3 className="text-sm font-black text-brand-text tracking-tight flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-primary" />
                    <span>Goals</span>
                  </h3>
                  <span className="text-xs font-bold text-brand-primary cursor-pointer">Edit</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-brand-body">
                      <span>Solve 700 problems</span>
                      <span className="text-brand-primary font-black">532 / 700 (76%)</span>
                    </div>
                    <div className="h-2 w-full bg-brand-input rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-[76%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-brand-body">
                      <span>Participate in 5 contests</span>
                      <span className="text-brand-primary font-black">3 / 5 (60%)</span>
                    </div>
                    <div className="h-2 w-full bg-brand-input rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-[60%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-brand-body">
                      <span>Complete 10 mock interviews</span>
                      <span className="text-brand-primary font-black">4 / 10 (40%)</span>
                    </div>
                    <div className="h-2 w-full bg-brand-input rounded-full overflow-hidden p-0.5 border border-brand-border/40">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-[40%]" />
                    </div>
                  </div>
                </div>
              </section>

              {/* MOTIVATION QUOTE CARD */}
              <div className="rounded-sm border border-brand-border bg-gradient-to-br from-brand-elevated via-brand-card to-brand-elevated p-4 space-y-2 shadow-2xs">
                <Quote className="w-4 h-4 text-brand-primary" />
                <p className="text-xs font-semibold text-brand-body italic leading-relaxed">
                  Discipline today creates opportunities tomorrow.
                </p>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">— Keep Building</p>
              </div>

            </div>

          </div>
        )}

        {/* OTHER SUB-TABS */}
        {activeTab === "solved" && (
          <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-brand-text tracking-tight">
              Solved Problems History
            </h3>
            <div className="space-y-2">
              {[
                { title: "Two Sum", difficulty: "Easy", topic: "Arrays & Hash Table", date: "2 hours ago" },
                { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", topic: "Trees & DFS", date: "3 days ago" },
                { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Sliding Window", date: "5 days ago" },
                { title: "Trapping Rain Water", difficulty: "Hard", topic: "Two Pointers", date: "1 week ago" }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-brand-elevated rounded-sm border border-brand-border flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-brand-text">{item.title}</h4>
                    <span className="text-[10px] font-bold text-brand-muted">{item.topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${item.difficulty === "Easy" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : item.difficulty === "Medium" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
                      {item.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-brand-muted">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "contests" && (
          <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-brand-text tracking-tight">
              Contests & Ranking History
            </h3>
            <div className="p-4 bg-brand-elevated rounded-sm border border-brand-border flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-brand-text">Weekly Contest 408</h4>
                <span className="text-[10px] font-bold text-brand-muted">Rank: #142 / 3,450 · Score: 1640</span>
              </div>
              <span className="text-xs font-black text-amber-500">+35 Rating</span>
            </div>
          </section>
        )}

        {activeTab === "interviews" && (
          <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-brand-text tracking-tight">
              Completed Mock Interviews
            </h3>
            <div className="p-4 bg-brand-elevated rounded-sm border border-brand-border flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-brand-text">Full Stack Software Engineer Assessment</h4>
                <span className="text-[10px] font-bold text-brand-muted">4 / 4 Questions Answered · Average Score: 8.5/10</span>
              </div>
              <button 
                onClick={() => navigate("/history")}
                className="text-xs font-black text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Report</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        )}

        {activeTab === "activity" && (
          <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-brand-text tracking-tight">
              Full Activity Timeline
            </h3>
            <div className="space-y-2">
              {activities.map((act) => (
                <div key={act.id} className="p-3 bg-brand-elevated rounded-sm border border-brand-border flex justify-between">
                  <span className="text-xs font-bold text-brand-text">{act.title}</span>
                  <span className="text-[10px] font-bold text-brand-muted">{act.subtitle}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "resume" && (
          <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-brand-text tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span>AI Resume Intelligence</span>
              </h3>
              <p className="text-xs text-brand-muted font-semibold mt-0.5">
                Upload your resume PDF/TXT to analyze skills match rating.
              </p>
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`rounded-sm border-2 border-dashed p-8 text-center transition ${
                dragActive ? "border-brand-primary bg-brand-primary/5" : "border-brand-border"
              }`}
            >
              <input type="file" id="file-up" onChange={handleFileChange} accept=".pdf,.txt" className="hidden" />
              <label htmlFor="file-up" className="cursor-pointer block space-y-3">
                <UploadCloud className="w-10 h-10 text-brand-primary mx-auto" />
                <span className="text-xs font-black text-brand-text block">Drag PDF/TXT file here or click to browse</span>
              </label>
            </div>
          </section>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSavingProfile && setShowEditModal(false)}
          />

          <div className="relative w-full max-w-lg bg-brand-card border border-brand-border rounded-sm p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-xs font-black text-brand-text uppercase tracking-wider">
                Edit Developer Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-brand-input border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="@sachin_dev"
                    className="w-full bg-brand-input border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-muted">
                  Bio Summary
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Short bio description..."
                  className="w-full bg-brand-input border border-brand-border rounded-sm p-3 text-xs font-semibold text-brand-text outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="India"
                    className="w-full bg-brand-input border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Education
                  </label>
                  <input
                    type="text"
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    placeholder="B.Tech CSE"
                    className="w-full bg-brand-input border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-muted">
                  Personal Website / Portfolio
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="sachinkumar.dev"
                  className="w-full bg-brand-input border border-brand-border rounded-sm px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-sm text-xs font-bold text-brand-muted hover:text-brand-text cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-sm bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

