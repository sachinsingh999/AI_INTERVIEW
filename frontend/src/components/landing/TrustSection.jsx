import React from "react";
import {
  ShieldCheck,
  Cpu,
  FileText,
  Award,
  Lock,
  CheckCircle2,
  Code2,
  Brain,
  Check
} from "lucide-react";

export default function TrustSection() {
  const trustPillars = [
    {
      icon: <Brain className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      title: "Objective Rubric Evaluation",
      description:
        "No mysterious AI black box. Every evaluation breaks down your solution across verifiable engineering dimensions: time complexity O(1) vs O(N), concurrency handling, code modularity, and STAR verbal articulation."
    },
    {
      icon: <Code2 className="w-5 h-5 text-emerald-500" />,
      title: "Isolated Container Execution",
      description:
        "Code is executed inside isolated container sandboxes with real execution time limits, memory boundaries, and standard assertion test runners—not an unverified visual mockup."
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      title: "Resume-Grounded Questioning",
      description:
        "Questions are synthesized around your real technology stack and past project architectures, holding you accountable to the specific frameworks and architectural patterns you claim on paper."
    },
    {
      icon: <Lock className="w-5 h-5 text-purple-500" />,
      title: "Private Candidate Dossiers",
      description:
        "Your practice sessions, code submissions, audio transcripts, and evaluation scorecards remain private to your account. Nothing is ever shared or made public without your explicit consent."
    }
  ];

  const verificationPoints = [
    "Role & Difficulty Calibration",
    "Isolated Multi-Language Sandbox",
    "Real-Time Speech & STAR Rubric",
    "Exportable Performance Dossiers"
  ];

  return (
    <section id="trust" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 relative z-10 scroll-mt-20 border-t border-brand-border/40">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-elevated/60 px-3 py-1 text-xs font-mono font-medium text-brand-secondary mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span>EVALUATION STANDARDS</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-text">
          Built Around Real Engineering Hiring Criteria
        </h2>
        <p className="mt-3 text-sm text-brand-secondary font-normal max-w-2xl mx-auto leading-relaxed">
          CodeForge is designed around authentic technical interview dimensions—replacing trivia questions and generic chat bots with verifiable evaluation metrics.
        </p>
      </div>

      {/* 4 Trust Pillars - Open Architectural Layout with Subtle Dividers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-brand-border/40 border-y border-brand-border/40 py-8 mb-12">
        {trustPillars.map((pillar, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between space-y-3 ${
              idx === 0 ? "lg:pr-6" : idx === 3 ? "lg:pl-6 pt-6 md:pt-0" : "lg:px-6 pt-6 md:pt-0"
            }`}
          >
            <div className="space-y-3">
              <div className="h-8 w-8 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                {pillar.icon}
              </div>
              <h3 className="text-sm font-bold text-brand-text">
                {pillar.title}
              </h3>
              <p className="text-xs text-brand-secondary leading-relaxed font-normal">
                {pillar.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Credibility Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-4">
        <span className="text-brand-secondary font-mono text-[11px] font-medium tracking-wide">
          VERIFIED PLATFORM ATTRIBUTES:
        </span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-brand-text">
          {verificationPoints.map((point, pIdx) => (
            <div key={pIdx} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
