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
    roundType: "Technical & Coding",
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
        {/* Page Header - Clean & Focused */}
        <div className="max-w-5xl xl:max-w-6xl mx-auto border-b border-brand-border/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight font-outfit">
              Set Up Your AI Mock Interview
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              Configure target role, difficulty, and focus to start practicing.
            </p>
          </div>
        </div>

        {/* Wide Layout Setup Container */}
        <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-4">
          {/* Stepper Header Bar */}
          <StepperHeader currentStep={currentStep} setStep={setCurrentStep} />

          {/* Active Step Form */}
          {currentStep === 1 && (
            <StepJobRole
              roleData={roleData}
              setRoleData={setRoleData}
              onNext={nextStep}
              onSkipToLobby={() => setCurrentStep(4)}
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
      </main>

      {/* Footer */}
      <Footer onlyCopyright={true} />
    </div>
  );
}
