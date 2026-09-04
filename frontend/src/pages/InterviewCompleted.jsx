import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function InterviewCompleted() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Clear any active localStorage states for safety
  useEffect(() => {
    try {
      localStorage.removeItem(`lobby_completed_${id}`);
    } catch (e) {}
  }, [id]);

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* Success Header Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-75" />
            <div className="absolute inset-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <ShieldCheck className="h-9 w-9" />
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3.5 max-w-lg mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Your interview has been submitted successfully.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              We have securely received all transcript details, speech timings, and audio indicators. 
              The internal AI assessment and claims verification engines are compiling the analysis in the background.
            </p>
          </div>

          {/* Security details card */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-left space-y-3 shadow-inner">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Internal Evaluation Status
              </span>
            </div>
            <div className="space-y-2 text-[11px] leading-relaxed text-slate-400">
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Transcript generated and stored securely.
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Resume verification auditing initialized.
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Technical & project skills scoring active.
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <p className="text-[10px] text-slate-550 max-w-sm mx-auto leading-normal">
            Note: Detailed feedback and recommendation logs are restricted to internal administrators and hiring managers. Candidates will receive status updates directly from their recruiter.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleReturnToDashboard}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-lg transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-xs font-bold text-slate-400 rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
