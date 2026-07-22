import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch all interview rounds
      const res = await api.get("/interviews/admin/all");
      const rounds = res.data || [];

      // Group rounds by unique user email/ID
      const grouped = {};
      rounds.forEach((round) => {
        if (!round.user) return;
        const uid = round.user._id;
        if (!grouped[uid]) {
          grouped[uid] = {
            id: uid,
            name: round.user.name || "Anonymous",
            email: round.user.email || "",
            role: round.role || "Software Engineer",
            difficulty: round.difficulty || "Intermediate",
            experience: round.difficulty === "Easy" ? "Junior (0-2 yrs)" : round.difficulty === "Medium" ? "Mid-Level (2-5 yrs)" : "Senior (5+ yrs)",
            rounds: {},
            created: round.createdAt,
          };
        }

        // Map round types
        const type = round.interviewType;
        grouped[uid].rounds[type] = {
          id: round._id,
          answered: round.answeredCount || 0,
          total: round.questionCount || 0,
          created: round.createdAt,
        };
      });

      // Convert grouped object to array
      const candList = Object.values(grouped);
      setCandidates(candList);
    } catch (err) {
      console.error("Error loading candidates:", err);
      setError(err.response?.data?.message || "Failed to load candidates checklist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const getRoundStatus = (cand, key) => {
    const round = cand.rounds[key];
    if (!round) return "Locked";
    if (round.answered === 0) return "Pending";
    if (round.answered < round.total) return "Under Review";
    return "Passed";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Passed":
      case "Cleared":
      case "Hired":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
      case "Failed":
      case "Rejected":
        return "bg-rose-500/10 border-rose-500/20 text-rose-500";
      case "Under Review":
      case "Shortlisted":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-500";
      case "Pending":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      default:
        return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  const filtered = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || c.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20">
          <div>
            <h1 className="text-md font-black tracking-tight">Candidates Hub</h1>
            <p className="text-[10px] font-semibold text-slate-400">Review applications and coordinate manual scores.</p>
          </div>
          <button
            onClick={fetchCandidates}
            className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 text-xs font-black text-slate-300 active:scale-95 duration-100 cursor-pointer"
          >
            ↻ Refresh List
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Candidates", value: candidates.length, color: "text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/10" },
              { label: "Under Review", value: candidates.filter(c => Object.values(c.rounds).some(r => r.answered > 0)).length, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
              { label: "Hired Status", value: 0, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
              { label: "Rejected Status", value: 0, color: "text-rose-400", bg: "bg-rose-500/5 border-rose-500/10" },
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-2xl border p-5 ${stat.bg}`}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                <span className={`text-2xl font-black ${stat.color} block mt-1`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <input
                type="text"
                placeholder="Search candidate name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:border-indigo-500 transition duration-150"
              />
              <svg className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 py-2 px-3 outline-none focus:border-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="software">Software Engineer</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Engineer</option>
              </select>
            </div>
          </div>

          {/* Candidates List Table */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/20 overflow-hidden shadow-lg">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-semibold text-xs">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
                Loading candidate profiles...
              </div>
            ) : error ? (
              <div className="p-6 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 font-bold m-4 rounded-xl leading-relaxed">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 font-semibold">
                No matching candidate profiles found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-950/40 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-4.5 px-6">Candidate</th>
                      <th className="py-4.5 px-3">Role</th>
                      <th className="py-4.5 px-3">Experience</th>
                      <th className="py-4.5 px-3 text-center">OA</th>
                      <th className="py-4.5 px-3 text-center">Tech 1</th>
                      <th className="py-4.5 px-3 text-center">Tech 2</th>
                      <th className="py-4.5 px-3 text-center">HR</th>
                      <th className="py-4.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filtered.map((cand) => {
                      const oaStatus = getRoundStatus(cand, "oa");
                      const tech1Status = getRoundStatus(cand, "tech1");
                      const tech2Status = getRoundStatus(cand, "tech2") === "Locked" ? getRoundStatus(cand, "code") : getRoundStatus(cand, "tech2");
                      const hrStatus = getRoundStatus(cand, "video");

                      return (
                        <tr key={cand.id} className="hover:bg-slate-900/25 transition">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-black text-indigo-400">
                              {cand.name.charAt(0)}
                            </span>
                            <div>
                              <span className="font-extrabold text-slate-200 block">{cand.name}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block">{cand.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-slate-200">{cand.role}</td>
                          <td className="py-4 px-3 text-slate-400">{cand.experience}</td>
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(oaStatus)}`}>
                              {oaStatus}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(tech1Status)}`}>
                              {tech1Status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(tech2Status)}`}>
                              {tech2Status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(hrStatus)}`}>
                              {hrStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => navigate(`/candidates/${cand.id}`)}
                              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-[10px] font-black text-white active:scale-95 duration-100 cursor-pointer"
                            >
                              Review Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
