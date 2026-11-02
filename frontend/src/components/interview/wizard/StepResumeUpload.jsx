import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, Trash2, RefreshCw, ChevronRight, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import api from "../../../services/api";

export default function StepResumeUpload({ resumeData, setResumeData, setParsedResume, onBack, onNext }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsingStage, setParsingStage] = useState(""); // "uploading" | "extracting" | "analyzing" | "populating"
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  const processFile = (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "doc"].includes(ext)) {
      setError("Unsupported file format. Only PDF, DOC, and DOCX files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds the 10MB limit.");
      return;
    }

    setError("");
    setResumeData({
      file,
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      text: "",
      uploaded: true,
    });
    setUploadProgress(0);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setResumeData({
      file: null,
      fileName: "",
      fileSize: "",
      text: "",
      uploaded: false,
      resumeId: "",
    });
    setUploadProgress(0);
    setParsingStage("");
    setError("");
  };

  const handleContinue = async () => {
    if (!resumeData.uploaded || !resumeData.file) {
      setError("Please upload your resume to continue.");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setParsingStage("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeData.file);

      // Setup progressive steps simulation while request runs
      let progressInterval;
      const triggerSimulation = (start, end, duration, nextStage) => {
        clearInterval(progressInterval);
        const step = (end - start) / (duration / 100);
        let current = start;
        progressInterval = setInterval(() => {
          current += step;
          if (current >= end) {
            clearInterval(progressInterval);
            current = end;
            if (nextStage) {
              setParsingStage(nextStage);
            }
          }
          setUploadProgress(Math.round(current));
        }, 100);
      };

      // 1. Uploading Stage (10% -> 35% in 800ms)
      triggerSimulation(10, 35, 800, "extracting");

      // 2. Extracting Stage (35% -> 65% in 2000ms)
      const extractTimer = setTimeout(() => {
        triggerSimulation(35, 65, 2000, "analyzing");
      }, 900);

      // 3. Analyzing Stage (65% -> 90% in 4000ms)
      const analyzeTimer = setTimeout(() => {
        triggerSimulation(65, 90, 4000, null);
      }, 3000);

      const res = await api.post(
        "/resume/parse",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Clean up timers
      clearTimeout(extractTimer);
      clearTimeout(analyzeTimer);
      clearInterval(progressInterval);

      // 4. Populating Profile Stage (90% -> 100%)
      setUploadProgress(95);
      setParsingStage("populating");

      if (res.data && res.data.parsedData) {
        // Embed confidence metadata inside parsedResume state
        const completeData = {
          ...res.data.parsedData,
          confidence: res.data.confidence || 0.90,
          fieldConfidences: res.data.fieldConfidences || {}
        };
        setParsedResume(completeData);
      } else {
        throw new Error("Resume parsed data is missing from response.");
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setParsingStage("");
        onNext();
      }, 800);

    } catch (err) {
      console.error("Resume parsing error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while parsing the resume.");
      setUploading(false);
      setParsingStage("");
      setUploadProgress(0);
    }
  };

  const getStageMessage = () => {
    switch (parsingStage) {
      case "uploading":
        return "Uploading Resume...";
      case "extracting":
        return "Extracting Text...";
      case "analyzing":
        return "Analyzing Resume...";
      case "populating":
        return "Populating Profile...";
      default:
        return "Processing File...";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-sm border border-amber-200/80 dark:border-amber-900/30 bg-[#FFFDF7] dark:bg-[#121626] p-5 sm:p-6 shadow-xs space-y-5 text-brand-text"
    >
      {/* Step Header */}
      <div className="border-b border-amber-200/60 dark:border-slate-800 pb-2.5">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
          Step 2 of 4
        </span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
          Upload Your Resume
        </h2>
        <p className="text-[11px] text-brand-secondary mt-0.5">
          Upload resume in PDF, DOC, or DOCX format for real-time ATS analysis.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      {!resumeData.uploaded && !uploading && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
            dragActive
              ? "border-blue-500 bg-blue-500/10 shadow-md"
              : "border-brand-border bg-slate-50 dark:bg-slate-900/40 hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-slate-900/70"
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>

          <h3 className="text-xs font-extrabold text-brand-text">
            Drag & Drop your resume here
          </h3>
          <p className="text-[11px] text-brand-secondary mt-0.5">
            Supports PDF, DOC, DOCX (Max file size 10MB)
          </p>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white dark:hover:bg-white/15 transition"
          >
            Browse Files
          </button>
        </div>
      )}

      {/* Uploading Multi-Stage Progress State */}
      {uploading && (
        <div className="rounded-xl border border-brand-border bg-slate-50 dark:bg-slate-900/60 p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-brand-text transition-colors duration-150">
              {getStageMessage()}
            </h3>
            <p className="text-[10px] text-brand-secondary font-medium">
              Parsing sections, validating schema layout, and grading confidence.
            </p>
          </div>

          <div className="space-y-1.5 w-full max-w-xs mx-auto">
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-brand-border">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-black text-blue-500 dark:text-blue-400 block">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Success Uploaded State */}
      {resumeData.uploaded && !uploading && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  ✓ Resume Uploaded Successfully
                </span>
                <h4 className="text-xs font-bold text-brand-text tracking-tight">{resumeData.fileName}</h4>
                <p className="text-[10px] text-brand-secondary">{resumeData.fileSize}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-bold text-brand-text dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-xs font-bold text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-brand-border">
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
          onClick={handleContinue}
          disabled={!resumeData.uploaded || uploading}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-extrabold text-white transition duration-150 ${
            resumeData.uploaded && !uploading
              ? "bg-indigo-600 hover:bg-indigo-500 shadow-md active:scale-98 cursor-pointer"
              : "bg-slate-100 dark:bg-slate-900 border border-brand-border text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
          }`}
        >
          <span>Continue to Parsing</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
