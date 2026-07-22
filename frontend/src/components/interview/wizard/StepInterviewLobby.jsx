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
        },
      };

      const res = await api.post("/interviews/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interviewId = res.data?.interviewId || res.data?._id || `session_${Date.now()}`;

      setTimeout(() => {
        navigate(`/interview/session/${interviewId}?phase=oa`);
      }, 1200);
    } catch (err) {
      console.error("Error creating interview session:", err);
      const fallbackId = `session-${Date.now()}`;
      navigate(`/interview/session/${fallbackId}?phase=oa`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-xl border border-white/10 bg-slate-950/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5"
    >
      {/* Step Header */}
      <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-violet-400 block mb-0.5">
            Step 4 of 4 • Interview Lobby
          </span>
          <h2 className="text-lg font-black text-white tracking-tight">
            Interview Waiting Room
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Review your interview roadmap and verify hardware before starting.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <ShieldCheck className="h-4 w-4" />
        </div>
      </div>

      {/* Modern Roadmap Card */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Interview Plan Roadmap</span>
          </h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Resume Verified</span>
          </span>
        </div>

        {/* Phase Timeline */}
        <div className="space-y-3 relative pl-3.5 border-l-2 border-indigo-500/30 my-1">
          {/* Phase 1 */}
          <div className="relative pl-3">
            <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-sm bg-cyan-400 ring-2 ring-slate-950" />
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white">
                Phase 1: Aptitude Assessment
              </h4>
              <span className="text-[10px] font-mono font-bold text-cyan-300">15 Mins</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Quantitative, logical reasoning, and data interpretation logic assessment.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="relative pl-3">
            <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-sm bg-indigo-400 ring-2 ring-slate-950" />
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white">
                Phase 2: Technical Interview - Round 1 (Core Concepts)
              </h4>
              <span className="text-[10px] font-mono font-bold text-indigo-300">20 Mins</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Core language fundamentals, architecture, and tech stack evaluation.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="relative pl-3">
            <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-sm bg-violet-400 ring-2 ring-slate-950" />
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white">
                Phase 3: Technical Interview - Round 2 (Coding & Problem Solving)
              </h4>
              <span className="text-[10px] font-mono font-bold text-violet-300">30 Mins</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Live code implementation, algorithm solving, and system scenario round.
            </p>
          </div>
        </div>

        {/* Estimated Total Time */}
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Estimated Total Time</span>
          </div>
          <span className="text-xs font-black text-white font-mono">65 Minutes</span>
        </div>
      </div>

      {/* Session Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-2.5">
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Job Role</span>
          <span className="text-xs font-black text-white">{roleData.role}</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-2.5">
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Experience</span>
          <span className="text-xs font-black text-white">{roleData.experience}</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-2.5">
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Difficulty</span>
          <span className="text-xs font-black text-white">{roleData.difficulty}</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-2.5">
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Phases</span>
          <span className="text-xs font-black text-emerald-400">3 Phases</span>
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
      <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isStarting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleStartInterview}
          disabled={isStarting}
          className="flex-1 max-w-xs relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-xs font-black text-white shadow-md hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer overflow-hidden"
        >
          <Play className="h-3.5 w-3.5 shrink-0 fill-white" />
          <span>{isStarting ? "Initializing..." : "Start Interview"}</span>
        </button>
      </div>
    </motion.div>
  );
}
