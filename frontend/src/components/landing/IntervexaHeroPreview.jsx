import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Logo";
import {
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Brain,
  History,
  Code2,
  Layers,
  TrendingUp,
  FileText,
  Camera,
  CameraOff,
  Maximize2,
  MoreVertical,
  MessageSquare,
  Send,
  Square,
  Sparkles,
  Bot
} from "lucide-react";

export default function IntervexaHeroPreview() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [activeTab, setActiveTab] = useState("Chat");
  const [activeMenu, setActiveMenu] = useState("Mock Interview");
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121626] shadow-[0_20px_50px_rgba(79,70,229,0.08),0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-2xl overflow-hidden text-left transition-all">
      {/* Top Window Bar with macOS Dots */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 select-none">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400 inline-block" />
          <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
          <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Workspace Container */}
      <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
        
        {/* Left Navigation Sidebar */}
        <div className="col-span-12 md:col-span-3 p-3.5 bg-white dark:bg-[#121626] flex flex-col justify-between hidden md:flex min-h-[460px]">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center px-1 py-0.5">
              <Logo className="h-6" />
            </div>

            {/* Nav Menu */}
            <div className="space-y-1 text-slate-600 dark:text-slate-400 font-medium text-xs">
              <button
                onClick={() => setActiveMenu("Dashboard")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Dashboard"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeMenu === "Dashboard" ? "text-white" : "text-slate-400"}`} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveMenu("Mock Interview")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Mock Interview"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Brain className={`w-4 h-4 ${activeMenu === "Mock Interview" ? "text-white" : "text-slate-400"}`} />
                <span>Mock Interview</span>
              </button>

              <button
                onClick={() => setActiveMenu("Live Coding")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Live Coding"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Code2 className={`w-4 h-4 ${activeMenu === "Live Coding" ? "text-white" : "text-slate-400"}`} />
                <span>Live Coding</span>
              </button>

              <button
                onClick={() => setActiveMenu("Interview History")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Interview History"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <History className={`w-4 h-4 ${activeMenu === "Interview History" ? "text-white" : "text-slate-400"}`} />
                <span>Interview History</span>
              </button>

              <button
                onClick={() => setActiveMenu("Practice Sets")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Practice Sets"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Layers className={`w-4 h-4 ${activeMenu === "Practice Sets" ? "text-white" : "text-slate-400"}`} />
                <span>Practice Sets</span>
              </button>

              <button
                onClick={() => setActiveMenu("Progress & Analytics")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Progress & Analytics"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${activeMenu === "Progress & Analytics" ? "text-white" : "text-slate-400"}`} />
                <span>Progress &amp; Analytics</span>
              </button>

              <button
                onClick={() => setActiveMenu("Resume Analyzer")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeMenu === "Resume Analyzer"
                    ? "bg-[#4F46E5] text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <FileText className={`w-4 h-4 ${activeMenu === "Resume Analyzer" ? "text-white" : "text-slate-400"}`} />
                <span>Resume Analyzer</span>
              </button>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                S
              </div>
              <div className="text-xs leading-tight">
                <div className="font-bold text-slate-900 dark:text-white">Sachin Kumar</div>
                <div className="text-slate-400 text-[11px]">Student</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Right Main Content Area (Video + Chat Panel + Bottom Status Bar) */}
        <div className="col-span-12 md:col-span-9 flex flex-col justify-between bg-white dark:bg-[#121626]">
          
          {/* Upper Split: Center Video + Right Panel */}
          <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80 flex-1">
            
            {/* Center Live Video Stream */}
            <div className="col-span-12 md:col-span-7 p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  AI Mock Interview
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>Live</span>
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                    14:32
                  </span>
                  <div className="hidden sm:flex items-center gap-1 pl-1 text-slate-400">
                    <button className="p-1 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Feed */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 shadow-inner group">
                {cameraOn ? (
                  <img
                    src="/ai-interviewer.jpg"
                    alt="AI Interviewer"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 space-y-2">
                    <CameraOff className="w-8 h-8 text-slate-500" />
                    <span className="text-xs font-medium">Camera Muted</span>
                  </div>
                )}

                {/* Top-left AI Interviewer pill badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/10 select-none">
                  <Sparkles className="w-3 h-3 text-purple-400 fill-purple-400" />
                  <span>AI Interviewer</span>
                </div>
              </div>

              {/* Call Controls Toolbar */}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    micOn
                      ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
                      : "bg-rose-100 border-rose-200 text-rose-600"
                  }`}
                  title={micOn ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setCameraOn(!cameraOn)}
                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    cameraOn
                      ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
                      : "bg-rose-100 border-rose-200 text-rose-600"
                  }`}
                  title={cameraOn ? "Turn off camera" : "Turn on camera"}
                >
                  {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </button>

                {/* Red End Call Button */}
                <button
                  onClick={() => navigate("/create-interview")}
                  className="h-9 w-9 rounded-xl bg-[#F43F5E] hover:bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-all"
                  title="End Interview"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>

                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer transition-all"
                  title="Share Screen"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer transition-all"
                  title="Interview Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Chat & Interaction Panel */}
            <div className="col-span-12 md:col-span-5 p-3.5 sm:p-4 flex flex-col justify-between space-y-3 bg-white dark:bg-[#121626]">
              {/* Tab Switcher: Chat | Code | Notes */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-center font-semibold text-xs">
                <button
                  onClick={() => setActiveTab("Chat")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "Chat"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => setActiveTab("Code")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "Code"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code</span>
                </button>

                <button
                  onClick={() => setActiveTab("Notes")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "Notes"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes</span>
                </button>
              </div>

              {/* Chat View Tab (Active in Reference Image) */}
              {activeTab === "Chat" && (
                <div className="flex-1 flex flex-col justify-between space-y-3 animate-fade-in text-xs">
                  <div className="space-y-3.5">
                    {/* AI Interviewer Message */}
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                          <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 fill-indigo-600" />
                          <span>AI Interviewer</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">14:32</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                        Can you explain the difference between SQL and NoSQL databases?
                      </p>
                    </div>

                    {/* Candidate Message (Typing / Speech in Progress) */}
                    <div className="space-y-1 text-left">
                      <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                        You (Candidate)
                      </div>
                      <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </div>
                  </div>

                  {/* Chat Input Field with Mic & Send Arrow */}
                  <div className="relative pt-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3.5 pr-20 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={() => setMicOn(!micOn)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                        title="Voice Input"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (chatInput.trim()) setChatInput("");
                        }}
                        className="p-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs cursor-pointer transition-all active:scale-95"
                        title="Send Answer"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Code View Tab */}
              {activeTab === "Code" && (
                <div className="flex-1 flex flex-col justify-between space-y-2 animate-fade-in text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-[11px] leading-relaxed text-left">
                    <span className="text-purple-400">const</span>{" "}
                    <span className="text-blue-400">findDifference</span> = (type) =&gt; &#123;<br />
                    &nbsp;&nbsp;<span className="text-emerald-400">// Relational vs Non-relational</span><br />
                    &nbsp;&nbsp;<span className="text-purple-400">if</span> (type === <span className="text-amber-300">"SQL"</span>) return <span className="text-amber-300">"ACID compliant"</span>;<br />
                    &nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-amber-300">"Horizontal scale"</span>;<br />
                    &#125;;
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-sans text-emerald-600 font-semibold px-1">
                    <span>Validation: Passed</span>
                    <span className="font-mono">0ms</span>
                  </div>
                </div>
              )}

              {/* Notes View Tab */}
              {activeTab === "Notes" && (
                <div className="flex-1 flex flex-col justify-between space-y-3 animate-fade-in text-xs text-left">
                  <div className="space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white">Interviewer Key Criteria:</div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside text-[11px]">
                      <li>Explain Schema structure (Fixed vs Flexible)</li>
                      <li>Compare ACID vs CAP Theorem tradeoffs</li>
                      <li>Mention Vertical vs Horizontal scaling</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Status & Info Bar (Under Video and Chat) */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 sm:p-3.5 bg-white dark:bg-[#121626] flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Left Info: Progress Ring & Round Info */}
            <div className="flex items-center gap-3">
              {/* Circular Progress Ring (1/5) */}
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600"
                    strokeDasharray="20, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-slate-800 dark:text-slate-100">
                  1/5
                </span>
              </div>
              
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Technical Round
                </div>
                <div className="text-[11px] text-slate-400">
                  Question 1 of 5
                </div>
              </div>
            </div>

            {/* Middle Info: Interview Type */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                <Code2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-400 leading-tight">
                  Interview Type
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Backend Developer
                </div>
              </div>
            </div>

            {/* Right Button: End Interview */}
            <button
              onClick={() => navigate("/create-interview")}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 cursor-pointer transition-colors active:scale-98"
            >
              <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>End Interview</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
