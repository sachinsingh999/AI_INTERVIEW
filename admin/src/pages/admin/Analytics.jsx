import React from "react";
import Sidebar from "../../components/Sidebar";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Analytics() {
  const funnelData = [
    { stage: "Applied", count: 120 },
    { stage: "Screening", count: 85 },
    { stage: "OA Cleared", count: 52 },
    { stage: "Technical 1", count: 32 },
    { stage: "Technical 2", count: 18 },
    { stage: "HR Round", count: 12 },
    { stage: "Hired", count: 5 },
  ];

  const roundAccuracyData = [
    { name: "OA Aptitude", accuracy: 82 },
    { name: "Tech 1 core", accuracy: 68 },
    { name: "Tech 2 code", accuracy: 55 },
    { name: "HR Recruiter", accuracy: 74 },
  ];

  const passRatesData = [
    { month: "Jan", rate: 64 },
    { month: "Feb", rate: 58 },
    { month: "Mar", rate: 70 },
    { month: "Apr", rate: 75 },
    { month: "May", rate: 62 },
    { month: "Jun", rate: 68 },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0">
          <div>
            <h1 className="text-md font-black tracking-tight">Recruitment Analytics</h1>
            <p className="text-[10px] font-semibold text-slate-400">Track and monitor candidate funnels, pass ratios, and skills evaluation metrics.</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Top Row: Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Overall Pass Ratio", value: "32.4%", change: "+2.1% this week", color: "text-emerald-400" },
              { label: "Average Evaluation Time", value: "4.2 days", change: "-0.5 days vs last month", color: "text-indigo-400" },
              { label: "Hired Conversion Rate", value: "4.1%", change: "Aligned with targets", color: "text-purple-400" },
              { label: "AI Scored Matches", value: "98.2%", change: "High classification accuracy", color: "text-amber-400" },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                <span className={`text-2xl font-black ${stat.color} block`}>{stat.value}</span>
                <span className="text-[9px] font-bold text-slate-450 block">{stat.change}</span>
              </div>
            ))}
          </div>

          {/* Graphical Analytics Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Chart 1: Candidate Funnel Progression */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Candidate Funnel Progression</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Total candidate numbers at each pipeline stage.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="stage" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", fontSize: 10, borderRadius: 12 }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Average Pass Rates Trend */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Average Monthly Pass Rates</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Percentage trend of cleared candidate rounds.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={passRatesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", fontSize: 10, borderRadius: 12 }} />
                    <Area type="monotone" dataKey="rate" stroke="#6366f1" fill="rgba(99, 102, 241, 0.08)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Evaluation Accuracy Profile */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-5 md:col-span-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Round Passing Accuracy Metrics</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Clearing ratio matching rate across active assessment sections.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roundAccuracyData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", fontSize: 10, borderRadius: 12 }} />
                    <Bar dataKey="accuracy" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
