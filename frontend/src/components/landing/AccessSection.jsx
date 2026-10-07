import React from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../ProtectedRoute";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  Brain,
  Layers,
  FileCheck
} from "lucide-react";

export default function AccessSection() {
  const navigate = useNavigate();
  const signedIn = isAuthenticated();

  const handleStart = () => {
    navigate(signedIn ? "/create-interview" : "/register", {
      state: { from: { pathname: "/create-interview" } }
    });
  };

  const includedFeatures = [
    {
      title: "All 4 Assessment Phases",
      desc: "Practice Aptitude & Logic, Core Technical, Live Coding Sandbox, and Behavioral STAR rounds."
    },
    {
      title: "Automated Resume Calibration",
      desc: "Upload your resume to calibrate difficulty and generate questions targeting your actual tech stack."
    },
    {
      title: "Multi-Language Compiler Sandbox",
      desc: "Execute and test solutions across Python, TypeScript, JavaScript, Java, C++, and Go in isolated runtimes."
    },
    {
      title: "Granular Rubric Scorecards",
      desc: "Receive actionable performance feedback analyzing time complexity O(1), concurrency, and communication."
    },
    {
      title: "Candidate Performance Dashboard",
      desc: "Track session-over-session metrics, review past interview transcripts, and download exportable dossiers."
    }
  ];

  return (
    <section id="access" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 relative z-10 scroll-mt-20 border-t border-brand-border/40">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-elevated/60 px-3 py-1 text-xs font-mono font-medium text-brand-secondary mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>OPEN CANDIDATE ACCESS</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-text">
          Start Practicing Without Friction
        </h2>
        <p className="mt-3 text-sm text-brand-secondary font-normal max-w-xl mx-auto leading-relaxed">
          CodeForge is open for engineers preparing for technical roles. No credit card, no paywalls, and no artificial trial countdown locks.
        </p>
      </div>

      {/* Main Single Access Card */}
      <div className="rounded-xl border border-brand-border bg-brand-card p-8 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-brand-border/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-brand-elevated text-brand-secondary border border-brand-border mb-2.5">
              <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>FULL CANDIDATE ACCESS</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-brand-text">
              Complete Mock Interview Platform
            </h3>
            <p className="text-xs text-brand-secondary mt-1 font-normal">
              Full access to simulation environments, multi-language sandbox, and performance feedback.
            </p>
          </div>

          <div className="flex items-baseline gap-1.5 bg-brand-elevated px-4 py-2.5 rounded-lg border border-brand-border">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">$0</span>
            <span className="text-xs font-medium text-brand-secondary">/ free access</span>
          </div>
        </div>

        {/* Feature List Grid */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {includedFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-brand-text">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-brand-secondary leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="pt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-brand-secondary flex items-center gap-2 font-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>No credit card required • Instant access to mock interview workspace</span>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white dark:text-slate-950 shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 focus-ring"
          >
            <span>{signedIn ? "Start Mock Interview" : "Start Free Mock Interview"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
