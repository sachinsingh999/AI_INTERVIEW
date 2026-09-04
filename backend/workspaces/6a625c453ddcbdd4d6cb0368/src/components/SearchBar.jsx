import React from 'react';

export default function SearchBar({ query, setQuery, category, setCategory }) {
  const categories = ['All', 'Electronics', 'Audio', 'Accessories'];

  return (
    <div className="flex flex-col sm:flex-row gap-4 search-bar">
      <input
        type="text"
        placeholder="Search products by title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${ 
              category === cat 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}