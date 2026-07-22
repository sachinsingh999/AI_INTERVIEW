import React from "react";

export default function CategorySelector({
  categoryTopics = {},
  selectedCategory,
  handleCategoryChange,
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Category
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Object.keys(categoryTopics).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                : "border-[#1E293B] bg-slate-950/20 text-slate-400 hover:border-slate-800 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
