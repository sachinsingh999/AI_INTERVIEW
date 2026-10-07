import React, { useState } from "react";
import {
  Briefcase,
  Bot,
  Code2,
  Award,
  CheckCircle2,
  ArrowRight,
  FileText,
  Volume2,
  ChevronRight,
  Brain
} from "lucide-react";

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      stepName: "Configure",
      title: "Configure Your Assessment",
      tagline: "Role, difficulty & optional resume context",
      description:
        "Select your target job role (Frontend, Backend, Full Stack, DevOps), experience tier, and interview phases. Optionally upload your resume to have AI extract your tech stack and generate personalized questions.",
      icon: <Briefcase className="w-4 h-4" />,
      features: [
        "Curated role & difficulty calibration",
        "Automated resume skill extraction",
        "Aptitude, Coding, or Behavioral phase selection"
      ]
    },
    {
      num: "02",
      stepName: "Practice",
      title: "Simulate with AI Interviewer",
      tagline: "Adaptive questioning & live audio dialogue",
      description:
        "Enter a live interview session with the CodeForge AI Interviewer. The model asks technical and behavioral questions, probes your reasoning with adaptive follow-ups, and transcribes your verbal responses in real time.",
      icon: <Bot className="w-4 h-4" />,
      features: [
        "Dynamic follow-ups based on your answers",
        "Verbal response transcription & STAR assessment",
        "Timed assessment session simulation"
      ]
    },
    {
      num: "03",
      stepName: "Solve",
      title: "Solve in the Isolated Sandbox",
      tagline: "Monaco compiler with automated test validation",
      description:
        "Tackle realistic algorithm and system design problems inside an isolated compiler sandbox supporting TypeScript, Python, Java, C++, and Go. Run test suites, catch edge cases, and refine your time complexity.",
      icon: <Code2 className="w-4 h-4" />,
      features: [
        "Split-screen question & code editor layout",
        "Isolated container execution across 6+ runtimes",
        "Instant test-case pass/fail assertion feedback"
      ]
    },
    {
      num: "04",
      stepName: "Review",
      title: "Review Your Performance Dossier",
      tagline: "Actionable rubric scorecards & growth insights",
      description:
        "Receive a comprehensive evaluation dossier breaking down code correctness, time/space complexity, modularity, and communication clarity against FAANG-grade rubrics with targeted suggestions for your next round.",
      icon: <Award className="w-4 h-4" />,
      features: [
        "Per-question rubric scoring & analysis",
        "Algorithmic complexity vs. optimal solution critique",
        "Actionable improvement recommendations"
      ]
    }
  ];

  const currentStep = steps[activeStep];

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-elevated/60 px-3 py-1 text-xs font-mono font-medium text-brand-secondary mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span>The Complete Interview Journey</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-brand-text">
          From Setup to Feedback in Four Steps
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-secondary font-normal max-w-2xl mx-auto leading-relaxed">
          CodeForge mirrors the rigorous evaluation workflow of top technology firms. Here is how your mock interview session progresses from start to finish.
        </p>
      </div>

      {/* Connected Sequential Step Timeline Bar */}
      <div className="relative mb-12 max-w-4xl mx-auto">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-px bg-brand-border -translate-y-1/2 z-0" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const isPast = activeStep > idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center sm:flex-col sm:justify-center gap-2 p-2.5 sm:py-3 rounded-lg border transition-all text-left sm:text-center cursor-pointer focus-ring bg-brand-card ${
                  isActive
                    ? "border-cyan-500 text-brand-text shadow-sm"
                    : isPast
                    ? "border-brand-border text-brand-secondary hover:border-brand-border-strong"
                    : "border-brand-border/70 text-brand-secondary/70 hover:border-brand-border"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-colors shrink-0 ${
                    isActive
                      ? "bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950"
                      : isPast
                      ? "bg-brand-elevated text-brand-text border border-brand-border"
                      : "bg-brand-bg text-brand-secondary border border-brand-border"
                  }`}
                >
                  {s.num}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isActive ? "text-brand-text" : "text-brand-secondary"}`}>
                    {s.stepName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Split: Left Narrative + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Step Narrative & Proof Points (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium">
              <span>STAGE {currentStep.num} OF 04</span>
              <span>•</span>
              <span className="text-brand-secondary">{currentStep.tagline}</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-brand-text">
              {currentStep.title}
            </h3>

            <p className="text-sm text-brand-secondary font-normal leading-relaxed">
              {currentStep.description}
            </p>

            <div className="pt-2 space-y-2.5">
              {currentStep.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-start gap-2.5 text-xs text-brand-text">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
            <div className="text-xs font-mono text-brand-secondary">
              Step {activeStep + 1} of 4
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 3))}
                className="px-3 py-1.5 text-xs font-medium rounded border border-brand-border bg-brand-card hover:bg-brand-elevated text-brand-text transition-all cursor-pointer focus-ring"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveStep((prev) => (prev < 3 ? prev + 1 : 0))}
                className="px-3.5 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 transition-all cursor-pointer focus-ring flex items-center gap-1"
              >
                <span>{activeStep === 3 ? "Restart Tour" : "Next Stage"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Stage Product UI Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-brand-border bg-brand-card shadow-xl overflow-hidden min-h-[440px] flex flex-col justify-between">
            {/* Header Window Chrome */}
            <div className="flex items-center justify-between border-b border-brand-border bg-brand-elevated/70 px-4 py-2.5 select-none">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-brand-secondary">
                  STAGE PREVIEW: {currentStep.title.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] font-mono text-brand-secondary">
                Interactive Mock
              </span>
            </div>

            {/* Dynamic Step Content Preview */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
              {/* STEP 1 PREVIEW: Configure Interview */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <div>
                      <div className="text-[11px] text-brand-secondary font-mono">CONFIGURATION WIZARD</div>
                      <h4 className="text-base font-bold text-brand-text">Target Interview Parameters</h4>
                    </div>
                    <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      Preset Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <span className="text-brand-secondary font-mono text-[10px] uppercase">Job Role</span>
                      <div className="font-semibold text-brand-text mt-0.5">Frontend Engineer</div>
                    </div>
                    <div className="p-3 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <span className="text-brand-secondary font-mono text-[10px] uppercase">Experience</span>
                      <div className="font-semibold text-brand-text mt-0.5">1–3 Years</div>
                    </div>
                    <div className="p-3 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <span className="text-brand-secondary font-mono text-[10px] uppercase">Difficulty Mode</span>
                      <div className="font-semibold text-brand-text mt-0.5">Adaptive Hiring Bar</div>
                    </div>
                    <div className="p-3 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <span className="text-brand-secondary font-mono text-[10px] uppercase">Included Rounds</span>
                      <div className="font-semibold text-brand-text mt-0.5">Live Code + Behavioral</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume Skill Parsing (Optional)</span>
                    </div>
                    <p className="text-brand-secondary text-[11px] leading-relaxed">
                      Parsed candidate profile: <strong className="text-brand-text">React, TypeScript, Node.js, WebSockets</strong>. Question bank automatically modeled around your actual stack.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2 PREVIEW: AI Interviewer */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-text">AI Interviewer Session</h4>
                        <div className="text-[11px] text-brand-secondary flex items-center gap-1 font-mono">
                          <Volume2 className="w-3 h-3 text-cyan-500" />
                          <span>Live Voice &amp; Dialogue Active</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                      Listening...
                    </span>
                  </div>

                  <div className="border-l-2 border-cyan-500 pl-3.5 py-1 text-xs text-brand-text leading-relaxed">
                    <span className="font-mono text-[11px] text-brand-secondary uppercase block mb-1">
                      AI Interviewer Prompt:
                    </span>
                    &ldquo;Can you explain the trade-offs between client-side optimistic UI updates and server-validated transitions, and walk me through your rollback strategy when a mutation fails?&rdquo;
                  </div>

                  <div className="rounded-lg border border-brand-border bg-brand-elevated/40 p-3 text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-brand-secondary font-semibold">Candidate Response:</span>
                    <p className="text-brand-text italic text-[11px] leading-relaxed">
                      &ldquo;In my previous project, we maintained an in-memory rollback stack using Immer snapshots. When a mutation was dispatched, we immediately updated the local store...&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-brand-secondary pt-1 border-t border-brand-border">
                    <span>Evaluating: <strong className="text-brand-text font-medium">STAR Methodology &amp; Depth</strong></span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">Structured Response</span>
                  </div>
                </div>
              )}

              {/* STEP 3 PREVIEW: Code Sandbox */}
              {activeStep === 2 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-brand-border pb-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-semibold text-brand-text">RollbackManager.ts</span>
                      <span className="text-brand-secondary">• TypeScript</span>
                    </div>
                    <span className="text-brand-secondary">Isolated V8 Sandbox</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-brand-code-border bg-brand-code-snippet text-brand-code-text text-[11px] leading-relaxed overflow-x-auto">
                    <p><span className="text-purple-600 dark:text-purple-400 font-semibold">export class</span> <span className="text-blue-600 dark:text-blue-400 font-bold">RollbackManager</span>&lt;T&gt; &#123;</p>
                    <p className="pl-4"><span className="text-purple-600 dark:text-purple-400 font-semibold">private</span> history: T[] = [];</p>
                    <p className="pl-4"><span className="text-blue-600 dark:text-blue-400">pushSnapshot</span>(state: T): <span className="text-amber-600 dark:text-amber-300">void</span> &#123;</p>
                    <p className="pl-8"><span className="text-blue-600 dark:text-blue-400">this</span>.history.push(structuredClone(state));</p>
                    <p className="pl-4">&#125;</p>
                    <p className="pl-4"><span className="text-blue-600 dark:text-blue-400">rollback</span>(): T | <span className="text-cyan-600 dark:text-cyan-400">null</span> &#123;</p>
                    <p className="pl-8"><span className="text-purple-600 dark:text-purple-400 font-semibold">return</span> <span className="text-blue-600 dark:text-blue-400">this</span>.history.pop() ?? <span className="text-cyan-600 dark:text-cyan-400">null</span>;</p>
                    <p className="pl-4">&#125;</p>
                    <p>&#125;</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Test Cases: All Edge Cases Validated</span>
                    </div>
                    <span className="text-brand-secondary font-mono">Isolated Container</span>
                  </div>
                </div>
              )}

              {/* STEP 4 PREVIEW: Performance Dossier */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <div>
                      <div className="text-[11px] font-mono text-brand-secondary">EVALUATION DOSSIER</div>
                      <h4 className="text-base font-bold text-brand-text">Performance Assessment Summary</h4>
                    </div>
                    <span className="text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                      Overall: Ready for Final Round
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <div className="text-xs text-brand-secondary font-mono text-[10px]">Technical Accuracy</div>
                      <div className="text-base font-bold text-brand-text font-mono mt-0.5">High</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <div className="text-xs text-brand-secondary font-mono text-[10px]">Complexity O(1)</div>
                      <div className="text-base font-bold text-brand-text font-mono mt-0.5">Optimal</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-brand-border bg-brand-elevated/40">
                      <div className="text-xs text-brand-secondary font-mono text-[10px]">STAR Clarity</div>
                      <div className="text-base font-bold text-brand-text font-mono mt-0.5">Structured</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-xs space-y-1">
                    <div className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Targeted AI Improvement Insight</span>
                    </div>
                    <p className="text-brand-secondary text-[11px] leading-relaxed">
                      &ldquo;Strong algorithmic solution with clean constant-time state mutation. For the next round, explicitly communicate garbage collection overhead when retaining deep cloned snapshots.&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status bar */}
            <div className="px-4 py-2 border-t border-brand-border bg-brand-elevated/40 flex items-center justify-between text-[11px] text-brand-secondary select-none font-mono">
              <span>CodeForge Assessment Engine v2.4</span>
              <span>Interactive Simulator</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
