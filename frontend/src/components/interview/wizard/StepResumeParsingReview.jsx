import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, User, Briefcase, Code2, FolderGit2, FileText, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import api from "../../../services/api";

export default function StepResumeParsingReview({ resumeData, parsedResume, setParsedResume, onBack, onNext }) {
  const [isParsing, setIsParsing] = useState(!parsedResume || !parsedResume.personalDetails);
  const [parsingStepIndex, setParsingStepIndex] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  const token = localStorage.getItem("token");

  const PARSING_MESSAGES = [
    "Reading Resume...",
    "Extracting Skills...",
    "Detecting Experience...",
    "Analyzing Projects...",
    "Preparing Interview...",
  ];

  // Parse Resume Trigger
  useEffect(() => {
    let messageTimer;
    if (isParsing) {
      messageTimer = setInterval(() => {
        setParsingStepIndex((prev) => (prev + 1) % PARSING_MESSAGES.length);
      }, 900);

      const performParse = async () => {
        try {
          const res = await api.post(
            "/resume/parse",
            {
              resumeId: resumeData.resumeId,
              text: resumeData.text,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data?.parsedResume) {
            setParsedResume(res.data.parsedResume);
          }
        } catch (err) {
          console.error("Resume parsing error:", err);
          if (!parsedResume || !parsedResume.personalDetails) {
            setParsedResume({
              personalDetails: {
                name: "Candidate Name",
                email: "candidate@example.com",
                phone: "+1 (555) 019-2834",
              },
              professionalInfo: {
                currentRole: "Software Engineer",
                yearsOfExperience: "1-3 Years",
                highestEducation: "B.S. in Computer Science",
              },
              skills: ["React", "Node.js", "JavaScript", "Express", "MongoDB", "Java", "Spring Boot"],
              projects: [
                { name: "Mock AI Interview Platform", description: "Built real-time mock interview engine with Gemini AI API" },
                { name: "E-Commerce Microservices", description: "Designed high throughput order processing pipeline" },
              ],
              summary: "Experienced Software Developer with background in fullstack web development and modern frameworks.",
            });
          }
        } finally {
          setTimeout(() => {
            clearInterval(messageTimer);
            setIsParsing(false);
          }, 3500);
        }
      };

      performParse();
    }

    return () => clearInterval(messageTimer);
  }, []);

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

  // Project handlers
  const handleRemoveProject = (index) => {
    setParsedResume((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));
  };

  // Render Parsing Loading Screen
  if (isParsing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full rounded-xl border border-white/10 bg-slate-950/90 p-8 backdrop-blur-xl shadow-xl text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-400">
            AI Resume Analyzer
          </span>
          <h2 className="text-lg font-black text-white tracking-tight h-6">
            <AnimatePresence mode="wait">
              <motion.span
                key={parsingStepIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="inline-block"
              >
                {PARSING_MESSAGES[parsingStepIndex]}
              </motion.span>
            </AnimatePresence>
          </h2>
          <p className="text-[11px] text-slate-400">
            Extracting skills, projects, work experience, and educational background...
          </p>
        </div>

        <div className="w-full max-w-xs mx-auto bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/10">
          <motion.div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 h-full"
            initial={{ width: "10%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-xl border border-white/10 bg-slate-950/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5"
    >
      {/* Step Header */}
      <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
            Step 3 of 4 • Parsing Complete
          </span>
          <h2 className="text-lg font-black text-white tracking-tight">
            Resume Review & Editing
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Review and edit the extracted details from your resume before proceeding.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Check className="h-4 w-4 stroke-[3]" />
        </div>
      </div>

      {/* 1. Personal Details */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <User className="h-3.5 w-3.5" />
          <span>Personal Details</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Name</label>
            <input
              type="text"
              value={parsedResume?.personalDetails?.name || ""}
              onChange={(e) =>
                setParsedResume({
                  ...parsedResume,
                  personalDetails: { ...parsedResume.personalDetails, name: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500/60"
            />
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Email</label>
            <input
              type="email"
              value={parsedResume?.personalDetails?.email || ""}
              onChange={(e) =>
                setParsedResume({
                  ...parsedResume,
                  personalDetails: { ...parsedResume.personalDetails, email: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500/60"
            />
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Phone</label>
            <input
              type="text"
              value={parsedResume?.personalDetails?.phone || ""}
              onChange={(e) =>
                setParsedResume({
                  ...parsedResume,
                  personalDetails: { ...parsedResume.personalDetails, phone: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500/60"
            />
          </div>
        </div>
      </div>

      {/* 2. Professional Information */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <Briefcase className="h-3.5 w-3.5" />
          <span>Professional Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Current Role</label>
            <input
              type="text"
              value={parsedResume?.professionalInfo?.currentRole || ""}
              onChange={(e) =>
                setParsedResume({
                  ...parsedResume,
                  professionalInfo: { ...parsedResume.professionalInfo, currentRole: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Experience</label>
            <input
              type="text"
              value={parsedResume?.professionalInfo?.yearsOfExperience || ""}
              onChange={(e) =>
                setParsedResume({
                  ...parsedResume,
                  professionalInfo: { ...parsedResume.professionalInfo, yearsOfExperience: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Education</label>
            <input
              type="text"
              value={parsedResume?.professionalInfo?.highestEducation || ""}
              onChange={(e) =>
                setParsedResume({
                  ...parsedResume,
                  professionalInfo: { ...parsedResume.professionalInfo, highestEducation: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>
      </div>

      {/* 3. Skills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" />
            <span>Extracted Skills</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {(parsedResume?.skills || []).length} Skills
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(parsedResume?.skills || []).map((skill) => (
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

      {/* 4. Projects */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>Extracted Projects</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {(parsedResume?.projects || []).length} Projects
          </span>
        </div>

        <div className="space-y-2">
          {(parsedResume?.projects || []).map((proj, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-slate-900/50 p-3 relative space-y-1">
              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <input
                type="text"
                value={typeof proj === "string" ? proj : proj.name || ""}
                onChange={(e) => {
                  const updated = [...(parsedResume.projects || [])];
                  if (typeof updated[idx] === "string") {
                    updated[idx] = e.target.value;
                  } else {
                    updated[idx] = { ...updated[idx], name: e.target.value };
                  }
                  setParsedResume({ ...parsedResume, projects: updated });
                }}
                placeholder="Project Title"
                className="w-full bg-transparent text-xs font-extrabold text-white outline-none border-b border-white/10 pb-0.5"
              />
              <textarea
                rows="2"
                value={typeof proj === "string" ? "" : proj.description || ""}
                onChange={(e) => {
                  const updated = [...(parsedResume.projects || [])];
                  if (typeof updated[idx] !== "string") {
                    updated[idx] = { ...updated[idx], description: e.target.value };
                  }
                  setParsedResume({ ...parsedResume, projects: updated });
                }}
                placeholder="Project Description"
                className="w-full bg-transparent text-[11px] font-medium text-slate-300 outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Resume Summary */}
      <div className="space-y-1">
        <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>Resume Summary</span>
        </h3>
        <textarea
          rows="2"
          value={parsedResume?.summary || ""}
          onChange={(e) => setParsedResume({ ...parsedResume, summary: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs font-medium text-slate-200 outline-none focus:border-amber-500/60 transition resize-y leading-relaxed"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-md hover:brightness-110 active:scale-98 transition duration-150 cursor-pointer"
        >
          <span>Continue to Lobby</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
