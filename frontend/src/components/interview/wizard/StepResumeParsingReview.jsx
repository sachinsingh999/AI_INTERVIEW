import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, X, User, Briefcase, Code2, FolderGit2, FileText, ChevronRight, ChevronLeft, Award, Languages, GraduationCap, Trash2 } from "lucide-react";

export default function StepResumeParsingReview({ resumeData, parsedResume, setParsedResume, onBack, onNext }) {
  const [newSkill, setNewSkill] = useState("");

  if (!parsedResume) {
    return (
      <div className="w-full text-center p-8 rounded-xl border border-brand-border bg-brand-card text-brand-secondary">
        <p className="text-sm font-semibold">No resume parsing data available. Please go back and upload a resume.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-brand-border text-brand-text rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const overallConfidence = parsedResume.confidence ?? 0.90;
  const isLowConfidence = overallConfidence < 0.80;

  // Input Field Helper with Low Confidence Highlighting
  const renderInputField = (label, sectionKey, value, onChange, type = "text") => {
    const conf = parsedResume.fieldConfidences?.[sectionKey] ?? 1.0;
    const isLow = conf < 0.8;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
          <span>{label}</span>
          <span className={`font-mono font-bold ${isLow ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
            {Math.round(conf * 100)}%
          </span>
        </div>
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold text-brand-text outline-none transition ${
            isLow
              ? "border-amber-500/60 bg-amber-500/5 focus:border-amber-500 ring-1 ring-amber-500/20"
              : "border-brand-border bg-slate-50 dark:bg-slate-900/60 focus:border-blue-500/60"
          }`}
        />
        {isLow && (
          <p className="text-[9px] text-amber-500 font-bold leading-none mt-0.5">
            ⚠️ Verify - extraction confidence is low.
          </p>
        )}
      </div>
    );
  };

  // TextArea Helper
  const renderTextAreaField = (label, sectionKey, value, onChange) => {
    const conf = parsedResume.fieldConfidences?.[sectionKey] ?? 1.0;
    const isLow = conf < 0.8;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
          <span>{label}</span>
          <span className={`font-mono font-bold ${isLow ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
            {Math.round(conf * 100)}%
          </span>
        </div>
        <textarea
          rows="3"
          value={value || ""}
          onChange={onChange}
          className={`w-full rounded-lg border p-3 text-xs font-semibold text-brand-text outline-none transition resize-y leading-relaxed ${
            isLow
              ? "border-amber-500/60 bg-amber-500/5 focus:border-amber-500 ring-1 ring-amber-500/20"
              : "border-brand-border bg-slate-50 dark:bg-slate-900/60 focus:border-blue-500/60"
          }`}
        />
        {isLow && (
          <p className="text-[9px] text-amber-500 font-bold leading-none mt-0.5">
            ⚠️ Verify - extraction confidence is low.
          </p>
        )}
      </div>
    );
  };

  // Skill Chip handlers
  const handleRemoveSkill = (skillToRemove) => {
    setParsedResume((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (!newSkill || !newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (!(parsedResume.skills || []).includes(trimmed)) {
      setParsedResume((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), trimmed],
      }));
    }
    setNewSkill("");
  };

  // List Modification Handlers
  const handleAddEducation = () => {
    setParsedResume((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { degree: "", institution: "", university: "", branch: "", cgpa: "", startDate: "", endDate: "" },
      ],
    }));
  };

  const handleRemoveEducation = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddExperience = () => {
    setParsedResume((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { company: "", position: "", employmentType: "Full-time", startDate: "", endDate: "", duration: "", responsibilities: "" },
      ],
    }));
  };

  const handleRemoveExperience = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddProject = () => {
    setParsedResume((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: "", description: "", technologies: "", githubLink: "", liveUrl: "" },
      ],
    }));
  };

  const handleRemoveProject = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddCertification = () => {
    setParsedResume((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: "", issuer: "", issueDate: "" },
      ],
    }));
  };

  const handleRemoveCertification = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddAchievement = () => {
    setParsedResume((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), ""],
    }));
  };

  const handleRemoveAchievement = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddLanguage = () => {
    setParsedResume((prev) => ({
      ...prev,
      languages: [...(prev.languages || []), ""],
    }));
  };

  const handleRemoveLanguage = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-xl border border-brand-border bg-brand-card p-5 sm:p-6 shadow-xl space-y-6 text-brand-text"
    >
      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-505 dark:text-emerald-400 block mb-0.5">
            Step 3 of 4 • Parsing Complete
          </span>
          <h2 className="text-xl font-black text-brand-text tracking-tight">
            Resume Review & Editing
          </h2>
          <p className="text-xs text-brand-secondary mt-0.5">
            Review and edit the extracted details from your resume before proceeding.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Check className="h-4 w-4 stroke-[3]" />
        </div>
      </div>

      {/* Confidence Header Ribbon */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${
        isLowConfidence 
          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
      }`}>
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono uppercase font-black tracking-wider opacity-75">
            ATS Extraction Status
          </span>
          <h4 className="text-xs font-black text-white">Parsed Profile Check</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
            isLowConfidence 
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
          }`}>
            Confidence Score: {Math.round(overallConfidence * 100)}%
          </span>
          {isLowConfidence && (
            <span className="text-[10px] font-bold text-amber-400 animate-pulse">
              ⚠️ Low Confidence Warning
            </span>
          )}
        </div>
      </div>

      {/* 1. Personal Details */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <User className="h-3.5 w-3.5" />
          <span>Personal Details</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {renderInputField("Full Name", "name", parsedResume.name, (e) =>
            setParsedResume({ ...parsedResume, name: e.target.value })
          )}
          {renderInputField("Email", "email", parsedResume.email, (e) =>
            setParsedResume({ ...parsedResume, email: e.target.value })
          )}
          {renderInputField("Phone", "phone", parsedResume.phone, (e) =>
            setParsedResume({ ...parsedResume, phone: e.target.value })
          )}
          {renderInputField("LinkedIn Link", "linkedin", parsedResume.linkedin, (e) =>
            setParsedResume({ ...parsedResume, linkedin: e.target.value })
          )}
          {renderInputField("GitHub Link", "github", parsedResume.github, (e) =>
            setParsedResume({ ...parsedResume, github: e.target.value })
          )}
          {renderInputField("Portfolio Website", "portfolio", parsedResume.portfolio, (e) =>
            setParsedResume({ ...parsedResume, portfolio: e.target.value })
          )}
          {renderInputField("Location / Address", "location", parsedResume.location, (e) =>
            setParsedResume({ ...parsedResume, location: e.target.value })
          )}
        </div>
      </div>

      {/* 2. Professional Summary */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <FileText className="h-3.5 w-3.5" />
          <span>Professional Summary</span>
        </h3>
        {renderTextAreaField("Career Objective / Summary", "summary", parsedResume.summary, (e) =>
          setParsedResume({ ...parsedResume, summary: e.target.value })
        )}
      </div>

      {/* 3. Skills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" />
            <span>Extracted Skills</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-500">
            {(parsedResume.skills || []).length} Skills
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(parsedResume.skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-bold"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-rose-400 transition cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddSkill} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Add skill (e.g. Docker, GraphQL)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-cyan-500/60"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* 4. Education */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            <span>Education History</span>
          </h3>
          <button
            type="button"
            onClick={handleAddEducation}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add School</span>
          </button>
        </div>

        <div className="space-y-3">
          {(parsedResume.education || []).map((edu, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-slate-900/40 relative space-y-3">
              <button
                type="button"
                onClick={() => handleRemoveEducation(idx)}
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Degree</label>
                  <input
                    type="text"
                    value={edu.degree || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.education];
                      updated[idx].degree = e.target.value;
                      setParsedResume({ ...parsedResume, education: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Institution</label>
                  <input
                    type="text"
                    value={edu.institution || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.education];
                      updated[idx].institution = e.target.value;
                      setParsedResume({ ...parsedResume, education: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Branch / Major</label>
                  <input
                    type="text"
                    value={edu.branch || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.education];
                      updated[idx].branch = e.target.value;
                      setParsedResume({ ...parsedResume, education: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">CGPA / %</label>
                  <input
                    type="text"
                    value={edu.cgpa || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.education];
                      updated[idx].cgpa = e.target.value;
                      setParsedResume({ ...parsedResume, education: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Start Date</label>
                  <input
                    type="text"
                    value={edu.startDate || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.education];
                      updated[idx].startDate = e.target.value;
                      setParsedResume({ ...parsedResume, education: updated });
                    }}
                    placeholder="e.g. 2020"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">End Date</label>
                  <input
                    type="text"
                    value={edu.endDate || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.education];
                      updated[idx].endDate = e.target.value;
                      setParsedResume({ ...parsedResume, education: updated });
                    }}
                    placeholder="e.g. 2024"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          {(parsedResume.education || []).length === 0 && (
            <p className="text-xs text-slate-500 italic">No education entries found.</p>
          )}
        </div>
      </div>

      {/* 5. Experience */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Work Experience</span>
          </h3>
          <button
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Role</span>
          </button>
        </div>

        <div className="space-y-3">
          {(parsedResume.experience || []).map((exp, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-slate-900/40 relative space-y-3">
              <button
                type="button"
                onClick={() => handleRemoveExperience(idx)}
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Company</label>
                  <input
                    type="text"
                    value={exp.company || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.experience];
                      updated[idx].company = e.target.value;
                      setParsedResume({ ...parsedResume, experience: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Position</label>
                  <input
                    type="text"
                    value={exp.position || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.experience];
                      updated[idx].position = e.target.value;
                      setParsedResume({ ...parsedResume, experience: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.experience];
                      updated[idx].startDate = e.target.value;
                      setParsedResume({ ...parsedResume, experience: updated });
                    }}
                    placeholder="e.g. June 2022"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">End Date</label>
                  <input
                    type="text"
                    value={exp.endDate || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.experience];
                      updated[idx].endDate = e.target.value;
                      setParsedResume({ ...parsedResume, experience: updated });
                    }}
                    placeholder="e.g. Present"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400">Responsibilities</label>
                <textarea
                  rows="2"
                  value={exp.responsibilities || ""}
                  onChange={(e) => {
                    const updated = [...parsedResume.experience];
                    updated[idx].responsibilities = e.target.value;
                    setParsedResume({ ...parsedResume, experience: updated });
                  }}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-white outline-none focus:border-blue-500 resize-y"
                />
              </div>
            </div>
          ))}
          {(parsedResume.experience || []).length === 0 && (
            <p className="text-xs text-slate-500 italic">No experience entries found.</p>
          )}
        </div>
      </div>

      {/* 6. Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>Projects Done</span>
          </h3>
          <button
            type="button"
            onClick={handleAddProject}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-teal-400 hover:text-teal-300 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="space-y-3">
          {(parsedResume.projects || []).map((proj, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-slate-900/40 relative space-y-3">
              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="col-span-1 sm:col-span-3">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Project Name</label>
                  <input
                    type="text"
                    value={proj.name || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.projects];
                      updated[idx].name = e.target.value;
                      setParsedResume({ ...parsedResume, projects: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Description</label>
                  <textarea
                    rows="2"
                    value={proj.description || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.projects];
                      updated[idx].description = e.target.value;
                      setParsedResume({ ...parsedResume, projects: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-white outline-none focus:border-blue-500 resize-y"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Technologies</label>
                  <input
                    type="text"
                    value={proj.technologies || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.projects];
                      updated[idx].technologies = e.target.value;
                      setParsedResume({ ...parsedResume, projects: updated });
                    }}
                    placeholder="e.g. React, Node, WebSockets"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">GitHub Link</label>
                  <input
                    type="text"
                    value={proj.githubLink || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.projects];
                      updated[idx].githubLink = e.target.value;
                      setParsedResume({ ...parsedResume, projects: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Live URL</label>
                  <input
                    type="text"
                    value={proj.liveUrl || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.projects];
                      updated[idx].liveUrl = e.target.value;
                      setParsedResume({ ...parsedResume, projects: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          {(parsedResume.projects || []).length === 0 && (
            <p className="text-xs text-slate-500 italic">No projects found.</p>
          )}
        </div>
      </div>

      {/* 7. Certifications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            <span>Certifications</span>
          </h3>
          <button
            type="button"
            onClick={handleAddCertification}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-400 hover:text-amber-300 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Cert</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(parsedResume.certifications || []).map((cert, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-white/10 bg-slate-900/40 relative space-y-2.5">
              <button
                type="button"
                onClick={() => handleRemoveCertification(idx)}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="space-y-1.5">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Certification Name</label>
                  <input
                    type="text"
                    value={cert.name || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.certifications];
                      updated[idx].name = e.target.value;
                      setParsedResume({ ...parsedResume, certifications: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Issuer</label>
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.certifications];
                      updated[idx].issuer = e.target.value;
                      setParsedResume({ ...parsedResume, certifications: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400">Issue Date</label>
                  <input
                    type="text"
                    value={cert.issueDate || ""}
                    onChange={(e) => {
                      const updated = [...parsedResume.certifications];
                      updated[idx].issueDate = e.target.value;
                      setParsedResume({ ...parsedResume, certifications: updated });
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          {(parsedResume.certifications || []).length === 0 && (
            <p className="text-xs text-slate-500 italic col-span-2">No certifications found.</p>
          )}
        </div>
      </div>

      {/* 8. Achievements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            <span>Achievements / Awards</span>
          </h3>
          <button
            type="button"
            onClick={handleAddAchievement}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-purple-400 hover:text-purple-300 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Achievement</span>
          </button>
        </div>

        <div className="space-y-2">
          {(parsedResume.achievements || []).map((ach, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={typeof ach === "string" ? ach : ach.name || ""}
                onChange={(e) => {
                  const updated = [...parsedResume.achievements];
                  updated[idx] = e.target.value;
                  setParsedResume({ ...parsedResume, achievements: updated });
                }}
                className="flex-1 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveAchievement(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {(parsedResume.achievements || []).length === 0 && (
            <p className="text-xs text-slate-500 italic">No achievements found.</p>
          )}
        </div>
      </div>

      {/* 9. Languages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-violet-400 flex items-center gap-1.5">
            <Languages className="h-4 w-4" />
            <span>Languages</span>
          </h3>
          <button
            type="button"
            onClick={handleAddLanguage}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-violet-400 hover:text-violet-300 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Language</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(parsedResume.languages || []).map((lang, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200">
              <input
                type="text"
                value={lang || ""}
                onChange={(e) => {
                  const updated = [...parsedResume.languages];
                  updated[idx] = e.target.value;
                  setParsedResume({ ...parsedResume, languages: updated });
                }}
                className="bg-transparent border-none text-xs text-white outline-none w-20 focus:w-28 transition-all"
              />
              <button
                type="button"
                onClick={() => handleRemoveLanguage(idx)}
                className="text-slate-500 hover:text-rose-400 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {(parsedResume.languages || []).length === 0 && (
            <p className="text-xs text-slate-500 italic w-full">No languages listed.</p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-brand-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand-border bg-slate-100 dark:bg-slate-900 text-xs font-bold text-brand-text dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold text-white shadow-md active:scale-98 transition duration-150 cursor-pointer"
        >
          <span>Continue to Lobby</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
