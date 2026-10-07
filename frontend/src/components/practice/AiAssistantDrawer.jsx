import React from "react";

export default function AiAssistantDrawer({
  aiDrawerOpen,
  setAiDrawerOpen,
  isFullscreen,
  problem,
  detectedTopics,
  suggestedPatterns,
  result,
}) {
  if (!aiDrawerOpen || isFullscreen) return null;

  return (
    <>
      <div 
        onClick={() => setAiDrawerOpen(false)}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-88 sm:w-96 bg-brand-card text-brand-text border-l border-brand-border shadow-2xl flex flex-col transition-all duration-300 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-brand-border pb-3 bg-brand-card">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-secondary flex items-center gap-1.5">
            <span>✨ AI Assistant Drawer</span>
          </h3>
          <button 
            type="button"
            onClick={() => setAiDrawerOpen(false)}
            className="text-brand-secondary hover:text-brand-text transition p-1 hover:bg-brand-elevated rounded-xs text-xs font-bold cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* AI Mentor Coaching Box */}
        <div className="rounded-xs border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-base">✨</span>
            <p className="text-xs font-black text-amber-600 dark:text-amber-400">AI Mentor Advice</p>
          </div>
          <p className="text-xs font-medium leading-relaxed text-brand-body">
            "You're working on <b>{problem?.title || "this problem"}</b>. This pattern is widely asked in tech screenings. {detectedTopics.includes("Arrays") && "Keep space complexity at O(1) if possible by operating in-place. Let me check your code once you submit!"}"
          </p>
        </div>

        {/* Pattern Tracker */}
        <div className="rounded-xs border border-brand-border bg-brand-elevated p-3.5 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Pattern Tracker</p>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-bold text-brand-secondary block">Detected Topic:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {detectedTopics.map((topic, idx) => (
                  <span key={idx} className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-xs border border-amber-500/20">
                    ✓ {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-1">
              <span className="text-[9px] font-bold text-brand-secondary block">Suggested Approach:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestedPatterns.map((pat, idx) => (
                  <span key={idx} className="text-[9px] font-bold bg-brand-card text-brand-secondary px-2 py-0.5 rounded-xs border border-brand-border">
                    • {pat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submission Analytics */}
        {result && (
          <div className="rounded-xs border border-brand-border bg-brand-elevated p-3.5 space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Submission Analytics</p>
            <div className={`p-2.5 rounded-xs border text-center ${
              result.status === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}>
              <p className="text-xs font-black">
                {result.status === "error" ? "Execution Error" : `${result.passedCount}/${result.totalCount} Cases Passed`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono pt-0.5">
              <div className="bg-brand-card border border-brand-border rounded-xs p-2">
                <p className="text-[8px] font-bold text-brand-secondary uppercase">Runtime</p>
                <p className="text-brand-text font-black">{result.executionTime || "0.08s"}</p>
              </div>
              <div className="bg-brand-card border border-brand-border rounded-xs p-2">
                <p className="text-[8px] font-bold text-brand-secondary uppercase">Memory</p>
                <p className="text-brand-text font-black">{result.memory || "12.4 MB"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Insights */}
        <div className="rounded-xs border border-brand-border bg-brand-elevated p-3.5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Question Insights</p>
          <div className="text-[11px] text-brand-body space-y-1.5 leading-relaxed">
            <p>• <b>Most Common Approach:</b> Hash table lookup (O(N) Time, O(N) Space).</p>
            <p>• <b>Alternative Approach:</b> Sorting array and binary search (O(N log N) Time, O(1) Space).</p>
            <p>• <b>Common mistake:</b> Missing check for index duplication when numbers match.</p>
          </div>
        </div>
      </div>
    </>
  );
}
