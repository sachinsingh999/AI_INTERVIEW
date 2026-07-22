import React from "react";
import { toast } from "../../utils/toast";

export default function AiAnalysisModal({
  showAnalysisModal,
  setShowAnalysisModal,
  selectedSessionForModal,
  setSelectedCategory,
  setSelectedTopic,
  setDifficulty,
  setQuestionCount,
  categoryTopics = {},
}) {
  if (!showAnalysisModal || !selectedSessionForModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowAnalysisModal(false)}
      />

      <div className="relative w-full max-w-2xl bg-[#0B1220] border border-[#1E293B] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div>
            <h3 className="text-base font-black text-white">
              ✨ AI Performance Report
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {selectedSessionForModal.topic} • {selectedSessionForModal.difficulty} Set
            </p>
          </div>
          <button
            onClick={() => setShowAnalysisModal(false)}
            className="text-slate-400 hover:text-white transition cursor-pointer bg-transparent border-none outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Score summary panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-slate-950/20 p-4 border border-[#1E293B] rounded-xl">
            <div>
              <span className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider">Total Count</span>
              <span className="block text-xl font-extrabold text-white mt-1">{selectedSessionForModal.questionCount}</span>
            </div>
            <div>
              <span className="block text-slate-455 text-[10px] font-bold uppercase tracking-wider">Correct</span>
              <span className="block text-xl font-extrabold text-emerald-400 mt-1">
                {selectedSessionForModal.analysis?.correct ?? 
                 Math.round((selectedSessionForModal.analysis?.accuracy / 100) * selectedSessionForModal.questionCount) ?? 0}
              </span>
            </div>
            <div>
              <span className="block text-slate-455 text-[10px] font-bold uppercase tracking-wider">Accuracy</span>
              <span className="block text-xl font-extrabold text-indigo-400 mt-1">
                {selectedSessionForModal.analysis?.accuracy ?? 50}%
              </span>
            </div>
            <div>
              <span className="block text-slate-455 text-[10px] font-bold uppercase tracking-wider">Avg Time</span>
              <span className="block text-xl font-extrabold text-amber-500 mt-1">
                {selectedSessionForModal.analysis?.avgTimePerQuestion ?? 0}s/q
              </span>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-emerald-950/5 border border-emerald-500/10 rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>✓</span> Strengths
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                {selectedSessionForModal.analysis?.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 select-none">•</span>
                    <span>{s}</span>
                  </li>
                )) || <li className="italic text-slate-500">No strengths recorded.</li>}
              </ul>
            </div>

            <div className="bg-rose-950/5 border border-rose-500/10 rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-450 flex items-center gap-1.5">
                <span>⚠️</span> Weak Areas
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                {selectedSessionForModal.analysis?.weakAreas?.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 select-none">•</span>
                    <span>{w}</span>
                  </li>
                )) || <li className="italic text-slate-500">No weaknesses recorded.</li>}
              </ul>
            </div>
          </div>

          {/* Personalized Feedback */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">
              AI Feedback
            </h4>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
              {selectedSessionForModal.analysis?.feedback || "Review your responses to understand formula applications."}
            </p>
          </div>

          {/* Recommendations */}
          {selectedSessionForModal.recommendations && (
            <div className="border-t border-[#1E293B] pt-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                AI Recommendations for Next Steps
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Next Topics</span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {selectedSessionForModal.recommendations.nextTopics?.map((t, idx) => (
                      <span key={idx} className="bg-slate-900 border border-[#1E293B] text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-slate-950/40 p-2.5 border border-[#1E293B]/40 rounded-lg">
                    <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider">Next Difficulty</span>
                    <span className="text-xs font-extrabold text-indigo-400">{selectedSessionForModal.recommendations.recommendedDifficulty}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 p-2.5 border border-[#1E293B]/40 rounded-lg">
                    <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider">Practice Count</span>
                    <span className="text-xs font-extrabold text-indigo-400">{selectedSessionForModal.recommendations.suggestedPracticeCount} questions</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    const rec = selectedSessionForModal.recommendations;
                    setSelectedCategory("Quantitative Aptitude");
                    let matchedCat = "Quantitative Aptitude";
                    for (const cat of Object.keys(categoryTopics)) {
                      if (categoryTopics[cat].includes(rec.nextTopics[0])) {
                        matchedCat = cat;
                        break;
                      }
                    }
                    setSelectedCategory(matchedCat);
                    setSelectedTopic(rec.nextTopics[0]);
                    setDifficulty(rec.recommendedDifficulty || "Medium");
                    setQuestionCount(rec.suggestedPracticeCount || 20);
                    setShowAnalysisModal(false);
                    toast.success(`Loaded settings for recommended set: ${rec.nextTopics[0]}!`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer text-center border-none outline-none"
                >
                  Load Recommended Practice Config
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
