import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ats"); // ats, users
  
  // State from legacy admin console
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInterviews: 0,
    totalSubmissions: 0,
    trends: { registration: [], interviews: [] }
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [usersRes, statsRes] = await Promise.all([
        api.get("/users/admin/users"),
        api.get("/users/admin/stats")
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to load administrative console data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (userId) => {
    if (userId === currentUser._id) {
      alert("Safety Check: You cannot change your own administrator status.");
      return;
    }
    try {
      const res = await api.put(`/users/admin/toggle-role/${userId}`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: res.data.user.role } : u));
      const statsRes = await api.get("/users/admin/stats");
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle role.");
    }
  };

  // Combine trends data for recharts
  const activityData = [];
  const regMap = {};
  const intMap = {};
  stats.trends?.registration?.forEach(t => { regMap[t.date] = t.count; });
  stats.trends?.interviews?.forEach(t => { intMap[t.date] = t.count; });
  const allDates = Array.from(new Set([...Object.keys(regMap), ...Object.keys(intMap)])).sort();
  allDates.forEach(date => {
    activityData.push({
      date,
      Registrations: regMap[date] || 0,
      Interviews: intMap[date] || 0
    });
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0">
          <div>
            <h1 className="text-md font-black tracking-tight">Recruiter Command Center</h1>
            <p className="text-[10px] font-semibold text-slate-400">Coordinated proctor tools and candidate reviews dashboard.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("ats")}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                activeTab === "ats" ? "bg-indigo-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              ATS Pipeline
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                activeTab === "users" ? "bg-indigo-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              System Users
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold text-xs">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
              Loading recruiter dashboard...
            </div>
          ) : errorMsg ? (
            <div className="p-6 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 font-bold m-4 rounded-xl">
              {errorMsg}
            </div>
          ) : activeTab === "ats" ? (
            <div className="space-y-6">
              {/* Top Row: Metrics Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Applicants", value: stats.totalUsers || 0, color: "text-indigo-400" },
                  { label: "Mock Interviews Logs", value: stats.totalInterviews || 0, color: "text-purple-400" },
                  { label: "Submissions Saved", value: stats.totalSubmissions || 0, color: "text-emerald-400" },
                  { label: "Average Score Metric", value: "7.2 / 10", color: "text-amber-400" },
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                    <span className={`text-2xl font-black ${stat.color} block`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Chart section */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Candidate & Evaluation Trends</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Aggregate signups and mock sessions progression logs.</p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", fontSize: 10, borderRadius: 12 }} />
                      <Line type="monotone" dataKey="Registrations" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Interviews" stroke="#10b981" strokeWidth={2} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions Deck */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { title: "Review Candidates Profiles", desc: "Access full candidate portfolios, resume text, and round evaluations.", path: "/candidates", action: "Open Table →" },
                  { title: "Visual Hiring Funnel", desc: "Drag and drop candidate cards along columns inside the Kanban board.", path: "/pipeline", action: "Open Pipeline →" },
                  { title: "Evaluation Performance", desc: "Inspect monthly ratios, pass trends, and skills classifications.", path: "/analytics", action: "Open Analytics →" },
                ].map((act, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 flex flex-col justify-between items-start space-y-4 hover:border-slate-700 transition">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-200">{act.title}</h4>
                      <p className="text-[10px] text-slate-450 font-semibold leading-normal">{act.desc}</p>
                    </div>
                    <button
                      onClick={() => navigate(act.path)}
                      className="rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 px-3 py-1.5 text-[10px] font-black text-indigo-400 cursor-pointer active:scale-95 duration-100"
                    >
                      {act.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User management list */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[240px] relative">
                  <input
                    type="text"
                    placeholder="Search systems users by name/email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:border-indigo-500 transition duration-150"
                  />
                  <svg className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/20 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-350">
                    <thead>
                      <tr className="border-b border-slate-800/60 bg-slate-950/40 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">System Role</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-900/25 transition">
                          <td className="py-4 px-6 font-extrabold text-slate-200">{user.name}</td>
                          <td className="py-4 px-6 text-slate-400">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                              user.role === "admin" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-slate-800 text-slate-400"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleToggleRole(user._id)}
                              className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3.5 py-1.5 text-[10px] font-black text-slate-300 cursor-pointer active:scale-95 duration-100"
                            >
                              Toggle Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
