import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, UserCheck, Gauge, ChevronRight, Check, Search, X, Sparkles } from "lucide-react";

export default function StepJobRole({ roleData, setRoleData, onNext, onSkipToLobby }) {
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(roleData.role || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const FOCUS_AREAS = [
    { id: "Technical & Coding", label: "Technical & Live Coding", desc: "Core concepts & live IDE algorithms" },
    { id: "System Design", label: "System Design", desc: "Architecture & distributed systems" },
    { id: "Behavioral", label: "Behavioral (STAR)", desc: "Soft skills & situational prompts" },
  ];

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

  const POPULAR_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "AI Engineer",
  ];

  const EXPERIENCE_LEVELS = [
    "Fresher",
    "0–1 Years",
    "1–3 Years",
    "3–5 Years",
    "5+ Years",
  ];

  const DIFFICULTIES = [
    { id: "Easy", bg: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30", text: "text-emerald-300" },
    { id: "Medium", bg: "from-amber-500/20 to-orange-500/10 border-amber-500/30", text: "text-amber-300" },
    { id: "Hard", bg: "from-rose-500/20 to-red-500/10 border-rose-500/30", text: "text-rose-300" },
  ];

  // Sync searchTerm with parent state
  useEffect(() => {
    setSearchTerm(roleData.role || "");
  }, [roleData.role]);

  // Click outside handler to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setRoleData((prev) => ({ ...prev, role: value }));
    setError("");
    setIsOpen(true);
  };

  const handleSelectRole = (role) => {
    setRoleData((prev) => ({ ...prev, role }));
    setSearchTerm(role);
    setError("");
    setIsOpen(false);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setRoleData((prev) => ({ ...prev, role: "" }));
    setIsOpen(true);
  };

  const handleContinue = () => {
    if (!roleData.role || !roleData.role.trim()) {
      setError("Please select or enter a target Job Role.");
      return;
    }
    setError("");
    onNext();
  };

  const filteredRoles = JOB_ROLES.filter((r) =>
    r.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDifficulty = DIFFICULTIES.find((d) => d.id === roleData.difficulty) || DIFFICULTIES[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-sm border border-amber-200/80 dark:border-amber-900/30 bg-[#FFFDF7] dark:bg-[#121626] p-5 sm:p-6 shadow-xs space-y-5 text-brand-text"
    >
      {/* Step Header */}
      <div className="border-b border-amber-200/60 dark:border-slate-800 pb-3">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
          Step 1 of 4
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
          Select Interview Focus & Job Role
        </h2>
        <p className="text-xs text-brand-secondary mt-0.5">
          Specify target role, experience level, and interview difficulty.
        </p>
      </div>

      {/* 2-Column Wide Layout - prioritizes width over height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Job Role & Focus Area */}
        <div className="lg:col-span-7 space-y-4">
          {/* Job Role Selection */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Briefcase className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Target Job Role</span>
              <span className="text-rose-500">*</span>
            </label>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search or enter target role..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-sm border border-brand-border bg-white dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-brand-text placeholder-slate-400 outline-none focus:border-amber-500 transition duration-150"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown list */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-sm border border-brand-border bg-white dark:bg-[#121626] shadow-2xl z-50 no-scrollbar"
                >
                  {filteredRoles.length > 0 ? (
                    <div className="p-1 space-y-0.5">
                      {filteredRoles.map((role) => {
                        const isSelected = roleData.role === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleSelectRole(role)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xs text-left transition duration-100 cursor-pointer ${
                              isSelected
                                ? "bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold"
                                : "text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text"
                            }`}
                          >
                            <span>{role}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-xs text-slate-400 font-medium">
                        Press <span className="font-bold text-brand-text">Continue</span> to use your custom entered role.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Popular Quick Select Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-brand-secondary uppercase mr-1">Popular:</span>
              {POPULAR_ROLES.map((role) => {
                const isSelected = roleData.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold border transition duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-300 font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-900/60 border-brand-border text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview Focus Area */}
          <div className="space-y-1.5 pt-1">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Interview Focus</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FOCUS_AREAS.map((fa) => {
                const isSelected = (roleData.roundType || "Technical & Coding") === fa.id;
                return (
                  <button
                    key={fa.id}
                    type="button"
                    onClick={() => setRoleData({ ...roleData, roundType: fa.id })}
                    className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-100/50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-2xs"
                        : "bg-white dark:bg-slate-900/40 border-brand-border hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold ${isSelected ? "text-amber-900 dark:text-amber-300" : "text-brand-text"}`}>
                        {fa.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-brand-secondary line-clamp-1 leading-snug">
                      {fa.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Experience Level & Difficulty Rating */}
        <div className="lg:col-span-5 space-y-4">
          {/* Experience Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <UserCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Experience Level</span>
            </label>
            <div className="grid grid-cols-5 gap-1 p-1 bg-white/80 dark:bg-slate-900/60 border border-brand-border rounded-sm">
              {EXPERIENCE_LEVELS.map((exp) => {
                const isSelected = roleData.experience === exp;
                return (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setRoleData({ ...roleData, experience: exp })}
                    className={`py-1.5 text-[11px] font-bold text-center rounded-xs transition duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#F59E0B] text-[#0F172A] shadow-xs"
                        : "text-brand-secondary hover:text-brand-text"
                    }`}
                  >
                    {exp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Gauge className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Interview Difficulty</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/80 dark:bg-slate-900/60 border border-brand-border rounded-sm">
              {DIFFICULTIES.map((d) => {
                const isSelected = roleData.difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setRoleData({ ...roleData, difficulty: d.id })}
                    className={`py-1.5 text-[11px] font-bold text-center rounded-xs transition duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#F59E0B] text-[#0F172A] shadow-xs"
                        : "text-brand-secondary hover:text-brand-text"
                    }`}
                  >
                    {d.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Configuration Summary Pill */}
          <div className="p-3 rounded-sm border border-amber-300/80 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 flex items-center justify-between text-xs">
            <span className="text-amber-800 dark:text-amber-400 font-semibold">Selected:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {roleData.role || "Frontend Developer"} • {roleData.experience} • {roleData.difficulty}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-amber-200/60 dark:border-slate-800">
        {onSkipToLobby ? (
          <button
            type="button"
            onClick={() => {
              if (!roleData.role || !roleData.role.trim()) {
                setError("Please select or enter a target Job Role.");
                return;
              }
              onSkipToLobby();
            }}
            className="px-3.5 py-2 rounded-sm border border-brand-border bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-brand-secondary hover:text-brand-text transition cursor-pointer"
          >
            Skip to Lobby →
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white shadow-xs active:scale-98 transition duration-150 cursor-pointer"
        >
          <span>Continue to Resume</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
