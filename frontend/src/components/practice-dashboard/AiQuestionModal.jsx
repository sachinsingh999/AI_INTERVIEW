import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Building2,
  Briefcase,
  Layers,
  Award,
  AlertCircle,
  CheckCircle2,
  Code2
} from "lucide-react";

export default function AiQuestionModal({
  showAiModal,
  setShowAiModal,
  generating,
  handleGenerate,
  aiTopic,
  setAiTopic,
  aiDifficulty,
  setAiDifficulty,
  aiRole,
  setAiRole,
  aiCompany,
  setAiCompany,
  validationErrors = [],
}) {
  const [generationStep, setGenerationStep] = useState(0);

  const steps = [
    "Analyzing role specifications & company patterns...",
    "Drafting algorithmic problem statement...",
    "Synthesizing edge cases & benchmark test suite...",
    "Validating optimal time & space complexity..."
  ];

  useEffect(() => {
    let interval;
    if (generating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [generating]);

  if (!showAiModal) return null;

  const topics = [
    "Arrays",
    "Strings",
    "Linked List",
    "Stack",
    "Queue",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Greedy",
    "Backtracking",
    "Trie",
    "Heap / Priority Queue"
  ];

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer",
    "Mobile Developer (iOS/Android)",
    "AI / ML Engineer",
    "Data Engineer",
    "DevOps / Cloud Engineer",
    "QA / Automation Engineer"
  ];

  const companies = [
    "Google",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
    "Microsoft",
    "Uber",
    "Stripe",
    "Airbnb"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => !generating && setShowAiModal(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-brand-card border border-brand-border rounded-sm p-5 sm:p-6 shadow-2xl space-y-4 transition-all duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xs bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-brand-text">
                AI Coding Challenge Studio
              </h3>
              <p className="text-[11px] text-brand-secondary">
                Generate tailored interview questions matching specific companies & roles.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAiModal(false)}
            disabled={generating}
            className="p-1 rounded-xs text-brand-secondary hover:text-brand-text hover:bg-brand-elevated transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Topic Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-secondary flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Topic / Data Structure</span>
              </label>
              <select
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                disabled={generating}
                className="w-full bg-brand-elevated border border-brand-border rounded-xs px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
              >
                {topics.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-secondary flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Target Difficulty</span>
              </label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                disabled={generating}
                className="w-full bg-brand-elevated border border-brand-border rounded-xs px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>

            {/* Developer Role Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-secondary flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span>Candidate Role</span>
              </label>
              <select
                value={aiRole}
                onChange={(e) => setAiRole(e.target.value)}
                disabled={generating}
                className="w-full bg-brand-elevated border border-brand-border rounded-xs px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Target Company Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-secondary flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Target Company Focus</span>
              </label>
              <select
                value={aiCompany}
                onChange={(e) => setAiCompany(e.target.value)}
                disabled={generating}
                className="w-full bg-brand-elevated border border-brand-border rounded-xs px-3 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
              >
                {companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Validation Errors Box */}
          {validationErrors.length > 0 && (
            <div className="p-3 rounded-xs border border-rose-500/25 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Validation Checklist Failed:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Active Generation Progress Indicator */}
          {generating && (
            <div className="p-3.5 rounded-xs border border-amber-500/30 bg-amber-500/10 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>{steps[generationStep]}</span>
              </div>
              <div className="h-1 w-full bg-amber-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border/60">
            <button
              type="button"
              disabled={generating}
              onClick={() => setShowAiModal(false)}
              className="px-4 py-2 rounded-xs bg-brand-elevated hover:bg-brand-elevated/80 border border-brand-border text-brand-secondary text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-xs hover:shadow-amber-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? "Synthesizing Problem..." : "Generate Challenge"}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
