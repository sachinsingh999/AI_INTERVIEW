import React from "react";
import { Clock, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Logo from "../../Logo";

export default function SessionNavbar({
  interviewTitle,
  currentPhaseName,
  timeLeftSeconds,
  autoSaveStatus,
}) {
  // Logo is rendered via custom vector element

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeftSeconds < 300;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-card/95 backdrop-blur-xl px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3">
          <Logo className="h-12 shrink-0 -my-2 cursor-pointer" />

          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-brand-secondary tracking-wider block">
              Online Assessment Platform
            </span>
            <h1 className="text-xs font-black text-brand-text tracking-tight truncate max-w-xs sm:max-w-md">
              {interviewTitle || "AI Mock Assessment Session"}
            </h1>
          </div>
        </div>

        {/* Center: Current Phase Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-brand-border">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-brand-text">
            {currentPhaseName || "Phase 1 • Aptitude"}
          </span>
        </div>

        {/* Right: Timer & Auto-Save */}
        <div className="flex items-center gap-3">
          {/* Auto Save Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-brand-secondary font-medium">
            {autoSaveStatus === "saving" ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-blue-505 dark:text-blue-400" />
                <span className="text-blue-505 dark:text-blue-400 font-bold">Auto-saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-505 dark:text-emerald-400" />
                <span className="text-emerald-505 dark:text-emerald-400/90 font-bold">Saved</span>
              </>
            )}
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs transition duration-200 ${
              isLowTime
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse"
                : "bg-slate-100 dark:bg-slate-900 border-brand-border text-brand-text"
            }`}
          >
            <Clock className={`h-3.5 w-3.5 ${isLowTime ? "text-rose-505" : "text-blue-505 dark:text-blue-400"}`} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
