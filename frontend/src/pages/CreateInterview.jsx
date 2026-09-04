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
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text selection:bg-blue-500 selection:text-white font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container - Full Page 2-Column Responsive Layout */}
      <main className="w-full px-4 sm:px-8 pt-6 pb-16 space-y-6 flex-1">
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
                setParsedResume={setParsedResume}
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
            <div className="rounded-xl border border-brand-border bg-brand-card p-5 sm:p-6 shadow-2xl space-y-5 text-brand-text">
              <div className="flex items-center justify-between border-b border-brand-border pb-3.5">
                <span className="text-xs font-mono uppercase font-black text-blue-500 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span>Live Assessment Preview</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-black">
                  AI Ready
                </span>
              </div>

              {/* Selected Role Specifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-secondary font-bold">Target Job Role:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {roleData.role || "Frontend Developer"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-secondary font-bold">Experience Target:</span>
                  <span className="font-extrabold text-brand-text font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-brand-border">{roleData.experience || "1–3 Years"}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-secondary font-bold">Difficulty Rating:</span>
                  <span
                    className={`font-black font-mono px-2 py-0.5 rounded text-[10px] uppercase border ${
                      roleData.difficulty === "Easy"
                        ? "bg-emerald-500/10 border-emerald-550/30 text-emerald-600 dark:text-emerald-400"
                        : roleData.difficulty === "Hard"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {roleData.difficulty || "Medium"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-border">
                  <span className="text-brand-secondary font-bold">Resume Upload Status:</span>
                  <span className={`font-black font-mono text-xs ${resumeData.uploaded ? "text-emerald-600 dark:text-emerald-400" : "text-brand-secondary"}`}>
                    {resumeData.uploaded ? "Uploaded & Tailored ✓" : "Not Provided (Default)"}
                  </span>
                </div>
              </div>

              {/* Included Assessment Rounds Overview */}
              <div className="pt-4 border-t border-brand-border space-y-4">
                <span className="text-[10px] font-mono uppercase font-black text-brand-secondary tracking-wider block">
                  Automated 3-Phase Assessment Plan
                </span>

                <div className="relative pl-5 border-l border-brand-border space-y-4.5 ml-2">
                  {/* Round 1 */}
                  <div className="relative">
                    <span className="absolute -left-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold">
                      1
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-brand-text">OA Aptitude Assessment</p>
                        <p className="text-[10px] text-brand-secondary font-medium">MCQs, Logic & Quant</p>
                      </div>
                      <span className="text-[10px] text-brand-secondary font-mono font-semibold shrink-0">15 Mins</span>
                    </div>
                  </div>

                  {/* Round 2 */}
                  <div className="relative">
                    <span className="absolute -left-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[9px] font-mono font-bold">
                      2
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-brand-text">Tech Round 1 (Coding)</p>
                        <p className="text-[10px] text-brand-secondary font-medium">DSA & Live IDE Execution</p>
                      </div>
                      <span className="text-[10px] text-brand-secondary font-mono font-semibold shrink-0">20 Mins</span>
                    </div>
                  </div>

                  {/* Round 3 */}
                  <div className="relative">
                    <span className="absolute -left-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[9px] font-mono font-bold">
                      3
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-brand-text">Tech Round 2 (Design)</p>
                        <p className="text-[10px] text-brand-secondary font-medium">System Architecture & Specs</p>
                      </div>
                      <span className="text-[10px] text-brand-secondary font-mono font-semibold shrink-0">30 Mins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & System Check */}
              <div className="pt-3.5 border-t border-brand-border flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Proctoring Active</span>
                </span>
                <span className="font-mono font-bold text-brand-secondary">Total ~65 Mins</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onlyCopyright={true} />
    </div>
  );
}
