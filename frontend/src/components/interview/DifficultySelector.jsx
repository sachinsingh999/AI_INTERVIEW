import React from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

export default function DifficultySelector({ value, onChange }) {
  const options = [
    { id: "Easy", label: "Easy" },
    { id: "Medium", label: "Medium" },
    { id: "Hard", label: "Hard" },
  ];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
        <Gauge className="h-4 w-4 text-blue-400" />
        <span>Difficulty</span>
        <span className="text-rose-400">*</span>
      </label>

      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`relative py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center select-none ${
                isSelected
                  ? "text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="difficulty-active"
                  className={`absolute inset-0 rounded-xl ${
                    option.id === "Easy"
                      ? "bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : option.id === "Medium"
                      ? "bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : "bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
