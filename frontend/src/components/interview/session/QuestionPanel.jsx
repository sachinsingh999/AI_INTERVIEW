import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  HelpCircle,
  Check,
  Flag,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  UserCheck,
  Sparkles,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
} from "lucide-react";
import CodingQuestionEditor from "./CodingQuestionEditor";

export default function QuestionPanel({
  question,
  currentIndex,
  totalQuestions,
  currentPhaseName,
  answer,
  onAnswerChange,
  isFlagged,
  onToggleFlag,
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  isLocked,
  questions = [],
  answers = {},
  visitedQuestions = {},
  flaggedQuestions = {},
  onSelectQuestion = () => {},
}) {
  if (!question) return null;

  const handleMcqSelect = (optId) => {
    if (isLocked) return;
    onAnswerChange({ selectedOption: optId });
  };

  const handleMsqToggle = (optId) => {
    if (isLocked) return;
    const currentList = answer?.selectedOptions || [];
    if (currentList.includes(optId)) {
      onAnswerChange({ selectedOptions: currentList.filter((o) => o !== optId) });
    } else {
      onAnswerChange({ selectedOptions: [...currentList, optId] });
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`flex-1 flex flex-col justify-between rounded-md border border-brand-border bg-brand-card shadow-xl overflow-hidden ${
        (question.type === "coding" || question.type === "technical" || question.starterCode) ? "p-0 space-y-0 h-full" : "p-5 sm:p-6 space-y-6 min-h-[580px]"
      }`}
    >
      <div className={(question.type === "coding" || question.type === "technical" || question.starterCode) ? "flex-1 flex flex-col overflow-hidden space-y-0 h-full" : "space-y-6"}>
        {/* Top Header Row */}
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-brand-border ${(question.type === "coding" || question.type === "technical" || question.starterCode) ? "p-3.5 bg-slate-100 dark:bg-slate-900/60" : "pb-4"}`}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-550 dark:text-blue-400 text-xs font-mono font-bold">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-brand-border text-brand-text text-xs font-mono font-bold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-505 dark:text-indigo-400" />
              <span>{currentPhaseName}</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold">
              +10 Marks
            </span>

            {/* Questions Heatmap List */}
            {questions && questions.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-lg border border-brand-border select-none">
                <span className="text-[10px] uppercase font-bold text-brand-secondary font-mono tracking-wider px-1">
                  Questions:
                </span>
                <div className="flex items-center gap-1">
                  {questions.map((q, idx) => {
                    const isActive = currentIndex === idx;
                    const qAnswer = answers[q.id];
                    const qStatus = qAnswer?.runStatus; // "run", "submitted_passed", "submitted_failed"
                    const isQFlagged = !!flaggedQuestions[q.id];
                    const isVisited = !!visitedQuestions[q.id];

                    let cellColorClass = "bg-slate-100 dark:bg-slate-900 text-brand-secondary border-brand-border";
                    let statusLabel = "Unvisited";

                    if (qStatus === "submitted_passed") {
                      cellColorClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                      statusLabel = "All Passed";
                    } else if (qStatus === "submitted_failed") {
                      cellColorClass = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-455";
                      statusLabel = "Submission Failed";
                    } else if (qStatus === "run") {
                      cellColorClass = "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-455";
                      statusLabel = "Run Completed";
                    } else if (isQFlagged) {
                      cellColorClass = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-455";
                      statusLabel = "Flagged";
                    } else {
                      const isQAnswered = q.type === "coding" || q.type === "technical" || q.starterCode
                        ? (qAnswer?.code && qAnswer.code.trim().length > 0 && qAnswer.code !== q.starterCode)
                        : (qAnswer?.selectedOption || (Array.isArray(qAnswer?.selectedOptions) && qAnswer.selectedOptions.length > 0) || qAnswer?.text?.trim()?.length > 0);

                      if (isQAnswered) {
                        cellColorClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                        statusLabel = "Answered";
                      } else if (isVisited) {
                        cellColorClass = "bg-slate-200 dark:bg-slate-800 text-brand-text border-brand-border";
                        statusLabel = "Visited";
                      }
                    }

                    if (isActive) {
                      cellColorClass += " ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 scale-105";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => onSelectQuestion(idx)}
                        className={`h-6 w-6 rounded-md border text-[10px] font-mono font-bold flex items-center justify-center transition cursor-pointer hover:border-blue-500 hover:text-brand-text ${cellColorClass}`}
                        title={`${statusLabel}: ${q.title || `Question ${idx + 1}`}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition duration-150 cursor-pointer ${isFlagged
                ? "bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-300 shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 border-brand-border text-brand-secondary hover:text-brand-text hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
            >
              <Flag className={`h-3.5 w-3.5 ${isFlagged ? "fill-rose-450 text-rose-500" : ""}`} />
              <span>{isFlagged ? "Flagged" : "Flag"}</span>
            </button>

            {/* Quick Header Question Navigation Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-brand-border p-0.5 rounded-lg">
              <button
                type="button"
                onClick={onPrev}
                disabled={isFirst}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  isFirst
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
                    : "text-brand-secondary hover:text-brand-text hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                }`}
                title="Previous Question"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="h-3.5 w-[1px] bg-brand-border"></div>

              <button
                type="button"
                onClick={isLast ? onSubmit : onNext}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  isLast
                    ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                    : "text-blue-505 dark:text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                }`}
                title={isLast ? "Submit Assessment" : "Next Question"}
              >
                <span className="hidden sm:inline">{isLast ? "Finish" : "Next"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Title & Description (Non-Coding) */}
        {question.type !== "coding" && question.type !== "technical" && !question.starterCode && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-brand-text tracking-tight leading-snug">
              {question.title &&
                question.title !== question.description &&
                question.title !== question.question
                ? question.title
                : `${question.category || "Technical Concept"}: ${question.difficulty || "Medium"}`}
            </h2>
            <div className="border-l-4 border-blue-500 bg-slate-100 dark:bg-slate-900/60 p-4 rounded-r-xl border-y border-r border-brand-border">
              <p className="text-xs sm:text-sm text-brand-text leading-relaxed font-medium">
                {question.description || question.question}
              </p>
            </div>
          </div>
        )}

        {/* QUESTION TYPES INPUT SECTION */}
        <div className={(question.type === "coding" || question.type === "technical" || question.starterCode) ? "flex-1 flex flex-col overflow-hidden h-full min-h-0" : ""}>
          {/* 1. Multiple Choice (MCQ / Aptitude) */}
          {(question.type === "mcq" || question.type === "aptitude" || question.type === "multiple_choice" || (Array.isArray(question.options) && question.options.length > 0 && question.type !== "coding" && question.type !== "technical" && question.type !== "msq" && question.type !== "short_answer" && question.type !== "hr")) && (
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-brand-secondary block mb-1">
                Select one correct answer:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(question.options || []).map((opt, oIdx) => {
                  const letterLabel = ["A", "B", "C", "D", "E", "F"][oIdx] || String(oIdx + 1);
                  const optId = typeof opt === "object" && opt !== null ? (opt.id || letterLabel) : letterLabel;
                  const optText = typeof opt === "object" && opt !== null ? (opt.text || opt.label || String(opt)) : String(opt);
                  const isSelected = answer?.selectedOption === optId || answer?.selectedOption === optText;

                  return (
                    <button
                      key={optId || oIdx}
                      type="button"
                      onClick={() => handleMcqSelect(optId)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-xs font-bold transition duration-150 cursor-pointer text-left ${isSelected
                        ? "bg-blue-600/20 border-blue-500 text-brand-text shadow-lg ring-1 ring-blue-500/50"
                        : "bg-slate-100 dark:bg-slate-900/70 border-brand-border text-brand-text hover:bg-slate-200 dark:hover:bg-slate-900 hover:border-blue-505/40"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-mono font-bold border transition ${isSelected
                            ? "bg-blue-500 border-blue-400 text-white shadow-sm"
                            : "bg-slate-200 dark:bg-slate-950 border-brand-border text-brand-secondary"
                            }`}
                        >
                          {optId}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-brand-text">{optText}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-blue-550 dark:text-blue-400 stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Multi Select (MSQ) */}
          {question.type === "msq" && (
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                Select all options that apply:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(question.options || []).map((opt, oIdx) => {
                  const letterLabel = ["A", "B", "C", "D", "E", "F"][oIdx] || String(oIdx + 1);
                  const optId = typeof opt === "object" && opt !== null ? (opt.id || letterLabel) : letterLabel;
                  const optText = typeof opt === "object" && opt !== null ? (opt.text || opt.label || String(opt)) : String(opt);
                  const isSelected = (answer?.selectedOptions || []).includes(optId) || (answer?.selectedOptions || []).includes(optText);

                  return (
                    <button
                      key={optId || oIdx}
                      type="button"
                      onClick={() => handleMsqToggle(optId)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-xs font-bold transition duration-150 cursor-pointer text-left ${isSelected
                        ? "bg-cyan-500/20 border-cyan-500 text-brand-text shadow-lg ring-1 ring-cyan-500/50"
                        : "bg-slate-100 dark:bg-slate-900/70 border-brand-border text-brand-text hover:bg-slate-200 dark:hover:bg-slate-900 hover:border-cyan-505/40"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${isSelected ? "bg-cyan-500 border-cyan-400 text-white" : "bg-slate-200 dark:bg-slate-950 border-brand-border text-brand-secondary"
                            }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">[{optId}]</span>
                        <span className="text-xs sm:text-sm font-semibold text-brand-text">{optText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Short Answer */}
          {question.type === "short_answer" && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase text-brand-secondary">Your Answer Response</label>
              <input
                type="text"
                disabled={isLocked}
                value={answer?.text || ""}
                onChange={(e) => onAnswerChange({ text: e.target.value })}
                placeholder={question.placeholder || "Type your short answer..."}
                className="w-full rounded-xl border border-brand-border bg-slate-100 dark:bg-slate-900/80 px-4 py-3.5 text-xs sm:text-sm font-medium text-brand-text outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          )}



          {/* 5. HR & Behavioral Question Type */}
          {(question.type === "hr" || question.type === "behavioral") && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-brand-border">
                <label className="text-xs font-mono font-bold uppercase text-brand-text flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-505 dark:text-blue-400" />
                  <span>HR & Behavioral Response</span>
                </label>

                {/* STAR Framework Quick Tag Inserts */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-brand-secondary font-mono">STAR Tags:</span>
                  {["Situation", "Task", "Action", "Result"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        const currentText = answer?.text || "";
                        const insertTag = currentText ? `\n[${tag}]: ` : `[${tag}]: `;
                        onAnswerChange({ text: currentText + insertTag });
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-white/5 border border-brand-border text-[10px] font-mono font-bold text-blue-505 dark:text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50 transition cursor-pointer"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows="7"
                disabled={isLocked}
                value={answer?.text || ""}
                onChange={(e) => onAnswerChange({ text: e.target.value })}
                placeholder={
                  question.placeholder ||
                  "Structure your response using the STAR method (Situation, Task, Action, Result)..."
                }
                className="w-full rounded-xl border border-brand-border bg-slate-100 dark:bg-slate-900/90 p-4 text-xs sm:text-sm font-medium text-brand-text outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-y leading-relaxed shadow-inner font-sans"
              />

              <div className="flex items-center justify-between text-[11px] text-brand-secondary font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Evaluated for STAR method, leadership, & quantitative metrics</span>
                </span>
                <span className="font-bold text-brand-text">
                  {(answer?.text || "").trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          )}

          {/* 6. Coding & Technical Code Editor */}
          {(question.type === "coding" || question.type === "technical" || question.starterCode) && (
            <CodingQuestionEditor
              question={question}
              answer={answer}
              onAnswerChange={onAnswerChange}
              isLocked={isLocked}
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
            />
          )}
        </div>

        {/* Bottom Navigation Footer for Non-Editor Questions */}
        {question.type !== "coding" && question.type !== "technical" && !question.starterCode && (
          <div className="flex items-center justify-between pt-6 border-t border-brand-border mt-8">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirst}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 ${
                isFirst
                  ? "bg-slate-100 dark:bg-slate-900 border-brand-border/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
                  : "bg-slate-100 dark:bg-slate-900 border-brand-border text-brand-secondary hover:bg-slate-200 dark:hover:bg-slate-850 hover:text-brand-text"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={isLast ? onSubmit : onNext}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-lg active:scale-95 text-white ${
                isLast
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              }`}
            >
              <span>{isLast ? "Submit Assessment" : "Save & Next"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
