import React from "react";
import {
  CheckCircle2,
  Brain,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Award
} from "lucide-react";

export default function ProductShowcase() {
  return (
    <section id="showcase" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-brand-border/40 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-elevated/60 px-3 py-1 text-xs font-mono font-medium text-brand-secondary mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span>The Evaluation Standard</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-brand-text">
          Deep Evaluation, Not Just Accepted or Rejected
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-secondary font-normal max-w-2xl mx-auto leading-relaxed">
          Generic coding platforms only check whether basic tests pass. CodeForge analyzes your complete engineering performance—evaluating algorithmic trade-offs, concurrency handling, and verbal articulation against hiring rubrics.
        </p>
      </div>

      {/* Unified High-Fidelity Performance Dossier Window */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-2xl overflow-hidden">
        {/* Top Window Chrome */}
        <div className="flex flex-wrap items-center justify-between border-b border-brand-border bg-brand-elevated/70 px-4 py-3 gap-2 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="hidden sm:block h-3.5 w-px bg-brand-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
              <span className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-secondary font-mono text-[11px]">
                SAMPLE REPORT
              </span>
              <span className="text-brand-secondary hidden md:inline">•</span>
              <span className="text-brand-secondary font-mono text-[11px] hidden md:inline">
                Senior Full Stack Engineer Assessment #1042
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              Score: 92/100 • Hiring Bar Met
            </span>
          </div>
        </div>

        {/* 2-Pane Dossier Layout: Question Evaluation on Left, Competency Scorecard on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-brand-border">
          {/* Left Pane: Question-by-Question Rubric Breakdown (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-brand-secondary">
                    Algorithmic Problem Evaluation
                  </span>
                  <h3 className="text-base font-bold text-brand-text">
                    Distributed Rate Limiter Implementation
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Rubric Passed
                </span>
              </div>

              {/* Rubric Breakdown Rows */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-brand-border bg-brand-elevated/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-text flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Algorithmic Complexity</span>
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                      O(1) Sliding Window
                    </span>
                  </div>
                  <p className="text-brand-secondary text-xs leading-relaxed pl-5">
                    Optimal memory footprint with constant-time lookup and token eviction mechanics.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-brand-border bg-brand-elevated/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-text flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Concurrency &amp; Mutex Safety</span>
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-medium text-[11px]">
                      Atomic Lock Verified
                    </span>
                  </div>
                  <p className="text-brand-secondary text-xs leading-relaxed pl-5">
                    Clean atomic state mutation handling multi-threaded ingress spikes without race conditions.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-brand-border bg-brand-elevated/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-text flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Spoken STAR Articulation</span>
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                      Structured Format
                    </span>
                  </div>
                  <p className="text-brand-secondary text-xs leading-relaxed pl-5">
                    Proactively communicated trade-offs between Redis memory overhead and token window accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* Targeted AI Feedback Box */}
            <div className="p-3.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-xs space-y-1">
              <div className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>Targeted Senior Engineer Insight</span>
              </div>
              <p className="text-brand-secondary text-[11px] leading-relaxed">
                &ldquo;Solid architectural reasoning and clean concurrency handling. In production loops, explicitly note how Redis cluster NTP clock drift affects distributed expiration timestamps.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Pane: Competency Scorecard & Deliverables (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 bg-brand-elevated/20 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-brand-secondary">
                    Competency Matrix
                  </span>
                  <h3 className="text-base font-bold text-brand-text">
                    Engineering Rubric Scores
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Level: Senior
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-brand-text">Data Structures &amp; Complexity</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">92%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-brand-border overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-brand-text">System Architecture &amp; Scale</span>
                    <span className="font-mono text-blue-500 font-semibold">88%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-brand-border overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[88%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-brand-text">STAR Verbal Articulation</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">94%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-brand-border overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-brand-text">Edge Case &amp; Error Handling</span>
                    <span className="font-mono text-purple-500 font-semibold">86%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-brand-border overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[86%]" />
                  </div>
                </div>
              </div>

              {/* Deliverable Verification List */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-brand-secondary">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Verified Session ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>PDF Dossier Export</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>Session History</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>FAANG Benchmark</span>
                </div>
              </div>
            </div>

            {/* Utility status footer */}
            <div className="pt-3 border-t border-brand-border text-xs text-brand-secondary flex items-center justify-between font-mono text-[11px]">
              <span>Candidate Dashboard Access</span>
              <span className="text-cyan-600 dark:text-cyan-400">Encrypted Dossier</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
