import React from "react";
import { motion } from "framer-motion";
import { Send, AlertTriangle, X } from "lucide-react";

export default function SubmitConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  answeredCount,
  totalCount,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="w-full max-w-md rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-5 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-brand-text tracking-tight">
            Submit Assessment?
          </h3>
          <p className="text-xs text-brand-secondary">
            Are you sure you want to finalize and submit your interview? Once submitted, your answers will be locked and evaluated.
          </p>
        </div>

        <div className="rounded-lg border border-brand-border bg-slate-100 dark:bg-slate-900/60 p-3 text-xs font-mono font-bold text-brand-text">
          {answeredCount} of {totalCount} Questions Answered
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-lg border border-brand-border bg-slate-100 dark:bg-slate-900 text-xs font-bold text-brand-text dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white shadow-md active:scale-98 transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Confirm & Submit"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
