import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Logo";
import {
  Video,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Settings,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  LayoutDashboard,
  Brain,
  History,
  FileCode,
  FileText,
  TrendingUp,
  Bookmark,
  Camera,
  CameraOff
} from "lucide-react";

export default function IntervexaHeroPreview() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [activeTab, setActiveTab] = useState("Chat");

  return (
    <div className="w-full rounded-sm bg-white dark:bg-[#121626] shadow-xl overflow-hidden text-left transition-all">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 select-none">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Online</span>
        </div>
      </div>

      {/* 3-Column Split Visual Grid */}
      <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 text-xs">
        {/* Left Mini Sidebar (2.5 cols) */}
        <div className="col-span-12 sm:col-span-3 lg:col-span-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between hidden md:flex">
          <div className="space-y-3">
            {/* Logo */}
            <div className="flex items-center px-1 py-1">
              <Logo className="h-5" />
            </div>

            {/* Nav list */}
            <div className="space-y-0.5 text-slate-600 dark:text-slate-400 font-medium text-xs">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm bg-indigo-600 text-white font-semibold shadow-xs">
                <Brain className="w-3.5 h-3.5" />
                <span>Mock Interview</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Interview History</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Practice Questions</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Resume Analyzer</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Progress &amp; Analytics</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Bookmarks</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </div>
            </div>
          </div>

          {/* User profile footer */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <img
                src="/aman.jpg"
                alt="Sachin Kumar"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/30"
              />
              <div className="text-xs leading-tight">
                <div className="font-bold text-slate-900 dark:text-white">Sachin Kumar</div>
                <div className="text-slate-400 text-[11px]">Student</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Center Live Video Stream (6 cols) */}
        <div className="col-span-12 md:col-span-6 p-4 flex flex-col justify-between space-y-3 bg-white dark:bg-[#121626]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              AI Mock Interview
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Live</span>
            </span>
          </div>

          {/* Video Container with flat sharp edges and no border lines */}
          <div className="relative rounded-sm overflow-hidden aspect-[4/3] bg-slate-900 shadow-inner group">
            <img
              src="/ai-interviewer.jpg"
              alt="AI Interviewer"
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay for subtitle */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4">
              <div className="bg-black/60 backdrop-blur-md rounded-xs p-3 text-xs sm:text-sm text-white leading-relaxed shadow-lg">
                <p className="font-medium text-slate-100">
                  &ldquo;Can you explain the difference between SQL and NoSQL databases?&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Call Controls Strip with rounded-sm and no boundary border line */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-2 rounded-sm transition-all cursor-pointer ${
                micOn
                  ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
                  : "bg-rose-100 dark:bg-rose-900/50 text-rose-600"
              }`}
              title={micOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-2 rounded-sm transition-all cursor-pointer ${
                cameraOn
                  ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
                  : "bg-rose-100 dark:bg-rose-900/50 text-rose-600"
              }`}
              title={cameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {cameraOn ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => navigate("/create-interview")}
              className="p-2.5 rounded-sm bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="End Interview Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>

            <button
              className="p-2 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
              title="Share Screen"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              className="p-2 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
              title="Interview Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Panel: Tabs & Progress Stepper (3.5 cols) */}
        <div className="col-span-12 md:col-span-3 p-3.5 sm:p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Top Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-sm text-center font-semibold text-xs">
              {["Chat", "Code", "Notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-1 rounded-xs transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Interview Progress Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Interview Progress</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">3 / 5</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-xs overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full w-3/5 rounded-xs" />
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-3 relative pl-3.5 border-l border-slate-200 dark:border-slate-800 my-1 text-xs">
              {/* Aptitude Round */}
              <div className="relative pl-3">
                <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-xs bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                <div className="font-bold text-slate-900 dark:text-white">Aptitude Round</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Completed • 10/10</div>
              </div>

              {/* Technical Round 1 */}
              <div className="relative pl-3">
                <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-xs bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
                <div className="font-bold text-indigo-600 dark:text-indigo-400">Technical Round 1</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">In Progress • 2/5</div>
              </div>

              {/* Technical Round 2 */}
              <div className="relative pl-3">
                <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-xs bg-slate-300 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900" />
                <div className="font-semibold text-slate-600 dark:text-slate-400">Technical Round 2</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Upcoming • 0/3</div>
              </div>

              {/* HR Round */}
              <div className="relative pl-3">
                <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-xs bg-slate-300 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900" />
                <div className="font-semibold text-slate-600 dark:text-slate-400">HR Round</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Upcoming • 0/5</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/create-interview")}
            className="w-full py-2.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer text-center"
          >
            Start Real Practice
          </button>
        </div>
      </div>
    </div>
  );
}
