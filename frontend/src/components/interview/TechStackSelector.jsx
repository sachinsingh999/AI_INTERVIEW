import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Search, X, Plus, Sparkles } from "lucide-react";

export default function TechStackSelector({ value = [], onChange, hasError }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const SUGGESTIONS = [
    "React", "Node.js", "Express", "MongoDB", "Java", "Spring Boot",
    "Python", "C++", "JavaScript", "TypeScript", "Next.js", "Tailwind",
    "AWS", "Docker", "Kubernetes", "Redis", "SQL", "PostgreSQL",
    "GraphQL", "Go", "Rust", "Flutter"
  ];

  const filteredSuggestions = SUGGESTIONS.filter(
    (tech) =>
      !value.includes(tech) &&
      tech.toLowerCase().includes(query.toLowerCase().trim())
  );

  const addTech = (tech) => {
    if (!value.includes(tech)) {
      onChange([...value, tech]);
      setQuery("");
      setIsOpen(false);
    }
  };

  const removeTech = (tech) => {
    onChange(value.filter((item) => item !== tech));
  };

  const handleCustomAdd = (e) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      const techToAdd = query.trim();
      if (!value.includes(techToAdd)) {
        onChange([...value, techToAdd]);
        setQuery("");
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Code className="h-4 w-4 text-blue-400" />
          <span>Tech Stack</span>
          <span className="text-rose-400">*</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">
          {value.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <AnimatePresence>
          {value.map((tech) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)] group"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => removeTech(tech)}
                className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {value.length === 0 && (
          <span className="text-xs text-slate-500 italic py-1 px-1">
            Search or pick technologies below...
          </span>
        )}
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleCustomAdd}
            placeholder="Type to search technologies or press Enter..."
            className={`w-full rounded-2xl border bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition duration-200 ${
              hasError
                ? "border-rose-500/50 focus:border-rose-500"
                : "border-white/10 focus:border-blue-500/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
            }`}
          />
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-30 top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-2xl border border-white/15 bg-[#0b0e14]/95 backdrop-blur-2xl p-2 shadow-2xl space-y-1"
          >
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTech(tech)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition text-left cursor-pointer"
                >
                  <span>{tech}</span>
                  <Plus className="h-3.5 w-3.5 text-blue-400" />
                </button>
              ))
            ) : query.trim() ? (
              <button
                type="button"
                onClick={() => addTech(query.trim())}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition text-left cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Add custom technology "{query.trim()}"</span>
              </button>
            ) : (
              <div className="px-3 py-2 text-xs text-slate-500 font-medium">
                Type to add custom technology.
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
          Quick add:
        </span>
        {["React", "Node.js", "Python", "Java", "TypeScript", "AWS", "SQL", "Docker"].map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => addTech(tech)}
            disabled={value.includes(tech)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition border ${
              value.includes(tech)
                ? "bg-white/5 border-transparent text-slate-600 opacity-40 cursor-not-allowed"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20 cursor-pointer"
            }`}
          >
            +{tech}
          </button>
        ))}
      </div>
    </div>
  );
}
