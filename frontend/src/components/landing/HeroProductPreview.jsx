import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
  Code2,
  Gift
} from "lucide-react";
import api from "../../services/api";

const POPULAR_QUESTIONS = [
  {
    label: "3-Phase Interview Loop",
    icon: Layers,
    question: "How do the 3 interview phases work in CodeForge?"
  },
  {
    label: "Resume Tailoring",
    icon: FileText,
    question: "Can CodeForge tailor questions from my uploaded resume?"
  },
  {
    label: "Multi-Language Compiler",
    icon: Code2,
    question: "Which programming languages are supported in the live compiler?"
  },
  {
    label: "100% Free Access",
    icon: Gift,
    question: "Is CodeForge completely free to use with no paywalls?"
  }
];

export default function HeroProductPreview() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(
    "How does CodeForge prepare candidates for real technical hiring loops?"
  );
  const [response, setResponse] = useState(
    "CodeForge simulates a realistic 3-phase technical hiring loop: Phase 1 Aptitude MCQs, Phase 2 Core Technical Concepts, and Phase 3 Live Coding with an in-browser Monaco compiler in Python, JS, TS, Java, C++, and Go. You can upload your resume for personalized questions, and it is 100% free with no credit card required."
  );
  const [keyPoints, setKeyPoints] = useState([
    "Phase 1: Aptitude & Logical Reasoning (Timed MCQs)",
    "Phase 2: Technical Round 1 (Core Concepts & Stack)",
    "Phase 3: Technical Round 2 (Live Coding & Compiler)"
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (questionText) => {
    const q = (questionText || query).trim();
    if (!q || isLoading) return;

    setCurrentQuestion(q);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/ask-app", { prompt: q });
      if (res.data && res.data.response) {
        setResponse(res.data.response);
        if (res.data.keyPoints && res.data.keyPoints.length > 0) {
          setKeyPoints(res.data.keyPoints);
        }
      }
    } catch (err) {
      console.warn("AI Assistant fallback:", err);
      setResponse(
        "CodeForge prepares you for real technical interviews across 3 stages: Aptitude Assessment, Core Technical Concepts, and Live Coding with an in-browser compiler. It supports resume-tailored questions and is completely free."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-brand-border bg-brand-card text-left shadow-2xl relative transition-all duration-300">
      {/* Top Window Header Chrome */}
      <div className="flex flex-wrap items-center justify-between border-b border-brand-border bg-brand-elevated/70 px-4 py-2.5 gap-2 select-none backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-brand-border" />
          <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
            <span className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-secondary font-mono text-[11px]">
              CODEFORGE AI ASSISTANT
            </span>
            <span className="text-brand-secondary hidden md:inline">•</span>
            <span className="text-brand-secondary font-mono text-[11px] hidden md:inline">
              Ask Anything Regarding The Application
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>AI Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-brand-secondary font-mono text-[11px]">
            <Clock className="w-3 h-3 text-brand-secondary" />
            <span>Instant Response</span>
          </div>
        </div>
      </div>

      {/* Main Interactive AI Query Interface */}
      <div className="p-5 sm:p-7 space-y-5 bg-brand-card">
        {/* Search & Prompt Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything about CodeForge (e.g., How do the 3 phases work? Can I upload my resume?)..."
              className="w-full rounded-lg border border-brand-border bg-brand-elevated/40 px-4 py-3 text-xs sm:text-sm text-brand-text placeholder:text-brand-secondary/70 focus-ring shadow-inner transition-all disabled:opacity-50"
              aria-label="Ask anything about CodeForge"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 focus-ring"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </form>

        {/* Popular Question Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-brand-secondary font-medium">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>Try Asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_QUESTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAsk(item.question)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-elevated/50 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-1.5 text-xs text-brand-secondary transition-all cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Answer Card */}
        <div className="rounded-xl border border-brand-border bg-brand-elevated/30 p-4 sm:p-5 space-y-3 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5 text-xs font-semibold text-brand-text">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold">CodeForge Assistant</span>
                <span className="text-[11px] text-brand-secondary ml-2 font-normal font-mono hidden sm:inline">
                  • Verified Platform Specs
                </span>
              </div>
            </div>
            {isLoading ? (
              <span className="text-[11px] font-mono text-cyan-500 animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>Thinking...</span>
              </span>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Accurate &amp; Real-Time</span>
              </div>
            )}
          </div>

          {/* Current Question */}
          <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
            Q: {currentQuestion}
          </div>

          {/* AI Response Text */}
          <p className="text-xs sm:text-sm leading-relaxed text-brand-text whitespace-pre-line font-normal">
            {response}
          </p>

          {/* Verified Feature Highlights */}
          {keyPoints.length > 0 && (
            <div className="pt-2 border-t border-brand-border/60 flex flex-wrap gap-2">
              {keyPoints.map((pt, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-brand-card border border-brand-border px-2.5 py-1 rounded-md text-brand-secondary"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{pt}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <span className="text-brand-secondary">
            Practice Aptitude, Core Tech, and Live Coding in a real simulation.
          </span>
          <button
            onClick={() => navigate("/create-interview")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-lg border border-cyan-500/20 transition-all cursor-pointer"
          >
            <span>Start Free Mock Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
