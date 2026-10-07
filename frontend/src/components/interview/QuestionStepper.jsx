import React from "react";
import { HelpCircle, Minus, Plus } from "lucide-react";

export default function QuestionStepper({ value, onChange }) {
  const presets = [5, 10, 15, 20];

  const handleDecrement = () => {
    if (value > 3) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < 30) onChange(value + 1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <HelpCircle className="h-4 w-4 text-blue-400" />
          <span>Number of Questions</span>
          <span className="text-rose-400">*</span>
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= 3}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[28px] text-center font-mono text-xs font-black text-blue-400">
            {value}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= 30}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isSelected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-500/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                  : "bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
              }`}
            >
              {preset} Questions
            </button>
          );
        })}
      </div>
    </div>
  );
}
