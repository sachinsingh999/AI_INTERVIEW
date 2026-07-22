import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Code2,
  UserCheck,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  FileText,
  Briefcase,
  Building2,
  Code,
  Sparkles,
  Send,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import DifficultySelector from "./DifficultySelector";
import DurationSlider from "./DurationSlider";
import QuestionStepper from "./QuestionStepper";
import TechStackSelector from "./TechStackSelector";
import ValidationMessage from "./ValidationMessage";

export default function ProgressiveWizardForm({
  formData,
  setFormData,
  errors,
  setErrors,
  onSubmit,
  isSubmitting,
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const TYPES = [
    {
      id: "Technical Interview",
      title: "Technical Interview",
      icon: Code2,
      description: "In-depth code questions, core concepts, stack & DSA challenges.",
      badge: "Coding & Concepts",
      glowColor: "from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.25)]",
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      id: "Aptitude Test",
      title: "Aptitude Test",
      icon: Brain,
      description: "Quantitative, Logical Reasoning, Verbal & Data Interpretation MCQs.",
      badge: "Logic & Math",
      glowColor: "from-cyan-500/20 via-teal-500/10 to-transparent border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "HR Interview",
      title: "HR Interview",
      icon: UserCheck,
      description: "Behavioral, culture fit, leadership, teamwork & STAR scenarios.",
      badge: "Behavioral & Culture",
      glowColor: "from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.25)]",
      iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
    {
      id: "Mixed Interview",
      title: "Mixed Interview",
      icon: Layers,
      description: "Comprehensive combination of Technical, Aptitude & HR rounds.",
      badge: "All-in-One",
      glowColor: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  const JOB_ROLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Python Developer",
    "AI Engineer",
    "ML Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Data Scientist",
    "Data Analyst",
    "Cyber Security",
    "Mobile Developer",
    "UI/UX Developer",
  ];

  const EXPERIENCE_LEVELS = [
    "Fresher",
    "0-1 Years",
    "1-3 Years",
    "3-5 Years",
    "5+ Years",
  ];

  const COMPANY_TYPES = [
    "Product-based",
    "Service-based",
    "Startup",
    "Enterprise",
    "FAANG / Big Tech",
  ];

  const APTITUDE_CATEGORIES = [
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Verbal Ability",
    "Data Interpretation",
  ];

  const HR_FOCUS_AREAS = [
    "Self Introduction",
    "Behavioural",
    "Leadership",
    "Teamwork",
    "Conflict Resolution",
    "Salary Discussion",
    "Strengths & Weaknesses",
  ];

  const PROGRAMMING_LANGUAGES = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "Go",
    "Rust",
  ];

  const toggleArrayItem = (key, item) => {
    const currentList = formData[key] || [];
    if (currentList.includes(item)) {
      setFormData({ ...formData, [key]: currentList.filter((i) => i !== item) });
    } else {
      setFormData({ ...formData, [key]: [...currentList, item] });
    }
  };

  const handleTypeSelect = (typeId) => {
    let titlePreset = `${typeId} Session`;
    if (typeId === "Technical Interview") titlePreset = "Frontend React Technical Interview";
    else if (typeId === "Aptitude Test") titlePreset = "General Aptitude Assessment";
    else if (typeId === "HR Interview") titlePreset = "Behavioral HR Round";
    else if (typeId === "Mixed Interview") titlePreset = "Fullstack Mixed Interview";

    setFormData({
      ...formData,
      interviewType: typeId,
      title: titlePreset,
    });
    setErrors({});
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.interviewType) newErrors.interviewType = "Please select an interview type.";
    } else if (step === 2) {
      if (!formData.title || !formData.title.trim()) newErrors.title = "Interview Title is required.";
    } else if (step === 3) {
      const norm = (formData.interviewType || "").toLowerCase();
      if ((norm.includes("tech") || norm.includes("mixed")) && (!formData.technologies || formData.technologies.length === 0)) {
        newErrors.technologies = "Select at least one technology.";
      }
      if ((norm.includes("aptitude") || norm.includes("mixed")) && (!formData.aptitudeCategories || formData.aptitudeCategories.length === 0)) {
        newErrors.aptitudeCategories = "Select at least one Aptitude Category.";
      }
      if ((norm.includes("hr") || norm.includes("mixed")) && (!formData.hrTopics || formData.hrTopics.length === 0)) {
        newErrors.hrTopics = "Select at least one HR Focus Topic.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const isTechVisible = formData.interviewType === "Technical Interview" || formData.interviewType === "Mixed Interview";
  const isAptitudeVisible = formData.interviewType === "Aptitude Test" || formData.interviewType === "Mixed Interview";
  const isHRVisible = formData.interviewType === "HR Interview" || formData.interviewType === "Mixed Interview";
  const isRoleVisible = formData.interviewType !== "Aptitude Test";

  const STEPS = [
    { num: 1, label: "Type" },
    { num: 2, label: "Basic Setup" },
    { num: 3, label: "Topics & Stack" },
    { num: 4, label: "Review & Launch" },
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Step Progress Indicator */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
                className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : isCurrent
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110 border border-blue-400"
                      : "bg-slate-900 border border-white/10 text-slate-500 hover:text-white"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold tracking-tight hidden sm:block ${
                    isCurrent ? "text-blue-400 font-extrabold" : isCompleted ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <AnimatePresence mode="wait">
        {/* STEP 1: Select Type */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-blue-400 block mb-1">
                Step 1 of 4
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Choose Interview Format
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select the format of the mock interview session to unlock tailored configuration options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.interviewType === type.id;

                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
                      isSelected
                        ? `bg-slate-900/90 ${type.glowColor}`
                        : "bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-900/40"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-md z-10">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${type.iconBg}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="space-y-1 pr-4">
                        <h3 className={`text-sm font-bold tracking-tight ${isSelected ? "text-white" : "text-slate-200"}`}>
                          {type.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <ValidationMessage message={errors.interviewType} />

            {/* Next Button */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-98 transition cursor-pointer"
              >
                <span>Continue to Basic Setup</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Basic Setup */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-blue-400 block mb-1">
                Step 2 of 4 • {formData.interviewType}
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Basic Parameters
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure duration, difficulty, and question density for this session.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <FileText className="h-4 w-4 text-blue-400" />
                <span>Interview Title</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Frontend React Technical Interview"
                className={`w-full rounded-2xl border bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 outline-none transition duration-200 ${
                  errors.title
                    ? "border-rose-500/60 focus:border-rose-500"
                    : "border-white/10 focus:border-blue-500/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                }`}
              />
              <ValidationMessage message={errors.title} />
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <UserCheck className="h-4 w-4 text-blue-400" />
                <span>Experience Level</span>
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blue-500/60 transition cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp} className="bg-slate-900 text-white">
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <DifficultySelector
              value={formData.difficulty}
              onChange={(diff) => setFormData({ ...formData, difficulty: diff })}
            />

            {/* Duration */}
            <DurationSlider
              value={formData.duration}
              onChange={(dur) => setFormData({ ...formData, duration: dur })}
            />

            {/* Number of Questions */}
            <QuestionStepper
              value={formData.totalQuestions}
              onChange={(count) => setFormData({ ...formData, totalQuestions: count })}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-98 transition cursor-pointer"
              >
                <span>Continue to Topics & Tech</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Topics & Domain Customization */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-blue-400 block mb-1">
                Step 3 of 4 • {formData.interviewType}
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Topics & Domain Parameters
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tailor the specific role, technologies, and focus topics for question generation.
              </p>
            </div>

            {/* Job Role */}
            {isRoleVisible && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Briefcase className="h-4 w-4 text-blue-400" />
                  <span>Job Role</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blue-500/60 transition cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                >
                  {JOB_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Company Type (HR) */}
            {formData.interviewType === "HR Interview" && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>Company Type</span>
                </label>
                <select
                  value={formData.companyType}
                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blue-500/60 transition cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                >
                  {COMPANY_TYPES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tech Stack */}
            {isTechVisible && (
              <div className="space-y-4 pt-2">
                <TechStackSelector
                  value={formData.technologies}
                  onChange={(techs) => setFormData({ ...formData, technologies: techs })}
                  hasError={!!errors.technologies}
                />
                <ValidationMessage message={errors.technologies} />

                {/* Primary Language */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Code className="h-4 w-4 text-blue-400" />
                    <span>Primary Language</span>
                    <span className="text-slate-500 text-[10px] lowercase">(optional)</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blue-500/60 transition cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Any / Auto-detect</option>
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-slate-900 text-white">
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Aptitude Categories */}
            {isAptitudeVisible && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Aptitude Categories <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {(formData.aptitudeCategories || []).length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {APTITUDE_CATEGORIES.map((cat) => {
                    const isSelected = (formData.aptitudeCategories || []).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleArrayItem("aptitudeCategories", cat)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
                <ValidationMessage message={errors.aptitudeCategories} />
              </div>
            )}

            {/* HR Focus Areas */}
            {isHRVisible && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    HR Focus Areas <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {(formData.hrTopics || []).length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {HR_FOCUS_AREAS.map((topic) => {
                    const isSelected = (formData.hrTopics || []).includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleArrayItem("hrTopics", topic)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                            : "bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span>{topic}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-violet-400" />}
                      </button>
                    );
                  })}
                </div>
                <ValidationMessage message={errors.hrTopics} />
              </div>
            )}

            {/* Custom Instructions */}
            {(formData.interviewType === "Technical Interview" || formData.interviewType === "Mixed Interview") && (
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Custom AI Instructions</span>
                  <span className="text-slate-500 text-[10px] lowercase">(optional)</span>
                </label>
                <textarea
                  rows="3"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g. Focus on System Design, React Hooks, Redux, real-world scenario follow-ups..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500/60 transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] leading-relaxed resize-y"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-98 transition cursor-pointer"
              >
                <span>Review & Launch</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Review & Generate */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                Step 4 of 4 • Final Review
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Review Interview Setup
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verify your configuration before launching the AI question generation engine.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Summary</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                    {formData.interviewType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Title</span>
                    <span className="font-bold text-white">{formData.title}</span>
                  </div>
                  {isRoleVisible && (
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Role</span>
                      <span className="font-bold text-white">{formData.role}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Difficulty & Exp</span>
                    <span className="font-bold text-white">{formData.difficulty} • {formData.experience}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Duration & Count</span>
                    <span className="font-bold text-white">{formData.duration} Mins • {formData.totalQuestions} Questions</span>
                  </div>
                </div>
              </div>

              {/* Technologies summary */}
              {isTechVisible && (formData.technologies || []).length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selected Tech Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.technologies.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aptitude Categories summary */}
              {isAptitudeVisible && (formData.aptitudeCategories || []).length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Aptitude Categories</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.aptitudeCategories.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* HR Topics summary */}
              {isHRVisible && (formData.hrTopics || []).length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">HR Focus Areas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.hrTopics.map((h) => (
                      <span key={h} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-violet-500/10 border border-violet-500/20 text-violet-300">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit & Back Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 max-w-sm relative flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-sm font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-98 transition duration-200 cursor-pointer overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                <Send className="h-4 w-4 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                <span>Generate Interview</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
