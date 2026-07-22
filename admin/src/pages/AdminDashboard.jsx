import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";

function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: res.data.user.role } : u));
      // Re-fetch stats just in case
      const statsRes = await api.get("/users/admin/stats");
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle role.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Combine trends data for a unified activity chart
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
    <div className="flex min-h-screen bg-brand-bg text-brand-text">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <main className="w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">System Monitoring Console</p>
            <h1 className="text-3xl font-black tracking-tight mt-1">Administrative Overview</h1>
            <p className="text-xs text-brand-secondary font-semibold mt-1">Real-time statistics, engagement graphs, and user access lists.</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-xs font-bold text-brand-text hover:bg-brand-bg transition duration-150 active:scale-95 self-start md:self-auto cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H12v3" />
            </svg>
            Refresh System
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-500">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
            <p className="text-xs text-brand-secondary font-semibold mt-4">Polling database instances...</p>
          </div>
        ) : (
          <>
            {/* KPI Metrics */}
            <div className="grid gap-5 sm:grid-cols-3 mb-8">
              {[
                {
                  label: "Total Registered Users",
                  val: stats.totalUsers,
                  sub: "Database accounts registered",
                  color: "text-indigo-650 bg-indigo-55/40 border-indigo-200/50 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400"
                },
                {
                  label: "Mock Interviews Conducted",
                  val: stats.totalInterviews,
                  sub: "Total standard & full assessments",
                  color: "text-emerald-700 bg-emerald-55/40 border-emerald-200/50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                },
                {
                  label: "Coding Submissions",
                  val: stats.totalSubmissions,
                  sub: "Code execution outputs counted",
                  color: "text-blue-700 bg-blue-55/40 border-blue-200/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                }
              ].map((kpi, idx) => (
                <div key={idx} className={`rounded-2xl border p-5 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 ${kpi.color}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider opacity-85">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-black">{kpi.val}</p>
                  <p className="mt-1 text-[10px] font-semibold opacity-65">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Trends Chart */}
            <div className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-sm mb-8">
              <h2 className="text-lg font-black tracking-tight">System Activity Trends</h2>
              <p className="text-xs text-brand-secondary font-semibold mt-1">Growth analysis over the last 10 days.</p>
              
              <div className="h-64 mt-6">
                {activityData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-brand-secondary font-semibold">
                    No active statistics yet to chart.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: resolvedThemeStyle(),
                          borderColor: theme === "dark" ? "#1F2937" : "#E2E8F0",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 700
                        }}
                      />
                      <Line type="monotone" dataKey="Registrations" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Interviews" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black tracking-tight">User Administration</h2>
                  <p className="text-xs text-brand-secondary font-semibold mt-1">Manage database records and toggle admin privileges.</p>
                </div>
                
                <div className="w-full sm:max-w-xs relative">
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-bg/50 pl-9 pr-4 py-2 text-xs font-semibold outline-none transition focus:border-indigo-500 focus:bg-brand-card"
                  />
                  <svg className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-border text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-brand-secondary font-semibold">
                          No users matching search filters found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-brand-zebra/20 transition duration-150 font-semibold">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[10px] font-black">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-slate-800 dark:text-slate-200 font-extrabold">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-brand-secondary">{user.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              user.role === "admin"
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-blue-500/10 text-blue-500"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-brand-secondary">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleRole(user._id)}
                              disabled={user._id === currentUser._id}
                              className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition active:scale-95 duration-100 cursor-pointer ${
                                user._id === currentUser._id
                                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900/40"
                                  : user.role === "admin"
                                    ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/50 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400"
                                    : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/50 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400"
                              }`}
                            >
                              {user.role === "admin" ? "Demote" : "Promote"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  );

  function resolvedThemeStyle() {
    return theme === "dark" ? "#111827" : "#FFFFFF";
  }
}

export default AdminDashboard;
