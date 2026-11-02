import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Plus,
  X,
  User,
  Briefcase,
  Code2,
  FolderGit2,
  FileText,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Trash2
} from "lucide-react";

export default function StepResumeParsingReview({
  resumeData,
  parsedResume,
  setParsedResume,
  onBack,
  onNext
}) {
  const [newSkill, setNewSkill] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!parsedResume) {
    return (
      <div className="w-full text-center p-8 rounded-sm border border-amber-200/80 dark:border-amber-900/30 bg-[#FFFDF7] dark:bg-[#121626] text-brand-secondary">
        <p className="text-sm font-semibold">No resume parsing data available. Please upload a resume first.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-brand-border text-brand-text rounded-sm text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Filter out completely blank education entries that sometimes get generated
  const educationList = useMemo(() => {
    return (parsedResume.education || []).filter(
      (edu) => (edu.degree && edu.degree.trim()) || (edu.institution && edu.institution.trim()) || (edu.branch && edu.branch.trim())
    );
  }, [parsedResume.education]);

  // Filter out completely blank experience entries
  const experienceList = useMemo(() => {
    return (parsedResume.experience || []).filter(
      (exp) => (exp.company && exp.company.trim()) || (exp.position && exp.position.trim())
    );
  }, [parsedResume.experience]);

  // Filter out completely blank project entries
  const projectsList = useMemo(() => {
    return (parsedResume.projects || []).filter(
      (p) => (p.name && p.name.trim()) || (p.description && p.description.trim())
    );
  }, [parsedResume.projects]);

  // Skill Handlers
  const handleRemoveSkill = (skillToRemove) => {
    setParsedResume((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove)
    }));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (!newSkill || !newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (!(parsedResume.skills || []).includes(trimmed)) {
      setParsedResume((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), trimmed]
      }));
    }
    setNewSkill("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-sm border border-amber-200/80 dark:border-amber-900/30 bg-[#FFFDF7] dark:bg-[#121626] p-5 sm:p-6 shadow-xs space-y-6 text-brand-text"
    >
      {/* Header */}
      <div className="border-b border-amber-200/60 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
            Step 3 of 4 • AI Analysis Complete
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
            Resume Profile Verified
          </h2>
          <p className="text-xs text-brand-secondary mt-0.5">
            Review the extracted tech stack and projects that will tailor your interview questions.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Check className="h-4 w-4 stroke-[3]" />
        </div>
      </div>

      {/* Candidate Profile Summary Header Card */}
      <div className="p-4 rounded-sm border border-brand-border bg-white dark:bg-slate-900/60 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-[#F59E0B] text-slate-900 font-bold text-sm">
              {(parsedResume.name || "C").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {parsedResume.name || "Candidate Name"}
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                {parsedResume.summary ? parsedResume.summary.slice(0, 90) + "..." : "Resume Profile Loaded"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            {isEditingProfile ? "Done Editing" : "Edit Contact Details"}
          </button>
        </div>

        {/* Contact Info Pills */}
        {!isEditingProfile ? (
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-brand-secondary">
            {parsedResume.email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-50 dark:bg-slate-800 border border-brand-border">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{parsedResume.email}</span>
              </span>
            )}
            {parsedResume.phone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-50 dark:bg-slate-800 border border-brand-border">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{parsedResume.phone}</span>
              </span>
            )}
            {parsedResume.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-50 dark:bg-slate-800 border border-brand-border">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{parsedResume.location}</span>
              </span>
            )}
            {parsedResume.github && (
              <a
                href={parsedResume.github.startsWith("http") ? parsedResume.github : `https://${parsedResume.github}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-50 dark:bg-slate-800 border border-brand-border text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Globe className="w-3 h-3" />
                <span>GitHub</span>
              </a>
            )}
            {parsedResume.linkedin && (
              <a
                href={parsedResume.linkedin.startsWith("http") ? parsedResume.linkedin : `https://${parsedResume.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-50 dark:bg-slate-800 border border-brand-border text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Globe className="w-3 h-3" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <input
              type="text"
              placeholder="Full Name"
              value={parsedResume.name || ""}
              onChange={(e) => setParsedResume({ ...parsedResume, name: e.target.value })}
              className="px-2.5 py-1.5 rounded-xs border border-brand-border bg-slate-50 dark:bg-slate-900 text-xs"
            />
            <input
              type="text"
              placeholder="Email"
              value={parsedResume.email || ""}
              onChange={(e) => setParsedResume({ ...parsedResume, email: e.target.value })}
              className="px-2.5 py-1.5 rounded-xs border border-brand-border bg-slate-50 dark:bg-slate-900 text-xs"
            />
            <input
              type="text"
              placeholder="Phone"
              value={parsedResume.phone || ""}
              onChange={(e) => setParsedResume({ ...parsedResume, phone: e.target.value })}
              className="px-2.5 py-1.5 rounded-xs border border-brand-border bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
        )}
      </div>

      {/* Extracted Skills Section - Clean, Organized & Sharp */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Code2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Extracted Skills ({parsedResume.skills?.length || 0})</span>
          </label>
          <span className="text-[10px] text-brand-secondary font-mono">
            Click × to remove or add custom stack below
          </span>
        </div>

        {/* Clean, readable skill tags with amber highlight */}
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-sm border border-brand-border bg-white dark:bg-slate-900/40">
          {(parsedResume.skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-slate-800 dark:text-amber-200 text-xs font-medium"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                title={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {(!parsedResume.skills || parsedResume.skills.length === 0) && (
            <span className="text-xs text-brand-secondary italic">No skills listed.</span>
          )}
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Add missing skill (e.g. Docker, TypeScript, Redis)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-sm border border-brand-border bg-white dark:bg-slate-900/60 text-xs font-semibold text-brand-text outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* 2-Column Grid for Experience & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Work Experience */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-brand-border/60 pb-1">
            <Briefcase className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Work Experience ({experienceList.length})</span>
          </label>

          <div className="space-y-2">
            {experienceList.length > 0 ? (
              experienceList.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-sm border border-brand-border bg-white dark:bg-slate-900/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {exp.position || "Software Engineer"}
                    </span>
                    <span className="text-[10px] font-mono text-brand-secondary">
                      {exp.startDate || ""} {exp.endDate ? `– ${exp.endDate}` : ""}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    {exp.company}
                  </p>
                  {exp.responsibilities && (
                    <p className="text-[11px] text-brand-secondary line-clamp-2">
                      {exp.responsibilities}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 rounded-sm border border-dashed border-brand-border text-center text-xs text-brand-secondary italic">
                No formal work experience detected (Fresher / Student Profile)
              </div>
            )}
          </div>
        </div>

        {/* Education History */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-brand-border/60 pb-1">
            <GraduationCap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Education ({educationList.length})</span>
          </label>

          <div className="space-y-2">
            {educationList.length > 0 ? (
              educationList.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-sm border border-brand-border bg-white dark:bg-slate-900/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {edu.degree || edu.branch || "Degree"}
                    </span>
                    <span className="text-[10px] font-mono text-brand-secondary">
                      {edu.endDate || edu.startDate || ""}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    {edu.institution || edu.university || "University"}
                  </p>
                  {edu.cgpa && (
                    <span className="inline-block text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-xs">
                      CGPA / Score: {edu.cgpa}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 rounded-sm border border-dashed border-brand-border text-center text-xs text-brand-secondary italic">
                Self-taught / Professional Track (No university records extracted)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Detected */}
      {projectsList.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-brand-border/60 pb-1">
            <FolderGit2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Highlighted Projects ({projectsList.length})</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {projectsList.map((proj, idx) => (
              <div
                key={idx}
                className="p-3 rounded-sm border border-brand-border bg-white dark:bg-slate-900/60 space-y-1"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {proj.name}
                </span>
                {proj.technologies && (
                  <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                    {typeof proj.technologies === "string" ? proj.technologies : proj.technologies.join(", ")}
                  </p>
                )}
                {proj.description && (
                  <p className="text-[11px] text-brand-secondary line-clamp-2">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Tailoring Active Banner */}
      <div className="p-3 rounded-sm border border-amber-300/80 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            AI Interviewer has configured custom questions matching your tech stack & projects.
          </span>
        </div>
        <span className="font-bold text-amber-800 dark:text-amber-400 font-mono text-[11px] shrink-0">
          Tailoring Ready ✓
        </span>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-amber-200/60 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-brand-border bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-brand-secondary hover:text-brand-text transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white shadow-xs active:scale-98 transition duration-150 cursor-pointer"
        >
          <span>Continue to Waiting Room</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
