import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  FileText,
  BarChart3,
  Clock,
  PhoneOff,
  Copy,
  Check,
  Sun,
  Maximize2,
  Settings,
  Columns2,
  Play,
  RotateCcw,
  Send,
  MoreVertical,
  Sparkles,
  ArrowRight,
  Plus,
  MessageSquare,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

const QUESTIONS = {
  1: {
    id: 1,
    title: "Two Sum",
    category: "Two Sum",
    difficulty: "Easy",
    description: (
      <>
        Given an array of integers <code className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs">nums</code> and an integer <code className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs">target</code>, return indices of the two numbers such that they add up to <code className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs">target</code>.
      </>
    ),
    note: "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        id: 1,
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] = 9, we return [0, 1]."
      },
      {
        id: 2,
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]"
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ],
    testCase: {
      input: "nums = [2,7,11,15]\ntarget = 9",
      expected: "[0,1]"
    },
    codeTemplates: {
      "C++": `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here

    }
};`,
      Python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass`,
      JavaScript: `class Solution {
    twoSum(nums, target) {
        // Write your code here

    }
};`,
      Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here

        return new int[]{};
    }
};`
    }
  },
  2: {
    id: 2,
    title: "Binary Tree",
    category: "Binary Tree",
    difficulty: "Medium",
    description: (
      <>
        Given the <code className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs">root</code> of a binary tree, invert the tree, and return its root.
      </>
    ),
    note: "Each node contains a unique integer value.",
    examples: [
      {
        id: 1,
        input: "root = [4,2,7,1,3,6,9]",
        output: "[4,7,2,9,6,3,1]",
        explanation: "The binary tree is mirrored horizontally."
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 ≤ Node.val ≤ 100"
    ],
    testCase: {
      input: "root = [4,2,7,1,3,6,9]",
      expected: "[4,7,2,9,6,3,1]"
    },
    codeTemplates: {
      "C++": `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        // Write your code here

    }
};`,
      Python: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        # Write your code here
        pass`,
      JavaScript: `class Solution {
    invertTree(root) {
        // Write your code here

    }
};`,
      Java: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Write your code here

        return root;
    }
};`
    }
  },
  3: {
    id: 3,
    title: "System Design",
    category: "System Design",
    difficulty: "Hard",
    description: (
      <>
        Design a data structure that follows the constraints of a <code className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs">Least Recently Used (LRU)</code> cache with <code className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs">O(1)</code> average time complexity.
      </>
    ),
    note: "Both get and put operations must run in O(1) average time complexity.",
    examples: [
      {
        id: 1,
        input: '["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]',
        output: "[null, null, null, 1, null, -1]"
      }
    ],
    constraints: [
      "1 ≤ capacity ≤ 3000",
      "0 ≤ key ≤ 10⁴",
      "0 ≤ value ≤ 10⁵",
      "At most 2 * 10⁵ calls will be made to get and put."
    ],
    testCase: {
      input: '["LRUCache", "put", "put", "get"]\n[[2], [1, 1], [2, 2], [1]]',
      expected: "[null, null, null, 1]"
    },
    codeTemplates: {
      "C++": `class LRUCache {
public:
    LRUCache(int capacity) {
        // Write your code here

    }
};`,
      Python: `class LRUCache:
    def __init__(self, capacity: int):
        # Write your code here
        pass`,
      JavaScript: `class LRUCache {
    constructor(capacity) {
        // Write your code here

    }
};`,
      Java: `class LRUCache {
    public LRUCache(int capacity) {
        // Write your code here

    }
};`
    }
  }
};

export default function IntervexaCodingPreview() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState("C++");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [activeTab, setActiveTab] = useState("problem"); // problem, submissions, discussion
  const [activeBottomTab, setActiveBottomTab] = useState("testcases"); // testcases, console, result
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedExample, setCopiedExample] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(43 * 60 + 28);

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 45 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currentQ = QUESTIONS[activeQuestion] || QUESTIONS[1];
  const currentCode = currentQ.codeTemplates[selectedLang] || currentQ.codeTemplates["C++"];

  const handleRunCode = () => {
    setIsRunning(true);
    setTestResult(null);
    setActiveBottomTab("testcases");
    setTimeout(() => {
      setIsRunning(false);
      setTestResult("Accepted • All test cases passed (Runtime: 3ms, Beats 94.2%)");
    }, 650);
  };

  const handleCopyExample = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(id);
    setTimeout(() => setCopiedExample(null), 1500);
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 relative z-10 text-center font-sans">
      {/* 3 Top Feature Pills with subtle entrance */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 select-none"
      >
        <motion.div
          whileHover={{ y: -2 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121626] border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs transition-shadow"
        >
          <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold">
            &lt;/&gt;
          </span>
          <span className="text-emerald-500 font-bold">✓</span>
          <span>Multi-Language Support (C++, Python, JS, Java)</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121626] border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs transition-shadow"
        >
          <span className="p-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <FileText className="w-3.5 h-3.5" />
          </span>
          <span className="text-emerald-500 font-bold">✓</span>
          <span>Real Test Cases & Constraints</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121626] border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs transition-shadow"
        >
          <span className="p-1 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </span>
          <span className="text-emerald-500 font-bold">✓</span>
          <span>Instant Feedback & Scoring</span>
        </motion.div>
      </motion.div>

      {/* Main Coding Workspace Window */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1440px] mx-auto rounded-sm bg-white dark:bg-[#0E1322] shadow-xl overflow-hidden text-left"
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0E1322] px-6 py-3.5 gap-4 select-none">
          {/* Left: Code Icon + Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="font-mono font-bold text-sm">&lt;/&gt;</span>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Technical Round – Coding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solve coding problems with real-time compiler and AI evaluation.
              </p>
            </div>
          </div>

          {/* Center: Question progress */}
          <div className="hidden md:flex flex-col items-start gap-1 w-44">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Question {activeQuestion} of 3
            </span>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                animate={{ width: `${(activeQuestion / 3) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Right: Time remaining + End Interview button */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-left">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <div>
                <div className="text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-white leading-none">
                  {formatTimer(secondsLeft)}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Time Remaining
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/create-interview")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Interview</span>
            </motion.button>
          </div>
        </div>

        {/* 3-Column Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800/80 min-h-[580px]">
          
          {/* Left Column: Questions Navigator (3 cols) with reduced gaps */}
          <div className="lg:col-span-3 p-4 bg-white dark:bg-[#0E1322] space-y-2">
            <div className="flex items-center justify-between pb-1 select-none">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Questions
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                3 Questions
              </span>
            </div>

            {/* Question 1: Two Sum */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setActiveQuestion(1);
                setTestResult(null);
              }}
              className={`w-full text-left p-3 rounded-sm transition-all cursor-pointer flex items-center justify-between ${
                activeQuestion === 1
                  ? "bg-[#EEF2FF] dark:bg-indigo-950/60 shadow-xs"
                  : "bg-slate-50/80 dark:bg-[#121626] hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    activeQuestion === 1
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  1
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Two Sum
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                Easy
              </span>
            </motion.button>

            {/* Question 2: Binary Tree */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setActiveQuestion(2);
                setTestResult(null);
              }}
              className={`w-full text-left p-3 rounded-sm transition-all cursor-pointer flex items-center justify-between ${
                activeQuestion === 2
                  ? "bg-[#EEF2FF] dark:bg-indigo-950/60 shadow-xs"
                  : "bg-slate-50/80 dark:bg-[#121626] hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    activeQuestion === 2
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  2
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Binary Tree
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                Medium
              </span>
            </motion.button>

            {/* Question 3: System Design */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setActiveQuestion(3);
                setTestResult(null);
              }}
              className={`w-full text-left p-3 rounded-sm transition-all cursor-pointer flex items-center justify-between ${
                activeQuestion === 3
                  ? "bg-[#EEF2FF] dark:bg-indigo-950/60 shadow-xs"
                  : "bg-slate-50/80 dark:bg-[#121626] hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    activeQuestion === 3
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  3
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  System Design
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-rose-50 dark:bg-rose-500/15 text-rose-500 dark:text-rose-400 text-xs font-semibold">
                Hard
              </span>
            </motion.button>
          </div>

          {/* Middle Column: Problem Details & Constraints (4.5 cols) */}
          <div className="lg:col-span-4 p-5 sm:p-6 bg-white dark:bg-[#0E1322] flex flex-col justify-between overflow-y-auto space-y-4">
            <div>
              {/* Problem Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4 select-none text-xs sm:text-sm">
                <button
                  onClick={() => setActiveTab("problem")}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer relative pb-1 ${
                    activeTab === "problem"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                  <span>Problem</span>
                  {activeTab === "problem" && (
                    <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("submissions")}
                  className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer relative pb-1 ${
                    activeTab === "submissions"
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Submissions</span>
                  {activeTab === "submissions" && (
                    <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer relative pb-1 ${
                    activeTab === "discussion"
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion</span>
                  {activeTab === "discussion" && (
                    <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
              </div>

              {/* Title & Difficulty Badge */}
              <div className="flex items-center gap-3 mb-2.5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {currentQ.id}. {currentQ.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-xs bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Description Body */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                {currentQ.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {currentQ.note}
              </p>

              {/* Example Boxes with reduced gap and no boundary line */}
              <div className="space-y-2">
                {currentQ.examples.map((ex) => (
                  <div
                    key={ex.id}
                    className="rounded-sm bg-[#F8FAFC] dark:bg-[#0B101D] p-3 font-mono text-xs space-y-1 relative group shadow-2xs"
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Example {ex.id}</span>
                      </div>
                      <button
                        onClick={() => handleCopyExample(`Input: ${ex.input}\nOutput: ${ex.output}`, ex.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy example"
                      >
                        {copiedExample === ex.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">Input: </span>
                      <span className="text-slate-600 dark:text-slate-400">{ex.input}</span>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">Output: </span>
                      <span className="text-slate-600 dark:text-slate-400">{ex.output}</span>
                    </div>

                    {ex.explanation && (
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] pt-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Constraints Section */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Settings className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Constraints</span>
                </div>
                <ul className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {currentQ.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & Test Cases (4.5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-[#0E1322] border-t lg:border-t-0 divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Upper Editor Zone */}
            <div className="p-4 sm:p-5 bg-[#0F172A] text-slate-200 font-mono text-xs sm:text-sm">
              {/* Language Toolbar & Top Action Icons */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 select-none">
                <div className="relative">
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      C+
                    </span>
                    <span>{selectedLang}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {langDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-32 rounded-sm bg-slate-800 shadow-xl py-1 z-30">
                      {["C++", "Python", "JavaScript", "Java"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSelectedLang(lang);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors cursor-pointer ${
                            selectedLang === lang
                              ? "bg-indigo-600 text-white font-bold"
                              : "text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right utility icons */}
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Toggle theme">
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Layout split">
                    <Columns2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => navigate("/create-interview")} className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Fullscreen">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Editor settings">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code lines */}
              <motion.div
                key={`${selectedLang}-${activeQuestion}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-1 py-1 leading-relaxed overflow-x-auto min-h-[160px]"
              >
                {currentCode.split("\n").map((line, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="w-6 text-slate-500 select-none text-right pr-3 shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-words flex-1">
                      {line.includes("//") || line.includes("#") ? (
                        <span className="text-slate-500 italic">{line}</span>
                      ) : line.trim() === "class Solution {" || line.trim().startsWith("class ") ? (
                        <>
                          <span className="text-[#E879F9] font-medium">class </span>
                          <span className="text-white font-medium">{line.replace("class ", "")}</span>
                        </>
                      ) : line.trim() === "public:" ? (
                        <span className="text-[#E879F9] font-medium">public:</span>
                      ) : line.includes("twoSum") ? (
                        <>
                          <span className="text-[#38BDF8]">vector&lt;int&gt; </span>
                          <span className="text-[#60A5FA]">twoSum</span>
                          <span className="text-slate-300">(</span>
                          <span className="text-[#38BDF8]">vector&lt;int&gt;&amp; </span>
                          <span className="text-slate-200">nums, </span>
                          <span className="text-[#38BDF8]">int </span>
                          <span className="text-slate-200">target</span>
                          <span className="text-slate-300">) &#123;</span>
                        </>
                      ) : (
                        <span className="text-slate-200">{line}</span>
                      )}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Lower Test Cases & Controls Zone */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1322] space-y-4">
              {/* Test Cases Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 select-none text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveBottomTab("testcases")}
                    className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer relative pb-1 ${
                      activeBottomTab === "testcases"
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Test Cases</span>
                    {activeBottomTab === "testcases" && (
                      <motion.span
                        layoutId="activeBottomTab"
                        className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveBottomTab("console")}
                    className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer relative pb-1 ${
                      activeBottomTab === "console"
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Console</span>
                    {activeBottomTab === "console" && (
                      <motion.span
                        layoutId="activeBottomTab"
                        className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveBottomTab("result")}
                    className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer relative pb-1 ${
                      activeBottomTab === "result"
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Result</span>
                    {activeBottomTab === "result" && (
                      <motion.span
                        layoutId="activeBottomTab"
                        className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => alert("Custom test case editor will open")}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Test Case</span>
                </button>
              </div>

              {/* Test Case 1 Card with no boundary line */}
              <div className="rounded-sm bg-[#F8FAFC] dark:bg-[#0B101D] p-3.5 font-mono text-xs shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 fill-emerald-600" />
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Test Case 1
                    </span>
                    <span className="px-2 py-0.2 rounded-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                      Default
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                      {currentQ.testCase.input}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-sans mb-0.5">Expected Output</div>
                    <div className="text-slate-800 dark:text-slate-200 font-bold">
                      {currentQ.testCase.expected}
                    </div>
                  </div>
                </div>
              </div>

              {/* Run Test Result Alert */}
              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="py-2 px-3 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-mono shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{testResult}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons with sharp flat corners and no boundary border line */}
              <div className="flex items-center justify-end gap-2.5 pt-1.5 select-none">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTestResult(null)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Code</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-300 ${isRunning ? "animate-spin" : ""}`} />
                  <span>{isRunning ? "Running..." : "Run Code"}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/create-interview")}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Centered Bottom CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="pt-8 flex items-center justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/create-interview")}
          className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Try a Full Mock Coding Interview</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </section>
  );
}
