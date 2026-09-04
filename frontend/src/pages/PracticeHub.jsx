import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";

export default function PracticeHub() {
  const navigate = useNavigate();

  const practiceModes = [
    {
      id: "coding",
      title: "Coding Practice",
      description: "Solve DSA, Algorithms, System Design, and Company-Specific Coding Questions.",
      path: "/practice/coding",
      topics: ["Arrays", "Strings", "Linked List", "Trees", "Graphs", "DP", "Contests"],
      badge: "DSA & Algorithms",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#F59E0B]">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    },
    {
      id: "aptitude",
      title: "Aptitude Practice",
      description: "Practice quantitative aptitude, logical reasoning, and verbal ability questions.",
      path: "/practice/aptitude",
      topics: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"],
      badge: "Problem Solving",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#F59E0B]">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
      )
    },
    {
      id: "technical",
      title: "Technical MCQ Practice",
      description: "Prepare Computer Science fundamentals like databases, networks, and system design.",
      path: "/practice/technical",
      topics: ["DBMS & SQL", "OS & Architecture", "Computer Networks", "OOP Design", "React & Node.js"],
      badge: "CS Fundamentals",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#F59E0B]">
          <rect x="2" y="2" width="20" height="8" rx="1" ry="1" />
          <rect x="2" y="14" width="20" height="8" rx="1" ry="1" />
          <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
          <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
        </svg>
      )
    },
    {
      id: "interview",
      title: "AI Mock Interview",
      description: "Practice real-time behavior, technical, and HR questions with an AI interviewer.",
      path: "/create-interview",
      topics: ["HR Prep Round", "Technical Prep Round", "Coding Prep Round", "Behavioral Analysis"],
      badge: "Interactive AI",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#F59E0B]">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      )
    },
    {
      id: "communication",
      title: "Communication Practice",
      description: "Improve verbal speaking flow, syntax structure, and communication confidence.",
      path: "/practice/hr",
      topics: ["Speaking Flow", "Grammar Analysis", "Pronunciation Tips", "Confidence Stats"],
      badge: "Soft Skills",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#F59E0B]">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      id: "company",
      title: "Company Specific Prep",
      description: "Prepare specifically for interview questions asked at target FAANG companies.",
      path: "/practice/coding",
      topics: ["Google", "Amazon", "Microsoft", "Meta", "Uber", "Netflix"],
      badge: "Target FAANG",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#F59E0B]">
          <rect x="4" y="2" width="16" height="20" rx="1" ry="1" />
          <line x1="9" y1="22" x2="9" y2="16" />
          <line x1="15" y1="22" x2="15" y2="16" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      )
    }
  ];

  const [selectedModeId, setSelectedModeId] = useState(practiceModes[0].id);
  const selectedMode = practiceModes.find(m => m.id === selectedModeId) || practiceModes[0];
  const [selectedTopic, setSelectedTopic] = useState(selectedMode.topics[0]);

  const handleModeChange = (modeId) => {
    setSelectedModeId(modeId);
    const newMode = practiceModes.find(m => m.id === modeId);
    if (newMode) {
      setSelectedTopic(newMode.topics[0]);
    }
  };

  const handleStartPractice = () => {
    if (selectedMode.id === "company") {
      toast.success(`Filtering questions for ${selectedTopic}`);
      navigate(`/practice/coding?search=${encodeURIComponent(selectedTopic)}`);
    } else {
      navigate(`${selectedMode.path}?topic=${encodeURIComponent(selectedTopic)}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 my-auto">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Header Block */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider mb-1 select-none">
              ⚡ Practice Arena
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              Select Your <span className="text-[#F59E0B]">Practice Module</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Choose a practice mode and topic below to launch your customized assessment workspace.
            </p>
          </div>

          {/* Practice Selector Controls */}
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Practice Mode Dropdown */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Select Practice Mode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {selectedMode.icon}
                </div>
                <select
                  value={selectedModeId}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-sm font-bold rounded-sm pl-11 pr-10 py-3 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
                >
                  {practiceModes.map((mode) => (
                    <option key={mode.id} value={mode.id} className="bg-white dark:bg-[#0c1220] text-slate-800 dark:text-slate-100 font-semibold">
                      {mode.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Topic / Focus Area Dropdown */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Select Focus Topic
              </label>
              <div className="relative">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-sm font-bold rounded-sm px-4 py-3 pr-10 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
                >
                  {selectedMode.topics.map((topic) => (
                    <option key={topic} value={topic} className="bg-white dark:bg-[#0c1220] text-slate-800 dark:text-slate-100 font-semibold">
                      {topic}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

          </div>


          {/* Primary CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleStartPractice}
              className="w-full py-3.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-sm font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-[0.99] duration-150 flex items-center justify-center gap-2"
            >
              <span>Start {selectedMode.title}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>

    </main>
  </div>
);
}
