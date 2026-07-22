import React from "react";

export default function WrittenPractice({
  writtenAnswers,
  setWrittenAnswers,
  currentIndex,
  currentQuestion,
  questionSet,
  goToQuestion,
  reviewed,
  setReviewed,
  moveQuestion,
  stateClass,
  questionState,
  writtenCount,
  safeMode,
  getAnswerQuality,
}) {
  const answer = writtenAnswers[currentIndex] || "";
  const quality = getAnswerQuality(answer, currentQuestion?.hints || []);

  return (
    <div className="flex-1 min-h-0 grid gap-6 lg:grid-cols-[1fr_340px] mb-4">
      <section className="h-full flex flex-col min-h-0 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">
              {currentQuestion?.topic}
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-brand-text">
              {currentQuestion?.prompt}
            </h2>
          </div>
          <span className="rounded-lg bg-brand-bg px-3 py-2 text-xs font-black text-brand-secondary">
            {currentIndex + 1}/{questionSet.length}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 shrink-0">
          {currentQuestion?.hints?.map((hint) => (
            <span key={hint} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
              {hint}
            </span>
          ))}
        </div>

        <textarea
          value={answer}
          onChange={(event) =>
            setWrittenAnswers((prev) => ({ ...prev, [currentIndex]: event.target.value }))
          }
          className="mt-6 flex-1 min-h-0 w-full resize-none rounded-xl border border-brand-border bg-brand-bg/50 p-4 text-sm font-semibold leading-relaxed outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-105 text-slate-800"
          placeholder={safeMode === "hr" ? "Use STAR: situation, task, action, result..." : "Explain your thinking clearly with examples and tradeoffs..."}
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => moveQuestion(-1)}
            className="rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-xs font-black text-brand-text disabled:opacity-40"
          >
            Previous
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReviewed((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))}
              className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-black text-violet-700"
            >
              {reviewed[currentIndex] ? "Unmark" : "Mark Review"}
            </button>
            <button
              type="button"
              onClick={() => moveQuestion(1)}
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700"
            >
              Save & Next
            </button>
          </div>
        </div>
      </section>

      <aside className="h-full overflow-y-auto space-y-4 pr-1">
        <div className="rounded-lg border border-brand-border bg-brand-card p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">Answer Coach</p>
          <p className={`mt-3 text-4xl font-black ${quality.tone}`}>{quality.score}/10</p>
          <p className="mt-1 text-sm font-black text-brand-text">{quality.label}</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-brand-secondary">{quality.feedback}</p>
        </div>

        <div className="rounded-lg border border-brand-border bg-brand-card p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">Expected Direction</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-brand-secondary">{currentQuestion?.expected}</p>
        </div>

        <div className="rounded-lg border border-brand-border bg-brand-card p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">Questions</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {questionSet.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToQuestion(index)}
                className={`h-10 rounded-lg border text-sm font-black ${stateClass[questionState(index)]}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-bold text-brand-secondary">
            {writtenCount}/{questionSet.length} answers drafted
          </p>
        </div>
      </aside>
    </div>
  );
}
