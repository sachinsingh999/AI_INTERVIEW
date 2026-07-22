import React from "react";
import { Check } from "lucide-react";

export default function StepperHeader({ currentStep, setStep }) {
  const steps = [
    { num: 1, label: "Job Role" },
    { num: 2, label: "Resume" },
    { num: 3, label: "Review" },
    { num: 4, label: "Lobby" },
  ];

  return (
    <div className="w-full mb-4">
      <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 sm:p-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between relative max-w-lg mx-auto px-2">
          {/* Connector Line Background */}
          <div className="absolute top-1/2 left-5 right-5 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

          {/* Active Connector Progress Line */}
          <div
            className="absolute top-1/2 left-5 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const isFuture = currentStep < step.num;

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center gap-1">
                <button
                  type="button"
                  disabled={isFuture}
                  onClick={() => isCompleted && setStep(step.num)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-black transition-all duration-200 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm cursor-pointer hover:scale-105"
                      : isCurrent
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/80 shadow-md scale-105"
                      : "bg-slate-900 border border-white/10 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : step.num}
                </button>

                <span
                  className={`text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors duration-200 ${
                    isCurrent
                      ? "text-blue-400 font-extrabold"
                      : isCompleted
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
