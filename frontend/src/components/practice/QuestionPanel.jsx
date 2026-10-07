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
      <div key={index} className="mb-3 text-xs font-mono select-text">
        <div className="p-3.5 rounded-xs bg-brand-elevated border border-brand-border shadow-xs">
          <div className="mb-2.5">
            <span className="block text-[9px] font-black uppercase tracking-wider text-brand-secondary mb-1">Input</span>
            <span className="text-brand-text block text-xs font-semibold whitespace-pre-wrap">{input}</span>
          </div>
          <div className="mb-2.5">
            <span className="block text-[9px] font-black uppercase tracking-wider text-brand-secondary mb-1">Output</span>
            <span className="text-amber-500 font-extrabold block text-xs">{output}</span>
          </div>
          {explanation && (
            <div>
              <span className="block text-[9px] font-black uppercase tracking-wider text-brand-secondary mb-1">Explanation</span>
              <span className="text-brand-secondary block text-xs leading-normal font-medium">{explanation}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const isBookmarked = userProfile?.bookmarked?.some(b => (b._id || b) === problem._id);
  const isSaved = userProfile?.saved?.some(s => (s._id || s) === problem._id);

  return (
    <aside className="h-full flex flex-col bg-brand-card text-brand-text overflow-hidden transition-colors duration-150">
      
      {/* Title Details */}
      <div className="p-4 pb-3 bg-brand-card shrink-0 border-b border-brand-border/60">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 select-none min-w-0">
            {/* Title & Action Icons inline */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-brand-text leading-tight truncate">
                {problem.title}
              </h2>
              
              {/* Bookmark, Share, Option Icons */}
              <div className="flex items-center gap-1 shrink-0">
                {problem._id && (
                  <>
                    <button
                      onClick={() => toggleBookmark(problem._id)}
                      className={`p-1 rounded-xs transition hover:bg-brand-elevated cursor-pointer ${
                        isBookmarked ? "text-amber-500" : "text-brand-secondary hover:text-brand-text"
                      }`}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                    >
                      {isBookmarked ? (
                        <svg className="w-4 h-4 fill-amber-500 stroke-amber-500" viewBox="0 0 24 24">
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
                      className={`p-1 rounded-xs transition hover:bg-brand-elevated cursor-pointer ${
                        isSaved ? "text-brand-primary" : "text-brand-secondary hover:text-brand-text"
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
                  className="p-1 rounded-xs text-brand-secondary hover:text-brand-text transition hover:bg-brand-elevated cursor-pointer"
                  title="Share Question"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Badges metadata row */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
              <span className={`px-2 py-0.5 rounded-xs border font-black ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                  : problem.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/25"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
              }`}>
                {problem.difficulty}
              </span>
              <span className="text-brand-secondary border border-brand-border px-2 py-0.5 rounded-xs bg-brand-elevated">
                {acceptance}% Acceptance
              </span>
              <span className="text-brand-secondary font-semibold bg-brand-elevated px-1.5 py-0.5 rounded-xs border border-brand-border">
                {suggestedPatterns[0] || "Greedy"}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-xs border border-brand-border bg-brand-elevated text-brand-secondary hover:text-brand-text transition active:scale-95 cursor-pointer shrink-0"
            title="Collapse Panel"
          >
            <span className="text-xs font-black">&lt;</span>
          </button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-brand-border bg-brand-card px-4 shrink-0 gap-6">
        {[
          { id: "problem", label: "Problem" },
          { id: "discussion", label: "Discussion" },
          ...(result && result.submit ? [{ id: "accepted", label: result.passedCount === result.totalCount ? "Accepted" : "Submission" }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLeftActiveTab(tab.id)}
            className={`py-2.5 text-[11px] font-black uppercase tracking-wider relative transition shrink-0 cursor-pointer ${
              leftActiveTab === tab.id
                ? "text-brand-text font-black"
                : "text-brand-secondary hover:text-brand-text"
            }`}
          >
            {tab.label}
            {leftActiveTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed text-brand-text bg-brand-card">
        {leftActiveTab === "problem" && (
          <div className="space-y-5">
            
            {/* Description Section */}
            <div className="text-[13px] text-brand-text leading-relaxed font-sans select-text prose dark:prose-invert max-w-none">
              {renderMarkdown(stripLeadingTitle(problem.description || problem.statement || "", problem.title))}
            </div>

            {/* Examples Section */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase text-brand-secondary tracking-wider">Examples:</h4>
                <div className="py-0.5">
                  {problem.examples.map((example, index) => renderExampleCard(example, index))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-brand-secondary tracking-wider">Constraints:</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs font-mono text-brand-secondary">
                  {problem.constraints.map((item, idx) => (
                    <li key={idx} className="marker:text-brand-primary">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints Section */}
            <div className="border-t border-brand-border pt-3.5">
              <button
                type="button"
                onClick={() => setHintsExpanded(!hintsExpanded)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-secondary hover:text-brand-primary transition cursor-pointer select-none"
              >
                <span>Hints</span>
                <span className="text-[9px] text-brand-secondary">{hintsExpanded ? "▼" : "►"}</span>
              </button>
              {hintsExpanded && (
                <div className="mt-2.5 py-2 text-[13px] text-brand-secondary space-y-2 font-sans select-text border-t border-brand-border pt-2.5">
                  <p>Consider using the <strong>{suggestedPatterns[0] || "Greedy"}</strong> approach. Store intermediate states in a dictionary/object to reduce search complexity.</p>
                  {problem.hints && problem.hints.map((hint, idx) => (
                    <p key={idx} className="border-t border-brand-border/60 pt-1.5 mt-1.5">• {hint}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {leftActiveTab === "discussion" && (
          <div className="space-y-4 select-text">
            <div className="p-3.5 rounded-xs bg-brand-primary/5 border border-brand-border space-y-2.5 shadow-xs">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-wider">AI Solution Breakdown</p>
              <div className="text-xs text-brand-text space-y-2.5 prose dark:prose-invert font-sans max-w-none">
                {renderMarkdown(getEditorialContent(problem))}
              </div>
            </div>
            <div className="p-3.5 rounded-xs bg-brand-elevated border border-brand-border space-y-2 shadow-xs">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Reference Implementation ({selectedLanguage})</p>
              <pre className="text-[11px] font-mono text-brand-text bg-brand-card p-3 rounded-xs overflow-x-auto border border-brand-border">
                {getSolutionContent(problem, selectedLanguage)}
              </pre>
            </div>
          </div>
        )}
        {leftActiveTab === "accepted" && result && (
          <div className="space-y-5 animate-fade-in select-text">
            <div className={`p-5 rounded-xs border text-center relative overflow-hidden ${
              result.passedCount === result.totalCount
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300"
            }`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Submission Result
              </p>
              <h3 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight">
                {result.passedCount === result.totalCount ? "Accepted" : "Rejected"}
              </h3>
              <p className="mt-1 text-xs font-semibold opacity-90">
                Passed {result.passedCount} / {result.totalCount} test cases
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-elevated border border-brand-border rounded-xs p-3 flex flex-col items-center text-center">
                <svg className="w-4 h-4 text-brand-primary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[9px] font-black uppercase tracking-wider text-brand-secondary">Runtime</p>
                <p className="text-xs sm:text-sm font-black text-brand-text mt-0.5">{result.executionTime || "0 ms"}</p>
                <span className="text-[9px] text-emerald-500 font-bold mt-0.5">Beats 95.4%</span>
              </div>
              <div className="bg-brand-elevated border border-brand-border rounded-xs p-3 flex flex-col items-center text-center">
                <svg className="w-4 h-4 text-brand-primary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-[9px] font-black uppercase tracking-wider text-brand-secondary">Memory</p>
                <p className="text-xs sm:text-sm font-black text-brand-text mt-0.5">{result.memory || "0 MB"}</p>
                <span className="text-[9px] text-emerald-500 font-bold mt-0.5">Beats 89.2%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Submission Breakdown</h4>
              <div className="space-y-1.5 pr-1 max-h-60 overflow-y-auto">
                {result.results?.map((test, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-xs border text-xs flex items-center justify-between transition ${
                      test.passed
                        ? "bg-emerald-500/5 border-emerald-500/20 text-brand-text"
                        : "bg-rose-500/5 border-rose-500/20 text-brand-text"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${test.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="font-bold">{test.label || `Case ${index + 1}`}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${test.passed ? "text-emerald-500" : "text-rose-500"}`}>
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
