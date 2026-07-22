import React from "react";

const stripLeadingTitle = (markdownText, title) => {
  if (!markdownText) return "";
  const lines = markdownText.split("\n");
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.startsWith("#")) {
      lines.shift();
      while (lines.length > 0 && lines[0].trim() === "") {
        lines.shift();
      }
      return lines.join("\n");
    }
  }
  return markdownText;
};

export default function QuestionPanel({
  problem,
  acceptance,
  userProfile,
  toggleBookmark,
  toggleSave,
  leftActiveTab,
  setLeftActiveTab,
  renderMarkdown,
  suggestedPatterns,
  getEditorialContent,
  getSolutionContent,
  selectedLanguage,
  isFullscreen,
  setIsFullscreen,
  result,
}) {
  const [hintsExpanded, setHintsExpanded] = React.useState(false);

  const renderExampleCard = (example, index) => {
    const input = example.input || "";
    const output = example.output || "";
    const explanation = example.explanation || "";

    return (
      <div key={index} className="mb-4 text-xs font-mono select-text">
        <div className="p-4 rounded-md bg-[#0F172A] border border-[#1F2937]/40 shadow-inner">
          <div className="mb-3">
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Input</span>
            <span className="text-slate-200 block text-xs font-semibold whitespace-pre-wrap">{input}</span>
          </div>
          <div className="mb-3">
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Output</span>
            <span className="text-amber-500 font-extrabold block text-xs">{output}</span>
          </div>
          {explanation && (
            <div>
              <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Explanation</span>
              <span className="text-slate-400 block text-xs leading-normal font-medium">{explanation}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const isBookmarked = userProfile?.bookmarked?.some(b => (b._id || b) === problem._id);
  const isSaved = userProfile?.saved?.some(s => (s._id || s) === problem._id);

  return (
    <aside className="h-full flex flex-col bg-[#0B1220] text-slate-355 overflow-hidden transition-colors duration-150">
      
      {/* Title Details (LeetCode style) */}
      <div className="p-5 pb-3 bg-[#0B1220] shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 select-none min-w-0">
            {/* Title & Action Icons inline */}
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-black text-white leading-tight truncate">
                {problem.title}
              </h2>
              
              {/* Bookmark, Share, Option Icons */}
              <div className="flex items-center gap-1 shrink-0">
                {problem._id && (
                  <>
                    <button
                      onClick={() => toggleBookmark(problem._id)}
                      className={`p-1 rounded-md transition hover:bg-slate-800 cursor-pointer ${
                        isBookmarked ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                    >
                      {isBookmarked ? (
                        <svg className="w-4 h-4 fill-amber-400 stroke-amber-400" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.72c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.72c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => toggleSave(problem._id)}
                      className={`p-1 rounded-md transition hover:bg-slate-800 cursor-pointer ${
                        isSaved ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title={isSaved ? "Unsave Question" : "Save Question"}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </>
                )}
                
                <button
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition hover:bg-slate-800 cursor-pointer"
                  title="Share Question"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                <button
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition hover:bg-slate-800 cursor-pointer"
                  title="More Options"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Badges metadata row */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
              <span className={`px-2 py-0.5 rounded-md border font-black ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : problem.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {problem.difficulty}
              </span>
              <span className="text-slate-550 border border-[#1F2937] px-2 py-0.5 rounded-md bg-slate-900/40">
                {acceptance}% Acceptance
              </span>
              <span className="text-slate-500 font-semibold bg-slate-900/20 px-1">
                {suggestedPatterns[0] || "Greedy"}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg border border-[#1F2937]/50 bg-slate-900 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
            title="Collapse Panel"
          >
            <span className="text-xs font-black">&lt;</span>
          </button>
        </div>
      </div>

      {/* Tabs Selection with Active Underline */}
      <div className="flex border-b border-[#1F2937]/50 bg-[#0B1220]/20 px-4 shrink-0 gap-6">
        {[
          { id: "problem", label: "Problem" },
          { id: "discussion", label: "Discussion" },
          ...(result && result.submit ? [{ id: "accepted", label: result.passedCount === result.totalCount ? "Accepted" : "Submission" }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLeftActiveTab(tab.id)}
            className={`py-3 text-[11px] font-black uppercase tracking-wider relative transition shrink-0 cursor-pointer ${
              leftActiveTab === tab.id
                ? "text-white font-extrabold"
                : "text-slate-450 hover:text-slate-200"
            }`}
          >
            {tab.label}
            {leftActiveTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 text-[13px] md:text-sm leading-relaxed text-slate-355 bg-[#0B1220]/10">
        {leftActiveTab === "problem" && (
          <div className="space-y-6">
            
            {/* Description Section */}
            <div className="text-[13px] md:text-sm text-slate-300 leading-relaxed font-sans select-text">
              {renderMarkdown(stripLeadingTitle(problem.description || problem.statement || "", problem.title))}
            </div>

            {/* Examples Section */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Examples:</h4>
                <div className="py-1">
                  {problem.examples.map((example, index) => renderExampleCard(example, index))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Constraints:</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs font-mono text-slate-350">
                  {problem.constraints.map((item, idx) => (
                    <li key={idx} className="marker:text-indigo-550">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints Section */}
            <div className="border-t border-[#1F2937]/35 pt-4">
              <button
                type="button"
                onClick={() => setHintsExpanded(!hintsExpanded)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition cursor-pointer select-none"
              >
                <span>Hints</span>
                <span className="text-[9px] text-slate-500">{hintsExpanded ? "▼" : "►"}</span>
              </button>
              {hintsExpanded && (
                <div className="mt-3 py-2 text-[13px] md:text-sm text-slate-400 space-y-2.5 font-sans select-text border-t border-[#1F2937]/20 pt-3">
                  <p>Consider using the <strong>{suggestedPatterns[0] || "Greedy"}</strong> approach. Store intermediate states in a dictionary/object to reduce search complexity.</p>
                  {problem.hints && problem.hints.map((hint, idx) => (
                    <p key={idx} className="border-t border-[#1F2937]/30 pt-2 mt-2">• {hint}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {leftActiveTab === "discussion" && (
          <div className="space-y-4 select-text">
            <div className="p-4 rounded-md bg-indigo-500/5 border border-[#1F2937]/30 space-y-3 shadow-sm">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">AI Solution Breakdown</p>
              <div className="text-xs text-slate-300 space-y-3 prose prose-invert font-sans">
                {renderMarkdown(getEditorialContent(problem))}
              </div>
            </div>
            <div className="p-4 rounded-md bg-[#0F172A] border border-[#1F2937]/35 space-y-2 shadow-sm">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Reference Implementation ({selectedLanguage})</p>
              <pre className="text-[11px] font-mono text-slate-200 bg-slate-950/40 p-3 rounded overflow-x-auto border border-[#1F2937]/30">
                {getSolutionContent(problem, selectedLanguage)}
              </pre>
            </div>
          </div>
        )}
        {leftActiveTab === "accepted" && result && (
          <div className="space-y-6 animate-fade-in select-text">
            <div className={`p-6 rounded-md border text-center relative overflow-hidden ${
              result.passedCount === result.totalCount
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full translate-x-12 -translate-y-12" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Submission Result
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">
                {result.passedCount === result.totalCount ? "Accepted" : "Rejected"}
              </h3>
              <p className="mt-1 text-xs font-semibold opacity-90">
                Passed {result.passedCount} / {result.totalCount} test cases
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 border border-[#1F2937] rounded-md p-4 flex flex-col items-center text-center">
                <svg className="w-5 h-5 text-indigo-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Runtime</p>
                <p className="text-sm font-black text-slate-200 mt-1">{result.executionTime || "0 ms"}</p>
                <span className="text-[9px] text-emerald-450 font-bold mt-0.5">Beats 95.4%</span>
              </div>
              <div className="bg-slate-950/40 border border-[#1F2937] rounded-md p-4 flex flex-col items-center text-center">
                <svg className="w-5 h-5 text-indigo-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Memory</p>
                <p className="text-sm font-black text-slate-200 mt-1">{result.memory || "0 MB"}</p>
                <span className="text-[9px] text-emerald-450 font-bold mt-0.5">Beats 89.2%</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Submission Breakdown</h4>
              <div className="space-y-2 pr-1 max-h-60 overflow-y-auto">
                {result.results?.map((test, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border text-xs flex items-center justify-between transition ${
                      test.passed
                        ? "bg-emerald-500/5 border-emerald-500/10 text-brand-text"
                        : "bg-rose-500/5 border-rose-500/10 text-brand-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${test.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="font-bold">{test.label || `Case ${index + 1}`}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${test.passed ? "text-emerald-400" : "text-rose-400"}`}>
                      {test.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
