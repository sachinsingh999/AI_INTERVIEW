import React from "react";

export default function AptitudeConfigForm({
  handleStartSession,
  selectedTopic,
  setSelectedTopic,
  categoryTopics = {},
  selectedCategory,
  difficulty,
  setDifficulty,
  questionCount,
  setQuestionCount,
  generating,
}) {
  const topics = categoryTopics[selectedCategory] || [];

  return (
    <form onSubmit={handleStartSession} className="space-y-5">
      {/* Topic Select */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full bg-[#090E1A] text-slate-200 border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-[#090E1A] text-slate-200 border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Question Count Selector */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Number of Questions
        </label>
        <div className="flex gap-3">
          {[5, 10, 15, 20, 30].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setQuestionCount(num)}
              className={`flex-1 py-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                questionCount === num
                  ? "border-indigo-500 bg-indigo-550/15 text-white"
                  : "border-[#1E293B] bg-slate-950/20 text-slate-400 hover:bg-slate-800/40"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={generating}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 border-none outline-none"
      >
        {generating ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Generating Practice Set...</span>
          </>
        ) : (
          <>
            <span>Generate Practice Set</span>
            <span>✨</span>
          </>
        )}
      </button>
    </form>
  );
}
