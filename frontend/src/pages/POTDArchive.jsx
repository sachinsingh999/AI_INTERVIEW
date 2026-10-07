import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  X,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Filter,
  RotateCcw
} from "lucide-react";
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

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      case "Hard":
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25";
      case "Medium":
      default:
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25";
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full px-3.5 sm:px-5 lg:px-6 py-3.5 space-y-3.5">
        
        {/* TOP HEADER */}
        <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-xs transition-all duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-xs shrink-0">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                    Daily Challenge Archive
                  </h1>
                  <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-black border border-amber-500/30">
                    {archive.length} Challenges
                  </span>
                </div>
                <p className="text-xs text-brand-secondary font-medium">
                  Review and solve historical Daily Coding Challenges to reinforce algorithm mastery.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/practice/coding")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Back to Coding Arena</span>
            </button>
          </div>
        </section>

        {/* CONTENT & FILTER BAR */}
        <div className="space-y-3">
          
          {/* Filter Toolbar */}
          <div className="bg-brand-card border border-brand-border rounded-sm p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search past problems by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-brand-elevated border border-brand-border rounded-xs text-xs font-semibold text-brand-text placeholder:text-brand-secondary/60 outline-none focus:border-brand-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-brand-elevated border border-brand-border rounded-xs px-2.5 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer transition-colors"
              >
                <option value="All">Difficulty: All</option>
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-brand-elevated border border-brand-border rounded-xs px-2.5 py-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer transition-colors"
              >
                <option value="All">Status: All</option>
                <option value="Solved">✓ Solved</option>
                <option value="Unsolved">⭕ Unsolved</option>
              </select>

              {(searchQuery || selectedDifficulty !== "All" || selectedStatus !== "All") && (
                <button
                  onClick={handleResetFilters}
                  className="p-2 bg-brand-elevated border border-brand-border text-brand-secondary hover:text-brand-text rounded-xs cursor-pointer"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-brand-card rounded-sm border border-brand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
                <thead className="sticky top-0 z-10 bg-brand-elevated/90 backdrop-blur-sm border-b border-brand-border text-brand-secondary text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="py-3 px-3.5 w-14 text-center">Status</th>
                    <th className="py-3 px-3 w-28">Date</th>
                    <th className="py-3 px-4 w-[45%]">Problem Title</th>
                    <th className="py-3 px-3 w-28 text-center">Difficulty</th>
                    <th className="py-3 px-3">Topic Tags</th>
                    <th className="py-3 px-4 text-right w-24">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-brand-border/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-brand-secondary font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          <span>Loading POTD history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredArchive.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-brand-secondary space-y-3">
                        <div className="text-2xl opacity-40">🔍</div>
                        <p className="font-bold text-sm text-brand-text">No past challenges match your filter</p>
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-1.5 bg-[#F59E0B] text-[#0F172A] font-bold text-xs rounded-xs cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredArchive.map((item, idx) => {
                      const q = item.question;
                      const isSolved = item.solved;

                      return (
                        <tr
                          key={item._id}
                          onClick={() => navigate(`/practice/coding/${q._id}`)}
                          className={`cursor-pointer transition-colors duration-150 group hover:bg-brand-elevated/80 ${
                            idx % 2 === 0 ? "bg-transparent" : "bg-brand-bg/30"
                          }`}
                        >
                          <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            {isSolved ? (
                              <div className="inline-flex items-center justify-center text-emerald-500" title="Solved">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center text-brand-secondary/40" title="Unsolved">
                                <Circle className="w-4 h-4" />
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono font-semibold text-brand-secondary whitespace-nowrap text-[11px]">
                            {formatDate(item.publishedAt)}
                          </td>

                          <td className="py-3 px-4 font-bold text-brand-text group-hover:text-brand-primary transition-colors truncate">
                            {q.title}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-xs uppercase tracking-wider border ${getDifficultyBadge(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-brand-secondary font-medium truncate">
                            {(q.tags || []).join(", ") || "General"}
                          </td>

                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/practice/coding/${q._id}`)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xs text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                                isSolved
                                  ? "bg-brand-elevated hover:bg-brand-elevated/80 text-brand-secondary border border-brand-border"
                                  : "bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] shadow-xs"
                              }`}
                            >
                              <span>{isSolved ? "Review" : "Solve"}</span>
                              <ArrowRight className="w-3 h-3" />
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
