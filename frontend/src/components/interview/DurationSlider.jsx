import React from "react";
import { Clock } from "lucide-react";

export default function DurationSlider({ value, onChange }) {
  const presetDurations = [10, 20, 30, 45, 60];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Clock className="h-4 w-4 text-blue-400" />
          <span>Interview Duration</span>
          <span className="text-rose-400">*</span>
        </label>
        <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-400 font-mono">
          {value} Minutes
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetDurations.map((duration) => {
          const isSelected = value === duration;
          return (
            <button
              key={duration}
              type="button"
              onClick={() => onChange(duration)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-500/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                  : "bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
              }`}
            >
              {duration} min
            </button>
          );
        })}
      </div>

      <div className="relative pt-2">
        <input
          type="range"
          min="10"
          max="60"
          step="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-950/80 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none border border-white/10"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-bold">
          <span>10 min</span>
          <span>30 min</span>
          <span>60 min</span>
        </div>
      </div>
    </div>
  );
}
