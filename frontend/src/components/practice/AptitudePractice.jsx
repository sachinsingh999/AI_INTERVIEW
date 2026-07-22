import React from "react";

export default function AptitudePractice({
  aptitudeQuestions,
  currentIndex,
  goToQuestion,
  questionState,
  stateClass,
  setSubmitted,
  setShowReview,
  currentQuestion,
  selectedOptions,
  setSelectedOptions,
  moveQuestion,
  timeTaken,
  resetAptitude,
  submitted,
  showReview,
  formatTime,
}) {
  if (submitted && showReview) {
    const aptitudeScore = aptitudeQuestions.reduce((acc, q, idx) => {
      return acc + (selectedOptions[idx] === q.correct ? 1 : 0);
    }, 0);
    const aptitudeWrong = aptitudeQuestions.length - aptitudeScore;
    const aptitudePercentage = Math.round((aptitudeScore / aptitudeQuestions.length) * 100);

    const aptitudeBreakdown = Object.values(
      aptitudeQuestions.reduce((acc, q, idx) => {
        if (!acc[q.topic]) acc[q.topic] = { topic: q.topic, correct: 0, total: 0 };
        acc[q.topic].total++;
        if (selectedOptions[idx] === q.correct) acc[q.topic].correct++;
        return acc;
      }, {})
    ).map((item) => ({
      ...item,
      percentage: Math.round((item.correct / item.total) * 100),
    }));

    const performance =
      aptitudePercentage >= 85 ? "Excellent" : aptitudePercentage >= 65 ? "Good" : "Needs Practice";
    const weakestCategory = aptitudeBreakdown.reduce((lowest, item) =>
      item.percentage < lowest.percentage ? item : lowest
    );

    return (
      <section className="flex-1 overflow-y-auto mx-auto w-full max-w-5xl rounded-3xl border border-brand-border bg-brand-card/5 backdrop-blur-lg p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-4">
        <div className="border-b border-brand-border pb-5">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Aptitude Report</p>
          <h2 className="mt-2 text-3xl font-black text-brand-text">Assessment Complete</h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-brand-bg p-4">
            <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">Score</p>
            <p className="mt-2 text-3xl font-black text-brand-text">{aptitudeScore} / {aptitudeQuestions.length}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Percentage</p>
            <p className="mt-2 text-3xl font-black text-blue-700">{aptitudePercentage}%</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Correct</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{aptitudeScore}</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-rose-600">Wrong</p>
            <p className="mt-2 text-3xl font-black text-rose-700">{aptitudeWrong}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-brand-border bg-brand-bg p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">Time Taken</p>
              <p className="mt-1 text-xl font-black text-brand-text">{formatTime(timeTaken)}</p>
            </div>
            <div className="rounded-lg bg-brand-card px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-brand-secondary">Performance</p>
              <p className="mt-1 text-xl font-black text-emerald-700">{performance}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-black text-brand-text">Category Breakdown</h3>
          <div className="mt-4 grid gap-3">
            {aptitudeBreakdown.map((item) => (
              <div key={item.topic} className="rounded-lg border border-brand-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black text-slate-800">{item.topic}</p>
                  <p className="text-sm font-black text-brand-text">{item.percentage}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-bg">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-brand-secondary">{item.correct}/{item.total} correct</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
          <h3 className="text-lg font-black text-blue-950">Improvement Suggestions</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-blue-900">
            Focus next on {weakestCategory.topic}. Reattempt mixed sets, review every wrong explanation, and keep question time under 75 seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={resetAptitude}
          className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
        >
          Practice Again
        </button>
      </section>
    );
  }

  return (
    <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-[240px_1fr] mb-4">
      <aside className="overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 shadow-lg flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">Navigator</p>
          <div className="mt-3 grid grid-cols-5 gap-1.5 lg:grid-cols-4">
            {aptitudeQuestions.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToQuestion(index)}
                className={`flex h-8 w-full items-center justify-center rounded-lg border text-xs font-black transition-all hover:scale-105 hover:shadow-sm ${stateClass[questionState(index)]}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3 text-[10px] font-bold text-brand-secondary">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" /> Unvisited</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500/10 ring-1 ring-amber-500/30" /> Visited</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500/40" /> Current</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" /> Answered</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmitted(true);
            setShowReview(true);
          }}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-slate-900 to-slate-850 py-2.5 text-xs font-black text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 border border-slate-800"
        >
          Submit Test
        </button>
      </aside>

      <section className="flex flex-col min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-lg relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/0 to-slate-950/0"></div>
        <div className="border-b border-slate-800/80 bg-slate-950/20 px-5 py-3 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Aptitude Assessment</h2>
            <p className="text-[11px] font-bold text-brand-secondary">
              Question {currentIndex + 1} of {aptitudeQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-black text-indigo-400">
              {currentQuestion?.topic}
            </span>
            <span className="rounded-lg bg-slate-850 px-2.5 py-1 text-[10px] font-black text-brand-secondary border border-slate-800">
              {currentQuestion?.difficulty}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <p className="max-w-4xl text-lg font-black leading-relaxed text-white mb-6">
            {currentQuestion?.question}
          </p>

          <div className="grid gap-2.5">
            {currentQuestion?.options.map((option, optionIndex) => {
              const isSelected = selectedOptions[currentIndex] === optionIndex;

              return (
                <label
                  key={option}
                  className={`group relative flex w-full cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 transition-all duration-200 active:scale-[0.99] ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500 text-white"
                      : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex shrink-0 items-center justify-center">
                    <input
                      type="radio"
                      name={`aptitude-${currentIndex}`}
                      checked={isSelected}
                      onChange={() =>
                        setSelectedOptions((prev) => ({ ...prev, [currentIndex]: optionIndex }))
                      }
                      className="sr-only"
                    />
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                      isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-700 group-hover:border-indigo-400"
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-brand-card" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black ${isSelected ? "text-indigo-400" : "text-brand-secondary"}`}>
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <span className={`text-sm font-semibold leading-normal ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {option}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 px-5 py-3 border-t border-slate-800/80 bg-slate-900/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() =>
              setSelectedOptions((prev) => {
                const next = { ...prev };
                delete next[currentIndex];
                return next;
              })
            }
            disabled={selectedOptions[currentIndex] === undefined}
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-black text-brand-secondary shadow-sm transition-all hover:bg-slate-900 disabled:opacity-30"
          >
            Clear Response
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => moveQuestion(-1)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-5 py-2 text-xs font-black text-brand-secondary shadow-sm transition-all hover:bg-slate-900 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => moveQuestion(1)}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-xs font-black text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              Save & Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
