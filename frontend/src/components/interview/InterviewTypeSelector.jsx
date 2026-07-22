import React from "react";
import { motion } from "framer-motion";
import { Brain, Code2, UserCheck, Layers, Check } from "lucide-react";

export default function InterviewTypeSelector({ selectedType, onSelect }) {
  const types = [
    {
      id: "Technical Interview",
      title: "Technical Interview",
      icon: Code2,
      description: "In-depth code questions, core concepts, stack & DSA challenges.",
      badge: "Coding & Concepts",
      glowColor: "from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.25)]",
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      id: "Aptitude Test",
      title: "Aptitude Test",
      icon: Brain,
      description: "Quantitative, Logical Reasoning, Verbal & Data Interpretation MCQs.",
      badge: "Logic & Math",
      glowColor: "from-cyan-500/20 via-teal-500/10 to-transparent border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "HR Interview",
      title: "HR Interview",
      icon: UserCheck,
      description: "Behavioral, culture fit, leadership, teamwork & STAR scenarios.",
      badge: "Behavioral & Culture",
      glowColor: "from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.25)]",
      iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
    {
      id: "Mixed Interview",
      title: "Mixed Interview",
      icon: Layers,
      description: "Comprehensive combination of Technical, Aptitude & HR rounds.",
      badge: "All-in-One",
      glowColor: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 1: Choose Interview Type
        </label>
        <span className="text-[11px] text-blue-400 font-bold">Required</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <motion.div
              key={type.id}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(type.id)}
              className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
                isSelected
                  ? `bg-slate-900/90 ${type.glowColor}`
                  : "bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-900/40"
              }`}
            >
              {/* Selected check mark badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-md z-10"
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </motion.div>
              )}

              {/* Animated active border glow line */}
              {isSelected && (
                <motion.div
                  layoutId="active-type-glow"
                  className="absolute inset-0 border-2 border-blue-500/60 rounded-2xl pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}

              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${type.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold tracking-tight ${isSelected ? "text-white" : "text-slate-200"}`}>
                      {type.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
