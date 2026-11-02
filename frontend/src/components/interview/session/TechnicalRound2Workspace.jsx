import React, { useState, useEffect, useRef } from "react";
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
  MicOff,
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
  Sparkles,
  Radio,
  Headphones,
  Play
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

  // Live Microphone & Audio Calibration State
  const [micTesting, setMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micTested, setMicTested] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Staggered initialization checklist for the overlay
  const initSteps = [
    { label: "Connecting Low-Latency Voice Engine", key: "engine" },
    { label: "Calibrating Microphone & Audio Streams", key: "audio" },
    { label: "Loading Resume Knowledge Graph", key: "insights" },
    { label: "Connecting AI Technical Recruiter", key: "agent" },
    { label: "Synchronizing Real-Time Speech Protocol", key: "sync" },
    { label: "Launching Live Voice Session", key: "ready" }
  ];

  // Microphone Testing
  const startMicTest = async () => {
    try {
      setMicTesting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        if (avg > 15) setMicTested(true);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.error("Mic test error:", err);
      setMicTesting(false);
    }
  };

  const stopMicTest = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setMicTesting(false);
  };

  const testAudioOutput = () => {
    if (!window.speechSynthesis) return;
    setAudioTesting(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Audio output verified. I am your AI interviewer, and I am ready for our live voice session.");
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setAudioTesting(false);
    utterance.onerror = () => setAudioTesting(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      stopMicTest();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Initialization process when Start button is clicked
  useEffect(() => {
    if (!isInitializing) return;

    const interval = setInterval(() => {
      setInitProgress((prev) => {
        const next = prev + 2.5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onCompletePhase) {
              onCompletePhase();
            }
          }, 500);
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isInitializing, onCompletePhase]);

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
    stopMicTest();
    setIsInitializing(true);
    setInitProgress(0);
    setActiveStepIndex(0);
  };

  // Process candidateInfo dynamically
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
    experience: resumeAnalysis?.experience || (resumeAnalysis?.experienceYears ? `${resumeAnalysis.experienceYears} Years of Experience` : "1-3 Years"),
    certificates: resumeAnalysis?.certifications || resumeAnalysis?.certificates || "None detected",
    skills: Array.isArray(resumeAnalysis?.skills) && resumeAnalysis.skills.length > 0
      ? resumeAnalysis.skills
      : ["React", "JavaScript", "TypeScript", "Node.js", "Express", "System Design"],
    projectsCount: resumeAnalysis?.projectsCount || (Array.isArray(resumeAnalysis?.projects) ? resumeAnalysis.projects.length : 2)
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] dark:bg-[#0E121E] text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-amber-500/20">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-amber-200/80 dark:border-slate-800 bg-[#FFFDF7]/95 dark:bg-[#0E121E]/95 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="h-4 w-[1px] bg-amber-300/80 dark:bg-slate-700" />
            <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40 px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
              Live Voice-to-Voice Session
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Voice Engine Online
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-amber-50/80 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
              <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
              Zero Typing Required
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Voice Hero & Calibration Cards */}
        <section className="lg:col-span-8 space-y-6 flex flex-col justify-start">
          
          {/* Main Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2.5"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/40 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
              <Mic className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Phase 3 • Technical & System Discussion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit flex items-center gap-3">
              Live Voice-to-Voice AI Interview
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
              You are about to enter a real-time conversational interview with your dedicated AI Technical Recruiter. Speak naturally into your microphone—the AI speaks questions aloud, listens to your reasoning, and asks dynamic follow-ups based on your resume.
            </p>
          </motion.div>

          {/* Audio & Mic Calibration Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-sm border border-amber-300/90 dark:border-amber-900/40 bg-white dark:bg-[#141828] p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-sm bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                    Audio & Voice Calibration
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                    Verify your microphone and speakers before starting
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-sm border border-amber-200 dark:border-amber-900/30">
                Live Test
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Mic Test Box */}
              <div className="p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-[#FFFDF7] dark:bg-[#111422] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Microphone Input
                  </span>
                  {micTested && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3 stroke-[3]" /> Detected
                    </span>
                  )}
                </div>

                {/* Animated Waveform Level */}
                <div className="h-9 bg-slate-100 dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center px-3 gap-1 overflow-hidden">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const activeHeight = micTesting
                      ? Math.max(4, Math.round((Math.sin(i * 0.4 + micVolume) + 1) * (micVolume / 100) * 14))
                      : 4;
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-xs transition-all duration-75 ${
                          micTesting && micVolume > 10
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        style={{ height: `${activeHeight}px` }}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {micTesting ? "Speak to test volume..." : "Click test to calibrate mic"}
                  </span>
                  <button
                    type="button"
                    onClick={micTesting ? stopMicTest : startMicTest}
                    className={`px-3 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
                      micTesting
                        ? "bg-rose-500/10 text-rose-600 border border-rose-300 dark:border-rose-900 hover:bg-rose-500/20"
                        : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    }`}
                  >
                    {micTesting ? "Stop Test" : "Test Microphone"}
                  </button>
                </div>
              </div>

              {/* Speaker Test Box */}
              <div className="p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-[#FFFDF7] dark:bg-[#111422] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    AI Speaker Output
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    Text-to-Speech
                  </span>
                </div>

                <div className="h-9 bg-slate-100 dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center px-3 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  {audioTesting ? "🔊 Playing AI Voice Sample..." : "Click below to test speaker clarity"}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Verifies clear playback
                  </span>
                  <button
                    type="button"
                    onClick={testAudioOutput}
                    disabled={audioTesting}
                    className="px-3 py-1 rounded-sm text-[11px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{audioTesting ? "Speaking..." : "Play Voice Sample"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Voice Interaction Protocol (How It Works) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                step: "01",
                title: "AI Speaks Question",
                desc: "Your AI interviewer asks questions aloud using natural conversational speech pacing.",
                icon: Volume2,
                color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40"
              },
              {
                step: "02",
                title: "Speak Your Answer",
                desc: "Your mic activates automatically. Speak your architectural decisions & coding logic aloud.",
                icon: Mic,
                color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40"
              },
              {
                step: "03",
                title: "Adaptive Follow-ups",
                desc: "The AI evaluates your verbal reasoning in real time and asks contextual follow-ups.",
                icon: Brain,
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40"
              }
            ].map((card, i) => (
              <div
                key={i}
                className="p-3.5 rounded-sm border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-[#141828] space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-sm border ${card.color}`}>
                    <card.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    STEP {card.step}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-outfit">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Candidate Profile Context Box */}
          <div className="rounded-sm border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-[#141828] p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Resume Knowledge Graph
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
                {candidateInfo.experience} • {role}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium self-center mr-1 font-mono">Topics Loaded:</span>
              {candidateInfo.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-xs bg-[#FFFDF7] dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column (4 cols): System Checklist & Rules */}
        <aside className="lg:col-span-4 space-y-5 flex flex-col justify-start">
          
          {/* Live Agent Card */}
          <div className="rounded-sm border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-[#141828] p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 border-b border-amber-200/60 dark:border-slate-800 pb-3">
              <div className="h-10 w-10 rounded-sm bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white relative shadow-sm">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-outfit">
                  AI Technical Recruiter #7
                </h4>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-medium">
                  Voice Model: Gemini 2.5 Flash Voice
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Interaction Mode</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">Full-Duplex Voice</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Question Strategy</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">Adaptive System Design</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Round Duration</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">10 Minutes (Projects & Skills)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono uppercase tracking-wider text-[10px]">
                  Engine Ready
                </span>
              </div>
            </div>
          </div>

          {/* Interview Rules */}
          <div className="rounded-sm border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-[#141828] p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-outfit border-b border-amber-200/60 dark:border-slate-800 pb-2.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              Live Voice Guidelines
            </h4>

            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Speak directly into your microphone in a quiet room.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Explain your technical trade-offs and architectural reasoning.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>You can pause to think—the AI allows natural pacing.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Live transcripts appear automatically on screen as you speak.</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="mt-auto border-t border-amber-200/80 dark:border-slate-800 bg-[#FFFDF7]/95 dark:bg-[#0E121E]/95 backdrop-blur-md px-6 py-4 sticky bottom-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              <Check className="h-3 w-3 stroke-[3]" /> Mic Ready
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              <Check className="h-3 w-3 stroke-[3]" /> Voice Agent Ready
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              <Check className="h-3 w-3 stroke-[3]" /> Low Latency Stream
            </span>
          </div>

          <button
            type="button"
            onClick={handleStartInterview}
            className="w-full sm:w-auto px-7 py-3 rounded-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-bold font-outfit uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Start Live Voice Interview</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Initialization Fullscreen Overlay */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-[#FFFDF7] dark:bg-[#121626] border border-amber-300 dark:border-amber-900/50 rounded-sm p-6 shadow-2xl space-y-5 text-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-800">
                <Mic className="h-6 w-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit">
                  Launching Live Voice Interview...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {initSteps[activeStepIndex]?.label || "Preparing audio channel..."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 text-left">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-xs overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-600 dark:bg-amber-500"
                    style={{ width: `${initProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Calibrating Voice Pipeline</span>
                  <span>{Math.round(initProgress)}%</span>
                </div>
              </div>

              {/* Step Checklist */}
              <div className="space-y-1.5 text-left pt-1">
                {initSteps.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-2 text-xs font-mono ${
                        isDone
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : isCurrent
                          ? "text-amber-600 dark:text-amber-400 font-bold"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-3 w-3 stroke-[3]" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
