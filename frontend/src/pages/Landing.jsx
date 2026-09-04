import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Sun,
  Moon,
  Terminal,
  Code2,
  Cpu,
  Video,
  Zap,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Play,
  Check,
  Globe,
  Database
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function Landing() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("coding");
  const { resolvedTheme, setTheme } = useTheme();
  const [activeTerminalLine, setActiveTerminalLine] = useState(0);

  // Terminal simulated logs cycling effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTerminalLine((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    {
      q: "How does CodeForge evaluate my interview responses?",
      a: "CodeForge parses your voice transcripts, code syntax trees, and architecture canvas diagrams using state-of-the-art AI models. It evaluates technical accuracy, time/space complexity, modularity, and communication clarity against FAANG-grade rubrics.",
    },
    {
      q: "Can I practice coding in multiple programming languages?",
      a: "Yes. CodeForge natively supports Python, Java, C++, TypeScript, Go, and JavaScript. Executions are run inside isolated, high-speed sandbox containers with live test-case validation.",
    },
    {
      q: "What is monitored during proctored assessment mode?",
      a: "To simulate actual technical hiring assessments, CodeForge optionally monitors tab switches, copy-paste events, window focus, and speech continuity—synthesizing a integrity score into your summary dossier.",
    },
    {
      q: "Can I export or share my performance reports?",
      a: "Absolutely. You can generate encrypted PDF reports or create public shareable verification links to embed in your resume or present directly to hiring managers.",
    },
  ];

  const features = [
    {
      id: "coding",
      title: "Real-Time Compiler Sandbox",
      desc: "Split-screen IDE powered by Monaco Editor with syntax highlighting, custom test runners, and automated execution analysis.",
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      tag: "COMPILER V3"
    },
    {
      id: "video",
      title: "AI Video & Voice Assessor",
      desc: "Simulated camera & audio interface evaluating speech pace, STAR method response structure, and technical confidence.",
      icon: <Video className="w-5 h-5 text-blue-400" />,
      tag: "AV ANALYSIS"
    },
    {
      id: "system-design",
      title: "Architecture Whiteboard",
      desc: "Drag-and-drop HTML5 system design canvas with automated latency, throughput, and bottleneck detection.",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      tag: "SYSTEM DESIGN"
    },
    {
      id: "analytics",
      title: "Competency Dossier",
      desc: "In-depth radar breakdowns across algorithms, data structures, system design, and communication skills.",
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      tag: "METRICS ENGINE"
    },
    {
      id: "proctoring",
      title: "Session Integrity Proctor",
      desc: "Real-time tab switch tracking, code paste velocity metrics, and automated environment diagnostic logs.",
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      tag: "INTEGRITY"
    },
    {
      id: "faang",
      title: "Company-Targeted Prep",
      desc: "Curated problem sets and interview rubrics modeled directly after top tech firm interviewing tracks.",
      icon: <Zap className="w-5 h-5 text-rose-400" />,
      tag: "TARGETED"
    }
  ];

  const stats = [
    { label: "Compiler Execution", value: "< 45ms", sub: "Global Latency" },
    { label: "Supported Languages", value: "6+", sub: "Runtime Engines" },
    { label: "Mock Sessions", value: "100K+", sub: "Completed Rounds" },
    { label: "Hiring Accuracy", value: "98.4%", sub: "Evaluator Score" }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Custom Styles for Sharp Corners & Micro Animations */}
      <style>{`
        @keyframes tech-grid-bg {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-border-glow {
          0%, 100% { border-color: rgba(99, 102, 241, 0.3); box-shadow: 0 0 15px rgba(99, 102, 241, 0.1); }
          50% { border-color: rgba(99, 102, 241, 0.8); box-shadow: 0 0 25px rgba(99, 102, 241, 0.25); }
        }
        @keyframes terminal-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .bg-grid-tech {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          animation: tech-grid-bg 40s linear infinite;
        }
        .animate-float-subtle {
          animation: float-subtle 4s ease-in-out infinite;
        }
        .animate-border-glow {
          animation: pulse-border-glow 3s infinite ease-in-out;
        }
        .animate-terminal-blink {
          animation: terminal-cursor 1s infinite;
        }
      `}</style>

      {/* Tech Grid Background Surface */}
      <div className="absolute inset-0 bg-grid-tech pointer-events-none -z-10 opacity-70" />

      {/* Header / Navbar - Sharp Geometric Layout */}
      <header className="sticky top-0 z-50 border-b border-brand-border/60 bg-brand-card/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div onClick={() => navigate("/")} className="cursor-pointer group">
              <Logo className="h-10 transition-transform duration-200 group-hover:scale-102" />
            </div>
            <span className="hidden md:inline-block rounded-sm border border-brand-border bg-brand-bg px-2 py-0.5 text-[9px] font-mono font-bold text-brand-secondary tracking-widest uppercase">
              STUDIO 2.4
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-brand-border bg-brand-bg/50 hover:bg-slate-800/40 text-brand-secondary hover:text-brand-text transition-all cursor-pointer"
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-sm border border-transparent px-4 py-2 text-xs font-bold text-brand-secondary hover:text-brand-text hover:border-brand-border transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="relative inline-flex items-center gap-2 rounded-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-98 transition-all cursor-pointer border border-indigo-400/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Sharp Corners & Interactive Terminal */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 lg:px-8 relative z-10">
        {/* Sharp Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-sm border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 shadow-sm mb-6 animate-float-subtle">
          <span className="h-1.5 w-1.5 rounded-none bg-indigo-400 animate-pulse" />
          <span>✦ THE NEXT-GEN AI MOCK INTERVIEW ENGINE</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl text-slate-900 dark:text-white leading-[1.08] max-w-4xl mx-auto">
          Engineer Your Career Success with Precision AI Simulators.
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-brand-secondary font-medium sm:text-base">
          Master DSA coding challenges, live compiler evaluation, video STAR behavioral feedback, and HTML5 system design architecture—all within one high-performance environment.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row items-center">
          <button
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto rounded-sm bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-98 transition-all duration-200 cursor-pointer border border-indigo-400/40 flex items-center justify-center gap-2"
          >
            <span>Start Practice Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto rounded-sm border border-brand-border/80 bg-brand-card hover:bg-slate-150 dark:hover:bg-white/5 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-brand-text active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Explore Dashboard</span>
          </button>
        </div>

        {/* Sharp Terminal / Code IDE Showcase */}
        <div className="mt-14 overflow-hidden rounded-sm border border-slate-700/60 dark:border-slate-800 bg-[#0A0E17] text-left shadow-2xl relative animate-border-glow">
          {/* Terminal Window Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#070B12] px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-none bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-none bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-none bg-emerald-500/80" />
              <span className="ml-3 text-[11px] font-mono font-bold text-slate-400 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                codeforge-runtime-env --version 2.4.0
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">
                COMPILER ACTIVE
              </span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">PROCTORED MODE</span>
            </div>
          </div>

          {/* Interactive Code/Logs Terminal Display */}
          <div className="p-5 sm:p-6 font-mono text-xs leading-relaxed text-slate-300 space-y-2.5 bg-[#0A0E17]">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-800/60 pb-2 text-[10px]">
              <span>// SIMULATED CANDIDATE EVALUATION TRAJECTORY</span>
              <span>NODE: US-EAST-VIRGINIA</span>
            </div>

            <p className="text-slate-400">
              <span className="text-indigo-400">candidate@codeforge</span>:<span className="text-emerald-400">~/workspace</span>$ npx codeforge start-interview --role="Senior Frontend Architect" --round="Technical-2"
            </p>

            <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500/40 my-3 text-[11px]">
              <p className={`transition-all duration-300 ${activeTerminalLine >= 0 ? "text-slate-200" : "text-slate-600"}`}>
                [00:01] <span className="text-indigo-400">✓ INFRASTRUCTURE:</span> Connected Monaco Sandbox Kernel (V8 Isolated VM)
              </p>
              <p className={`transition-all duration-300 ${activeTerminalLine >= 1 ? "text-slate-200" : "text-slate-600"}`}>
                [00:02] <span className="text-blue-400">✓ MEDIA FEED:</span> WebRTC Camera 1080p60 initialized (Speech-to-Text active)
              </p>
              <p className={`transition-all duration-300 ${activeTerminalLine >= 2 ? "text-slate-200" : "text-slate-600"}`}>
                [00:03] <span className="text-amber-400">⚡ EVALUATION:</span> Generated 3-tier algorithm: High-Throughput Debounce & Virtual Canvas
              </p>
              <p className={`transition-all duration-300 ${activeTerminalLine >= 3 ? "text-emerald-300 font-bold" : "text-slate-600"}`}>
                [00:04] <span className="text-emerald-400">★ SCORE DOSSIER:</span> Code Correctness 100% | Time Complexity O(N) | STAR Method 96/100 <span className="animate-terminal-blink text-indigo-400">█</span>
              </p>
            </div>

            {/* Code Snippet Preview Box */}
            <div className="mt-4 rounded-sm border border-slate-800 bg-[#05080E] p-4 text-[11px] font-mono text-slate-300 overflow-x-auto">
              <div className="text-slate-500 mb-2 text-[10px] uppercase tracking-wider font-bold">solution.ts</div>
              <p><span className="text-purple-400">export function</span> <span className="text-blue-400">solveOptimizedTree</span>(root: <span className="text-amber-300">TreeNode</span>): <span className="text-amber-300">number</span> &#123;</p>
              <p className="pl-4 text-slate-400">// O(N) linear pass with memoized dynamic window</p>
              <p className="pl-4"><span className="text-purple-400">if</span> (!root) <span className="text-purple-400">return</span> <span className="text-cyan-400">0</span>;</p>
              <p className="pl-4"><span className="text-purple-400">return</span> Math.max(<span className="text-blue-400">solveOptimizedTree</span>(root.left), <span className="text-blue-400">solveOptimizedTree</span>(root.right)) + root.val;</p>
              <p>&#125;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Metrics Bar - Sharp Rectangular Containers */}
      <section className="border-y border-brand-border/60 bg-brand-card/40 py-10 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="border-r border-brand-border/40 last:border-0 px-4">
                <div className="text-3xl font-black text-brand-text tracking-tight font-mono">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mt-1">{stat.label}</div>
                <div className="text-[10px] text-brand-secondary mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Sharp Cards & Tech Badges */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="rounded-sm border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl text-brand-text">
            Built for Modern Software Engineers
          </h2>
          <p className="mt-3 text-sm text-brand-secondary font-medium max-w-xl mx-auto">
            Everything you need to practice, simulate, and excel across standard technical assessment rounds.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="rounded-sm border border-brand-border/80 bg-brand-card p-6 relative group hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-bg border border-brand-border">
                    {feat.icon}
                  </div>
                  <span className="rounded-sm border border-brand-border bg-brand-bg px-2 py-0.5 text-[9px] font-mono font-bold text-brand-secondary tracking-wider">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-base font-black text-brand-text group-hover:text-indigo-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2.5 text-xs font-medium leading-relaxed text-brand-secondary">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-border/40 flex items-center justify-between text-[11px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>EXPLORE CAPABILITIES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards - Sharp Edges & Clear Hierarchy */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 relative z-10 border-t border-brand-border/40">
        <div className="text-center mb-16">
          <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
            TRANSPARENT PLANS
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-brand-text">
            Invest in Your Career Growth
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Developer Free */}
          <div className="rounded-sm border border-brand-border/80 bg-brand-card p-8 relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-brand-text">Developer Starter</h3>
                  <p className="mt-1 text-xs text-brand-secondary font-medium">Ideal for casual self-assessment.</p>
                </div>
                <span className="rounded-sm border border-brand-border bg-brand-bg px-2.5 py-1 text-[9px] font-mono font-bold text-brand-secondary">
                  FREE TIER
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-brand-text font-mono">$0</span>
                <span className="text-xs font-semibold text-brand-secondary">/ forever</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs font-medium text-brand-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5 AI Mock Sessions per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-language Monaco Compiler</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard AI Score Summaries</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/register")}
              className="mt-8 w-full rounded-sm border border-brand-border bg-brand-bg py-3 text-xs font-black uppercase tracking-wider text-brand-text hover:bg-slate-800/40 transition-all cursor-pointer"
            >
              Get Free Pass
            </button>
          </div>

          {/* Interview Pro */}
          <div className="rounded-sm border-2 border-indigo-500 bg-brand-card p-8 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3.5 right-6 rounded-sm bg-indigo-600 px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md">
              MOST POPULAR
            </div>

            <div>
              <div>
                <h3 className="text-lg font-black text-indigo-300">Interview Pro</h3>
                <p className="mt-1 text-xs text-slate-400 font-medium">Accelerated prep for FAANG & top tech roles.</p>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-indigo-300 font-mono">$19</span>
                <span className="text-xs font-semibold text-slate-400">/ per month</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs font-medium text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-bold text-white">Unlimited AI Mock Sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Interactive System Design Architecture Canvas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Video Speech & STAR Method AI Feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Encrypted PDF Dossiers & Shareable Links</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/register")}
              className="mt-8 w-full rounded-sm bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/30"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section - Sharp Accordion */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-brand-border/40">
        <div className="text-center mb-14">
          <span className="rounded-sm border border-brand-border bg-brand-bg px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-secondary">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-text">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-sm border transition-all duration-200 cursor-pointer ${
                activeFaq === index
                  ? "border-indigo-500/60 bg-brand-card shadow-md"
                  : "border-brand-border/80 bg-brand-card/50 hover:border-brand-border"
              }`}
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="text-sm font-bold text-brand-text">{faq.q}</h3>
                <ChevronDown
                  className={`w-4 h-4 text-brand-secondary transition-transform duration-300 ${
                    activeFaq === index ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </div>
              {activeFaq === index && (
                <div className="px-5 pb-5 pt-0 text-xs leading-relaxed text-brand-secondary font-medium border-t border-brand-border/30 mt-1">
                  <p className="mt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action Section - Sharp Cyber Box */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-sm border-2 border-indigo-500/40 bg-slate-900 p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/10">
          
          <span className="rounded-sm border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300">
            START YOUR PRACTICE TODAY
          </span>
          
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl text-white">
            Ready to Forge Your Career Path?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300 font-medium">
            Join thousands of developers leveling up their technical skills, code complexity, and interview confidence with CodeForge.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto rounded-sm bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/40 flex items-center justify-center gap-2"
            >
              <span>Create Account Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto rounded-sm border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-200 transition-all cursor-pointer"
            >
              Sign In To Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default Landing;

