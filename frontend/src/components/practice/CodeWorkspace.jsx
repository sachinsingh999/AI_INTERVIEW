import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeWorkspace({
  question,
  submitting,
  selectedLanguage,
  setSelectedLanguage,
  setResult,
  editorTheme,
  setEditorTheme,
  languageOptions,
  activeLanguage,
  fontSize,
  setFontSize,
  isFullscreen,
  setIsFullscreen,
  handleResetCode,
  currentCode,
  handleEditorDidMount,
  consoleTab,
  setConsoleTab,
  consoleExpanded,
  setConsoleExpanded,
  renderConsoleTabContent,
  selectedTestCaseIndex,
  running,
  runCode,
  submissions,
  isFocusMode,
  setIsFocusMode,
  formatCode,
  aiDrawerOpen,
  setAiDrawerOpen,
  saveStatus,
  timeAgoText,
  autoSaveEnabled,
  setAutoSaveEnabled,
}) {
  const [consoleHeight, setConsoleHeight] = useState(() => {
    const saved = localStorage.getItem("workspace_console_height");
    return saved ? Number(saved) : 180;
  });

  const startConsoleResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(100, Math.min(450, startHeight - deltaY));
      setConsoleHeight(newHeight);
      localStorage.setItem("workspace_console_height", newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <section className="flex-1 flex flex-col min-h-0 relative h-full">
      
      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[50vh] flex flex-col bg-[#0B1220] overflow-hidden relative transition-colors duration-150">
        
        {/* Floating Top Editor Toolbar */}
        <div className="shrink-0 border-b border-[#1F2937]/60 p-2.5 px-4 flex items-center justify-between bg-[#0B1220] relative z-20 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {"</>"} Source Code
            </span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Formatting, Reset, Settings Toolbar Controls */}
            <div className="flex items-center gap-1.5">
              {/* Reset code */}
              <button
                type="button"
                onClick={handleResetCode}
                className="p-1.5 rounded-lg border border-[#1F2937] bg-slate-900/50 text-slate-400 hover:text-rose-450 hover:border-rose-500/30 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Reset starter template"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>

              {/* Format code */}
              <button
                type="button"
                onClick={formatCode}
                className="p-1.5 rounded-lg border border-[#1F2937] bg-slate-900/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition active:scale-95 cursor-pointer"
                title="Format Code"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M3 10h18M3 15h12M3 20h12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Monaco Component */}
        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            language={activeLanguage.monaco}
            theme={editorTheme}
            value={currentCode}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              lineNumbers: "on",
              autoIndent: "full",
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              matchBrackets: "always",
              folding: true,
              wordWrap: "on",
              smoothScrolling: true,
              readOnly: false,
              cursorBlinking: "smooth",
              fontSize: fontSize || 15,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 4,
              scrollBeyondLastLine: false,
            }}
          />

          {submitting && (
            <div 
              className="absolute inset-0 bg-[#050B14]/85 backdrop-blur-md flex flex-col items-center justify-center z-40 transition-all duration-300"
              style={{ animation: "fadeIn 0.2s ease-out forwards" }}
            >
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}</style>
              <div className="max-w-xs w-full mx-auto p-6 rounded-2xl border border-indigo-500/20 bg-slate-900/40 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                {/* Decorative glowing gradient sphere in background */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

                {/* Spinning loader with dynamic double ring */}
                <div className="relative w-16 h-16 mb-5">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-2 rounded-full border-4 border-b-emerald-500 border-l-emerald-500" style={{ animation: "spin 1s linear infinite reverse" }} />
                  
                  {/* Small inner logo/symbol */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                {/* Status messages */}
                <h3 className="text-sm font-extrabold text-white mb-1 tracking-wide">
                  Evaluating Submission
                </h3>
                <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed mb-4">
                  Running your solution against the hidden test suite...
                </p>

                {/* Pulse loading text */}
                <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full animate-pulse border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                  <span>Processing Test Cases</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Console Pane */}
        {!isFocusMode && (
          <div className="shrink-0 border-t border-[#1F2937]/75 bg-[#0B1220] relative">
            
            {/* Draggable Resizer Divider */}
            <div
              onMouseDown={startConsoleResize}
              className="absolute -top-1 left-0 right-0 h-2 hover:bg-indigo-500/40 cursor-row-resize transition-all z-35"
              title="Drag to resize console"
            />

            <div className="flex items-center justify-between px-4 border-b border-[#1F2937]/50 bg-[#0B1220]/20 select-none">
              <div className="flex gap-6">
                {[
                  { id: "testcases", label: "Testcase" },
                  { id: "result", label: "Result" },
                  { id: "output", label: "Logs" },
                  { id: "submissions", label: `Submissions (${submissions.length})` }
                ].map((tab) => {
                  const isActive = consoleTab === tab.id && consoleExpanded;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setConsoleTab(tab.id); setConsoleExpanded(true); }}
                      className={`py-3.5 text-xs font-bold relative transition shrink-0 cursor-pointer ${
                        isActive
                          ? "text-white font-extrabold"
                          : "text-slate-450 hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConsoleExpanded(!consoleExpanded)}
                  className="text-xs text-slate-400 hover:text-white transition p-1.5 rounded-md hover:bg-slate-800/40 cursor-pointer font-bold select-none shrink-0"
                >
                  {consoleExpanded ? "Console ▾" : "Console ▴"}
                </button>
              </div>
            </div>

            {consoleExpanded && (
              <div 
                style={{ height: `${consoleHeight}px` }}
                className="p-4 bg-[#0B1220]/10 border-b border-[#1F2937]/50 min-h-[100px] max-h-[450px] overflow-y-auto"
              >
                {consoleTab === "submissions" ? (
                  <div className="space-y-3">
                    {submissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-slate-500 py-6 select-none">
                        <p className="text-xs font-semibold">No submissions found for this question yet.</p>
                      </div>
                    ) : (
                      submissions.map((sub, index) => {
                        const timeStr = sub.createdAt ? new Date(sub.createdAt).toLocaleTimeString() : `${index + 1} mins ago`;
                        const isAccepted = sub.passed === sub.total;
                        return (
                          <div key={index} className="flex items-center justify-between p-3.5 rounded-md bg-[#0F172A] border border-[#1F2937]/50 shadow-sm">
                            <div className="min-w-0">
                              <p className={`text-xs font-black ${isAccepted ? "text-emerald-450" : "text-rose-455"}`}>
                                {isAccepted ? "Accepted" : "Wrong Answer"} ({sub.passed || 0}/{sub.total || 0} passed)
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 select-none">
                                Language: {sub.languageName || "JavaScript"} • {timeStr}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-slate-200">Score: {sub.score || 0}</p>
                              <p className="text-[10px] text-slate-500 font-semibold select-none">{sub.runtime || "0.08s"} • {sub.memory || "12.4 MB"}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  renderConsoleTabContent(question)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
