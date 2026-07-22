import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, Trash2, RefreshCw, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import api from "../../../services/api";

export default function StepResumeUpload({ resumeData, setResumeData, onBack, onNext }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  const processFile = (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "doc", "txt"].includes(ext)) {
      setError("Please upload a PDF or DOCX file format.");
      return;
    }

    setError("");
    setUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (e) => {
      const textContent = e.target.result || "";
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setUploading(false);

        setResumeData({
          file,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          text: typeof textContent === "string" ? textContent : "",
          uploaded: true,
        });
      }, 700);
    };

    reader.readAsText(file);
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
    setError("");
  };

  const handleContinue = async () => {
    if (!resumeData.uploaded) {
      setError("Please upload your resume to continue.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.post(
        "/resume/upload",
        {
          fileName: resumeData.fileName,
          text: resumeData.text,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resumeId = res.data?.resumeId || `res_${Date.now()}`;
      setResumeData({
        ...resumeData,
        resumeId,
      });

      setUploading(false);
      onNext();
    } catch (err) {
      console.error("Resume upload endpoint error:", err);
      setResumeData({
        ...resumeData,
        resumeId: `res_${Date.now()}`,
      });
      setUploading(false);
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-xl border border-white/10 bg-slate-950/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5"
    >
      {/* Step Header */}
      <div className="border-b border-white/10 pb-2.5">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-400 block mb-0.5">
          Step 2 of 4
        </span>
        <h2 className="text-lg font-black text-white tracking-tight">
          Upload Your Resume
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Upload resume in PDF or DOCX format for automated AI parsing.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
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
          className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-xl ${
            dragActive
              ? "border-blue-500 bg-blue-500/10 shadow-md"
              : "border-white/15 bg-slate-900/40 hover:border-blue-500/50 hover:bg-slate-900/70"
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>

          <h3 className="text-xs font-extrabold text-white">
            Drag & Drop your resume here
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Supports PDF, DOCX (Max file size 10MB)
          </p>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/15 transition"
          >
            Browse Files
          </button>
        </div>
      )}

      {/* Uploading Progress State */}
      {uploading && (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 animate-pulse">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
          <h3 className="text-xs font-extrabold text-white">Uploading Resume...</h3>

          <div className="w-full max-w-xs mx-auto bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-blue-400">{uploadProgress}%</span>
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
                <h4 className="text-xs font-bold text-white tracking-tight">{resumeData.fileName}</h4>
                <p className="text-[10px] text-slate-400">{resumeData.fileSize}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-300 hover:bg-white/15 transition cursor-pointer"
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
          onClick={handleContinue}
          disabled={!resumeData.uploaded || uploading}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-extrabold text-white transition duration-150 ${
            resumeData.uploaded && !uploading
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:brightness-110 active:scale-98 cursor-pointer"
              : "bg-slate-900 border border-white/10 text-slate-600 cursor-not-allowed opacity-40"
          }`}
        >
          <span>Continue to Parsing</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
