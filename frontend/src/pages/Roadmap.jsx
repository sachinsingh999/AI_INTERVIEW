import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";
import api from "../services/api";

export default function Roadmap() {
  const navigate = useNavigate();

  // State for AI Roadmap Generator Form
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [role, setRole] = useState("Full Stack Engineer");
  const [level, setLevel] = useState("Intermediate (1-3 yrs)");
  const [duration, setDuration] = useState("8 Weeks");
  const [focusAreas, setFocusAreas] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  // Default initial roadmap state
  const defaultRoadmap = {
    title: "AI Personalized Full Stack Engineer Master Roadmap",
    targetRole: "Full Stack Engineer",
    level: "Intermediate (1-3 yrs)",
    duration: "8 Weeks",
    summary: "A customized 8-week learning path computed by AI. Focuses on core DSA efficiency, backend microservice architecture, and system scalability.",
    phases: [
      {
        id: "phase-1",
        phaseNumber: 1,
        title: "1. Core Logic & DSA Acceleration",
        duration: "Weeks 1-2",
        badge: "DSA & Algorithms",
        desc: "Master fundamental data structures, array windowing, time-complexity analysis, and clean recursion.",
        topics: ["Arrays & Strings", "Hash Tables", "Two Pointers", "Sliding Window"],
        checklist: [
          { id: "p1-c1", text: "Solve 15 array manipulation & string windowing exercises", checked: true },
          { id: "p1-c2", text: "Master Hash Map frequency counters and two-pointer techniques", checked: true },
          { id: "p1-c3", text: "Implement custom debouncers and throttle utilities from scratch", checked: false },
          { id: "p1-c4", text: "Analyze Big-O time and space complexity for recursive algorithms", checked: false }
        ],
        resources: [
          { label: "DSA Practice Arena", link: "/practice/coding?topic=Arrays", type: "practice" },
          { label: "Algorithms Patterns Breakdown", link: "/practice/coding", type: "article" }
        ]
      },
      {
        id: "phase-2",
        phaseNumber: 2,
        title: "2. System Design & Scalable Architecture",
        duration: "Weeks 3-5",
        badge: "System Design",
        desc: "Build scalable distributed architectures, master database indexing, caching strategies, and load balancing.",
        topics: ["Database Indexing", "Redis Caching", "REST & GraphQL", "Load Balancers"],
        checklist: [
          { id: "p2-c1", text: "Design a high-throughput Rate Limiter & URL Shortener", checked: false },
          { id: "p2-c2", text: "Compare Write-Through vs Write-Back cache invalidation policies", checked: false },
          { id: "p2-c3", text: "Understand SQL B-Tree indexing vs NoSQL key-value patterns", checked: false },
          { id: "p2-c4", text: "Complete 1 Technical MCQ Practice Quiz on Databases & Networks", checked: false }
        ],
        resources: [
          { label: "Technical MCQ Practice", link: "/practice/technical?topic=DBMS%20%26%20SQL", type: "practice" },
          { label: "System Design Scalability Principles", link: "#", type: "article" }
        ]
      },
      {
        id: "phase-3",
        phaseNumber: 3,
        title: "3. Advanced Microservices & Production Patterns",
        duration: "Weeks 6-7",
        badge: "Backend & Cloud",
        desc: "Hone asynchronous event pipelines, JWT security workflows, and containerized deployment.",
        topics: ["Docker & K8s", "Message Queues (Kafka/RabbitMQ)", "OAuth & Auth", "CI/CD Pipelines"],
        checklist: [
          { id: "p3-c1", text: "Implement asynchronous event streaming with pub/sub architecture", checked: false },
          { id: "p3-c2", text: "Audit API security rules and implement rate limiting middleware", checked: false },
          { id: "p3-c3", text: "Dockerize a fullstack web service with multi-stage builds", checked: false }
        ],
        resources: [
          { label: "Backend System Quiz", link: "/practice/technical?topic=OS%20%26%20Architecture", type: "practice" },
          { label: "Microservices Security Guide", link: "#", type: "article" }
        ]
      },
      {
        id: "phase-4",
        phaseNumber: 4,
        title: "4. AI Mock Interview & Live Technical Evaluation",
        duration: "Week 8",
        badge: "Interview Simulation",
        desc: "Participate in real-time AI mock interviews, practice STAR response framing, and eliminate speech fillers.",
        topics: ["STAR Method", "Behavioral Rounds", "Live System Defense", "Speech Flow"],
        checklist: [
          { id: "p4-c1", text: "Complete 1 full-length AI Mock Technical Interview round", checked: false },
          { id: "p4-c2", text: "Analyze video & speech feedback to reduce filler words (< 3 per min)", checked: false },
          { id: "p4-c3", text: "Prepare 5 STAR stories highlighting key project challenges & tradeoffs", checked: false }
        ],
        resources: [
          { label: "Start AI Mock Interview", link: "/create-interview", type: "practice" },
          { label: "Communication Flow Practice", link: "/practice/hr", type: "practice" }
        ]
      }
    ]
  };

  // Active Roadmap State loaded from localStorage or default
  const [roadmap, setRoadmap] = useState(() => {
    try {
      const saved = localStorage.getItem("ai-user-roadmap");
      return saved ? JSON.parse(saved) : defaultRoadmap;
    } catch {
      return defaultRoadmap;
    }
  });

  // Save to localStorage whenever roadmap updates
  useEffect(() => {
    try {
      localStorage.setItem("ai-user-roadmap", JSON.stringify(roadmap));
    } catch (e) {
      console.error("Failed to save roadmap to localStorage:", e);
    }
  }, [roadmap]);

  // Calculate dynamic progress completion percentage
  const totalItems = roadmap.phases.reduce((acc, p) => acc + (p.checklist ? p.checklist.length : 0), 0);
  const checkedItems = roadmap.phases.reduce(
    (acc, p) => acc + (p.checklist ? p.checklist.filter(c => c.checked).length : 0),
    0
  );
  const completionPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Toggle checklist checkbox state
  const handleToggleChecklist = (phaseId, checkId) => {
    setRoadmap(prev => {
      const updatedPhases = prev.phases.map(p => {
        if (p.id === phaseId) {
          const updatedChecklist = p.checklist.map(c => {
            if (c.id === checkId) return { ...c, checked: !c.checked };
            return c;
          });
          return { ...p, checklist: updatedChecklist };
        }
        return p;
      });
      return { ...prev, phases: updatedPhases };
    });
  };

  // AI Roadmap Generation Call
  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    setGenerationStep("Analyzing target role & experience level...");

    try {
      const token = localStorage.getItem("token");
      setGenerationStep("Synthesizing learning milestones & checklist items...");

      const res = await api.post(
        "/roadmap/generate",
        { role, level, duration, focusAreas },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.data) {
        setRoadmap(res.data.data);
        toast.success(`✨ AI Roadmap successfully generated for ${role}!`);
        setShowGeneratorModal(false);
      } else {
        toast.error("Could not generate roadmap. Please try again.");
      }
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast.error("Error connecting to AI service. Using smart template.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick preset loader
  const handleLoadPreset = (presetRole, presetDuration) => {
    setRole(presetRole);
    setDuration(presetDuration);
    setShowGeneratorModal(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Block with Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider select-none">
              ✨ AI Powered Preparation Roadmap
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {roadmap.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {roadmap.summary}
            </p>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-3 shrink-0">
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="px-4 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>✨ Generate AI Roadmap</span>
            </button>

            <div className="w-full md:w-48 space-y-1">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                <span>Progress</span>
                <span className="text-[#F59E0B]">{completionPercentage}% Completed</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#070b13] rounded-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                <div 
                  className="h-full bg-[#F59E0B] transition-all duration-500 ease-out" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick AI Presets Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Quick AI Presets:
          </span>
          {[
            { label: "Frontend Specialist", role: "Senior Frontend Engineer", duration: "6 Weeks" },
            { label: "Backend Microservices", role: "Backend Microservices Architect", duration: "8 Weeks" },
            { label: "FAANG DSA & Algo", role: "FAANG DSA Specialist", duration: "12 Weeks" },
            { label: "Full Stack Master", role: "Full Stack Engineer", duration: "8 Weeks" }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleLoadPreset(preset.role, preset.duration)}
              className="text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-300 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors shrink-0 cursor-pointer"
            >
              ⚡ {preset.label}
            </button>
          ))}
        </div>

        {/* Timeline Node List */}
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
          {roadmap.phases.map((phase, idx) => {
            const phaseTotal = phase.checklist ? phase.checklist.length : 0;
            const phaseDone = phase.checklist ? phase.checklist.filter(c => c.checked).length : 0;
            const isPhaseComplete = phaseTotal > 0 && phaseDone === phaseTotal;

            return (
              <div key={phase.id || idx} className="relative space-y-3">
                
                {/* Timeline Marker Circle */}
                <span className={`absolute -left-[35px] sm:-left-[43px] top-1 flex h-8 w-8 items-center justify-center rounded-sm text-xs font-black border transition-all ${
                  isPhaseComplete
                    ? "bg-[#F59E0B] text-[#0F172A] border-[#F59E0B] shadow-md shadow-[#F59E0B]/20"
                    : phaseDone > 0
                    ? "bg-slate-800 text-white border-slate-700"
                    : "bg-white dark:bg-[#070b13] text-slate-400 border-slate-200 dark:border-slate-800"
                }`}>
                  {idx + 1}
                </span>

                {/* Milestone Section */}
                <div className="space-y-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60 last:border-0">
                  
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">
                          {phase.title}
                        </h3>
                        {phase.badge && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                            {phase.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {phase.desc}
                      </p>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-sm bg-slate-100 dark:bg-[#070b13] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 self-start sm:self-auto">
                      ⏱ {phase.duration}
                    </span>
                  </div>

                  {/* Key Topics Tags */}
                  {phase.topics && phase.topics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1">Focus Topics:</span>
                      {phase.topics.map((topic, tidx) => (
                        <span 
                          key={tidx}
                          className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-[#070b13] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Checklist Items */}
                  {phase.checklist && phase.checklist.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Action Checklist ({phaseDone}/{phaseTotal})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {phase.checklist.map((item) => (
                          <label
                            key={item.id}
                            onClick={() => handleToggleChecklist(phase.id, item.id)}
                            className="flex items-center gap-3 py-1.5 px-1 transition-all cursor-pointer select-none text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded-sm accent-[#F59E0B] cursor-pointer"
                            />
                            <span className={`text-xs font-semibold ${item.checked ? "line-through opacity-60 text-slate-500" : ""}`}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Resources & Direct Practice Button */}
                  {phase.resources && phase.resources.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {phase.resources.map((res, ridx) => (
                        <button
                          key={ridx}
                          onClick={() => res.link !== "#" && navigate(res.link)}
                          className={`text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-sm border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            res.type === "practice"
                              ? "bg-[#F59E0B] text-[#0F172A] border-[#F59E0B] hover:bg-[#D97706]"
                              : "bg-slate-100 dark:bg-[#070b13] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                          }`}
                        >
                          <span>{res.label}</span>
                          <span>➔</span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>


              </div>
            );
          })}
        </div>

      </main>

      {/* AI Roadmap Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isGenerating && setShowGeneratorModal(false)}
          />

          <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  ✨ Generate AI Preparation Roadmap
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Specify your target role and goals. Gemini AI will synthesize a custom step-by-step roadmap.
                </p>
              </div>
              {!isGenerating && (
                <button
                  onClick={() => setShowGeneratorModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Form Controls */}
            <div className="space-y-4">
              
              {/* Target Role */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Role / Domain
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Engineer, Frontend Specialist, System Design Lead..."
                  className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              {/* Level & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Experience Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] cursor-pointer"
                  >
                    <option value="Fresher / Junior (0-1 yrs)">Fresher / Junior (0-1 yrs)</option>
                    <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                    <option value="Senior / Lead (4+ yrs)">Senior / Lead (4+ yrs)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Preparation Timeframe
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] cursor-pointer"
                  >
                    <option value="4 Weeks">4 Weeks (Crash Course)</option>
                    <option value="8 Weeks">8 Weeks (Standard)</option>
                    <option value="12 Weeks">12 Weeks (Comprehensive)</option>
                  </select>
                </div>
              </div>

              {/* Custom Focus Prompt */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Custom Objectives / Technologies (Optional)
                </label>
                <textarea
                  rows={3}
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  placeholder="e.g. Focus on React 19, Microservice Architecture, Redis Caching, and System Design interview questions..."
                  className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold rounded-sm p-3 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

            </div>

            {/* Generation Status */}
            {isGenerating && (
              <div className="p-3 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin shrink-0" />
                <span className="text-xs font-bold text-[#F59E0B] animate-pulse">
                  {generationStep}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                disabled={isGenerating}
                onClick={() => setShowGeneratorModal(false)}
                className="px-4 py-2 rounded-sm text-xs font-black uppercase text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isGenerating}
                onClick={handleGenerateRoadmap}
                className="px-5 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{isGenerating ? "Generating..." : "✨ Generate Roadmap"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
