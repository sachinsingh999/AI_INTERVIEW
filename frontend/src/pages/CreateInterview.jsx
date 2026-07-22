import React, { useState } from "react";
import { Sparkles, Briefcase, UserCheck, Gauge, FileText, CheckCircle2, Clock, ShieldCheck, Cpu } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StepperHeader from "../components/interview/wizard/StepperHeader";
import StepJobRole from "../components/interview/wizard/StepJobRole";
import StepResumeUpload from "../components/interview/wizard/StepResumeUpload";
import StepResumeParsingReview from "../components/interview/wizard/StepResumeParsingReview";
import StepInterviewLobby from "../components/interview/wizard/StepInterviewLobby";

export default function CreateInterview() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Job Role State
  const [roleData, setRoleData] = useState({
    role: "Frontend Developer",
    experience: "1–3 Years",
    difficulty: "Medium",
  });

  // Step 2: Resume Upload State
  const [resumeData, setResumeData] = useState({
    file: null,
    fileName: "",
    fileSize: "",
    text: "",
    uploaded: false,
    resumeId: "",
  });

  // Step 3: Parsed Resume Details State
  const [parsedResume, setParsedResume] = useState(null);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(4, prev + 1));
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-blue-500 selection:text-white font-sans pb-16">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container - Full Page 2-Column Responsive Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
                Guided 4-Step Setup
              </span>
              <span className="px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                AI Proctor Powered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
              Configure Your AI Mock Interview
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary font-normal">
              Customize target role, upload resume for automated AI question tailoring, and preview your 4-phase assessment lobby.
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Wizard Setup Forms (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Stepper Header Bar */}
            <StepperHeader currentStep={currentStep} setStep={setCurrentStep} />

            {/* Active Step Form */}
            {currentStep === 1 && (
              <StepJobRole
                roleData={roleData}
                setRoleData={setRoleData}
                onNext={nextStep}
              />
            )}

            {currentStep === 2 && (
              <StepResumeUpload
                resumeData={resumeData}
                setResumeData={setResumeData}
                onBack={prevStep}
                onNext={nextStep}
              />
            )}

            {currentStep === 3 && (
              <StepResumeParsingReview
                resumeData={resumeData}
                parsedResume={parsedResume}
                setParsedResume={setParsedResume}
                onBack={prevStep}
                onNext={nextStep}
              />
            )}

            {currentStep === 4 && (
              <StepInterviewLobby
                roleData={roleData}
                resumeData={resumeData}
                parsedResume={parsedResume}
                onBack={prevStep}
              />
            )}
          </div>

          {/* Right Column: Live Setup Summary & AI Configuration Side Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-brand-border bg-brand-card p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="text-xs font-mono uppercase font-bold text-blue-500 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Live Assessment Preview</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  AI Ready
                </span>
              </div>

              {/* Selected Role Specifications */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-secondary font-medium">Target Job Role:</span>
                  <span className="font-bold text-brand-text font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {roleData.role || "Frontend Developer"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-secondary font-medium">Experience Target:</span>
                  <span className="font-bold text-brand-text font-mono">{roleData.experience || "1–3 Years"}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Difficulty Rating:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] uppercase border ${
                      roleData.difficulty === "Easy"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : roleData.difficulty === "Hard"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {roleData.difficulty || "Medium"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
                  <span className="text-slate-400 font-medium">Resume Upload Status:</span>
                  <span className={`font-bold font-mono text-xs ${resumeData.uploaded ? "text-emerald-400" : "text-slate-500"}`}>
                    {resumeData.uploaded ? "Uploaded & Tailored ✓" : "Not Provided (Default)"}
                  </span>
                </div>
              </div>

              {/* Included Assessment Rounds Overview */}
              <div className="pt-3 border-t border-brand-border space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-brand-secondary block">
                  Automated 4-Phase Assessment Plan
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-brand-bg/85 border border-brand-border">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold text-[10px]">
                        1
                      </span>
                      <div>
                        <p className="font-bold text-brand-text leading-none">OA Aptitude Assessment</p>
                        <p className="text-[10px] text-brand-secondary font-normal mt-0.5">MCQs, Logic & Quant</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-secondary font-mono font-bold">15 Mins</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-brand-bg/85 border border-brand-border">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono font-bold text-[10px]">
                        2
                      </span>
                      <div>
                        <p className="font-bold text-brand-text leading-none">Tech Round 1 (Coding)</p>
                        <p className="text-[10px] text-brand-secondary font-normal mt-0.5">DSA & Live IDE Execution</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-secondary font-mono font-bold">20 Mins</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-brand-bg/85 border border-brand-border">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 font-mono font-bold text-[10px]">
                        3
                      </span>
                      <div>
                        <p className="font-bold text-brand-text leading-none">Tech Round 2 (Design)</p>
                        <p className="text-[10px] text-brand-secondary font-normal mt-0.5">System Architecture & Specs</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-secondary font-mono font-bold">30 Mins</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-brand-bg/85 border border-brand-border">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-bold text-[10px]">
                        4
                      </span>
                      <div>
                        <p className="font-bold text-brand-text leading-none">HR & Behavioral Round</p>
                        <p className="text-[10px] text-brand-secondary font-normal mt-0.5">STAR Method Analysis</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-secondary font-mono font-bold">15 Mins</span>
                  </div>
                </div>
              </div>

              {/* Security & System Check */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Proctoring Active</span>
                </span>
                <span className="font-mono font-bold text-slate-300">Total ~65 Mins</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
