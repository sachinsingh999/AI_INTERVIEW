import React, { useState, useMemo } from "react";

export default function AptitudeInterface({
  questionSet = [],
  currentIndex,
  goToQuestion,
  question, // currentQuestion
  selectedOptions,
  setSelectedOptions,
  moveQuestion,
  timeLeft,
  formatTime,
  reviewed = {},
  setReviewed,
  visited = {},
  setVisited,
  submitted,
  setSubmitted,
  showReview,
  setShowReview,
  resetAptitude,
  navigate,
  sessionData,
  handleAptitudeSubmit,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Score calculation for review page
  const stats = useMemo(() => {
    const total = questionSet.length;
    let answered = 0;
    let reviewCount = 0;
    let unvisited = 0;

    questionSet.forEach((_, idx) => {
      const isAnswered = selectedOptions[idx] !== undefined;
      const isReview = reviewed[idx];
      const isVisited = visited[idx];

      if (isAnswered) answered++;
      if (isReview) reviewCount++;
      if (!isVisited) unvisited++;
    });

    const unanswered = total - answered;
    const progressPercent = total > 0 ? Math.round((answered / total) * 100) : 0;

    return {
      total,
      answered,
      unanswered,
      reviewCount,
      unvisited,
      progressPercent,
    };
  }, [questionSet, selectedOptions, reviewed, visited]);

  // Determine question state mapping
  const getQuestionState = (index) => {
    if (currentIndex === index) return "current";
    if (reviewed[index]) return "review";
    if (selectedOptions[index] !== undefined) return "answered";
    if (visited[index]) return "visited";
    return "unvisited";
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleClearResponse = () => {
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const handleToggleReview = () => {
    setReviewed((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  // Renders the summary review report view when test is submitted
  if (submitted && showReview) {
    const score = questionSet.reduce((acc, q, idx) => {
      const correctIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
      return acc + (selectedOptions[idx] === correctIndex ? 1 : 0);
    }, 0);
    const wrong = stats.total - score;
    const percentage = stats.total > 0 ? Math.round((score / stats.total) * 100) : 0;
    const performance = percentage >= 85 ? "Excellent" : percentage >= 65 ? "Good" : "Needs Practice";

    const totalTimeSpent = questionSet.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
    const avgTime = stats.total > 0 ? Math.round(totalTimeSpent / stats.total) : 0;

    return (
      <div className="h-screen w-screen flex flex-col bg-[#050B14] text-slate-100 font-sans overflow-y-auto">
        <header className="h-14 shrink-0 border-b border-[#1F2937]/80 bg-[#0B1220] flex items-center justify-between px-6 z-10 shadow-md">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white uppercase tracking-wider">Aptitude Practice Report</h1>
          </div>
          <button
            type="button"
            onClick={resetAptitude}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-transparent hover:bg-slate-800/40 text-xs font-bold text-slate-300 transition cursor-pointer"
          >
            Exit to Dashboard
          </button>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-8 space-y-6 pb-16">
          <div className="border-b border-[#1E293B] pb-5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Report Overview</p>
            <h2 className="mt-2 text-2xl font-black text-white">Assessment Complete</h2>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-5">
            <div className="rounded-xl bg-slate-900/40 border border-[#1E293B] p-4 text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Score</p>
              <p className="mt-2 text-3xl font-black text-indigo-400">{score} / {stats.total}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-[#1E293B] p-4 text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Accuracy</p>
              <p className="mt-2 text-3xl font-black text-emerald-400">{percentage}%</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-[#1E293B] p-4 text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Correct</p>
              <p className="mt-2 text-3xl font-black text-emerald-450">{score}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-[#1E293B] p-4 text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Wrong/Skipped</p>
              <p className="mt-2 text-3xl font-black text-rose-500">{wrong}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-[#1E293B] p-4 text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Avg Time</p>
              <p className="mt-2 text-3xl font-black text-amber-500">{avgTime}s/q</p>
            </div>
          </div>

          {/* AI Analysis Sections (If available) */}
          {sessionData?.analysis && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-950/5 border border-emerald-500/10 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span> Strengths
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-350">
                    {sessionData.analysis.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 select-none">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/5 border border-rose-500/10 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-450 flex items-center gap-1.5">
                    <span>⚠️</span> Weak Areas
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-355">
                    {sessionData.analysis.weakAreas?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 select-none">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  AI Performance Feedback
                </h4>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                  {sessionData.analysis.feedback}
                </p>
              </div>
            </div>
          )}

          {/* AI Recommendations Section */}
          {sessionData?.recommendations && (
            <div className="bg-slate-900/20 border border-[#1E293B] rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                AI Recommendations for Next Practice
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">Suggested Topics</span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {sessionData.recommendations.nextTopics?.map((t, idx) => (
                      <span key={idx} className="bg-slate-900 border border-[#1E293B]/60 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-950/40 p-2.5 border border-[#1E293B]/40 rounded-lg">
                    <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Recommended Difficulty</span>
                    <span className="text-xs font-extrabold text-indigo-400">{sessionData.recommendations.recommendedDifficulty}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 p-2.5 border border-[#1E293B]/40 rounded-lg">
                    <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider">Question Count</span>
                    <span className="text-xs font-extrabold text-indigo-400">{sessionData.recommendations.suggestedPracticeCount} Questions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#1E293B] bg-slate-900/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Performance Verdict</p>
              <p className="mt-1 text-lg font-black text-slate-200">{performance}</p>
            </div>
            <button
              type="button"
              onClick={resetAptitude}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white px-5 py-2.5 shadow-lg shadow-indigo-500/10 transition cursor-pointer"
            >
              Exit to Dashboard
            </button>
          </div>

          {/* Question Review Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white">Review Responses</h3>
            <div className="space-y-4">
              {questionSet.map((q, idx) => {
                const userAns = selectedOptions[idx];
                const correctIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
                const isCorrect = userAns === correctIndex;

                return (
                  <div key={idx} className={`rounded-xl border p-5 bg-slate-900/40 ${isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                    <div className="flex items-center justify-between border-b border-[#1E293B]/60 pb-3 mb-3">
                      <span className="text-xs font-bold text-slate-355">Question {idx + 1} ({q.subtopic || "General"})</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-550/10 text-emerald-400 border border-emerald-550/20' : 'bg-rose-500/10 text-rose-400 border border-rose-550/20'}`}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 leading-relaxed mb-4">{q.question}</p>
                    
                    <div className="grid gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAns === oIdx;
                        const isCorrectOpt = correctIndex === oIdx;
                        let optBorderClass = "border-[#1E293B] bg-slate-950/20";
                        if (isSelected) optBorderClass = "border-rose-500 bg-rose-550/5 text-rose-350";
                        if (isCorrectOpt) optBorderClass = "border-emerald-500 bg-emerald-550/5 text-emerald-400";

                        return (
                          <div key={opt} className={`flex items-center gap-3 border rounded-lg px-4 py-2.5 text-xs font-medium ${optBorderClass}`}>
                            <span className="font-bold text-slate-500">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                            {isCorrectOpt && <span className="ml-auto text-[10px] font-bold text-emerald-400">Correct Answer</span>}
                            {isSelected && !isCorrectOpt && <span className="ml-auto text-[10px] font-bold text-rose-400">Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs">
                        <span className="font-bold text-indigo-400">Explanation: </span>
                        <span className="text-slate-350 leading-relaxed">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050B14] text-slate-100 font-sans overflow-hidden">
      
      {/* Aptitude Specialized Header */}
      <header className="h-14 shrink-0 border-b border-[#1E293B] bg-[#0B1220] flex items-center justify-between px-6 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-[#1E293B]/30 transition cursor-pointer"
            title="Exit Assessment"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-200">Aptitude Assessment</h1>
            <p className="text-[10px] font-semibold text-slate-450">MockAI Practice Suite</p>
          </div>
        </div>

        {/* Center metadata */}
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
            {question?.topic || "Logical Reasoning"}
          </span>
          <span className="rounded-lg bg-slate-850 px-2.5 py-1 text-[10px] font-black text-slate-400 border border-slate-800 uppercase">
            {question?.difficulty || "Medium"}
          </span>
        </div>

        {/* Right: Timer & Submit */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="text-[10px] text-slate-500 select-none">
            <span className="text-emerald-450 font-bold">● Auto-Saved</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E293B] bg-[#090E1A] text-amber-500 font-semibold font-mono text-xs select-none">
            <span>⏱</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Top Visual Progress Bar */}
      <div className="h-1.5 w-full bg-slate-900 border-b border-[#1E293B]/20 relative shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
          style={{ width: `${stats.progressPercent}%` }}
        />
        <div className="absolute right-4 top-2 text-[9px] font-bold text-slate-500 tracking-wider uppercase">
          Progress: {stats.answered} / {stats.total} questions ({stats.progressPercent}%)
        </div>
      </div>

      {/* Main Container: Sidebar + Question Page */}
      <div className="flex-1 flex min-h-0 w-full relative">
        
        {/* Left Collapsible sidebar navigator */}
        <div 
          className={`shrink-0 border-r border-[#1E293B]/60 bg-[#0B1220]/60 backdrop-blur-md flex flex-col transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-[260px]" : "w-0 border-r-0"
          }`}
        >
          {sidebarOpen && (
            <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
              
              {/* Circular Progress Block */}
              <div className="bg-slate-900/35 border border-[#1E293B] rounded-xl p-3.5 flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="text-indigo-400 transition-all duration-500" strokeWidth="3.5" strokeDasharray={151} strokeDashoffset={151 - (151 * stats.progressPercent) / 100} stroke="currentColor" fill="transparent" />
                  </svg>
                  <span className="absolute text-[10px] font-black font-mono">{stats.progressPercent}%</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Completion</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Keep track of your pacing</p>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-2 bg-[#090E1A] p-2.5 rounded-lg border border-[#1E293B]/50 text-center text-[10px]">
                <div>
                  <span className="block text-emerald-400 font-bold text-xs">{stats.answered}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Done</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-xs">{stats.unanswered}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Left</span>
                </div>
                <div>
                  <span className="block text-amber-500 font-bold text-xs">{stats.reviewCount}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Review</span>
                </div>
              </div>

              {/* Navigator title */}
              <div className="flex items-center justify-between border-b border-[#1E293B]/40 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Questions navigator</span>
                <span className="text-[9px] font-bold text-slate-550">Total: {stats.total}</span>
              </div>

              {/* Question list numbers grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-4 gap-2">
                  {questionSet.map((_, index) => {
                    const qState = getQuestionState(index);
                    let btnClass = "";
                    
                    if (qState === "current") {
                      btnClass = "bg-indigo-650 hover:bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-500/30 font-black scale-105 shadow-[0_0_12px_rgba(99,102,241,0.15)]";
                    } else if (qState === "review") {
                      btnClass = "bg-amber-500 hover:bg-amber-600 text-white border-amber-400 font-bold shadow-sm";
                    } else if (qState === "answered") {
                      btnClass = "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 font-bold shadow-sm";
                    } else if (qState === "visited") {
                      btnClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30";
                    } else {
                      btnClass = "bg-slate-900/50 text-slate-400 border border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700/60";
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`h-9 w-full flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${btnClass}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color legend guide */}
              <div className="pt-2 border-t border-[#1E293B]/45 space-y-1.5 text-[9px] font-bold text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-900 border border-slate-800" /> Unvisited</span>
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500/20 border border-amber-500/30" /> Visited</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Current</span>
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Marked for Review
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Collapsible toggle float button handle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 h-20 w-3 bg-[#0B1220] hover:bg-[#1E293B] border border-l-0 border-[#1E293B] rounded-r-md flex items-center justify-center cursor-pointer text-slate-500 hover:text-indigo-400 transition"
          style={{
            left: sidebarOpen ? "260px" : "0px",
            transition: "left 0.3s ease-in-out"
          }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="text-[9px] font-bold select-none">{sidebarOpen ? "◀" : "▶"}</span>
        </button>

        {/* Main Area: Question Content + MCQ options card */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/10 relative">
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8 max-w-4xl mx-auto w-full pb-28">
            
            {/* Question title header */}
            <div>
              <span className="text-xs font-bold text-indigo-400 tracking-wide uppercase">Question {currentIndex + 1} of {stats.total}</span>
              <h2 className="mt-2.5 text-lg sm:text-xl font-bold text-white leading-relaxed">
                {question?.question || "Question prompt loading..."}
              </h2>
            </div>

            {/* Optional formula, image, or table layout elements if present in database */}
            {question?.image && (
              <div className="my-4">
                <img src={question.image} alt="Question Graphic" className="max-w-md w-full rounded-lg border border-[#1E293B] bg-slate-950/20" />
              </div>
            )}

            {question?.table && (
              <div className="my-4 overflow-x-auto border border-[#1E293B] rounded-lg bg-slate-950/20">
                <table className="min-w-full divide-y divide-[#1E293B] text-xs">
                  {/* render table structure */}
                </table>
              </div>
            )}

            {/* MCQ Option selectable cards */}
            <div className="grid gap-3.5">
              {question?.options?.map((option, oIdx) => {
                const isSelected = selectedOptions[currentIndex] === oIdx;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    className={`group w-full flex items-center gap-4 rounded-xl border text-left px-5 py-4 transition-all duration-200 active:scale-[0.995] cursor-pointer outline-none ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] text-white"
                        : "border-[#1E293B] bg-slate-950/40 text-slate-300 hover:border-slate-800 hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex shrink-0 items-center justify-center">
                      <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border transition-all ${
                        isSelected 
                          ? "border-indigo-550 bg-indigo-550" 
                          : "border-slate-800 group-hover:border-indigo-400"
                      }`}>
                        {isSelected ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-transparent" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`text-sm font-extrabold ${isSelected ? "text-indigo-400" : "text-slate-500"}`}>
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span className={`text-sm font-semibold leading-relaxed ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Sticky Bottom Actions Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-16 shrink-0 px-6 border-t border-[#1E293B]/80 bg-[#090E1A] z-10 flex items-center justify-between shadow-lg select-none">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={selectedOptions[currentIndex] === undefined}
                className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-slate-200 px-4 py-2 shadow-sm transition disabled:opacity-30 cursor-pointer"
              >
                Clear Response
              </button>
              <button
                type="button"
                onClick={handleToggleReview}
                className={`rounded-lg border text-xs font-bold px-4 py-2 transition cursor-pointer ${
                  reviewed[currentIndex]
                    ? "bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/25"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                {reviewed[currentIndex] ? "Unmark Review" : "Mark for Review"}
              </button>
            </div>
            
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => moveQuestion(-1)}
                className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-slate-200 px-5 py-2 shadow-sm transition disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              
              {currentIndex < questionSet.length - 1 ? (
                <button
                  type="button"
                  onClick={() => moveQuestion(1)}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition active:scale-95 cursor-pointer"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAptitudeSubmit}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/10 transition active:scale-95 cursor-pointer border border-emerald-500"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
