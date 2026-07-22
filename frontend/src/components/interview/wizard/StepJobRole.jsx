import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, UserCheck, Gauge, ChevronRight, Check } from "lucide-react";

export default function StepJobRole({ roleData, setRoleData, onNext }) {
  const [error, setError] = useState("");

  const JOB_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Python Developer",
    "Software Engineer",
    "AI Engineer",
    "DevOps Engineer",
    "Data Analyst",
    "Mobile Developer",
    "Data Scientist",
  ];

  const EXPERIENCE_LEVELS = [
    "Fresher",
    "0–1 Years",
    "1–3 Years",
    "3–5 Years",
    "5+ Years",
  ];

  const DIFFICULTIES = [
    { id: "Easy", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-300" },
    { id: "Medium", color: "from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-300" },
    { id: "Hard", color: "from-rose-500/20 to-red-500/10 border-rose-500/50 text-rose-300" },
  ];

  const handleContinue = () => {
    if (!roleData.role || !roleData.role.trim()) {
      setError("Please select a target Job Role.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-xl border border-white/10 bg-slate-950/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5"
    >
      {/* Step Header */}
      <div className="border-b border-white/10 pb-2.5">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-400 block mb-0.5">
          Step 1 of 4
        </span>
        <h2 className="text-lg font-black text-white tracking-tight">
          Select Interview Focus & Job Role
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Specify target role, experience level, and interview difficulty.
        </p>
      </div>

      {/* Job Role Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <Briefcase className="h-3.5 w-3.5 text-blue-400" />
          <span>Job Role</span>
          <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {JOB_ROLES.map((r) => {
            const isSelected = roleData.role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRoleData({ ...roleData, role: r });
                  setError("");
                }}
                className={`p-2.5 rounded-lg border text-xs font-bold text-left transition duration-150 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-sm"
                    : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span className="truncate pr-1">{r}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <UserCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>Experience Level</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {EXPERIENCE_LEVELS.map((exp) => {
            const isSelected = roleData.experience === exp;
            return (
              <button
                key={exp}
                type="button"
                onClick={() => setRoleData({ ...roleData, experience: exp })}
                className={`py-2 px-2 rounded-lg border text-xs font-bold text-center transition duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                    : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {exp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <Gauge className="h-3.5 w-3.5 text-blue-400" />
          <span>Interview Difficulty</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => {
            const isSelected = roleData.difficulty === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setRoleData({ ...roleData, difficulty: d.id })}
                className={`py-2.5 px-3 rounded-lg border text-xs font-black text-center transition duration-150 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${d.color} shadow-sm`
                    : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {d.id}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-lg border border-white/5 bg-slate-900/30 text-xs font-bold text-slate-600 cursor-not-allowed opacity-40"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-md hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer"
        >
          <span>Continue</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
