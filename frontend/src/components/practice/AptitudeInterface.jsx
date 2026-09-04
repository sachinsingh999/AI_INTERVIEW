import React, { useState, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";

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
  const { resolvedTheme } = useTheme();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [filterMode, setFilterMode] = useState("all"); // "all", "correct", "incorrect", "unattempted"

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
    const wrong = questionSet.reduce((acc, q, idx) => {
      const correctIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
      const userAns = selectedOptions[idx];
      return acc + (userAns !== undefined && userAns !== correctIndex ? 1 : 0);
    }, 0);
    const unattemptedCount = questionSet.reduce((acc, q, idx) => {
      return acc + (selectedOptions[idx] === undefined ? 1 : 0);
    }, 0);
    const percentage = questionSet.length > 0 ? Math.round((score / questionSet.length) * 100) : 0;
    
    // Performance assessment helpers
    const isExcellent = percentage >= 85;
    const isGood = percentage >= 65;
    const performance = isExcellent ? "Excellent" : isGood ? "Good" : "Needs Practice";
    
    let performanceColor = "text-rose-600 dark:text-rose-400";
    let performanceBg = "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50";
    if (isExcellent) {
      performanceColor = "text-emerald-600 dark:text-emerald-400";
      performanceBg = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50";
    } else if (isGood) {
      performanceColor = "text-blue-600 dark:text-blue-400";
      performanceBg = "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50";
    }

    // Filter questions based on filterMode selection
    const filteredQuestions = questionSet.map((q, idx) => ({ ...q, originalIndex: idx })).filter((q) => {
      const userAns = selectedOptions[q.originalIndex];
      const correctIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
      const isCorrect = userAns === correctIndex;
      const isAnswered = userAns !== undefined;

      if (filterMode === "correct") return isCorrect && isAnswered;
      if (filterMode === "incorrect") return !isCorrect && isAnswered;
      if (filterMode === "unattempted") return !isAnswered;
      return true;
    });

    const activeReviewQuestion = questionSet[reviewIndex] || questionSet[0];
    const userAns = selectedOptions[reviewIndex];
    const correctIndex = activeReviewQuestion ? (activeReviewQuestion.correctAnswer !== undefined ? activeReviewQuestion.correctAnswer : activeReviewQuestion.correct) : 0;
    const activeIsCorrect = userAns === correctIndex;

    const currentFilteredIndex = filteredQuestions.findIndex(q => q.originalIndex === reviewIndex);

    // Calculate metadata details
    const totalTimeSeconds = (sessionData?.questionCount || questionSet.length) * 60;
    const elapsedSeconds = Math.max(0, totalTimeSeconds - (timeLeft || 0));
    const formatTimeSeconds = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Calculate weak subtopics for Footer list
    const wrongSubtopics = Array.from(
      new Set(
        questionSet
          .filter((_, idx) => {
            const cIdx = questionSet[idx].correctAnswer !== undefined ? questionSet[idx].correctAnswer : questionSet[idx].correct;
            return selectedOptions[idx] !== cIdx;
          })
          .map(q => q.subtopic || q.topic || "General")
      )
    ).join(", ") || "None";

    const handleFilterChange = (mode) => {
      setFilterMode(mode);
      const matched = questionSet.map((q, idx) => ({ ...q, originalIndex: idx })).find((q) => {
        const uAns = selectedOptions[q.originalIndex];
        const cIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
        const isC = uAns === cIndex;
        const isA = uAns !== undefined;

        if (mode === "correct") return isC && isA;
        if (mode === "incorrect") return !isC && isA;
        if (mode === "unattempted") return !isA;
        return true;
      });
      if (matched) {
        setReviewIndex(matched.originalIndex);
      }
    };

    return (
      <div className="h-screen w-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070b13] text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
        
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1220] flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Session Report</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Aptitude Assessment – {activeReviewQuestion?.topic || "Mock Test 01"}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetAptitude}
              className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-black uppercase text-white tracking-wider transition cursor-pointer shadow-sm shadow-indigo-500/10"
            >
              Exit Dashboard
            </button>
          </div>
        </header>

        <main className="flex-1 w-full px-8 py-5 flex flex-col gap-4 overflow-hidden !ml-0 !w-full">
          
          {/* Metadata Badges Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-3 shrink-0">
            
            {/* Left metadata cards */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424] text-xs font-semibold text-slate-500 dark:text-slate-400">
                <svg className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(sessionData?.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424] text-xs font-semibold text-slate-500 dark:text-slate-400">
                <svg className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(sessionData?.updatedAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424] text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                <svg className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth={2} />
                  <path d="M12 9v4l3 3M12 2v3m-2-3h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
                <span>{formatTimeSeconds(elapsedSeconds)} / {formatTimeSeconds(totalTimeSeconds)}</span>
              </div>
            </div>

            {/* Right filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { mode: "all", label: `All Questions (${questionSet.length})` },
                { mode: "correct", label: `Correct (${score})` },
                { mode: "incorrect", label: `Incorrect (${wrong})` },
                { mode: "unattempted", label: `Unattempted (${unattemptedCount})` }
              ].map((tab) => {
                const isActive = filterMode === tab.mode;
                return (
                  <button
                    key={tab.mode}
                    onClick={() => handleFilterChange(tab.mode)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer select-none border ${
                      isActive 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-black animate-fade-in" 
                        : "bg-white border-slate-205 dark:bg-[#0d1424] dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Main Workspace */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
            
            {/* Left Card: Navigator + Question details */}
            <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 shadow-sm h-full flex gap-5 overflow-hidden">
              
              {/* Question Rail Selector */}
              <div className="w-14 shrink-0 flex flex-col gap-2.5 h-full overflow-y-auto pr-1.5 border-r border-slate-100 dark:border-slate-800/60 custom-scrollbar">
                {filteredQuestions.map((q) => {
                  const qUserAns = selectedOptions[q.originalIndex];
                  const qCorrectIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
                  const qIsCorrect = qUserAns === qCorrectIndex;
                  const qIsAnswered = qUserAns !== undefined;
                  const isActive = reviewIndex === q.originalIndex;

                  return (
                    <div key={q.originalIndex} className="relative flex justify-center py-0.5">
                      <button
                        onClick={() => setReviewIndex(q.originalIndex)}
                        className={`h-9 w-9 rounded-full font-bold text-xs transition flex items-center justify-center cursor-pointer select-none relative ${
                          isActive 
                            ? "bg-indigo-50 border-2 border-indigo-600 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-500 dark:text-indigo-300"
                            : "bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:border-slate-350"
                        }`}
                      >
                        {q.originalIndex + 1}
                        
                        {/* Status Overlay Badge */}
                        {qIsAnswered ? (
                          qIsCorrect ? (
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7.5px] border border-white dark:border-slate-950 font-black">
                              ✓
                            </span>
                          ) : (
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7.5px] border border-white dark:border-slate-950 font-black">
                              ✗
                            </span>
                          )
                        ) : null}
                      </button>
                    </div>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <div className="text-[10px] text-center text-slate-400 font-bold mt-4 leading-normal">
                    No items
                  </div>
                )}
              </div>

              {/* Active Question detail */}
              <div className="flex-1 flex flex-col justify-between h-full">
                {activeReviewQuestion ? (
                  <div className="space-y-5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    
                    {/* Header bar within question card */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Question {reviewIndex + 1} of {questionSet.length}
                      </span>
                      <button className="text-slate-400 hover:text-indigo-650 transition rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Question statement */}
                    <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-relaxed">
                      {activeReviewQuestion.question}
                    </h2>

                    {/* MCQ Options list */}
                    <div className="grid gap-3">
                      {activeReviewQuestion.options.map((opt, oIdx) => {
                        const isSelected = userAns === oIdx;
                        const isCorrectOpt = correctIndex === oIdx;
                        
                        let optBorderClass = "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700";
                        if (isSelected) {
                          optBorderClass = isCorrectOpt 
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 font-semibold shadow-sm"
                            : "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-semibold shadow-sm";
                        }

                        return (
                          <div key={oIdx} className={`flex items-center gap-3 border rounded-lg px-4 py-3 text-xs transition duration-150 ${optBorderClass}`}>
                            {/* Custom radio circular indicator */}
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected 
                                ? activeIsCorrect 
                                  ? "border-emerald-500 text-emerald-500" 
                                  : "border-rose-500 text-rose-500" 
                                : "border-slate-300 dark:border-slate-750"
                            }`}>
                              {isSelected && (
                                <div className={`w-2 h-2 rounded-full ${
                                  activeIsCorrect ? "bg-emerald-500" : "bg-rose-500"
                                }`} />
                              )}
                            </div>
                            <span className="font-black mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                            <span className="font-semibold">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
                    Select a question from the list to review details.
                  </div>
                )}

                {/* Navigator bottom controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
                  <button
                    type="button"
                    disabled={currentFilteredIndex <= 0}
                    onClick={() => {
                      if (currentFilteredIndex > 0) {
                        setReviewIndex(filteredQuestions[currentFilteredIndex - 1].originalIndex);
                      }
                    }}
                    className="px-4 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>&lt;</span> Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentFilteredIndex < 0 || currentFilteredIndex >= filteredQuestions.length - 1}
                    onClick={() => {
                      if (currentFilteredIndex >= 0 && currentFilteredIndex < filteredQuestions.length - 1) {
                        setReviewIndex(filteredQuestions[currentFilteredIndex + 1].originalIndex);
                      }
                    }}
                    className="px-4 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 transition cursor-pointer flex items-center gap-1"
                  >
                    Next <span>&gt;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: Answer & Response Analysis */}
            <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 shadow-sm h-full flex flex-col justify-between overflow-hidden">
              {activeReviewQuestion ? (
                <div className="space-y-5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Answer & Your Response</h3>
                  
                  {/* Correct Answer Box */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Correct Answer</span>
                    <div className="border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] p-3.5 rounded-lg flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0 select-none shadow-sm">
                        {String.fromCharCode(65 + correctIndex)}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {activeReviewQuestion.options[correctIndex]}
                      </span>
                    </div>
                  </div>

                  {/* Your Response Box */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Your Response</span>
                    <div className={`border p-3.5 rounded-lg flex items-center justify-between gap-3 ${
                      activeIsCorrect 
                        ? "border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02]" 
                        : userAns === undefined
                          ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20"
                          : "border-rose-500/20 bg-rose-500/[0.03] dark:bg-rose-500/[0.02]"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-full font-extrabold flex items-center justify-center text-xs shrink-0 select-none shadow-sm ${
                          activeIsCorrect 
                            ? "bg-emerald-500 text-white" 
                            : userAns === undefined
                              ? "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              : "bg-rose-500 text-white"
                        }`}>
                          {userAns !== undefined ? String.fromCharCode(65 + userAns) : "-"}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {userAns !== undefined ? activeReviewQuestion.options[userAns] : "Unattempted / Skipped"}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        activeIsCorrect 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                          : userAns === undefined
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-250 dark:border-slate-700"
                            : "bg-rose-500/10 text-rose-650 dark:text-rose-400 border border-rose-500/20"
                      }`}>
                        {activeIsCorrect ? "Correct" : userAns === undefined ? "Skipped" : "Incorrect"}
                      </span>
                    </div>
                  </div>

                  {/* Explanation Section */}
                  {activeReviewQuestion.explanation && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Explanation</span>
                      </span>
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 p-3.5 rounded-lg max-h-[160px] overflow-y-auto custom-scrollbar">
                        {activeReviewQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Tip Callout Block */}
                  <div className="border border-indigo-500/10 bg-indigo-500/[0.02] dark:border-indigo-900/20 dark:bg-indigo-950/10 p-3.5 rounded-lg flex items-start gap-2.5 shadow-sm">
                    <svg className="w-4 h-4 text-indigo-550 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Tip</span>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-350 leading-relaxed mt-0.5">
                        Read the explanation thoroughly, write down formulas, and double-check your derivation flow to avoid repeating calculation oversights next time.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
                  No active item details.
                </div>
              )}
            </div>
          </div>

          {/* Footer Metrics Row */}
          <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80 select-none shrink-0">
            
            {/* Time Taken */}
            <div className="flex-1 flex items-center gap-3 pt-4 sm:pt-0">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-555 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth={2} />
                  <path d="M12 9v4l2.5 2.5M12 2v2.5M10 2h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Time Taken</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                  {formatTimeSeconds(elapsedSeconds)} / {formatTimeSeconds(totalTimeSeconds)}
                </span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="flex-1 flex items-center gap-3 pt-4 sm:pt-0 sm:pl-6">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Accuracy</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Strength */}
            <div className="flex-1 flex items-center gap-3 pt-4 sm:pt-0 sm:pl-6">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Strength</span>
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase mt-1 ${
                  isExcellent 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                    : isGood 
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}>
                  {performance}
                </span>
              </div>
            </div>

            {/* Needs Improvement */}
            <div className="flex-[1.5] flex items-center gap-3 pt-4 sm:pt-0 sm:pl-6">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Needs Improvement</span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 mt-1 block truncate" title={wrongSubtopics}>
                  {wrongSubtopics}
                </span>
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-[#070b13] text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* Aptitude Specialized Header */}
      <header className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1220] flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-[#1E293B]/30 transition cursor-pointer"
            title="Exit Assessment"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          
          {/* Logo Brand Layout matching Mockup */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg border border-blue-500/20 bg-blue-500/[0.04] flex items-center justify-center font-black text-blue-600 dark:text-blue-400 select-none shadow-sm text-xs">
              <svg className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-slate-200 leading-tight">Aptitude Assessment</h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none">Mock Practice Suite</p>
            </div>
          </div>
        </div>

        {/* Center Topic & Difficulty Badges */}
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/80 px-3 py-1 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {question?.topic || "Percentage"}
          </span>
          <span className="rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1 text-[9px] font-black uppercase tracking-widest">
            {question?.difficulty || "Medium"}
          </span>
        </div>

        {/* Right Status Info & Countdown Timer */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-450 font-bold select-none">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Auto-saved</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-extrabold font-mono text-xs select-none shadow-sm">
            <span className="text-orange-500 dark:text-orange-400 text-xs">⏱</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Question Page */}
      <div className="flex-1 flex min-h-0 w-full relative">
        
        {/* Left Collapsible sidebar navigator */}
        <div 
          className={`shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] flex flex-col transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-[260px]" : "w-0 border-r-0"
          }`}
        >
          {sidebarOpen && (
            <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
              
              {/* Circular Gauge widget */}
              <div className="bg-white dark:bg-[#0c1220]/65 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" className="text-slate-100 dark:text-slate-850" strokeWidth="4" stroke="currentColor" fill="transparent" />
                    <circle cx="32" cy="32" r="26" className="text-indigo-600 dark:text-indigo-500 transition-all duration-500" strokeWidth="4" strokeDasharray={163} strokeDashoffset={163 - (163 * stats.progressPercent) / 100} stroke="currentColor" fill="transparent" />
                  </svg>
                  <span className="absolute text-xs font-black font-mono">{stats.progressPercent}%</span>
                </div>
                <div className="mt-2.5">
                  <p className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Completed</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Keep going, you're doing great!</p>
                </div>

                {/* Progress dot row segments */}
                <div className="flex items-center gap-1 w-full justify-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  {questionSet.map((_, index) => {
                    const isAnswered = selectedOptions[index] !== undefined;
                    return (
                      <div 
                        key={index} 
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-250 ${
                          isAnswered 
                            ? "bg-indigo-600 dark:bg-indigo-500" 
                            : "bg-slate-100 dark:bg-slate-800"
                        }`} 
                      />
                    );
                  })}
                </div>
                <p className="text-[9px] font-black text-slate-450 dark:text-slate-500 mt-2 select-none uppercase tracking-wide">
                  {stats.answered} / {stats.total} Questions
                </p>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#0c1220]/20 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 text-center text-[10px] shadow-sm">
                <div>
                  <span className="block text-emerald-600 dark:text-emerald-450 font-black text-sm">{stats.answered}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-extrabold">Done</span>
                </div>
                <div>
                  <span className="block text-indigo-600 dark:text-indigo-400 font-black text-sm">{stats.unanswered}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-extrabold">Left</span>
                </div>
                <div>
                  <span className="block text-amber-500 font-black text-sm">{stats.reviewCount}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">Review</span>
                </div>
              </div>

              {/* Navigator header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Questions</span>
                <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Total: {stats.total}</span>
              </div>

              {/* Question list numbers grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-4 gap-2">
                  {questionSet.map((_, index) => {
                    const qState = getQuestionState(index);
                    let btnClass = "";
                    
                    if (qState === "current") {
                      btnClass = "bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold scale-105 shadow-md shadow-indigo-500/15";
                    } else if (qState === "review") {
                      btnClass = "border border-amber-500 bg-amber-500/[0.03] text-amber-600 dark:text-amber-400 font-extrabold relative";
                    } else if (qState === "answered") {
                      btnClass = "border border-emerald-500 bg-emerald-500/[0.03] text-emerald-600 dark:text-emerald-450 font-extrabold relative";
                    } else if (qState === "visited") {
                      btnClass = "border border-amber-500/35 bg-amber-500/[0.03] text-amber-600 dark:text-amber-400 font-extrabold";
                    } else {
                      btnClass = "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1220]/20 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700";
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`h-9 w-full flex items-center justify-center rounded-full text-xs transition-all duration-150 active:scale-95 cursor-pointer relative ${btnClass}`}
                      >
                        <span>{index + 1}</span>
                        {qState === "answered" && (
                          <span className="absolute bottom-0 right-0 -mb-0.5 -mr-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white ring-1 ring-white dark:ring-[#0b1220] select-none font-bold">
                            ✓
                          </span>
                        )}
                        {qState === "review" && (
                          <span className="absolute bottom-0 right-0 -mb-0.5 -mr-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] text-white ring-1 ring-white dark:ring-[#0b1220] select-none font-bold">
                            ?
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color legend guide */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 select-none">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1220]/20" /> 
                    Not Visited
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-amber-500/35 bg-amber-500/[0.03]" /> 
                    Visited
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" /> 
                    Current
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-500 bg-emerald-500/[0.03] flex items-center justify-center text-[7px] text-emerald-500 font-bold">✓</span> 
                    Answered
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 
                  Marked for Review
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Collapsible toggle float button handle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute z-20 top-1/2 -translate-y-1/2 h-14 w-5 bg-white dark:bg-[#0B1220] hover:bg-slate-50 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-r-lg flex items-center justify-center cursor-pointer text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow-md transition-all duration-300"
          style={{
            left: sidebarOpen ? "260px" : "0px",
            marginLeft: sidebarOpen ? "-1px" : "0px",
          }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="text-[8px] font-bold select-none">{sidebarOpen ? "◀" : "▶"}</span>
        </button>

        {/* Main Area: Question Content + MCQ options card */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20 dark:bg-slate-900/10 relative">
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8 w-full pb-28">
            
            {/* Question title header */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-wide uppercase select-none">Question {currentIndex + 1} of {stats.total}</span>
              <h2 className="text-base sm:text-lg font-black text-slate-850 dark:text-white leading-relaxed">
                {question?.question || "Question prompt loading..."}
              </h2>
            </div>

            {/* Optional formula, image, or table layout elements if present in database */}
            {question?.image && (
              <div className="my-4">
                <img src={question.image} alt="Question Graphic" className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20" />
              </div>
            )}

            {question?.table && (
              <div className="my-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/20 shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
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
                    className={`group w-full flex items-center gap-4 rounded-xl border text-left px-5 py-4 transition-all duration-200 active:scale-[0.995] cursor-pointer outline-none shadow-sm ${
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-slate-900 dark:text-white shadow-[0_4px_16px_rgba(99,102,241,0.04)]"
                        : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220]/45 text-slate-650 dark:text-slate-300 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 hover:scale-[1.005] hover:shadow-md"
                    }`}
                  >
                    <div className="flex shrink-0 items-center justify-center">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        isSelected 
                          ? "border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500 text-white" 
                          : "border-slate-300 dark:border-slate-700 group-hover:border-slate-400"
                      }`}>
                        {isSelected ? (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                        )}
                      </div>
                    </div>
                    
                    {/* Premium badge style Option letter */}
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black uppercase shrink-0 transition-colors ${
                      isSelected 
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white" 
                        : "bg-slate-100 dark:bg-[#121b2d] text-slate-500 dark:text-slate-450"
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold leading-relaxed ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Sticky Bottom Actions Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-16 shrink-0 px-6 border-t border-slate-200 dark:border-slate-805 bg-white dark:bg-[#090E1A] z-10 flex items-center justify-between shadow-md select-none">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={selectedOptions[currentIndex] === undefined}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2 shadow-sm transition disabled:opacity-30 cursor-pointer"
              >
                Clear Response
              </button>
              <button
                type="button"
                onClick={handleToggleReview}
                className={`rounded-xl border text-xs font-bold px-4 py-2 transition cursor-pointer shadow-sm ${
                  reviewed[currentIndex]
                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-500 hover:bg-amber-500/25"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-5 py-2 shadow-sm transition disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              
              {currentIndex < questionSet.length - 1 ? (
                <button
                  type="button"
                  onClick={() => moveQuestion(1)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAptitudeSubmit}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-500/10 transition active:scale-95 cursor-pointer border border-emerald-500"
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
