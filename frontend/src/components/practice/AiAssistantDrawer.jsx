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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-96 bg-[#101428] border-l border-brand-border shadow-2xl flex flex-col transition-all duration-300 p-5 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-brand-border bg-[#0c1024]/60 -mx-5 px-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
            <span>✨ AI Assistant Drawer</span>
          </h3>
          <button 
            type="button"
            onClick={() => setAiDrawerOpen(false)}
            className="text-brand-secondary hover:text-white transition p-1.5 hover:bg-brand-card/5 rounded-lg text-sm"
          >
            ✕ Close
          </button>
        </div>

        {/* AI Mentor Coaching Box */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <p className="text-xs font-black text-indigo-400">AI Mentor Advice</p>
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-[#9CA3AF]">
            "You're working on <b>{problem.title}</b>. This pattern is widely asked in tech screenings. {detectedTopics.includes("Arrays") && "Keep space complexity at O(1) if possible by operating in-place. Let me check your code once you submit!"}"
          </p>
        </div>

        {/* Pattern Tracker */}
        <div className="rounded-2xl border border-brand-border bg-[#0b0e20]/60 p-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Pattern Tracker</p>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-bold text-brand-secondary block">Detected Topic:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {detectedTopics.map((topic, idx) => (
                  <span key={idx} className="text-[9px] font-bold bg-[#6366F1]/10 text-indigo-400 px-2 py-0.5 rounded border border-[#6366F1]/20">
                    ✓ {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-1">
              <span className="text-[9px] font-bold text-brand-secondary block">Suggested Approach:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestedPatterns.map((pat, idx) => (
                  <span key={idx} className="text-[9px] font-bold bg-[#0B1020] text-brand-secondary px-2 py-0.5 rounded border border-brand-border/5">
                    • {pat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submission Analytics */}
        {result && (
          <div className="rounded-2xl border border-brand-border bg-[#0b0e20]/60 p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Submission Analytics</p>
            <div className={`p-3 rounded-xl border text-center ${
              result.status === "error" ? "bg-rose-950/20 border-rose-500/20 text-rose-400" : "bg-emerald-950/20 border-emerald-500/20 text-emerald-450"
            }`}>
              <p className="text-sm font-black mt-0.5">
                {result.status === "error" ? "Execution Error" : `${result.passedCount}/${result.totalCount} Cases Passed`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono pt-1">
              <div className="bg-[#0b0e20] border border-brand-border/5 rounded-lg p-2">
                <p className="text-[8px] font-bold text-brand-secondary uppercase">Runtime</p>
                <p className="text-white font-black">{result.executionTime || "0.08s"}</p>
              </div>
              <div className="bg-[#0b0e20] border border-brand-border/5 rounded-lg p-2">
                <p className="text-[8px] font-bold text-brand-secondary uppercase">Memory</p>
                <p className="text-white font-black">{result.memory || "12.4 MB"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Insights */}
        <div className="rounded-2xl border border-brand-border bg-[#0b0e20]/60 p-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Question Insights</p>
          <div className="text-[10px] text-[#9CA3AF] space-y-2 leading-relaxed">
            <p>• <b>Most Common Approach:</b> Hash table lookup (O(N) Time, O(N) Space).</p>
            <p>• <b>Alternative Approach:</b> Sorting array and binary search (O(N log N) Time, O(1) Space).</p>
            <p>• <b>Common mistake:</b> Missing check for index duplication when numbers match.</p>
          </div>
        </div>
      </div>
    </>
  );
}
