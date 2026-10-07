import React, { useState } from "react";
import {
  FileText,
  Bot,
  Code2,
  Award,
  Check,
  Brain,
  Mic
} from "lucide-react";

export default function ProductCapabilities() {
  const [activeTab, setActiveTab] = useState(0);

  const capabilities = [
    {
      id: "resume-calibration",
      eyebrow: "INTELLIGENT CALIBRATION",
      tabTitle: "Resume Intelligence",
      headline: "Tailored to Your Stack, Not a Generic Question Bank",
      description:
        "CodeForge extracts your genuine engineering stack, project history, and experience tier from your uploaded resume. It calibrates difficulty dynamically and formulates targeted questions that test the actual frameworks and architectural paradigms you claim on paper.",
      proofPoints: [
        {
          title: "Automated Tech Stack Extraction",
          detail: "Parses frameworks, state management tools, and distributed systems technologies directly from resume content."
        },
        {
          title: "Tiered Difficulty Calibration",
          detail: "Aligns question depth and evaluation rubrics across Junior, Mid, Senior, and Staff engineering benchmarks."
        },
        {
          title: "Project-Grounded Question Synthesis",
          detail: "Generates deep questions exploring specific architectural decisions and trade-offs mentioned in your past projects."
        }
      ],
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: "voice-simulation",
      eyebrow: "CONVERSATIONAL AI SIMULATION",
      tabTitle: "Adaptive Voice Dialogue",
      headline: "Real-Time Interview Dialogue That Probes Your Reasoning",
      description:
        "Unlike static multiple-choice tests, CodeForge conducts live verbal interviews with adaptive follow-ups. The AI interviewer assesses your spoken answers, detects architectural trade-offs, and proactively probes edge cases, rollback strategies, and concurrency hazards.",
      proofPoints: [
        {
          title: "Verbal STAR Articulation Assessment",
          detail: "Evaluates how effectively you structure behavioral and technical answers using Situation, Task, Action, and Result."
        },
        {
          title: "Dynamic Follow-Up Analyzer",
          detail: "Detects architectural claims in your answers and automatically generates contextual follow-up probes."
        },
        {
          title: "Communication Clarity Metrics",
          detail: "Analyzes technical vocabulary density, response organization, and communication confidence without penalizing accents."
        }
      ],
      icon: <Bot className="w-4 h-4" />
    },
    {
      id: "code-sandbox",
      eyebrow: "ISOLATED RUNTIME SANDBOX",
      tabTitle: "Multi-Runtime Sandbox",
      headline: "Real Code Execution in Isolated High-Speed Containers",
      description:
        "Tackle realistic algorithm and full-stack engineering challenges inside an isolated execution sandbox. Write production-grade code, run automated unit test suites, verify edge-case coverage, and inspect execution memory and latency under realistic interview constraints.",
      proofPoints: [
        {
          title: "Multi-Language & Framework Support",
          detail: "Executes Python, TypeScript, JavaScript, Java, C++, and Go alongside full React and Node.js templates."
        },
        {
          title: "Automated Test Case Runners",
          detail: "Runs visible and hidden test suites with automated assertion reporting, standard output streaming, and error tracing."
        },
        {
          title: "Production Resource Limits",
          detail: "Enforces strict container execution timeouts and memory boundaries to mirror true technical assessment environments."
        }
      ],
      icon: <Code2 className="w-4 h-4" />
    },
    {
      id: "evaluation-dossier",
      eyebrow: "4-PHASE HIRING AUDIT",
      tabTitle: "Competency Dossier",
      headline: "Holistic 4-Phase Assessment Beyond Just Pass or Fail",
      description:
        "Technical interviews assess more than just whether a single test passed. CodeForge evaluates you across four comprehensive assessment phases—quantifying algorithmic efficiency, systems architecture, problem solving, and communication maturity with actionable growth guidance.",
      proofPoints: [
        {
          title: "4 Distinct Assessment Phases",
          detail: "Simulates the complete hiring loop: Aptitude & Logic, Core Technical Concepts, Live Coding Sandbox, and Behavioral HR."
        },
        {
          title: "Granular Rubric Evidence",
          detail: "Maps each skill to verifiable transcript quotes, code complexity metrics, and performance benchmarks."
        },
        {
          title: "Targeted Growth Recommendations",
          detail: "Generates prioritized, actionable study topics and complexity refinements to focus your preparation before real rounds."
        }
      ],
      icon: <Award className="w-4 h-4" />
    }
  ];

  const currentCap = capabilities[activeTab];

  return (
    <section id="capabilities" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 scroll-mt-20 border-t border-brand-border/40">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-elevated/60 px-3 py-1 text-xs font-mono font-medium text-brand-secondary mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span>Core Technology Pillars</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-brand-text">
          Engineered for Rigorous Technical Evaluation
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-secondary font-normal max-w-2xl mx-auto leading-relaxed">
          Explore the four core technological pillars powering CodeForge mock interviews—built from real execution sandboxes, speech analyzers, and evaluation rubrics.
        </p>
      </div>

      {/* Modern Refined Segmented Control */}
      <div
        role="tablist"
        aria-label="Product Capabilities"
        className="flex p-1 rounded-xl border border-brand-border bg-brand-elevated/50 max-w-3xl mx-auto mb-10 overflow-x-auto no-scrollbar gap-1 select-none"
      >
        {capabilities.map((cap, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={cap.id}
              role="tab"
              id={`tab-${cap.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${cap.id}`}
              tabIndex={0}
              onClick={() => setActiveTab(idx)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setActiveTab((prev) => (prev + 1) % capabilities.length);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setActiveTab((prev) => (prev - 1 + capabilities.length) % capabilities.length);
                }
              }}
              className={`flex-1 min-w-[150px] sm:min-w-0 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer focus-ring ${
                isActive
                  ? "bg-brand-card text-brand-text shadow-sm border border-brand-border/80"
                  : "text-brand-secondary hover:text-brand-text hover:bg-brand-card/40"
              }`}
            >
              <span>{cap.icon}</span>
              <span>{cap.tabTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Capability Panel Container */}
      <div
        role="tabpanel"
        id={`panel-${currentCap.id}`}
        aria-labelledby={`tab-${currentCap.id}`}
        className="rounded-xl border border-brand-border bg-brand-card p-6 sm:p-8 lg:p-10 shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Narrative & Technical Proofs (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-2 block">
                {currentCap.eyebrow}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text leading-tight">
                {currentCap.headline}
              </h3>
              <p className="mt-3 text-sm text-brand-secondary font-normal leading-relaxed">
                {currentCap.description}
              </p>
            </div>

            {/* Proof Points List */}
            <div className="space-y-3.5 pt-2 border-t border-brand-border/60">
              {currentCap.proofPoints.map((point, pIdx) => (
                <div key={pIdx} className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-brand-text">
                      {point.title}
                    </h4>
                    <p className="text-xs text-brand-secondary font-normal leading-relaxed mt-0.5">
                      {point.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Authentic UI Representation of the Real Feature (6 cols) */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-brand-border bg-brand-elevated/30 shadow-lg overflow-hidden">
              
              {/* TAB 1 VISUAL EVIDENCE: Resume Intelligence Matrix */}
              {activeTab === 0 && (
                <div>
                  <div className="flex items-center justify-between border-b border-brand-border bg-brand-card/90 px-4 py-2.5 text-xs select-none">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-mono font-bold text-brand-text text-[11px]">RESUME PARSER PIPELINE</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Extraction: 94% Confidence
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    {/* Candidate Extraction Card */}
                    <div className="p-3.5 rounded border border-brand-border bg-brand-card space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-brand-text">Detected Candidate Profile</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Senior Full-Stack (4 Yrs)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {["React 18", "TypeScript", "Node.js", "WebSockets", "Kafka", "PostgreSQL", "Redis"].map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px] font-mono font-semibold text-brand-secondary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Question Calibration Preview */}
                    <div className="p-3.5 rounded border border-cyan-500/20 bg-cyan-500/5 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                          CALIBRATED PROJECT QUESTION
                        </span>
                        <span className="text-[10px] font-mono text-brand-secondary">
                          Derived from Project #1
                        </span>
                      </div>
                      <p className="text-brand-text text-[11px] leading-relaxed">
                        &ldquo;Your resume references building a real-time notification gateway handling socket connections. How did you structure your Kafka consumer groups to prevent race conditions during partition rebalances?&rdquo;
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-brand-secondary border-t border-cyan-500/15">
                        <span>Target Skill: <strong className="text-brand-text">Distributed Messaging &amp; Sockets</strong></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Resume Relevant</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2 VISUAL EVIDENCE: Adaptive Voice & Dialogue Engine */}
              {activeTab === 1 && (
                <div>
                  <div className="flex items-center justify-between border-b border-brand-border bg-brand-card/90 px-4 py-2.5 text-xs select-none">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-mono font-bold text-brand-text text-[11px]">ADAPTIVE FOLLOW-UP ENGINE</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      <span>Live Speech Ingress</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                    {/* Live Audio Ingress Waveform */}
                    <div className="flex items-center justify-between p-2.5 rounded border border-brand-border bg-brand-card">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-text">
                        <Mic className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Candidate Speech Feed: Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-1 bg-cyan-500 rounded-full animate-pulse" />
                        <span className="h-5 w-1 bg-cyan-500 rounded-full animate-pulse delay-75" />
                        <span className="h-2 w-1 bg-cyan-500 rounded-full animate-pulse delay-150" />
                        <span className="h-4 w-1 bg-cyan-500 rounded-full animate-pulse delay-100" />
                        <span className="h-2.5 w-1 bg-cyan-500 rounded-full animate-pulse delay-200" />
                      </div>
                    </div>

                    {/* Candidate Transcript */}
                    <div className="p-3 rounded border border-brand-border bg-brand-card/70 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-brand-secondary font-bold">Verbal Transcript:</span>
                      <p className="text-[11px] text-brand-secondary italic leading-relaxed">
                        &ldquo;We opted for optimistic UI updates on mutation events to maintain zero visual latency. However, if the server returned a 409 conflict, we reverted the client snapshot...&rdquo;
                      </p>
                    </div>

                    {/* Follow-up trigger notification */}
                    <div className="p-3 rounded border border-cyan-500/20 bg-cyan-500/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          <span>AI PROBE TRIGGERED</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">STAR Articulation: Strong</span>
                      </div>
                      <p className="text-[11px] text-brand-text leading-relaxed">
                        &ldquo;How did you resolve idempotency when the client retried a failed optimistic mutation across unstable mobile networks?&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3 VISUAL EVIDENCE: Isolated Compiler & Test Runner */}
              {activeTab === 2 && (
                <div className="font-mono text-xs">
                  {/* Editor Header & File Tabs */}
                  <div className="flex items-center justify-between border-b border-brand-code-border bg-brand-code-header px-4 py-2 text-[11px] select-none">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-brand-card border border-brand-border px-2.5 py-1 rounded text-cyan-600 dark:text-cyan-400 font-bold">
                        <Code2 className="w-3 h-3" />
                        <span>useDebounce.ts</span>
                      </div>
                      <span className="text-brand-code-muted hidden sm:inline">SearchFilter.tsx</span>
                    </div>
                    <span className="text-brand-code-muted text-[10px]">TypeScript • V8 Container</span>
                  </div>

                  {/* Code Editor Body */}
                  <div className="p-3.5 bg-brand-code-snippet text-brand-code-text text-[11px] leading-relaxed border-b border-brand-code-border overflow-x-auto">
                    <p><span className="text-purple-600 dark:text-purple-400 font-semibold">export function</span> <span className="text-blue-600 dark:text-blue-400 font-bold">useDebounce</span>&lt;T&gt;(val: T, ms: <span className="text-amber-600 dark:text-amber-300">number</span>): T &#123;</p>
                    <p className="pl-4"><span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> [debounced, setDebounced] = useState&lt;T&gt;(val);</p>
                    <p className="pl-4">useEffect(() =&gt; &#123;</p>
                    <p className="pl-8"><span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> handler = setTimeout(() =&gt; setDebounced(val), ms);</p>
                    <p className="pl-8"><span className="text-purple-600 dark:text-purple-400 font-semibold">return</span> () =&gt; clearTimeout(handler);</p>
                    <p className="pl-4">&#125;, [val, ms]);</p>
                    <p className="pl-4"><span className="text-purple-600 dark:text-purple-400 font-semibold">return</span> debounced;</p>
                    <p>&#125;</p>
                  </div>

                  {/* Test Execution Output */}
                  <div className="p-3 bg-brand-code-bg space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between text-brand-code-muted border-b border-brand-code-border pb-1">
                      <span>CONTAINER TEST SUITE</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">ALL SUITES PASSED</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>✓ Assertion 1: State delay boundary held</span>
                      <span className="text-brand-code-muted font-mono">14ms</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>✓ Assertion 2: Rapid successive keystrokes debounced</span>
                      <span className="text-brand-code-muted font-mono">32ms</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-brand-code-muted text-[9px] border-t border-brand-code-border/50">
                      <span>Memory: 41.2 MB / 256 MB Limit</span>
                      <span>Exit Code: 0</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4 VISUAL EVIDENCE: 4-Phase Hiring Bar Audit */}
              {activeTab === 3 && (
                <div>
                  <div className="flex items-center justify-between border-b border-brand-border bg-brand-card/90 px-4 py-2.5 text-xs select-none">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-mono font-bold text-brand-text text-[11px]">4-PHASE COMPLIANCE AUDIT</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Sample Dossier #CF-8402
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                    {/* Phase Status Rows */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded border border-brand-border bg-brand-card flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-mono text-brand-secondary uppercase">Phase 01</div>
                          <span className="font-bold text-brand-text">Aptitude &amp; Logic</span>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                      </div>
                      <div className="p-2.5 rounded border border-brand-border bg-brand-card flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-mono text-brand-secondary uppercase">Phase 02</div>
                          <span className="font-bold text-brand-text">Core Technical</span>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                      </div>
                      <div className="p-2.5 rounded border border-brand-border bg-brand-card flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-mono text-brand-secondary uppercase">Phase 03</div>
                          <span className="font-bold text-brand-text">Coding Sandbox</span>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                      </div>
                      <div className="p-2.5 rounded border border-brand-border bg-brand-card flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-mono text-brand-secondary uppercase">Phase 04</div>
                          <span className="font-bold text-brand-text">Behavioral STAR</span>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                      </div>
                    </div>

                    {/* Skill Depth Quote Evidence */}
                    <div className="p-3 rounded border border-cyan-500/20 bg-cyan-500/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                          EVALUATOR RUBRIC EVIDENCE
                        </span>
                        <span className="text-[10px] font-mono text-brand-secondary">Decision: READY FOR HIRED</span>
                      </div>
                      <p className="text-brand-text text-[11px] leading-relaxed">
                        &ldquo;Candidate clearly distinguished between optimistic updates and server reconciliation with strong consideration for race condition guards. Algorithmic complexity was optimal with $O(1)$ amortized memory.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Bar */}
              <div className="px-4 py-2.5 border-t border-brand-border bg-brand-card/60 flex items-center justify-between text-[11px] text-brand-secondary select-none">
                <span>Verified CodeForge Architecture Feature</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Production Aligned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
