import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Camera, Mic, Wifi, Play, ChevronLeft, ShieldCheck, Sparkles } from "lucide-react";
import api from "../../../services/api";

export default function StepInterviewLobby({ roleData, resumeData, parsedResume, onBack }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cameraReady, setCameraReady] = useState(true);
  const [micReady, setMicReady] = useState(true);
  const [internetReady, setInternetReady] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    setIsStarting(true);

    try {
      // Always start sequentially with Phase 1 (Aptitude Assessment)
      const targetPhase = "aptitude";

      const payload = {
        role: roleData.role || "Software Engineer",
        experience: roleData.experience || "1-3 Years",
        difficulty: roleData.difficulty || "Medium",
        resumeId: resumeData.resumeId || `res_${Date.now()}`,
        parsedResume: parsedResume || {},
        interviewPlan: {
          aptitude: true,
          technicalRound1: true,
          technicalRound2: true,
          hrRound: true,
        },
      };

      const res = await api.post("/interviews/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interviewId = res.data?.interviewId || res.data?._id || `session_${Date.now()}`;

      setTimeout(() => {
        navigate(`/interview/session/${interviewId}?phase=${targetPhase}`);
      }, 1000);
    } catch (err) {
      console.error("Error creating interview session:", err);
      const fallbackId = `session-${Date.now()}`;
      navigate(`/interview/session/${fallbackId}?phase=aptitude`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-sm border border-amber-200/80 dark:border-amber-900/30 bg-[#FFFDF7] dark:bg-[#121626] p-5 sm:p-6 shadow-xs space-y-5 text-brand-text"
    >
      {/* Step Header */}
      <div className="border-b border-amber-200/60 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
            Step 4 of 4 • Interview Lobby
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
            Ready to Begin Your Interview
          </h2>
          <p className="text-xs text-brand-secondary mt-0.5">
            Review your session configuration and verify your hardware.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <ShieldCheck className="h-4 w-4" />
        </div>
      </div>

      {/* Clean Session Overview Card */}
      <div className="rounded-xl border border-brand-border bg-slate-50 dark:bg-slate-900/60 p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
          <h3 className="text-xs font-bold text-brand-text flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Interview Session Plan</span>
          </h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            <span>{resumeData.uploaded ? "Resume Tailored" : "Standard Model"}</span>
          </span>
        </div>

        {/* Overview Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg border border-brand-border bg-white dark:bg-slate-900/80">
            <span className="text-[10px] font-semibold text-brand-secondary uppercase block">Role</span>
            <span className="text-xs font-bold text-brand-text truncate block">{roleData.role}</span>
          </div>
          <div className="p-2.5 rounded-lg border border-brand-border bg-white dark:bg-slate-900/80">
            <span className="text-[10px] font-semibold text-brand-secondary uppercase block">Focus</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate block">
              {roleData.roundType || "Technical & Coding"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-brand-border bg-white dark:bg-slate-900/80">
            <span className="text-[10px] font-semibold text-brand-secondary uppercase block">Experience</span>
            <span className="text-xs font-bold text-brand-text truncate block">{roleData.experience}</span>
          </div>
          <div className="p-2.5 rounded-lg border border-brand-border bg-white dark:bg-slate-900/80">
            <span className="text-[10px] font-semibold text-brand-secondary uppercase block">Difficulty</span>
            <span className="text-xs font-bold text-brand-text truncate block">{roleData.difficulty}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-brand-secondary pt-1">
          <span>AI Interviewer voice & live compiler active</span>
          <span className="font-semibold text-brand-text">~25-30 Mins</span>
        </div>
      </div>

      {/* Readiness Checklist */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-300">
          Readiness Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCameraReady(!cameraReady)}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
              cameraReady
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/40 border-white/10 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              <span>Camera Ready</span>
            </div>
            {cameraReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setMicReady(!micReady)}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
              micReady
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/40 border-white/10 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5" />
              <span>Microphone Ready</span>
            </div>
            {micReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setInternetReady(!internetReady)}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
              internetReady
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/40 border-white/10 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5" />
              <span>Stable Connection</span>
            </div>
            {internetReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-brand-border gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isStarting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand-border bg-slate-100 dark:bg-slate-900 text-xs font-bold text-brand-text dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleStartInterview}
          disabled={isStarting}
          className="flex-1 max-w-xs relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white shadow-md active:scale-98 transition duration-150 cursor-pointer overflow-hidden"
        >
          <Play className="h-3.5 w-3.5 shrink-0 fill-white" />
          <span>{isStarting ? "Initializing..." : "Start Interview"}</span>
        </button>
      </div>
    </motion.div>
  );
}
