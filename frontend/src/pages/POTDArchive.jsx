import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";

export default function POTDArchive() {
  const navigate = useNavigate();
  const { theme, resolvedTheme } = useTheme();

  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Fetch POTD Archive List
  const fetchArchive = async () => {
    try {
      setLoading(true);
      const res = await api.get("/potd/archive");
      setArchive(res.data || []);
    } catch (err) {
      console.error("Error loading POTD archive:", err);
      toast.error("Failed to load Problem of the Day archive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  // Filter archived POTDs
  const filteredArchive = archive.filter((item) => {
    if (!item.question) return false;
    
    const q = item.question;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === "All" || q.difficulty === selectedDifficulty;

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Solved" && item.solved) ||
      (selectedStatus === "Unsolved" && !item.solved);

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedStatus("All");
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="hidden lg:block w-68 shrink-0 lg:sticky lg:top-[90px] h-fit space-y-6">
          <div className="bg-brand-card/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2.5">
            <h3 className="text-[10px] font-black text-brand-secondary dark:text-brand-secondary uppercase tracking-widest px-2.5">
              Arena Navigation
            </h3>
            
            <div className="space-y-1.5">
              <button
                onClick={() => navigate("/practice")}
                className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-black text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-brand-bg/50 dark:hover:bg-slate-800/50 transition-all duration-150 cursor-pointer"
              >
                <span>←</span>
                <span>Back to Hub</span>
              </button>

              <button
                onClick={() => navigate("/practice/coding")}
                className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition-all duration-150 cursor-pointer text-brand-secondary dark:text-brand-secondary hover:text-brand-text dark:hover:text-white hover:bg-brand-bg/50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <span>Question Library</span>
                </div>
              </button>

              <button
                onClick={() => navigate("/practice/potd/archive")}
                className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition-all duration-150 cursor-pointer bg-gradient-to-r from-blue-650 to-indigo-600 text-white shadow-md shadow-indigo-650/15 scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>POTD Archive</span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <div className="flex-grow flex-1 min-w-0 space-y-6">
          <div>
            <h3 className="text-base font-bold text-brand-text tracking-tight flex items-center gap-2">
              <span className="text-lg">🕒</span> Problem of the Day Archive
            </h3>
            <p className="text-[11px] text-brand-secondary mt-0.5">
              Review and solve previous daily coding challenges.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-brand-card/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-brand-border dark:border-slate-800/80 shadow-sm">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-secondary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search past problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-brand-bg dark:bg-slate-950/40 border border-brand-border dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-brand-bg dark:bg-slate-950/40 text-brand-secondary dark:text-slate-300 border border-brand-border dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
              >
                <option value="All">Difficulty: All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-brand-bg dark:bg-slate-950/40 text-brand-secondary dark:text-slate-300 border border-brand-border dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
              >
                <option value="All">Status: All</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>
          </div>

          {/* Zebra Table of past problems */}
          <div className="bg-brand-card/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-250/60 dark:border-slate-800/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-brand-bg/90 dark:bg-slate-950/90 border-b border-brand-border dark:border-slate-800">
                  <tr className="text-brand-secondary text-[10px] font-black uppercase tracking-widest">
                    <th className="py-4 px-4 w-18 text-center">Status</th>
                    <th className="py-4 px-4 w-28">Date</th>
                    <th className="py-4 px-4 w-[45%]">Problem</th>
                    <th className="py-4 px-4 w-28 text-center">Difficulty</th>
                    <th className="py-4 px-4">Topics</th>
                    <th className="py-4 px-4 text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/70 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-brand-secondary font-black tracking-wide">
                        <svg className="animate-spin h-5 w-5 mx-auto text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading POTD history...
                      </td>
                    </tr>
                  ) : filteredArchive.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-brand-secondary space-y-4">
                        <div className="text-3xl opacity-35">🔍</div>
                        <p className="font-black text-sm">No historical problems match the criteria</p>
                        <button
                           onClick={handleResetFilters}
                           className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer inline-block"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredArchive.map((item, idx) => {
                      const q = item.question;
                      const isSolved = item.solved;

                      let diffStyle = "text-emerald-655 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-500/10";
                      if (q.difficulty === "Medium") diffStyle = "text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-500/10";
                      if (q.difficulty === "Hard") diffStyle = "text-rose-655 dark:text-rose-450 bg-rose-50 dark:bg-rose-500/10";

                      return (
                        <tr
                          key={item._id}
                          onClick={() => navigate(`/practice/coding/${q._id}`)}
                          className={`cursor-pointer transition-all duration-150 group border-l-2 border-l-transparent ${
                            idx % 2 === 0 ? "bg-transparent" : "bg-brand-bg/20 dark:bg-slate-950/10"
                          } hover:bg-brand-bg/40 dark:hover:bg-slate-950/40 hover:border-l-indigo-600 dark:hover:border-l-indigo-500`}
                        >
                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {isSolved ? (
                              <svg className="w-5 h-5 mx-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-brand-secondary whitespace-nowrap">
                            {formatDate(item.publishedAt)}
                          </td>
                          <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {q.title}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block ${diffStyle}`}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-brand-secondary font-bold truncate">
                            {(q.tags || []).join(", ")}
                          </td>
                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/practice/coding/${q._id}`)}
                              className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 ${
                                isSolved
                                  ? "bg-brand-bg dark:bg-slate-800/80 hover:bg-brand-border border border-brand-border dark:border-slate-700/60 text-brand-secondary dark:text-slate-350"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white shadow-md shadow-indigo-650/10"
                              }`}
                            >
                              {isSolved ? "Review" : "Solve"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
