import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Code2,
  Brain,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070b13] text-slate-400 relative z-10 overflow-hidden font-sans">
      {/* Ambient background blur elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20">
                <span className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950 text-sm font-black text-white">
                  M
                </span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">MockAI</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
                  v2.4 AI Engine
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-sm">
              Next-generation AI mock interview platform for candidates and hiring teams. Real-time DSA code execution, system design architecture, and STAR framework behavioral evaluation.
            </p>

            {/* Live System Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-slate-300">
                AI Engine Operational • 99.9% SLA
              </span>
            </div>
          </div>

          {/* Assessment Rounds (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              <span>Assessment</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/create-interview" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-amber-400">•</span> OA Aptitude Round
                </Link>
              </li>
              <li>
                <Link to="/create-interview" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-blue-400">•</span> Technical Coding 1
                </Link>
              </li>
              <li>
                <Link to="/create-interview" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-purple-400">•</span> Technical Design 2
                </Link>
              </li>
              <li>
                <Link to="/create-interview" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-emerald-400">•</span> HR & STAR Behavioral
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Tools (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Platform</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  IDE Code Sandbox
                </Link>
              </li>
              <li>
                <Link to="/create-interview" className="hover:text-white transition">
                  AI Resume Parser
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  STAR Articulation Tips
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Performance Dossier
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick AI Mock Subscribe Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Stay Interview Ready
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Get weekly DSA problem breakdowns, system design cheat sheets, and behavioral prompt guides.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter developer email..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} MockAI Inc. All rights reserved. Designed for engineers and modern recruitment.
          </p>

          <div className="flex items-center gap-4 text-slate-400">
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition p-2 rounded-lg bg-slate-900 border border-white/5"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition p-2 rounded-lg bg-slate-900 border border-white/5"
              aria-label="Twitter"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition p-2 rounded-lg bg-slate-900 border border-white/5"
              aria-label="LinkedIn"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
