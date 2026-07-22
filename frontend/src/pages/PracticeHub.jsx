import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";

export default function PracticeHub() {
  const navigate = useNavigate();
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const categories = [
    {
      id: "coding",
      title: "Coding Practice",
      description: "Solve DSA, Algorithms, System Design, and Company-Specific Coding Questions.",
      features: ["Arrays", "Strings", "Linked List", "Trees", "Graphs", "DP", "Contests"],
      buttonText: "Start Coding Practice",
      path: "/practice/coding",
      gradient: "from-blue-600/10 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-500/40",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    },
    {
      id: "aptitude",
      title: "Aptitude Practice",
      description: "Practice quantitative aptitude, logical reasoning, and verbal ability questions.",
      features: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"],
      buttonText: "Start Aptitude Practice",
      path: "/practice/aptitude",
      gradient: "from-purple-600/10 to-pink-600/10 border-purple-500/20 hover:border-purple-500/40",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
      )
    },
    {
      id: "technical",
      title: "Technical MCQ Practice",
      description: "Prepare Computer Science fundamentals like databases, networks, and system design.",
      features: ["DBMS & SQL", "OS & Architecture", "Computer Networks", "OOP Design", "React & Node.js"],
      buttonText: "Start Technical Practice",
      path: "/practice/technical",
      gradient: "from-blue-600/10 to-cyan-600/10 border-blue-500/20 hover:border-blue-500/40",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
          <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
        </svg>
      )
    },
    {
      id: "interview",
      title: "AI Mock Interview",
      description: "Practice real-time behavior, technical, and HR questions with an AI interviewer.",
      features: ["HR Prep Round", "Technical Prep Round", "Coding Prep Round", "Behavioral Analysis"],
      buttonText: "Start Interview",
      path: "/create-interview",
      gradient: "from-emerald-600/10 to-teal-600/10 border-emerald-500/20 hover:border-emerald-500/40",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-500">
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
      features: ["Speaking Flow", "Grammar Analysis", "Pronunciation Tips", "Confidence Stats"],
      buttonText: "Start Communication Practice",
      path: "/practice/hr", // Map communication to HR round preparation
      gradient: "from-amber-600/10 to-orange-600/10 border-amber-500/20 hover:border-amber-500/40",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-500">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      id: "company",
      title: "Company Specific Prep",
      description: "Prepare specifically for interview questions asked at target FAANG companies.",
      features: ["Google", "Amazon", "Microsoft", "Meta", "Uber", "Netflix"],
      buttonText: "Start Company Prep",
      action: () => setShowCompanyModal(true),
      gradient: "from-rose-600/10 to-red-600/10 border-rose-500/20 hover:border-rose-500/40",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-rose-500">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="16" />
          <line x1="15" y1="22" x2="15" y2="16" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      )
    }
  ];

  const handleCompanySelect = (companyName) => {
    setShowCompanyModal(false);
    toast.success(`Filtering questions for ${companyName}`);
    navigate(`/practice/coding?search=${companyName}`);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            Choose Your Practice Mode
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Prepare for interviews through coding, aptitude, communication, and technical assessments.
          </p>
        </div>

        {/* Smart Recommendations Section */}
        <section className="bg-gradient-to-br from-indigo-500/[0.04] via-purple-500/[0.04] to-blue-500/[0.02] border border-indigo-500/10 dark:border-indigo-500/5 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-60 h-60 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">✨</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Recommended For You
              </h3>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                Based on your Full Stack Developer roadmap, we recommend:
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Targeting these three critical preparation nodes to maximize your evaluation scores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { title: "1. Coding Practice", path: "/practice/coding", desc: "Solve Algorithms & DSA" },
                { title: "2. Technical MCQs", path: "/practice/technical", desc: "Prepare JS & SQL Core" },
                { title: "3. AI Mock Interview", path: "/create-interview", desc: "Practice real rounds" }
              ].map((rec, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate(rec.path)}
                  className="flex flex-col justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 hover:border-indigo-500/30 dark:hover:border-indigo-500/40 hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-sm group"
                >
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {rec.title}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {rec.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex flex-col justify-between rounded-3xl border bg-brand-card/45 dark:bg-slate-900/40 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-[1.015] hover:shadow-md hover:bg-white dark:hover:bg-slate-900 bg-gradient-to-br ${cat.gradient}`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 shadow-sm shrink-0">
                    {cat.icon}
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {cat.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {cat.description}
                </p>

                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                  <ul className="flex flex-wrap gap-1.5">
                    {cat.features.map((feat, i) => (
                      <li 
                        key={i} 
                        className="text-[9px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-850/60 text-slate-500 dark:text-slate-450 px-2 py-0.5 rounded-md"
                      >
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5">
                <button
                  onClick={() => cat.action ? cat.action() : navigate(cat.path)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-650/10 cursor-pointer active:scale-95 duration-150 flex items-center justify-center gap-1.5"
                >
                  {cat.buttonText}
                </button>
              </div>
            </div>
          ))}
        </section>

      </main>

      {/* Target Company Selector Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCompanyModal(false)}
          />
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-850 rounded-3xl p-5 md:p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">
                  🎯 Target Company Prep
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                  Choose a company to solve real interview questions asked during their rounds.
                </p>
              </div>
              <button 
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Google", color: "hover:border-red-500/40 hover:bg-red-500/[0.02] hover:text-red-500" },
                { name: "Amazon", color: "hover:border-amber-500/40 hover:bg-amber-500/[0.02] hover:text-amber-500" },
                { name: "Microsoft", color: "hover:border-blue-500/40 hover:bg-blue-500/[0.02] hover:text-blue-500" },
                { name: "Meta", color: "hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] hover:text-indigo-500" },
                { name: "Uber", color: "hover:border-slate-500/40 hover:bg-slate-500/[0.02] hover:text-slate-500 dark:hover:text-white" },
                { name: "Netflix", color: "hover:border-red-650/40 hover:bg-red-650/[0.02] hover:text-red-600" }
              ].map((comp) => (
                <button
                  key={comp.name}
                  onClick={() => handleCompanySelect(comp.name)}
                  className={`py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-xs font-black text-slate-700 dark:text-slate-350 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${comp.color}`}
                >
                  {comp.name}
                </button>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
