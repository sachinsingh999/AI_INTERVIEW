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
      // Offline fallback creation
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

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden text-brand-text">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/15 blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-blue-200/10 blur-[100px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Past performance</p>
            <h1 className="text-3xl font-black tracking-tight text-brand-text leading-none mt-2">Interview History</h1>
            <p className="text-xs text-brand-secondary font-semibold mt-1">Review your results, access detailed AI analysis, and retry rounds.</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-card border border-brand-border px-3.5 py-1 text-xs font-black text-brand-secondary shadow-sm">
            {filteredInterviews.length} sessions filtered
          </span>
        </div>



        {/* Search, Filter, Sort Controls */}
        <section className="mb-8 rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by role or language..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard (Text)</option>
              <option value="video">Video (Speech-to-Text)</option>
              <option value="code">Code (Monaco IDE)</option>
              <option value="design">System Design (Canvas)</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="role">Role Alphabetical</option>
              <option value="progress">Most Answered First</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-indigo-600" />
          </div>
        ) : paginatedInterviews.length > 0 ? (
          <>
            {/* Grid of interviews */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedInterviews.map((interview) => {
                const total = interview.questionCount || interview.questions?.length || 0;
                const answered = interview.answeredCount || 0;
                const progressPct = total > 0 ? Math.round((answered / total) * 100) : 0;

                return (
                  <div
                    key={interview._id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <span className="rounded-lg bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700">
                            {interview.interviewType || "Standard"}
                          </span>
                          <span className="text-xs font-bold text-brand-secondary">
                            {answered}/{total} Answered
                          </span>
                        </div>

                        <h3 className="line-clamp-2 text-xl font-black tracking-tight text-brand-text group-hover:text-indigo-650 transition-colors">
                          {interview.role}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-brand-secondary">
                          {interview.difficulty} {interview.language ? `· ${interview.language}` : ""}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-[10px] font-bold text-brand-secondary mb-1">
                            <span>Completion</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-bg">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => navigate(`/interview/${interview._id}/responses`)}
                          className="rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-xs font-black text-brand-text transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.03] active:scale-95 duration-100"
                        >
                          Review Report
                        </button>
                        <button
                          onClick={() => handleReattempt(interview)}
                          className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-650 hover:scale-[1.03] active:scale-95 duration-100"
                        >
                          Reattempt
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="rounded-lg border border-brand-border bg-brand-card px-3.5 py-2 text-xs font-black text-brand-secondary transition hover:bg-brand-bg disabled:pointer-events-none disabled:opacity-40 hover:scale-[1.02] active:scale-95 duration-100"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-brand-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="rounded-lg border border-brand-border bg-brand-card px-3.5 py-2 text-xs font-black text-brand-secondary transition hover:bg-brand-bg disabled:pointer-events-none disabled:opacity-40 hover:scale-[1.02] active:scale-95 duration-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-250 bg-brand-card/40 p-12 text-center">
            <h3 className="text-lg font-black text-slate-800">No interviews match your filters</h3>
            <p className="mt-2 text-xs text-brand-secondary">Try adjusting your keywords, interview types, or difficulties.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedDifficulty("all");
                setCurrentPage(1);
              }}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 duration-100"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default History;
