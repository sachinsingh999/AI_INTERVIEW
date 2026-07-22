import React from "react";

export default function ConsoleTabContent({
  consoleTab,
  problem,
  activeTestCases = [],
  setActiveTestCases,
  selectedTestCaseIndex,
  setSelectedTestCaseIndex,
  customInput,
  setCustomInput,
  result,
}) {
  if (consoleTab === "testcases") {
    const activeCases = activeTestCases.length > 0 ? activeTestCases : (problem?.visibleTestCases || problem?.tests || []);
    const selectedIndex = selectedTestCaseIndex === "custom" ? "custom" : Math.min(selectedTestCaseIndex, activeCases.length - 1);
    const activeCase = selectedIndex !== "custom" ? activeCases[selectedIndex] : null;

    return (
      <div className="flex-1 flex flex-col min-h-0 text-xs select-none">
        {/* Toggle Tab header: Official Cases | Custom Input */}
        <div className="flex items-center gap-6 border-b border-[#1F2937]/50 pb-0 mb-3 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedTestCaseIndex(0)}
            className={`pb-2 text-xs font-bold relative transition cursor-pointer bg-transparent border-none outline-none ${
              selectedIndex !== "custom"
                ? "text-white font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Official Cases
            {selectedIndex !== "custom" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTestCaseIndex("custom")}
            className={`pb-2 text-xs font-bold relative transition cursor-pointer bg-transparent border-none outline-none ${
              selectedIndex === "custom"
                ? "text-white font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Custom Input
            {selectedIndex === "custom" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>

        {selectedIndex === "custom" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 min-h-[120px] w-full p-3 rounded-lg border border-[#1F2937]/50 font-mono text-xs bg-[#090E1A] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter custom input here..."
            />
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 mb-2 shrink-0">
              <span className="text-xs font-semibold text-slate-400">Select Testcase:</span>
              <div className="relative">
                <select
                  value={selectedIndex}
                  onChange={(e) => setSelectedTestCaseIndex(Number(e.target.value))}
                  className="appearance-none bg-[#090E1A] text-slate-300 border border-[#1F2937]/80 hover:border-slate-655 rounded-lg pl-3 pr-8 py-1 text-xs font-semibold outline-none cursor-pointer transition select-none"
                >
                  {activeCases.map((test, idx) => (
                    <option key={idx} value={idx}>
                      Case {idx + 1}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <span className="text-[9px]">▼</span>
                </div>
              </div>
            </div>

            {/* Unified case input textarea box */}
            <div className="flex flex-col gap-1.5 select-text">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">INPUT =</span>
              <textarea
                value={activeCase ? activeCase.input : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveTestCases(prev => {
                    const updated = [...prev];
                    if (updated[selectedIndex]) {
                      updated[selectedIndex].input = val;
                    }
                    return updated;
                  });
                }}
                className="w-full min-h-[60px] max-h-[120px] p-3.5 rounded-md border border-[#1F2937]/50 font-mono text-xs bg-[#090E1A] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all leading-normal"
              />
            </div>
          </div>
        )}
      </div>
    );
  } else if (consoleTab === "output") {
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-brand-secondary p-4 py-8 select-none">
          <p className="text-xs font-semibold text-slate-500">No execution logs found. Run your code to check outputs.</p>
        </div>
      );
    }
    const testResult = result.results?.[0] || {};
    const actual = testResult.actual || "";
    const expected = testResult.expected || "";
    const isPassed = testResult.passed;
    const isCustom = selectedTestCaseIndex === "custom";

    return (
      <div className="space-y-4 text-xs">
        {/* Top Verdict Card */}
        <div className="p-3.5 rounded-md bg-slate-900/40 shadow-sm border border-[#1F2937]/30 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
              isPassed 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {isPassed ? "Accepted" : "Wrong Answer"}
            </span>
            <span className="text-slate-300 font-bold">
              {isCustom ? "Custom Test Case" : `Case ${selectedTestCaseIndex + 1}`}
            </span>
          </div>
          <div className="text-slate-400 text-[10px] font-semibold">
            Runtime: <span className="text-slate-200 font-bold">{result.executionTime || "0 ms"}</span> | Memory: <span className="text-slate-200 font-bold">{result.memory || "0 MB"}</span>
          </div>
        </div>

        {result.status === "error" || testResult.error ? (
          <div className="p-3.5 rounded-md bg-rose-950/10 border border-rose-500/10 font-sans">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-455 block mb-1">Execution Error</span>
            <pre className="overflow-x-auto text-xs font-mono text-rose-300 whitespace-pre-wrap">
              {result.message || testResult.error}
            </pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Card */}
            {testResult.input && (
              <div className="p-3.5 rounded-md bg-slate-900/20 border border-[#1F2937]/20 font-sans">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Input</span>
                <pre className="overflow-x-auto text-xs font-mono text-slate-300 whitespace-pre-wrap">
                  {testResult.input}
                </pre>
              </div>
            )}

            {/* Output & Expected Cards */}
            <div className="p-3.5 rounded-md bg-slate-900/20 border border-[#1F2937]/20 font-sans">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Your Output</span>
              <pre className="overflow-x-auto text-xs font-mono text-slate-200 whitespace-pre-wrap font-bold">
                {actual}
              </pre>
            </div>

            {!isCustom && (
              <div className="p-3.5 rounded-md bg-slate-900/20 border border-[#1F2937]/20 font-sans">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Expected Output</span>
                <pre className="overflow-x-auto text-xs font-mono text-slate-200 whitespace-pre-wrap font-bold">
                  {expected}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } else if (consoleTab === "result") {
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-slate-550 p-4 py-8 select-none">
          <p className="text-xs font-semibold text-slate-500">Submit your solution to view verdicts and test cases.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-xs">
        {/* Main Verdict Card */}
        <div className={`p-4 rounded-md shadow-md border font-sans ${
          result.status === "error"
            ? "bg-rose-950/10 border-rose-500/20 text-rose-300"
            : result.passedCount === result.totalCount
              ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300"
              : "bg-amber-950/10 border-amber-500/20 text-amber-300"
        }`}>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-75">
            {result.submit ? "Submission Verdict" : "Run Status"}
          </p>
          <p className="mt-1 text-base font-black">
            {result.status === "error"
              ? "Execution Error"
              : result.passedCount === result.totalCount
                ? "All Test Cases Passed!"
                : `${result.passedCount}/${result.totalCount} Passed`}
          </p>
        </div>

        {result.status !== "error" && (
          <>
            {/* Performance Cards */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-900/40 border border-[#1F2937]/20 rounded-md p-3 font-sans">
                <p className="text-[9px] font-black uppercase text-slate-500">Runtime</p>
                <p className="text-xs font-black text-slate-200 mt-0.5">{result.executionTime}</p>
              </div>
              <div className="bg-slate-900/40 border border-[#1F2937]/20 rounded-md p-3 font-sans">
                <p className="text-[9px] font-black uppercase text-slate-500">Memory</p>
                <p className="text-xs font-black text-slate-200 mt-0.5">{result.memory}</p>
              </div>
            </div>

            {/* Case Cards */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {result.results?.map((test, index) => {
                const isCustom = test.label === "Custom Case" || test.label === "Custom Test Case";
                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-md border text-xs shadow-sm bg-slate-900/30 border-[#1F2937]/20 font-sans"
                  >
                    <div className="flex items-center justify-between font-bold mb-2">
                      <span className="text-slate-300">{test.label || `Case ${index + 1}`}</span>
                      {!isCustom && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          test.passed 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {test.passed ? "Passed" : "Failed"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 font-mono text-[11px] text-slate-455">
                      <p><span className="text-slate-500">Input:</span> {test.input}</p>
                      {!isCustom && (
                        <p><span className="text-slate-500">Expected:</span> {test.expected}</p>
                      )}
                      <p>
                        <span className="text-slate-500">Actual:</span>{" "}
                        <span className={test.passed ? "text-emerald-400/90" : "text-rose-455"}>
                          {test.actual ?? "-"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
}
