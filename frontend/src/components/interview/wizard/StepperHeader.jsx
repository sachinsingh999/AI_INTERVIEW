import React from "react";

export default function StepperHeader({ currentStep }) {
  const steps = [
    { num: 1, label: "Select Job Role & Focus" },
    { num: 2, label: "Upload Resume (Optional)" },
    { num: 3, label: "Review Parsed Profile" },
    { num: 4, label: "Interview Waiting Room" },
  ];

  const current = steps.find((s) => s.num === currentStep) || steps[0];
  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <div className="w-full mb-4">
      <div className="rounded-sm border border-amber-200/80 dark:border-amber-900/30 bg-[#FFFDF7] dark:bg-[#121626] p-4 shadow-xs text-center">
        {/* Step No & Title In Middle */}
        <div className="flex flex-col items-center justify-center gap-1.5 mb-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wide">
            <span className="flex h-4 w-4 items-center justify-center rounded-xs bg-[#F59E0B] text-[#0F172A] text-[10px] font-black">
              {currentStep}
            </span>
            <span>Step {currentStep} of {steps.length}</span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-outfit">
            {current.label}
          </h2>
        </div>

        {/* Clean Centered Progress Bar */}
        <div className="w-full max-w-md mx-auto h-1.5 bg-amber-100/60 dark:bg-slate-800 rounded-xs overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] rounded-xs transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
