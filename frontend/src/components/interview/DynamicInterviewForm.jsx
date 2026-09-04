import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Briefcase, Building2, UserCheck, Code, Sparkles, Send, Check } from "lucide-react";
import DifficultySelector from "./DifficultySelector";
import DurationSlider from "./DurationSlider";
import QuestionStepper from "./QuestionStepper";
import TechStackSelector from "./TechStackSelector";
import ValidationMessage from "./ValidationMessage";

export default function DynamicInterviewForm({
  interviewType,
  formData,
  setFormData,
  errors,
  onSubmit,
  isSubmitting,
}) {
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

  const isTechVisible = interviewType === "Technical Interview" || interviewType === "Mixed Interview";
  const isAptitudeVisible = interviewType === "Aptitude Test" || interviewType === "Mixed Interview";
  const isHRVisible = interviewType === "HR Interview" || interviewType === "Mixed Interview";
  const isRoleVisible = interviewType !== "Aptitude Test";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step 2: Configure {interviewType}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Fill in the details below to generate your tailored AI interview.
          </p>
        </div>

        {/* COMMON FIELD: Title */}
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
            placeholder={`e.g. ${interviewType} Session`}
            className={`w-full rounded-2xl border bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 outline-none transition duration-200 ${
              errors.title
                ? "border-rose-500/60 focus:border-rose-500"
                : "border-white/10 focus:border-blue-500/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
            }`}
          />
          <ValidationMessage message={errors.title} />
        </div>

        {/* CONDITIONAL: Job Role */}
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

        {/* CONDITIONAL: Company Type (For HR Interview) */}
        {interviewType === "HR Interview" && (
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

        {/* COMMON FIELD: Experience Level */}
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

        {/* COMMON FIELDS: Difficulty, Duration, Total Questions */}
        <DifficultySelector
          value={formData.difficulty}
          onChange={(diff) => setFormData({ ...formData, difficulty: diff })}
        />

        <DurationSlider
          value={formData.duration}
          onChange={(dur) => setFormData({ ...formData, duration: dur })}
        />

        <QuestionStepper
          value={formData.totalQuestions}
          onChange={(count) => setFormData({ ...formData, totalQuestions: count })}
        />

        {/* CONDITIONAL: Tech Stack & Language */}
        {isTechVisible && (
          <div className="space-y-4 pt-2">
            <TechStackSelector
              value={formData.technologies}
              onChange={(techs) => setFormData({ ...formData, technologies: techs })}
              hasError={!!errors.technologies}
            />
            <ValidationMessage message={errors.technologies} />

            {/* Optional Programming Language */}
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

        {/* CONDITIONAL: Aptitude Categories */}
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

        {/* CONDITIONAL: HR Focus Topics */}
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

        {/* CONDITIONAL: Custom Instructions (for Technical or Mixed) */}
        {(interviewType === "Technical Interview" || interviewType === "Mixed Interview") && (
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
      </div>

      {/* GENERATE INTERVIEW BUTTON */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-sm font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-98 transition duration-200 cursor-pointer overflow-hidden group"
        >
          <Send className="h-4 w-4 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          <span>Generate Interview</span>
        </button>
      </div>
    </motion.form>
  );
}
