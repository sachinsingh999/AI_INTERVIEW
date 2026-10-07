import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Layers,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Hash
} from "lucide-react";

export const DSA_CATEGORIES = [
  {
    name: "Data Structures",
    description: "Arrays, lists, hash maps, trees, and custom data representations",
    topics: [
      "Arrays",
      "Strings",
      "Hash Table",
      "Linked List",
      "Stack",
      "Queue",
      "Matrix",
      "Heap",
      "Trees",
      "Binary Tree",
      "Binary Search Tree",
      "Trie",
      "Graph"
    ]
  },
  {
    name: "Algorithmic Techniques",
    description: "Core problem-solving patterns, windowing, and search paradigms",
    topics: [
      "Two Pointers",
      "Sliding Window",
      "Binary Search",
      "Prefix Sum",
      "Sorting",
      "Recursion",
      "Divide and Conquer",
      "Backtracking",
      "Greedy",
      "Dynamic Programming",
      "Memoization"
    ]
  },
  {
    name: "Graph & Tree Traversal",
    description: "Hierarchical searches, networks, connectivity, and shortest paths",
    topics: [
      "Depth-First Search",
      "Breadth-First Search",
      "Topological Sort",
      "Union Find",
      "Shortest Path",
      "Minimum Spanning Tree",
      "Segment Tree"
    ]
  },
  {
    name: "Advanced & Mathematical",
    description: "Bitwise logic, number theory, geometry, and system design",
    topics: [
      "Bit Manipulation",
      "Math",
      "Geometry",
      "Number Theory",
      "Game Theory",
      "Monotonic Stack",
      "Design",
      "Interactive",
      "Simulation"
    ]
  }
];

export default function TopicsModal({
  isOpen,
  onClose,
  selectedTag = "All",
  onSelectTag,
  questions = [],
  availableTags = []
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");

  // Calculate question count per tag
  const tagCounts = useMemo(() => {
    const counts = {};
    questions.forEach((q) => {
      (q.tags || []).forEach((t) => {
        const normalized = t.trim();
        counts[normalized] = (counts[normalized] || 0) + 1;
        // Case-insensitive lookup helper
        counts[normalized.toLowerCase()] = (counts[normalized.toLowerCase()] || 0) + 1;
      });
    });
    return counts;
  }, [questions]);

  // Find any uncategorized custom tags present in the question library
  const uncategorizedTags = useMemo(() => {
    const predefinedSet = new Set(
      DSA_CATEGORIES.flatMap((c) => c.topics.map((t) => t.toLowerCase()))
    );
    const extra = [];
    availableTags.forEach((tag) => {
      if (!predefinedSet.has(tag.toLowerCase()) && tag.toLowerCase() !== "all") {
        extra.push(tag);
      }
    });
    return extra;
  }, [availableTags]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (topic) => {
    onSelectTag(topic);
    onClose();
  };

  const query = searchQuery.trim().toLowerCase();

  // Filter categories and topics based on search & active tab
  const filteredCategories = DSA_CATEGORIES.map((cat) => {
    if (activeCategoryTab !== "All" && activeCategoryTab !== cat.name) {
      return null;
    }
    const matchingTopics = cat.topics.filter((topic) => {
      if (!query) return true;
      return (
        topic.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
      );
    });
    return { ...cat, topics: matchingTopics };
  }).filter((cat) => cat !== null && cat.topics.length > 0);

  // Filter custom tags
  const matchingCustomTags = uncategorizedTags.filter((tag) => {
    if (activeCategoryTab !== "All" && activeCategoryTab !== "Other") return false;
    if (!query) return true;
    return tag.toLowerCase().includes(query);
  });

  const totalTopicsCount =
    DSA_CATEGORIES.reduce((acc, c) => acc + c.topics.length, 0) + uncategorizedTags.length;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-brand-card border border-brand-border rounded-xs shadow-2xl flex flex-col z-10 overflow-hidden text-brand-text">
        
        {/* Header */}
        <div className="px-3.5 py-2.5 bg-brand-elevated/80 border-b border-brand-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xs bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] shadow-xs shrink-0">
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-brand-text tracking-tight flex items-center gap-2">
                <span>All Topics & Categories</span>
                <span className="text-[11px] font-mono font-bold text-brand-secondary bg-brand-card px-1.5 py-0.2 rounded-xs border border-brand-border">
                  {totalTopicsCount} Topics
                </span>
              </h2>
              <p className="text-[11px] text-brand-secondary hidden sm:block font-medium">
                Select any DSA topic or algorithmic category to filter practice problems.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xs text-brand-secondary hover:text-brand-text hover:bg-brand-card border border-transparent hover:border-brand-border transition-all cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-2.5 bg-brand-card border-b border-brand-border space-y-2 shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-brand-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Filter topics (e.g. Dynamic Programming, Tree, Binary Search, Stack)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-brand-elevated border border-brand-border rounded-xs text-xs font-semibold text-brand-text placeholder:text-brand-secondary/60 outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveCategoryTab("All")}
              className={`px-2 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryTab === "All"
                  ? "bg-brand-text text-brand-bg font-black shadow-xs"
                  : "bg-brand-elevated text-brand-secondary hover:text-brand-text border border-brand-border"
              }`}
            >
              All Categories
            </button>
            {DSA_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategoryTab(cat.name)}
                className={`px-2 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryTab === cat.name
                    ? "bg-brand-text text-brand-bg font-black shadow-xs"
                    : "bg-brand-elevated text-brand-secondary hover:text-brand-text border border-brand-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {uncategorizedTags.length > 0 && (
              <button
                onClick={() => setActiveCategoryTab("Other")}
                className={`px-2 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryTab === "Other"
                    ? "bg-brand-text text-brand-bg font-black shadow-xs"
                    : "bg-brand-elevated text-brand-secondary hover:text-brand-text border border-brand-border"
                }`}
              >
                Other ({uncategorizedTags.length})
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Topic Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[60vh]">
          
          {/* Quick "Show All" Card */}
          <div className="flex items-center justify-between p-2 rounded-xs bg-brand-elevated/50 border border-brand-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-brand-text">View All Topics & Problems</span>
                <span className="text-[10px] text-brand-secondary block">Clear topic filter and display all practice questions</span>
              </div>
            </div>
            <button
              onClick={() => handleSelect("All")}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                selectedTag === "All"
                  ? "bg-amber-500 text-slate-900 font-black"
                  : "bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text border border-brand-border"
              }`}
            >
              {selectedTag === "All" ? "✓ Currently Active" : "Select All"}
            </button>
          </div>

          {/* Categorized Groups */}
          {filteredCategories.map((category) => (
            <div key={category.name} className="space-y-1.5">
              <div className="flex items-baseline justify-between border-b border-brand-border/60 pb-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">
                    {category.name}
                  </h3>
                  <span className="text-[10px] font-mono text-brand-secondary">
                    ({category.topics.length})
                  </span>
                </div>
                <span className="text-[10px] text-brand-secondary hidden sm:inline">
                  {category.description}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 pt-0.5">
                {category.topics.map((topic) => {
                  const isSelected = selectedTag.toLowerCase() === topic.toLowerCase();
                  const count =
                    tagCounts[topic] || tagCounts[topic.toLowerCase()] || 0;

                  return (
                    <button
                      key={topic}
                      onClick={() => handleSelect(topic)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xs border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-black shadow-xs ring-1 ring-amber-500/30"
                          : "bg-brand-elevated hover:bg-brand-elevated/80 border-brand-border text-brand-text hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        {isSelected ? (
                          <Check className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : (
                          <Hash className="w-2.5 h-2.5 text-brand-secondary/60 group-hover:text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold truncate">
                          {topic}
                        </span>
                      </div>
                      {count > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded-xs shrink-0 ${
                            isSelected
                              ? "bg-amber-500 text-slate-900"
                              : "bg-brand-card text-brand-secondary border border-brand-border"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Uncategorized Custom Tags if any */}
          {matchingCustomTags.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between border-b border-brand-border/60 pb-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">
                    Additional Tags
                  </h3>
                  <span className="text-[10px] font-mono text-brand-secondary">
                    ({matchingCustomTags.length})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 pt-0.5">
                {matchingCustomTags.map((tag) => {
                  const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                  const count = tagCounts[tag] || tagCounts[tag.toLowerCase()] || 0;

                  return (
                    <button
                      key={tag}
                      onClick={() => handleSelect(tag)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xs border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-black shadow-xs ring-1 ring-amber-500/30"
                          : "bg-brand-elevated hover:bg-brand-elevated/80 border-brand-border text-brand-text hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        {isSelected ? (
                          <Check className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : (
                          <Hash className="w-2.5 h-2.5 text-brand-secondary/60 group-hover:text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold truncate">
                          {tag}
                        </span>
                      </div>
                      {count > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded-xs shrink-0 ${
                            isSelected
                              ? "bg-amber-500 text-slate-900"
                              : "bg-brand-card text-brand-secondary border border-brand-border"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results state */}
          {filteredCategories.length === 0 && matchingCustomTags.length === 0 && (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-bold text-brand-secondary">
                No topics found matching "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-xs font-bold border border-brand-border cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Search</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 bg-brand-elevated/80 border-t border-brand-border flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-brand-secondary">
            {selectedTag !== "All" ? (
              <span>
                Active topic filter: <strong className="text-amber-500">{selectedTag}</strong>
              </span>
            ) : (
              <span>Showing all problem topics</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedTag !== "All" && (
              <button
                onClick={() => handleSelect("All")}
                className="px-2.5 py-1 rounded-xs bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text text-xs font-bold border border-brand-border cursor-pointer"
              >
                Reset to All
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xs bg-brand-text text-brand-bg font-black text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
