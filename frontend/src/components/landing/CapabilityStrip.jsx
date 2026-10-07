import React from "react";
import {
  Bot,
  Layers,
  Code2,
  Award
} from "lucide-react";

export default function CapabilityStrip() {
  const capabilities = [
    {
      title: "Adaptive AI Interviewer",
      desc: "Dynamic follow-up questions tailored to your spoken answers and reasoning.",
      icon: <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
    },
    {
      title: "4-Phase Assessments",
      desc: "Simulate Aptitude, Core Technical, Live Coding, and Behavioral STAR rounds.",
      icon: <Layers className="w-4 h-4 text-blue-500" />
    },
    {
      title: "Isolated Code Sandbox",
      desc: "Multi-language compiler runtime with automated test assertion reporting.",
      icon: <Code2 className="w-4 h-4 text-emerald-500" />
    },
    {
      title: "Performance Dossier",
      desc: "Rubric-based evaluation reports with complexity analysis and targeted tips.",
      icon: <Award className="w-4 h-4 text-purple-500" />
    }
  ];

  return (
    <section className="border-y border-brand-border/50 bg-brand-elevated/25 py-6 sm:py-7 relative z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-0 sm:divide-x divide-brand-border/40">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 transition-colors ${
                i === 0 ? "sm:pr-6" : i === 3 ? "sm:pl-6" : "sm:px-6"
              }`}
            >
              <div className="mt-0.5 shrink-0 text-brand-secondary">
                {cap.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-brand-text tracking-tight">
                  {cap.title}
                </h3>
                <p className="text-xs text-brand-secondary font-normal leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
