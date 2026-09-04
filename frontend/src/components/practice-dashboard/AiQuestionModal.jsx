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
        className="absolute inset-0 bg-black/60"
        onClick={() => !generating && setShowAiModal(false)}
      />
      
      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-lg p-5 md:p-6 shadow-2xl space-y-5 transition-transform duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.096 15 8.1 14.187 9 9l.813 5.187 5.096.817-5.096.9zM19.045 7.045L18.5 10.5l-.545-3.455L14.5 6.5l3.455-.545L18.5 2.5l.545 3.455 3.455.545-3.455.545z" />
            </svg>
            <span>AI Challenge Generator</span>
          </h3>
          <button 
            onClick={() => setShowAiModal(false)}
            disabled={generating}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Topic</label>
              <select
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
              >
                {["Arrays", "Strings", "Linked List", "Stack", "Queue", "Trees", "Graphs", "Dynamic Programming", "Greedy", "Backtracking"].map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Developer Role</label>
              <select
                value={aiRole}
                onChange={(e) => setAiRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
              >
                {["Frontend Developer", "Backend Developer", "Fullstack Developer", "Mobile Developer", "Data Engineer", "DevOps Engineer", "QA Engineer"].map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Company Focus</label>
              <select
                value={aiCompany}
                onChange={(e) => setAiCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
              >
                {["Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft"].map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 rounded-md border border-red-500/20 bg-red-500/5 text-[11px] text-red-400 space-y-0.5">
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
              className="flex-1 py-2 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="flex-1 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none outline-none"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Compiling...</span>
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
