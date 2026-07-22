import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, CheckCircle2, Loader2, Cpu } from "lucide-react";

export default function LoadingOverlay({ isOpen }) {
  const steps = [
    "Analyzing Job Role & Parameters...",
    "Selecting Interview Topics...",
    "Generating AI Questions...",
    "Building Evaluation Rubric...",
    "Finalizing Interview Session...",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1300);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4"
      >
        <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#090d16]/95 p-8 text-center shadow-[0_0_80px_rgba(59,130,246,0.3)] space-y-6 overflow-hidden">
          {/* Ambient Glow background */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          {/* Glowing AI Central Icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-white/15 shadow-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 blur-md"
            />
            <Bot className="h-10 w-10 text-blue-400 relative z-10 animate-bounce" />
            <Sparkles className="h-4 w-4 text-amber-400 absolute top-2 right-2 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Generating Your AI Interview
            </h3>
            <p className="text-xs text-slate-400">
              Neural models are preparing your custom questions & rubric.
            </p>
          </div>

          {/* Sequential Steps Tracker */}
          <div className="space-y-2 text-left bg-slate-950/60 p-4 rounded-2xl border border-white/10">
            {steps.map((stepText, index) => {
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 text-xs font-semibold transition-all duration-300 ${
                    isDone
                      ? "text-emerald-400"
                      : isCurrent
                      ? "text-blue-400 font-bold scale-[1.01]"
                      : "text-slate-600"
                  }`}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-slate-800" />
                    )}
                  </div>
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Please wait while we prepare your session...</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
