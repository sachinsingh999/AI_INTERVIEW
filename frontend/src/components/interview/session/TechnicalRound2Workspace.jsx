import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../Logo";
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Check,
  Bot,
  FileText,
  Brain,
  Volume2,
  Mic,
  Video,
  Wifi,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Lock,
  ChevronRight,
  Sliders,
  GitFork,
  Target,
  Activity,
  Award,
  User,
  GraduationCap,
  Briefcase,
  Clock,
  HelpCircle,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";

export default function TechnicalRound2Workspace({
  interviewId,
  role = "Senior Frontend Engineer",
  difficulty = "Adaptive",
  timeLeftSeconds,
  resumeAnalysis,
  onCompletePhase
}) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Staggered initialization checklist for the overlay
  const initSteps = [
    { label: "Loading Candidate Profile", key: "profile" },
    { label: "Loading Resume Insights", key: "insights" },
    { label: "Preparing Interview Strategy", key: "strategy" },
    { label: "Connecting AI Interview Agent", key: "agent" },
    { label: "Synchronizing Interview Session", key: "sync" },
    { label: "Generating First Question", key: "question" }
  ];

  // Simulated loading process when Start button is clicked
  useEffect(() => {
    if (!isInitializing) return;

    const interval = setInterval(() => {
      setInitProgress((prev) => {
        const next = prev + 1.5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onCompletePhase) {
              onCompletePhase();
            }
          }, 600);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isInitializing, onCompletePhase]);

  // Sync active step based on progress percentage
  useEffect(() => {
    if (!isInitializing) return;
    const stepCount = initSteps.length;
    const calculatedIndex = Math.min(
      Math.floor((initProgress / 100) * stepCount),
      stepCount - 1
    );
    setActiveStepIndex(calculatedIndex);
  }, [initProgress, isInitializing]);

  const handleStartInterview = () => {
    setIsInitializing(true);
    setInitProgress(0);
    setActiveStepIndex(0);
  };

  // Process candidateInfo dynamically from resumeAnalysis prop, with fallback defaults
  const parsedEducation = Array.isArray(resumeAnalysis?.education)
    ? resumeAnalysis.education
        .map((edu) => `${edu.degree || edu.degreeName || ""} at ${edu.school || edu.institution || ""}`)
        .filter(Boolean)
        .join(", ")
    : typeof resumeAnalysis?.education === "string"
    ? resumeAnalysis.education
    : resumeAnalysis?.education?.degree
    ? `${resumeAnalysis.education.degree}${resumeAnalysis.education.school ? ` at ${resumeAnalysis.education.school}` : ""}`
    : "Not specified";

  const candidateInfo = {
    name: resumeAnalysis?.name || "Candidate Profile",
    education: parsedEducation || "Not specified",
    experience: resumeAnalysis?.experience || (resumeAnalysis?.experienceYears ? `${resumeAnalysis.experienceYears} Years of Experience` : "Not specified"),
    certificates: resumeAnalysis?.certifications || resumeAnalysis?.certificates || "None detected",
    skills: Array.isArray(resumeAnalysis?.skills) && resumeAnalysis.skills.length > 0
      ? resumeAnalysis.skills
      : ["React", "Node.js", "TypeScript", "Next.js", "Express", "System Design"],
    projectsCount: resumeAnalysis?.projectsCount || (Array.isArray(resumeAnalysis?.projects) ? resumeAnalysis.projects.length : 0)
  };

  // Timeline steps configuration
  const timelineSteps = [
    { title: "Resume Analysis", status: "completed", desc: "AI-parsed insights saved" },
    { title: "Interview Preparation", status: "completed", desc: "Environment calibrated" },
    { title: "AI Introduction", status: "active", desc: "Setting context & structure" },
    { title: "Resume Discussion", status: "upcoming", desc: "Exploring experience & roles" },
    { title: "Technical Skills", status: "upcoming", desc: "Core language & system questions" },
    { title: "Project Deep Dive", status: "upcoming", desc: "Detailed discussion on architecture" },
    { title: "Adaptive Follow-up Questions", status: "upcoming", desc: "Probing responses dynamically" },
    { title: "Final AI Evaluation", status: "upcoming", desc: "Comprehensive score compiling" }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-card/85 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <Logo />
            <div className="h-4 w-[1px] bg-brand-border" />
            <span className="text-[9px] font-mono font-bold bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              Technical Round 2
            </span>
          </div>

          {/* Header Badges */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              AI Agent Online
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-card border border-brand-border text-[10px] font-mono font-bold text-brand-secondary">
              <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 stroke-[3]" />
              Resume Verified
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-card border border-brand-border text-[10px] font-mono font-bold text-brand-secondary">
              <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 stroke-[3]" />
              System Ready
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Welcome Header & Summary Cards */}
        <section className="lg:col-span-8 space-y-8 flex flex-col justify-start">
          
          {/* Main Header / Welcome */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Phase 3 • Technical Assessment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text flex items-center gap-3">
              Technical Round 2
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            </h1>
            <h2 className="text-lg font-bold text-brand-secondary">AI Technical Interview</h2>
            <p className="text-sm text-brand-secondary leading-relaxed max-w-2xl font-medium">
              Your resume has been successfully analyzed. Today's interview will be personalized based on your projects, technical skills, and experience.
            </p>
          </motion.div>

          {/* Welcome Message Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-brand-card border border-brand-border rounded-xl p-5 relative overflow-hidden"
          >
            {/* Subtle border accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/30" />
            
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-text">AI Welcome Message</h3>
                <p className="text-xs text-brand-secondary leading-relaxed font-medium">
                  Welcome to Technical Round 2. Our AI has carefully analyzed your resume and prepared a personalized interview tailored to your technical skills, projects, and experience. The interview will adapt dynamically based on your responses. Take your time, explain your thinking clearly, and answer naturally. We wish you the very best.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Resume Insights Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-sm font-bold text-brand-text tracking-tight flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    Resume Insights
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Verified Summary
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-brand-border/40 pb-2">
                    <span className="text-brand-secondary font-medium">Candidate Name</span>
                    <span className="text-brand-text font-bold">{candidateInfo.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-2">
                    <span className="text-brand-secondary font-medium">Role Applied</span>
                    <span className="text-brand-text font-bold">{role}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-2">
                    <span className="text-brand-secondary font-medium">Experience</span>
                    <span className="text-brand-text font-bold">{candidateInfo.experience}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-brand-border/40 pb-2">
                    <span className="text-brand-secondary font-medium">Education</span>
                    <span className="text-brand-text font-bold truncate max-w-full leading-normal">{candidateInfo.education}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-2">
                    <span className="text-brand-secondary font-medium">Projects Found</span>
                    <span className="text-brand-text font-bold">{candidateInfo.projectsCount} Projects</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-brand-secondary font-medium">Primary Skills Detected</span>
                    <div className="flex flex-wrap gap-1">
                      {candidateInfo.skills.slice(0, 9).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full bg-brand-bg border border-brand-border text-[10px] font-bold text-brand-secondary tracking-tight"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidateInfo.skills.length > 9 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          +{candidateInfo.skills.length - 9} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pt-1.5">
                    <span className="text-brand-secondary font-medium">Certificates Detected</span>
                    <span className="text-[11px] text-brand-text font-bold leading-normal">
                      {candidateInfo.certificates}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-auto">
                <button
                  type="button"
                  className="w-full py-2 bg-brand-bg hover:bg-slate-100 dark:hover:bg-slate-800 border border-brand-border text-xs font-bold text-brand-text rounded-lg transition duration-200 cursor-pointer text-center"
                >
                  View Resume Insights
                </button>
              </div>
            </motion.div>

            {/* AI Interview Agent Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-sm font-bold text-brand-text tracking-tight flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    AI Interview Agent
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-555 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1 w-1 bg-emerald-555 dark:bg-emerald-400 rounded-full animate-ping" />
                    Online
                  </span>
                </div>

                {/* Avatar and Info Grid */}
                <div className="flex flex-col gap-4">
                  {/* Bot Avatar Section */}
                  <div className="flex items-center gap-3 bg-brand-bg/50 p-3 rounded-lg border border-brand-border">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white relative shadow-md">
                      <Bot className="h-5 w-5" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 border-2 border-brand-card rounded-full" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-brand-text block">Interview Agent #7</span>
                      <span className="text-[10px] font-mono text-brand-secondary block font-medium">Model: Gemini 3.5 Pro (Adaptive)</span>
                    </div>
                  </div>

                  {/* Overview details */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-brand-border/40 pb-2">
                      <span className="text-brand-secondary font-medium">Interview Type</span>
                      <span className="text-brand-text font-bold">Resume Based</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-border/40 pb-2">
                      <span className="text-brand-secondary font-medium">Question Strategy</span>
                      <span className="text-brand-text font-bold">Adaptive</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-border/40 pb-2">
                      <span className="text-brand-secondary font-medium">Follow-up Questions</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">Enabled</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-border/40 pb-2">
                      <span className="text-brand-secondary font-medium">Evaluation</span>
                      <span className="text-brand-text font-bold">Post Interview AI Analysis</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-brand-secondary font-medium">Session Status</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold font-mono uppercase tracking-wider text-[11px]">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-auto space-y-3.5">
                {/* Bot Meta Info */}
                <div className="bg-brand-bg p-2.5 rounded-lg border border-brand-border flex items-center gap-2 text-[10px] text-brand-secondary font-medium">
                  <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Estimated duration: 20–30 Minutes. Session difficulty adjusts dynamically.</span>
                </div>
                <button
                  type="button"
                  className="w-full py-2 bg-brand-bg hover:bg-slate-100 dark:hover:bg-slate-800 border border-brand-border text-xs font-bold text-brand-text rounded-lg transition duration-200 cursor-pointer text-center"
                >
                  Configure Audio Settings
                </button>
              </div>
            </motion.div>
          </div>

          {/* Interview Brief Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-brand-card border border-brand-border rounded-xl p-5"
          >
            <h3 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3 mb-4 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              Interview Brief
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3.5 text-xs text-brand-secondary">
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Questions are generated using your resume profile.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <GitFork className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Your answers influence future questions in real-time.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <Briefcase className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Projects listed in the resume may be discussed in depth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <Sliders className="h-3 w-3" />
                  </div>
                  <span className="font-medium">The AI interviewer adapts continuously to your experience level.</span>
                </li>
              </ul>

              <ul className="space-y-3.5 text-xs text-brand-secondary">
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <Cpu className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Core technical concepts and design patterns will be explored.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <Lock className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Every answer will be securely stored and parsed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                    <Activity className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Final evaluation report happens after the interview ends.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Right Column (4 cols): Timeline, Readiness & Rules */}
        <aside className="lg:col-span-4 space-y-8 flex flex-col justify-start">
          
          {/* Vertical Timeline Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-brand-card border border-brand-border rounded-xl p-5"
          >
            <h3 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              Interview Timeline
            </h3>

            {/* Vertical Timeline */}
            <div className="space-y-5 relative pl-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-brand-border">
              {timelineSteps.map((step, idx) => {
                const isCompleted = step.status === "completed";
                const isActive = step.status === "active";

                return (
                  <div key={step.title} className="relative flex flex-col text-xs leading-normal">
                    {/* Node Dot / Icon */}
                    <div className="absolute -left-[14px] -translate-x-1/2 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-card z-10">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 fill-brand-card z-20" />
                      ) : isActive ? (
                        <span className="relative flex h-2.5 w-2.5 items-center justify-center bg-brand-card rounded-full z-20">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400/30 opacity-75 animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                        </span>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-brand-border z-20" />
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold ${isActive ? "text-brand-text" : isCompleted ? "text-brand-text/90" : "text-brand-secondary/60"}`}>
                          {step.title}
                        </span>
                        {isCompleted && (
                          <span className="text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold">↓</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-secondary font-medium">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* System Readiness Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-brand-card border border-brand-border rounded-xl p-5"
          >
            <h3 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              System Readiness
            </h3>

            <ul className="space-y-2.5">
              {[
                "Resume Processed",
                "AI Interview Plan Generated",
                "AI Agent Connected",
                "Microphone Ready",
                "Camera Ready",
                "Stable Internet"
              ].map((checkItem) => (
                <li
                  key={checkItem}
                  className="flex items-center justify-between p-2 rounded-lg bg-brand-bg border border-brand-border"
                >
                  <span className="text-xs text-brand-text font-medium">{checkItem}</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-555 dark:text-emerald-400">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Interview Rules Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-brand-card border border-brand-border rounded-xl p-5"
          >
            <h3 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              Interview Rules
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { text: "Speak clearly during response times.", icon: Volume2 },
                { text: "Take your time and think before answering.", icon: Brain },
                { text: "The AI agent may ask adaptive follow-up questions.", icon: HelpCircle },
                { text: "Do not refresh or exit the browser window.", icon: RefreshCw },
                { text: "Ensure your microphone remains enabled.", icon: Mic },
                { text: "Maintain a stable internet connection throughout.", icon: Wifi },
                { text: "Be honest and detailed while answering.", icon: ShieldCheck }
              ].map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-brand-bg border border-brand-border hover:border-blue-500/40 transition duration-150"
                >
                  <div className="h-6 w-6 rounded bg-brand-card border border-brand-border flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
                    <rule.icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] text-brand-secondary font-medium leading-normal pt-0.5">
                    {rule.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </aside>
      </main>

      {/* Bottom Checklist & Primary Action Bar */}
      <footer className="mt-auto border-t border-brand-border bg-brand-card px-6 py-6 sticky bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Horizontal Checklist */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              "Resume Analyzed",
              "AI Ready",
              "Microphone Ready",
              "Camera Ready",
              "Internet Stable",
              "Instructions Read"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[11px] font-bold text-brand-secondary bg-brand-bg border border-brand-border px-2.5 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-555 dark:text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto flex justify-center">
            <button
              onClick={handleStartInterview}
              className="w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition duration-200 cursor-pointer shadow-md border border-transparent"
            >
              Start AI Interview
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Initialization Fullscreen Overlay */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-6"
          >
            {/* Ambient subtle glow backdrops */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg bg-brand-card border border-brand-border rounded-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-600" />

              <div className="space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 mx-auto animate-pulse">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-brand-text tracking-tight">
                    Launching AI Interview...
                  </h3>
                  <p className="text-xs text-brand-secondary max-w-sm mx-auto leading-normal">
                    Calibrating questions and establishing a secure communication link with the AI Interview Agent.
                  </p>
                </div>

                {/* Staggered Checklist */}
                <div className="space-y-2.5">
                  {initSteps.map((step, idx) => {
                    const isDone = idx < activeStepIndex;
                    const isCurrent = idx === activeStepIndex;

                    return (
                      <div
                        key={step.key}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition duration-200 ${
                          isCurrent
                            ? "bg-blue-500/5 border-blue-500/30 text-blue-600 dark:text-blue-300 font-bold"
                            : isDone
                            ? "bg-brand-bg border border-brand-border text-brand-secondary font-medium"
                            : "bg-brand-bg/50 border border-brand-border/60 text-brand-secondary/40 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <RefreshCw className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-brand-border bg-brand-bg shrink-0" />
                          )}
                          <span className="text-xs">{step.label}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase">
                          {isDone ? "Completed" : isCurrent ? "Loading" : "Queued"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar container */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-brand-secondary font-mono">
                    <span>Calibration Progress</span>
                    <span>{Math.round(initProgress)}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-brand-bg border border-brand-border overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      style={{ width: `${initProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

