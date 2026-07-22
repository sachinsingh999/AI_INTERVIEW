import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function PhaseTransitionModal({
  isOpen,
  completedPhaseName,
  nextPhaseName,
  onContinue,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="w-full max-w-md rounded-xl border border-white/10 bg-slate-950 p-6 shadow-2xl text-center space-y-5"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
          <Award className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
            Phase Completed
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            {completedPhaseName} Complete!
          </h3>
          <p className="text-xs text-slate-400">
            Great job! You have answered all questions for this round. Ready to start the next phase?
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-left space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Up Next</span>
          <span className="text-xs font-extrabold text-blue-400 block">{nextPhaseName}</span>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-xs font-extrabold text-white shadow-md hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer"
        >
          <span>Continue to {nextPhaseName}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
