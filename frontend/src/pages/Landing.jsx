import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { isAuthenticated } from "../components/ProtectedRoute";
import {
  Sun,
  Moon,
  Sparkles,
  Play,
  ArrowRight,
  Bot,
  Code2,
  FileText,
  BarChart3,
  Target,
  Users,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Brain,
  Star,
  Check,
  Award,
  Briefcase,
  Terminal,
  ShieldCheck,
  Zap,
  Cpu
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import IntervexaHeroPreview from "../components/landing/IntervexaHeroPreview";
import IntervexaCodingPreview from "../components/landing/IntervexaCodingPreview";

export default function Landing() {
  const navigate = useNavigate();
  const signedIn = isAuthenticated();
  const { resolvedTheme, setTheme } = useTheme();
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const stats = [
    {
      value: "10,000+",
      label: "Active Candidates",
      sub: "Practicing weekly",
      icon: Users,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
    },
    {
      value: "500,000+",
      label: "AI Questions Generated",
      sub: "Across all tech stacks",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
    },
    {
      value: "95.4%",
      label: "Candidate Satisfaction",
      sub: "Verified feedback",
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
    },
    {
      value: "3.2×",
      label: "Faster Offer Timeline",
      sub: "Compared to solo prep",
      icon: Target,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Choose Role & Company",
      desc: "Select SDE, Frontend, Backend, or Full Stack, and calibrate difficulty to your target company.",
      tag: "Target Calibration",
      icon: Target
    },
    {
      step: "02",
      title: "Upload Resume & Projects",
      desc: "Our AI scans your tech stack, system experience, and past projects to tailor hyper-specific questions.",
      tag: "AI Context Scan",
      icon: FileText
    },
    {
      step: "03",
      title: "Take Real Mock Sessions",
      desc: "Live coding in C++, Python, Java & JS with real-time compilers, test cases, and behavioral video prompts.",
      tag: "Live Simulation",
      icon: Code2
    },
    {
      step: "04",
      title: "Get Instant Actionable Scorecard",
      desc: "Receive algorithmic efficiency breakdowns, STAR method articulation scores, and step-by-step solutions.",
      tag: "Detailed Analytics",
      icon: BarChart3
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "SDE Intern • Hired @ Flipkart",
      image: "/priya.jpg",
      quote:
        "“The resume-specific DSA questions were uncanny — almost identical to what I was asked in my real technical round. The instant feedback pinpointed my time complexity gaps.”",
      company: "Flipkart"
    },
    {
      name: "Rohit Mehta",
      role: "Software Engineer • Hired @ Amazon",
      image: "/rohit.jpg",
      quote:
        "“The live coding environment with custom test cases felt exactly like Amazon's Chime interview. Practicing under the timer eliminated my interview anxiety completely.”",
      company: "Amazon"
    },
    {
      name: "Aman Verma",
      role: "Frontend Engineer • Hired @ Microsoft",
      image: "/aman.jpg",
      quote:
        "“Intervexa is the cleanest interview prep tool I've used. From STAR behavioral prompts to system design trade-offs, it covers every single round in one place.”",
      company: "Microsoft"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FE] dark:bg-[#0B0E1B] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 relative overflow-x-hidden transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0E1B]/85 backdrop-blur-xl transition-all">
        <div className="w-full flex items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Logo className="h-8" />
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Features
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("coding-preview");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Live Coding
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              How it Works
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("testimonials");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Success Stories
            </button>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-dropdown-in">
                  <button
                    onClick={() => {
                      navigate("/practice");
                      setResourcesOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Question Bank
                  </button>
                  <button
                    onClick={() => {
                      navigate("/practice/coding");
                      setResourcesOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    DSA Sandbox
                  </button>
                  <button
                    onClick={() => {
                      navigate("/practice/aptitude");
                      setResourcesOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Aptitude Tests
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {signedIn ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Log in
              </button>
            )}

            <button
              onClick={() => navigate(signedIn ? "/create-interview" : "/register")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-center">
          
          {/* Left Column: Clean Headline & Value Prop (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600" />
              <span>AI-POWERED INTERVIEW PREPARATION</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Practice Smarter.
              <br />
              Get Hired{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Faster.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Realistic AI mock interviews, live compiler with real-time test cases, and personalized feedback engineered to help you crack technical and behavioral rounds at top tech companies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(signedIn ? "/create-interview" : "/register")}
                className="inline-flex items-center gap-2 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <span>Start Free Practice</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = document.getElementById("coding-preview");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-sm bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                <span>Try Live Coding Demo</span>
              </motion.button>
            </div>

            {/* Premium Social Proof Strip (Clean replacement for icon clutter) */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs select-none">
              <div className="flex items-center -space-x-2">
                <img
                  src="/aman.jpg"
                  alt="Candidate"
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-[#0B0E1B] object-cover shadow-2xs"
                />
                <img
                  src="/priya.jpg"
                  alt="Candidate"
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-[#0B0E1B] object-cover shadow-2xs"
                />
                <img
                  src="/rohit.jpg"
                  alt="Candidate"
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-[#0B0E1B] object-cover shadow-2xs"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-bold">4.9 / 5</span>
                  <span className="text-slate-400 font-normal">• 10,000+ candidates</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  No credit card required • 2 full mock sessions free
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: AI Mock Interview Studio Visual (7 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <IntervexaHeroPreview />
          </motion.div>
        </div>
      </section>

      {/* Top Tech Company Hiring Ticker / Trust Strip (Brand New Enterprise Credibility) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 border-y border-slate-200/70 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm select-none">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Candidates Prepared For Interviews At
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-slate-400 dark:text-slate-500 text-sm font-bold tracking-tight">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Google</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Amazon</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Microsoft</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Meta</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Uber</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Atlassian</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Flipkart</span>
          </div>
        </div>
      </section>

      {/* Stats Metric Strip */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-7 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="flex items-center gap-3.5 p-4 sm:p-5 rounded-sm bg-white dark:bg-[#121626] shadow-xs hover:shadow-md text-left transition-all cursor-default"
              >
                <div className={`h-11 w-11 rounded-sm flex items-center justify-center shrink-0 ${item.color} shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-tight">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {item.sub}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* "WHY INTERVEXA?" Features Section — High-Impact BENTO GRID with reduced gaps & flat sharp edges */}
      <section id="features" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 relative z-10 text-center scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-2 mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-sm bg-purple-500/10 px-3.5 py-1 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
            <span>WHY INTERVEXA?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Everything you need to crack your tech interview
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            From online assessment aptitude to live DSA coding and system design architecture.
          </p>
        </motion.div>

        {/* 4-Card Bento Grid with reduced gap and borderless flat design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 text-left">
          
          {/* Bento Card 1: AI Question Generator (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="lg:col-span-7 rounded-sm bg-white dark:bg-[#121626] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-sm bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Resume-Tailored Question Engine
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Our AI parses your resume projects, GitHub repositories, and target role level to generate hyper-relevant questions that mirror real FAANG/tier-1 interviewer scripts.
              </p>
            </div>

            {/* Interactive Visual Preview Pill */}
            <div className="mt-5 p-3.5 rounded-sm bg-slate-50 dark:bg-[#0B101D] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Matched: SDE-2 Backend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-xs bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Distributed Systems
                </span>
                <span className="px-2 py-0.5 rounded-xs bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold">
                  Graphs &amp; DP
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Live DSA Coding Environment (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="lg:col-span-5 rounded-sm bg-white dark:bg-[#121626] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-sm bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Multi-Language IDE &amp; Test Runner
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Code live in C++, Python, Java, or JavaScript with edge-case validation, memory analysis, and LeetCode-style custom test runners.
              </p>
            </div>

            {/* Visual Indicator */}
            <div className="mt-5 p-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Compiler Status: 0 Runtime Errors</span>
              </span>
              <span className="font-bold">4ms (Top 5%)</span>
            </div>
          </motion.div>

          {/* Bento Card 3: Instant Actionable Feedback (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="lg:col-span-5 rounded-sm bg-white dark:bg-[#121626] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-sm bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Granular AI Scorecard
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Instant diagnostic report analyzing algorithmic efficiency, code readability, edge case resilience, and STAR framework behavioral delivery.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#0B101D]">
                <div className="font-bold text-indigo-600 text-sm">92%</div>
                <div className="text-[10px] text-slate-400">Technical</div>
              </div>
              <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#0B101D]">
                <div className="font-bold text-emerald-600 text-sm">88%</div>
                <div className="text-[10px] text-slate-400">STAR Clarity</div>
              </div>
              <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#0B101D]">
                <div className="font-bold text-purple-600 text-sm">O(N)</div>
                <div className="text-[10px] text-slate-400">Efficiency</div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 4: Full Multi-Round Track (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="lg:col-span-7 rounded-sm bg-white dark:bg-[#121626] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-sm bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Comprehensive 4-Stage Interview Track
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Don't just practice coding. Master the entire hiring cycle: Online Assessment (OA) Aptitude, Technical DSA Rounds, High-Level System Architecture, and HR Culture Fit.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-sm bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                1. OA Aptitude
              </span>
              <span className="px-3 py-1.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                2. Technical DSA
              </span>
              <span className="px-3 py-1.5 rounded-sm bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                3. System Design
              </span>
              <span className="px-3 py-1.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                4. HR &amp; Leadership
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* "REAL INTERVIEW EXPERIENCE" Dedicated Interactive Studio Centerpiece */}
      <div id="coding-preview" className="scroll-mt-20">
        <IntervexaCodingPreview />
      </div>

      {/* "HOW IT WORKS" 4 Connected Timeline Steps */}
      <section id="how-it-works" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 relative z-10 text-center scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto space-y-2 mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-sm bg-purple-500/10 px-3.5 py-1 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
            <span>THE ROADMAP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Get interview-ready in 4 simple steps
          </h2>
        </motion.div>

        {/* 4 Connected Step Cards with reduced gaps and flat sharp corners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 items-stretch">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="w-full rounded-sm bg-white dark:bg-[#121626] p-5 sm:p-6 text-left shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-2xl text-indigo-600 dark:text-indigo-400">
                      {step.step}
                    </span>
                    <div className="h-8 w-8 rounded-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
                      {step.tag}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* "LOVED BY STUDENTS" Testimonials with Real Placement Verification */}
      <section id="testimonials" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 relative z-10 text-center scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto space-y-2 mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-sm bg-purple-500/10 px-3.5 py-1 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
            <span>VERIFIED SUCCESS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trusted by candidates who landed dream offers
          </h2>
        </motion.div>

        {/* 3 High-Impact Cards with reduced gaps and flat sharp corners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-left">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-sm bg-white dark:bg-[#121626] p-6 sm:p-7 shadow-xs hover:shadow-md flex flex-col justify-between space-y-5 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t.name}
                    </h3>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {t.role}
                    </div>
                  </div>
                </div>

                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {t.quote}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Placement
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {t.company}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom Banner CTA Section */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          whileHover={{ scale: 1.005, transition: { duration: 0.2 } }}
          className="w-full rounded-sm bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-[#121626] dark:via-indigo-950/50 dark:to-[#121626] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md text-left"
        >
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Your dream tech job is closer than you think.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Join 10,000+ candidates who transformed their interview confidence with Intervexa.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(signedIn ? "/create-interview" : "/register")}
            className="inline-flex items-center gap-2 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer shrink-0"
          >
            <span>Start Free Practice Now</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
