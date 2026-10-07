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
      <div className="flex-1 min-h-[50vh] flex flex-col bg-brand-card overflow-hidden relative transition-colors duration-150">
        
        {/* Floating Top Editor Toolbar */}
        <div className="shrink-0 border-b border-brand-border/80 p-2 px-3 sm:px-4 flex items-center justify-between bg-brand-card relative z-20 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">
              {"</>"} Source Code
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Formatting, Reset Controls */}
            <div className="flex items-center gap-1">
              {/* Reset code */}
              <button
                type="button"
                onClick={handleResetCode}
                className="p-1 rounded-xs border border-brand-border bg-brand-elevated text-brand-secondary hover:text-rose-500 hover:border-rose-500/30 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Reset starter template"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>

              {/* Format code */}
              <button
                type="button"
                onClick={formatCode}
                className="p-1 rounded-xs border border-brand-border bg-brand-elevated text-brand-secondary hover:text-brand-primary hover:border-brand-primary/30 transition active:scale-95 cursor-pointer"
                title="Format Code"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M3 10h18M3 15h12M3 20h12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Monaco Component */}
        <div className="flex-1 min-h-0 relative bg-brand-card">
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
              fontSize: fontSize || 14,
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
              className="absolute inset-0 bg-brand-bg/85 backdrop-blur-md flex flex-col items-center justify-center z-40 transition-all duration-300"
              style={{ animation: "fadeIn 0.2s ease-out forwards" }}
            >
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}</style>
              <div className="max-w-xs w-full mx-auto p-5 rounded-xs border border-brand-border bg-brand-card flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                {/* Spinning loader */}
                <div className="relative w-14 h-14 mb-4">
                  <div className="absolute inset-0 rounded-full border-3 border-brand-border" />
                  <div className="absolute inset-0 rounded-full border-3 border-t-amber-500 border-r-amber-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-3 border-brand-border" />
                  <div className="absolute inset-2 rounded-full border-3 border-b-brand-primary border-l-brand-primary" style={{ animation: "spin 1s linear infinite reverse" }} />
                </div>

                {/* Status messages */}
                <h3 className="text-sm font-black text-brand-text mb-1 tracking-tight">
                  Evaluating Submission
                </h3>
                <p className="text-[11px] text-brand-secondary max-w-[220px] leading-relaxed mb-3">
                  Running your solution against test cases...
                </p>

                {/* Pulse loading text */}
                <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-xs animate-pulse border border-amber-500/20">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  <span>Processing Test Suite</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Console Pane */}
        {!isFocusMode && (
          <div className="shrink-0 border-t border-brand-border bg-brand-card relative">
            
            {/* Draggable Resizer Divider */}
            <div
              onMouseDown={startConsoleResize}
              className="absolute -top-1 left-0 right-0 h-2 hover:bg-brand-primary/40 cursor-row-resize transition-all z-35"
              title="Drag to resize console"
            />

            <div className="flex items-center justify-between px-3 sm:px-4 border-b border-brand-border bg-brand-card select-none">
              <div className="flex gap-4 sm:gap-6">
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
                      className={`py-2 text-xs font-bold relative transition shrink-0 cursor-pointer ${
                        isActive
                          ? "text-brand-text font-black"
                          : "text-brand-secondary hover:text-brand-text"
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConsoleExpanded(!consoleExpanded)}
                  className="text-xs text-brand-secondary hover:text-brand-text transition p-1 rounded-xs hover:bg-brand-elevated cursor-pointer font-bold select-none shrink-0"
                >
                  {consoleExpanded ? "Console ▾" : "Console ▴"}
                </button>
              </div>
            </div>

            {consoleExpanded && (
              <div 
                style={{ height: `${consoleHeight}px` }}
                className="p-3 sm:p-4 bg-brand-card border-b border-brand-border min-h-[100px] max-h-[450px] overflow-y-auto"
              >
                {consoleTab === "submissions" ? (
                  <div className="space-y-2.5">
                    {submissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-brand-secondary py-6 select-none">
                        <p className="text-xs font-semibold">No submissions found for this question yet.</p>
                      </div>
                    ) : (
                      submissions.map((sub, index) => {
                        const timeStr = sub.createdAt ? new Date(sub.createdAt).toLocaleTimeString() : `${index + 1} mins ago`;
                        const isAccepted = sub.passed === sub.total;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 rounded-xs bg-brand-elevated border border-brand-border shadow-xs">
                            <div className="min-w-0">
                              <p className={`text-xs font-black ${isAccepted ? "text-emerald-500" : "text-rose-500"}`}>
                                {isAccepted ? "Accepted" : "Wrong Answer"} ({sub.passed || 0}/{sub.total || 0} passed)
                              </p>
                              <p className="text-[10px] text-brand-secondary font-semibold mt-0.5 select-none">
                                Language: {sub.languageName || "JavaScript"} • {timeStr}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-brand-text">Score: {sub.score || 0}</p>
                              <p className="text-[10px] text-brand-secondary font-semibold select-none">{sub.runtime || "0.08s"} • {sub.memory || "12.4 MB"}</p>
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
