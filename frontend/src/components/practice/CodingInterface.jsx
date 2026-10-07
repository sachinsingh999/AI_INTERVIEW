import React, { useRef } from "react";
import QuestionPanel from "./QuestionPanel";
import CodeWorkspace from "./CodeWorkspace";
import AiAssistantDrawer from "./AiAssistantDrawer";
import QuestionNavigatorDrawer from "./QuestionNavigatorDrawer";

export default function CodingInterface({
  drawerOpen,
  setDrawerOpen,
  isCoding,
  isAptitude,
  searchQuery,
  setSearchQuery,
  questionSet,
  currentIndex,
  goToQuestion,
  userProfile,
  solvedQuestionIds,
  question, // currentQuestion
  leftWidth,
  startResize,
  isFullscreen,
  setIsFullscreen,
  leftActiveTab,
  setLeftActiveTab,
  renderMarkdown,
  suggestedPatterns,
  getEditorialContent,
  getSolutionContent,
  selectedLanguage,
  setSelectedLanguage,
  setResult,
  editorTheme,
  setEditorTheme,
  languageOptions,
  activeLanguage,
  fontSize,
  setFontSize,
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
  handleManualSave,
  detectedTopics,
  result,
  timeLeft,
  formatTime,
  navigate,
  safeCurrentIndex,
  showSettings,
  setShowSettings,
  acceptance,
  containerRef,
  toggleBookmark,
  toggleSave,
  submitting,
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-brand-bg text-brand-text font-sans overflow-hidden">
      
      {!isFocusMode && (
        <QuestionNavigatorDrawer
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          isCoding={isCoding}
          isAptitude={isAptitude}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          questionSet={questionSet}
          currentIndex={currentIndex}
          goToQuestion={goToQuestion}
          userProfile={userProfile}
          solvedQuestionIds={solvedQuestionIds}
        />
      )}

      {/* Settings Dropdown Overlay */}
      {isFocusMode ? null : showSettings && (
        <div className="absolute right-6 top-16 w-52 rounded-md bg-brand-card border border-brand-border p-3.5 shadow-2xl z-50 text-xs text-brand-text space-y-3 animate-dropdown-in">
          <p className="font-black uppercase tracking-wider text-brand-secondary text-[9px] mb-1">IDE Configuration</p>
          
          {/* Theme selector */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-brand-secondary">Theme</span>
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value)}
              className="bg-brand-elevated text-brand-text border border-brand-border rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-brand-primary transition"
            >
              <option value="vs-dark">Dark IDE</option>
              <option value="light">Light IDE</option>
              <option value="hc-black">High Contrast</option>
            </select>
          </div>

          {/* Font Size controls */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-brand-secondary">Font Size</span>
            <div className="flex items-center justify-between bg-brand-elevated border border-brand-border rounded-lg p-0.5">
              <button 
                type="button"
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                className="w-6 h-6 flex items-center justify-center font-bold text-brand-secondary hover:text-brand-text hover:bg-brand-card rounded-md transition"
              >
                A-
              </button>
              <span className="font-mono font-bold">{fontSize}px</span>
              <button 
                type="button"
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="w-6 h-6 flex items-center justify-center font-bold text-brand-secondary hover:text-brand-text hover:bg-brand-card rounded-md transition"
              >
                A+
              </button>
            </div>
          </div>

          {/* Focus Options */}
          <div className="pt-2 border-t border-brand-border flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => { setIsFocusMode(!isFocusMode); setShowSettings(false); }}
              className={`w-full py-1 rounded-lg border text-center font-bold transition ${
                isFocusMode 
                  ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                  : "border-brand-border bg-brand-elevated text-brand-secondary hover:text-brand-text"
              }`}
            >
              {isFocusMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            </button>
            <button
              type="button"
              onClick={() => { setIsFullscreen(!isFullscreen); setShowSettings(false); }}
              className={`w-full py-1 rounded-lg border text-center font-bold transition ${
                isFullscreen 
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary" 
                  : "border-brand-border bg-brand-elevated text-brand-secondary hover:text-brand-text"
              }`}
            >
              {isFullscreen ? "Split View" : "Zen Size"}
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      {!isFocusMode && (
        <header className="h-14 shrink-0 border-b border-brand-border bg-brand-card flex items-center justify-between px-4 z-10 shadow-xs">
          {/* Left: Combined Exit & Problem Set Button Group */}
          <div className="flex items-center rounded-lg border border-brand-border bg-brand-elevated overflow-hidden select-none">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="p-2 border-r border-brand-border text-brand-secondary hover:text-rose-500 hover:bg-brand-card transition cursor-pointer shrink-0"
              title="Exit Arena"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-secondary hover:text-brand-primary hover:bg-brand-card transition cursor-pointer select-none"
              title="Open problem set drawer"
            >
              <svg className="w-3.5 h-3.5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Problem Set
            </button>
          </div>

          {/* Center: Run & Submit Action Group */}
          <div className="flex items-center gap-3 select-none">
            <button
              type="button"
              onClick={() => runCode(false)}
              disabled={running}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                running && !submitting
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                  : "bg-brand-elevated border-brand-border text-brand-text hover:bg-brand-elevated/80"
              }`}
              title="Run Code"
            >
              {running && !submitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-brand-secondary hover:text-brand-text transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Run</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => runCode(true)}
              disabled={running}
              className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-extrabold text-white transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
                submitting
                  ? "bg-brand-primary/30 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/40"
                  : "bg-brand-primary hover:bg-brand-primary-hover border border-brand-primary text-white"
              }`}
              title="Submit Solution"
            >
              {submitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Autosave Status, Language Selection, Timer, and Settings Actions */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Auto Save Status */}
            <div className="flex items-center text-xs select-none">
              {saveStatus === "saving" && (
                <span className="text-amber-500 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  ✓ Saved
                </span>
              )}
              {saveStatus === "failed" && (
                <span className="text-rose-500 font-semibold flex items-center gap-1">
                  ⚠ Failed
                  <button
                    type="button"
                    onClick={() => handleManualSave()}
                    className="underline ml-1 text-brand-primary font-black cursor-pointer bg-transparent border-none p-0 outline-none"
                  >
                    Retry
                  </button>
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-amber-500 font-semibold flex items-center gap-1">
                  ● Unsaved
                </span>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative inline-block text-left select-none">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setResult(null);
                }}
                className="bg-brand-elevated text-brand-text border border-brand-border rounded-lg px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer transition select-none"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-brand-border bg-brand-elevated text-amber-500 font-semibold font-mono text-xs select-none">
              <span className="text-amber-500">⏱</span>
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="h-4 w-px bg-brand-border" />

            {/* Gear Configuration Toggler */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg border transition active:scale-95 cursor-pointer ${
                showSettings
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                  : "border-brand-border bg-brand-elevated text-brand-secondary hover:text-brand-text"
              }`}
              title="Editor Settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* AI Assistant Toggler */}
            <button
              type="button"
              onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
              className={`p-1.5 rounded-lg border transition active:scale-95 cursor-pointer ${
                aiDrawerOpen
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                  : "border-brand-border bg-brand-elevated text-brand-secondary hover:text-brand-text"
              }`}
              title="AI Assistant Chat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* Main Resizable Split Workspace */}
      <div className="flex-1 flex min-h-0 w-full relative">
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <main className="flex-1 flex flex-col min-h-0 w-full max-w-none">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <div ref={containerRef} className="flex-1 flex min-h-0 w-full relative">
                
                {isFocusMode ? null : isFullscreen ? (
                  <div 
                    onClick={() => setIsFullscreen(false)} 
                    className="w-4 h-full bg-brand-card hover:bg-brand-elevated border-r border-brand-border flex flex-col items-center justify-center cursor-pointer hover:text-brand-primary text-brand-secondary transition duration-150 shrink-0 select-none"
                    title="Expand Question Panel"
                  >
                    <span className="text-xs font-bold">&gt;</span>
                  </div>
                ) : (
                  <div style={{ width: `${leftWidth}%` }} className="h-full shrink-0">
                    <QuestionPanel
                      problem={question}
                      acceptance={acceptance}
                      userProfile={userProfile}
                      toggleBookmark={toggleBookmark}
                      toggleSave={toggleSave}
                      leftActiveTab={leftActiveTab}
                      setLeftActiveTab={setLeftActiveTab}
                      renderMarkdown={renderMarkdown}
                      suggestedPatterns={suggestedPatterns}
                      getEditorialContent={getEditorialContent}
                      getSolutionContent={getSolutionContent}
                      selectedLanguage={selectedLanguage}
                      isFullscreen={isFullscreen}
                      setIsFullscreen={setIsFullscreen}
                      result={result}
                    />
                  </div>
                )}
   
                {/* Draggable Divider */}
                {!isFullscreen && !isFocusMode && (
                  <div
                    onMouseDown={startResize}
                    className="w-[3px] bg-brand-border hover:bg-brand-primary cursor-col-resize transition-all self-stretch z-30 shrink-0"
                  />
                )}
   
                <div 
                  style={{ width: isFullscreen || isFocusMode ? "100%" : `${100 - leftWidth}%` }} 
                  className="h-full flex flex-col min-h-0"
                >
                  <CodeWorkspace
                    question={question}
                    submitting={submitting}
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={setSelectedLanguage}
                    setResult={setResult}
                    editorTheme={editorTheme}
                    setEditorTheme={setEditorTheme}
                    languageOptions={languageOptions}
                    activeLanguage={activeLanguage}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    handleResetCode={handleResetCode}
                    currentCode={currentCode}
                    handleEditorDidMount={handleEditorDidMount}
                    consoleTab={consoleTab}
                    setConsoleTab={setConsoleTab}
                    consoleExpanded={consoleExpanded}
                    setConsoleExpanded={setConsoleExpanded}
                    renderConsoleTabContent={renderConsoleTabContent}
                    selectedTestCaseIndex={selectedTestCaseIndex}
                    running={running}
                    runCode={runCode}
                    submissions={submissions}
                    isFocusMode={isFocusMode}
                    setIsFocusMode={setIsFocusMode}
                    formatCode={formatCode}
                    aiDrawerOpen={aiDrawerOpen}
                    setAiDrawerOpen={setAiDrawerOpen}
                    saveStatus={saveStatus}
                    timeAgoText={timeAgoText}
                    autoSaveEnabled={autoSaveEnabled}
                    setAutoSaveEnabled={setAutoSaveEnabled}
                    handleManualSave={handleManualSave}
                  />
                </div>

                {!isFocusMode && (
                  <AiAssistantDrawer
                    aiDrawerOpen={aiDrawerOpen}
                    setAiDrawerOpen={setAiDrawerOpen}
                    isFullscreen={isFullscreen}
                    problem={question}
                    detectedTopics={detectedTopics}
                    suggestedPatterns={suggestedPatterns}
                    result={result}
                  />
                )}
              </div>
            </div>
          </main>

          {/* Operational Bottom Status Footer */}
          {!isFocusMode && (
            <footer className="h-6 shrink-0 border-t border-brand-border bg-brand-card px-4 flex items-center justify-between text-[10px] text-brand-secondary select-none">
              <div className="flex items-center gap-1.5 font-semibold">
                <span>© 2026 CodeArena IDE. All rights reserved.</span>
                <span className="text-brand-border">|</span>
                <a href="#" className="hover:text-brand-text transition">Terms</a>
                <a href="#" className="hover:text-brand-text transition">Privacy</a>
              </div>
              <div className="flex items-center gap-4 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                  <span>All systems operational</span>
                </div>
                <a href="#" className="hover:text-brand-text transition">Support</a>
              </div>
            </footer>
          )}
        </div>
      </div>

    </div>
  );
}
