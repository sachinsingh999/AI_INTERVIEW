import React from "react";

export default function AiQuestionModal({
  showAiModal,
  setShowAiModal,
  generating,
  handleGenerate,
  aiTopic,
  setAiTopic,
  aiDifficulty,
  setAiDifficulty,
  aiRole,
  setAiRole,
  aiCompany,
  setAiCompany,
  validationErrors = [],
}) {
  if (!showAiModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !generating && setShowAiModal(false)}
      />
      
      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-xl p-5 md:p-6 shadow-2xl space-y-5 transition-transform duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>✨</span> AI Challenge Generator
          </h3>
          <button 
            onClick={() => setShowAiModal(false)}
            disabled={generating}
            className="text-brand-secondary hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">Topic</label>
              <select
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-brand-primary"
              >
                {["Arrays", "Strings", "Linked List", "Stack", "Queue", "Trees", "Graphs", "Dynamic Programming", "Greedy", "Backtracking"].map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-brand-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">Developer Role</label>
              <select
                value={aiRole}
                onChange={(e) => setAiRole(e.target.value)}
                className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-brand-primary"
              >
                {["Frontend Developer", "Backend Developer", "Fullstack Developer", "Mobile Developer", "Data Engineer", "DevOps Engineer", "QA Engineer"].map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">Company Focus</label>
              <select
                value={aiCompany}
                onChange={(e) => setAiCompany(e.target.value)}
                className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-brand-primary"
              >
                {["Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft"].map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-[11px] text-red-400 space-y-0.5">
              <p className="font-bold">Validation Failed:</p>
              <ul className="list-disc pl-3">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="font-medium">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={generating}
              onClick={() => setShowAiModal(false)}
              className="flex-1 py-2 rounded-lg bg-brand-bg hover:bg-brand-zebra/20 border border-brand-border text-brand-secondary hover:text-brand-text text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="flex-1 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md border-none outline-none"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Compiling...
                </>
              ) : (
                <>Generate Challenge</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
