import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";
import api from "../services/api";
import { demoInterviews } from "../utils/demoData";

function History() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get("/interviews");
        setInterviews(res.data);
      } catch (error) {
        if (error.response?.status === 401) return;
        console.error("Error fetching interview history, using fallback:", error);
        setInterviews(demoInterviews);
        toast.info("Showing simulated interview history because the API is offline.", "Demo Mode Active");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleReattempt = async (interview) => {
    try {
      const res = await api.post("/interviews/create", {
        role: interview.role,
        difficulty: interview.difficulty,
        interviewType: interview.interviewType || "standard",
        language: interview.language || "",
      });
      navigate(`/interview/${res.data._id}`);
    } catch (error) {
      const mockId = `demo-${Date.now()}`;
      const fallbackInterview = {
        ...interview,
        _id: mockId,
        answeredCount: 0,
        questions: interview.questions || [
          "Explain your design decisions.",
          "Describe your debugging approach.",
        ],
      };
      sessionStorage.setItem(mockId, JSON.stringify(fallbackInterview));
      navigate(`/interview/${mockId}`);
    }
  };

  // Filter logic
  const filteredInterviews = interviews.filter((item) => {
    const matchSearch = item.role?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.language?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === "all" || item.interviewType === selectedType;
    const matchDifficulty = selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    return matchSearch && matchType && matchDifficulty;
  });

  // Sorting logic
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (sortBy === "newest") return b._id > a._id ? 1 : -1;
    if (sortBy === "oldest") return a._id > b._id ? 1 : -1;
    if (sortBy === "role") return a.role?.localeCompare(b.role || "");
    if (sortBy === "progress") {
      const progA = (a.answeredCount || 0) / (a.questionCount || a.questions?.length || 1);
      const progB = (b.answeredCount || 0) / (b.questionCount || b.questions?.length || 1);
      return progB - progA;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedInterviews.length / itemsPerPage);
  const paginatedInterviews = sortedInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Overall Stats
  const totalSessions = interviews.length;
  const completedSessions = interviews.filter(i => (i.answeredCount || 0) >= (i.questionCount || i.questions?.length || 1)).length;

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden text-brand-text font-sans">
      <Navbar />

      <main className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider select-none">
              ⚡ Performance Analytics & Records
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
              Interview History & Archives
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Review your past assessment sessions, access detailed AI metrics, and reattempt technical rounds.
            </p>
          </div>

          {/* Quick Summary Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-sm bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-center">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total Sessions</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">{totalSessions}</span>
            </div>
            <div className="px-3.5 py-2 rounded-sm bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-center">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Completed</span>
              <span className="text-sm font-black text-[#F59E0B]">{completedSessions}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by role or language..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
          >
            <option value="all">All Round Types</option>
            <option value="standard">Standard Text Round</option>
            <option value="video">AI Speech / Video Round</option>
            <option value="code">DSA Coding Workspace</option>
            <option value="design">System Design Architecture</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy Level</option>
            <option value="Medium">Medium Level</option>
            <option value="Hard">Hard Level</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="role">Sort by Role Name</option>
            <option value="progress">Sort by Most Progress</option>
          </select>
        </div>

        {/* Sessions Content Section */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-sm border-2 border-slate-200 border-t-[#F59E0B]" />
          </div>
        ) : paginatedInterviews.length > 0 ? (
          <div className="space-y-6">
            
            {/* Grid of Session Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedInterviews.map((interview) => {
                const total = interview.questionCount || interview.questions?.length || 0;
                const answered = interview.answeredCount || 0;
                const progressPct = total > 0 ? Math.round((answered / total) * 100) : 0;

                return (
                  <div
                    key={interview._id}
                    className="flex flex-col justify-between rounded-sm border border-slate-200 dark:border-slate-800 bg-brand-card p-5 shadow-sm transition-all duration-200 hover:border-[#F59E0B]/50 hover:shadow-md space-y-4"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                          {interview.interviewType || "Standard"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {answered}/{total} Answered
                        </span>
                      </div>

                      {/* Title & Info */}
                      <div>
                        <h3 className="line-clamp-1 text-sm font-black text-slate-800 dark:text-white tracking-tight">
                          {interview.role}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {interview.difficulty} {interview.language ? `· ${interview.language}` : ""}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>Completion</span>
                          <span className="text-[#F59E0B]">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-sm bg-slate-100 dark:bg-[#070b13] border border-slate-200/50 dark:border-slate-800/50">
                          <div
                            className="h-full rounded-sm bg-[#F59E0B] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/interview/${interview._id}/responses`)}
                        className="w-full py-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b13] text-[#0F172A] dark:text-slate-200 text-xs font-black uppercase tracking-wider hover:border-slate-400 transition-colors cursor-pointer text-center"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleReattempt(interview)}
                        className="w-full py-2 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        Reattempt
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b13] text-xs font-black text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b13] text-xs font-black text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
              No matching interview sessions found
            </h3>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
              Try adjusting your search terms or clearing your selected filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedDifficulty("all");
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default History;
