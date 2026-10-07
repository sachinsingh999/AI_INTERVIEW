import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Lock, Code2, Play, AlertCircle, XCircle, Award, Cpu, Clock } from "lucide-react";

export default function SubmittingSolutionModal({
  isOpen,
  onClose,
  onComplete,
  language = "C++",
  questionIndex = 1,
  totalQuestions = 2,
  characterCount = 1248,
  isEvaluating = false,
  evaluationResult = null,
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [progress, setProgress] = useState(0);
  const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(1);
      setProgress(0);
      setHasTriggeredComplete(false);
      return;
    }

    // Progress increments smoothly
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // Stage increments every 1000ms (1 second)
    const stageTimer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= 5) {
          clearInterval(stageTimer);
          return 5;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
    };
  }, [isOpen]);

  // Call onComplete when we finish stage 4 (transition to stage 5)
  useEffect(() => {
    if (currentStage === 5 && !hasTriggeredComplete) {
      setHasTriggeredComplete(true);
      onComplete();
    }
  }, [currentStage, hasTriggeredComplete, onComplete]);

  if (!isOpen) return null;

  const stages = [
    { id: 1, label: "Saving latest changes..." },
    { id: 2, label: "Packaging source code..." },
    { id: 3, label: "Uploading securely..." },
    { id: 4, label: "Preparing evaluation environment..." },
  ];

  const isCancelDisabled = currentStage >= 3;

  // Determine which screen state to show
  const isSubmittingStages = currentStage < 5;
  const isEvaluatingState = currentStage === 5 && (isEvaluating || !evaluationResult);
  const showResultsState = currentStage === 5 && evaluationResult;

  // Calculate failed test cases count
  const passed = evaluationResult?.passed !== undefined ? evaluationResult.passed : (evaluationResult?.passedCount || 0);
  const total = evaluationResult?.total !== undefined ? evaluationResult.total : (evaluationResult?.totalCount || 0);
  const failed = Math.max(0, total - passed);
  const isAllPassed = passed === total && total > 0;
  const rawVerdict = evaluationResult?.verdict || (isAllPassed ? "Accepted" : "Wrong Answer");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/90 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[520px] rounded-2xl border border-[#1F2937] bg-[#111827] p-6 sm:p-7 shadow-2xl space-y-6 text-left relative overflow-hidden"
      >
        {/* Glow decoration inside the card */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#6366F1]/5 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* STATE A: SUBMITTING STAGES */}
          {isSubmittingStages && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Header Section */}
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="relative flex items-center justify-center h-16 w-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="flex items-center justify-center h-14 w-14 rounded-full border-4 border-[#6366F1]/20 border-t-[#6366F1]"
                  />
                  {currentStage === 3 && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full bg-[#6366F1] blur-md -z-10"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-[#F8FAFC] tracking-tight">
                    Submitting Your Solution
                  </h3>
                  <p className="text-xs text-[#94A3B8] max-w-sm">
                    Please wait while we securely submit your code for evaluation.
                  </p>
                </div>
              </div>

              {/* Code Summary Section */}
              <div className="grid grid-cols-2 gap-3 bg-[#0B1120] border border-[#1F2937] p-3 rounded-xl text-xs font-medium">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">Language</span>
                  <span className="text-[#F8FAFC] font-semibold flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-[#6366F1]" />
                    {language}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">Question</span>
                  <span className="text-[#F8FAFC] font-semibold">
                    Question {questionIndex} of {totalQuestions}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">Characters</span>
                  <span className="text-[#F8FAFC] font-semibold font-mono">
                    {characterCount.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">Last Auto Saved</span>
                  <span className="text-[#F8FAFC] font-semibold">Just now</span>
                </div>
              </div>

              {/* Animated Progress Section */}
              <div className="space-y-3 pt-1">
                <div className="h-2 w-full bg-[#1F2937] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>

                <div className="space-y-2.5">
                  {stages.map((stage) => {
                    const isCompleted = currentStage > stage.id;
                    const isCurrent = currentStage === stage.id;
                    const isFuture = currentStage < stage.id;

                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center justify-between text-xs transition-colors duration-200 ${
                          isFuture ? "text-[#94A3B8]/40" : isCurrent ? "text-[#F8FAFC]" : "text-[#94A3B8]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center h-4 w-4 shrink-0">
                            {isCompleted ? (
                              <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E]">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            ) : isCurrent ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-[#1F2937]" />
                            )}
                          </div>
                          <span className={isCurrent ? "font-semibold" : ""}>{stage.label}</span>
                        </div>
                        {isCompleted && (
                          <span className="text-[9px] font-mono font-bold text-[#22C55E]">Done</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Notice Card */}
              <div className="flex gap-3 bg-[#6366F1]/5 border border-[#6366F1]/10 p-3.5 rounded-xl text-xs leading-relaxed text-[#94A3B8]">
                <span className="text-base leading-none shrink-0" role="img" aria-label="lock">
                  🔒
                </span>
                <p>
                  Your submission is securely encrypted and cannot be modified after evaluation begins.
                </p>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#1F2937]/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCancelDisabled}
                  className={`flex-1 py-2.5 px-4 rounded-xl border border-[#1F2937] bg-[#111827] text-xs font-bold text-[#94A3B8] transition duration-200 ${
                    isCancelDisabled
                      ? "opacity-30 cursor-not-allowed border-[#1F2937]"
                      : "hover:bg-[#1F2937] hover:text-[#F8FAFC] cursor-pointer"
                  }`}
                >
                  Cancel Submission
                </button>

                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#6366F1] text-xs font-bold text-[#F8FAFC] flex items-center justify-center gap-2 cursor-not-allowed shadow-[0_4px_15px_rgba(99,102,241,0.25)]"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE B: EVALUATING SOLUTION */}
          {isEvaluatingState && (
            <motion.div
              key="evaluating"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center text-center space-y-6 py-6"
            >
              <div className="relative flex items-center justify-center h-20 w-20">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="flex items-center justify-center h-16 w-16 rounded-full border-4 border-[#6366F1]/10 border-t-[#6366F1]"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute h-10 w-10 bg-[#6366F1]/10 rounded-full flex items-center justify-center text-[#6366F1]"
                >
                  <Play className="h-5 w-5 fill-[#6366F1]" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#F8FAFC] tracking-tight">
                  Evaluating Solution...
                </h3>
                <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
                  Executing compilation tests and validating your output results against active coding parameters and edge cases.
                </p>
              </div>

              {/* Fake compilation metrics placeholder for visual satisfaction */}
              <div className="w-full bg-[#0B1120] border border-[#1F2937] p-4 rounded-xl flex items-center justify-around text-xs text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
                  <span>Running Unit Tests</span>
                </div>
                <div className="h-4 w-[1px] bg-[#1F2937]" />
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Secure Sandbox Active</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE C: EVALUATION RESULTS */}
          {showResultsState && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Verdict Header */}
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 border border-[#1F2937] shadow-inner relative">
                  {isAllPassed ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                      <Award className="h-6 w-6 stroke-[2]" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500">
                      <XCircle className="h-6 w-6 stroke-[2]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className={`text-xl font-extrabold tracking-tight ${isAllPassed ? "text-[#22C55E]" : "text-rose-500"}`}>
                    {rawVerdict}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {isAllPassed
                      ? "All test cases executed and passed compilation validation."
                      : `Your solution failed ${failed} of the ${total} evaluation test inputs.`}
                  </p>
                </div>
              </div>

              {/* Test Cases Counter Summary */}
              <div className="grid grid-cols-2 gap-4 text-center">
                {/* Passed Card */}
                <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 p-4 rounded-xl space-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#22C55E]" />
                  <span className="text-[10px] font-mono font-bold uppercase text-[#22C55E] block tracking-wider">
                    Test Cases Passed
                  </span>
                  <span className="text-3xl font-black text-[#22C55E] font-mono block">{passed}</span>
                </div>

                {/* Failed Card */}
                <div className={`p-4 rounded-xl space-y-1 relative overflow-hidden group border ${
                  failed > 0
                    ? "bg-rose-500/5 border-rose-500/20"
                    : "bg-[#1F2937]/30 border-[#1F2937]"
                }`}>
                  {failed > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />}
                  <span className={`text-[10px] font-mono font-bold uppercase block tracking-wider ${
                    failed > 0 ? "text-rose-500" : "text-[#94A3B8]"
                  }`}>
                    Test Cases Failed
                  </span>
                  <span className={`text-3xl font-black font-mono block ${
                    failed > 0 ? "text-rose-500" : "text-[#94A3B8]/60"
                  }`}>{failed}</span>
                </div>
              </div>

              {/* Compilation Stats */}
              <div className="bg-[#0B1120] border border-[#1F2937] p-3.5 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] block tracking-wider">
                  Compilation & Execution Telemetry
                </span>
                
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] font-bold text-[#F8FAFC]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#6366F1]" />
                    <span>{evaluationResult.totalRuntime || "32 ms"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-[#6366F1]" />
                    <span>{evaluationResult.maxMemory || "1.12 MB"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-[#6366F1]" />
                    <span className="uppercase">{language}</span>
                  </div>
                </div>
              </div>

              {/* Result Details Notice */}
              {evaluationResult.message && (
                <div className="flex gap-2.5 bg-slate-900 border border-[#1F2937] p-3 rounded-lg text-xs leading-relaxed text-[#94A3B8]">
                  <AlertCircle className="h-4 w-4 text-[#6366F1] shrink-0 mt-0.5" />
                  <p>{evaluationResult.message}</p>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="pt-2 border-t border-[#1F2937]/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-[#F8FAFC] shadow-[0_4px_15px_rgba(99,102,241,0.25)] transition duration-200 cursor-pointer active:scale-98 text-center"
                >
                  Return to Coding Workspace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
