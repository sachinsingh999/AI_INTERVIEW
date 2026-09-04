import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, UserCheck, Gauge, ChevronRight, Check, Search, X, Sparkles } from "lucide-react";

export default function StepJobRole({ roleData, setRoleData, onNext }) {
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(roleData.role || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      className="w-full rounded-xl border border-brand-border bg-brand-card p-5 sm:p-6 shadow-xl space-y-6 text-brand-text"
    >
      {/* Step Header */}
      <div className="border-b border-brand-border pb-4">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-505 dark:text-blue-400 block mb-0.5">
          Step 1 of 4
        </span>
        <h2 className="text-xl font-black text-brand-text tracking-tight">
          Select Interview Focus & Job Role
        </h2>
        <p className="text-xs text-brand-secondary mt-0.5">
          Specify target role, experience level, and interview difficulty.
        </p>
      </div>

      {/* Job Role Selection */}
      <div className="space-y-2 relative" ref={dropdownRef}>
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-text">
          <Briefcase className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span>Target Job Role</span>
          <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
          <input
            type="text"
            placeholder="Type to search or enter a custom job role..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-border bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold text-brand-text placeholder-slate-505 outline-none focus:border-blue-500/60 focus:bg-white dark:focus:bg-slate-900/80 transition duration-150"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
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
              className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-brand-border bg-brand-card shadow-2xl z-50 no-scrollbar"
            >
              {filteredRoles.length > 0 ? (
                <div className="p-1.5 space-y-0.5">
                  {filteredRoles.map((role) => {
                    const isSelected = roleData.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition duration-100 cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/20 text-blue-600 dark:text-white"
                            : "text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text"
                        }`}
                      >
                        <span>{role}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    No matching roles. Press <span className="text-white font-bold">Continue</span> to use your custom entered role.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popular Quick Select Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono text-brand-secondary uppercase tracking-wider block">
            Popular Choices
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_ROLES.map((role) => {
              const isSelected = roleData.role === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 dark:bg-blue-600/25 border-blue-500 text-blue-650 dark:text-blue-300 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-900/60 border-brand-border text-brand-secondary hover:text-brand-text hover:bg-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Experience Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-text">
          <UserCheck className="h-3.5 w-3.5 text-blue-505 dark:text-blue-400" />
          <span>Experience Level</span>
        </label>
        <div className="relative flex p-1 bg-slate-100 dark:bg-slate-900/60 border border-brand-border rounded-xl w-full">
          {EXPERIENCE_LEVELS.map((exp) => {
            const isSelected = roleData.experience === exp;
            return (
              <button
                key={exp}
                type="button"
                onClick={() => setRoleData({ ...roleData, experience: exp })}
                className={`relative flex-1 py-2 text-xs font-bold text-center transition duration-150 cursor-pointer z-10 ${
                  isSelected ? "text-indigo-650 dark:text-white" : "text-brand-secondary hover:text-brand-text"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="experience-bg"
                    className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-600/35 border border-indigo-500/20 dark:border-indigo-500/40 rounded-lg -z-10 shadow-lg"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                {exp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-text">
          <Gauge className="h-3.5 w-3.5 text-blue-505 dark:text-blue-400" />
          <span>Interview Difficulty</span>
        </label>
        <div className="relative flex p-1 bg-slate-100 dark:bg-slate-900/60 border border-brand-border rounded-xl w-full">
          {DIFFICULTIES.map((d) => {
            const isSelected = roleData.difficulty === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setRoleData({ ...roleData, difficulty: d.id })}
                className={`relative flex-1 py-2 text-xs font-black text-center transition duration-150 cursor-pointer z-10 ${
                  isSelected ? "text-indigo-650 dark:text-indigo-300" : "text-brand-secondary hover:text-brand-text"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="difficulty-bg"
                    className={`absolute inset-0 bg-indigo-600/10 dark:bg-gradient-to-r ${d.bg} border border-brand-border rounded-lg -z-10 shadow-lg`}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
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
      <div className="flex items-center justify-between pt-4 border-t border-brand-border">
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-lg border border-brand-border bg-slate-100 dark:bg-slate-900/30 text-xs font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
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
