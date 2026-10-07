import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import {
  Mail,
  ArrowRight,
  Globe,
  ChevronDown,
  CheckCircle2
} from "lucide-react";

export default function Footer({ onlyCopyright = false }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  if (onlyCopyright) {
    return (
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#0B0E1B]/70 py-4 text-slate-500 relative z-10 font-sans backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 Intervexa. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <span>Built with AI for dreamers, doers and future professionals.</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 font-sans border-t border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-b from-[#FAF9FE] via-[#FBF9FE] to-[#F1EEFC] dark:from-[#0B0E1B] dark:via-[#0E1224] dark:to-[#17142F] text-slate-600 dark:text-slate-400 overflow-hidden pt-14 pb-8 transition-colors duration-200">
      {/* Decorative ambient background curves at bottom */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-200/30 dark:bg-purple-900/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/30 dark:bg-indigo-900/10 blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Main Grid: Brand + 4 Link Columns + Newsletter Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-start">
          
          {/* Column 1: Brand & Socials (3 cols on large) */}
          <div className="lg:col-span-3 space-y-4">
            <Link to="/" className="inline-block focus:outline-none">
              <Logo className="h-8" />
            </Link>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              AI-powered mock interviews to help you practice smarter, build confidence, and get hired faster.
            </p>

            {/* 5 Social Media Circle Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join a growing community of students and professionals.
            </p>
          </div>

          {/* Middle 4 Columns: Product, Company, Resources, Legal (5.5 cols total) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
            
            {/* Column 2: Product */}
            <div className="space-y-3.5">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Product
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/practice" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Mock Interviews
                  </Link>
                </li>
                <li>
                  <Link to="/create-interview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    AI Question Generator
                  </Link>
                </li>
                <li>
                  <Link to="/create-interview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Resume Analyzer
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Interview Feedback
                  </Link>
                </li>
                <li>
                  <Link to="/practice/coding" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Coding Environment
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Progress Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3.5">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Company
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/#about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/#mission" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link to="/#careers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 flex-wrap">
                    <span>Careers</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                      We're Hiring
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/#blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/#press" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="space-y-3.5">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Resources
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/#tips" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Interview Tips
                  </Link>
                </li>
                <li>
                  <Link to="/#guide" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Career Guide
                  </Link>
                </li>
                <li>
                  <Link to="/#stories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link to="/#help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/#docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/#community" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/#status" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div className="space-y-3.5">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Legal
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/#privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/#terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/#cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/#ai-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    AI Usage Policy
                  </Link>
                </li>
                <li>
                  <Link to="/#refund" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/#sitemap" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 6: Newsletter Card ("Stay in the loop") (3.5 cols on large) */}
          <div className="lg:col-span-4">
            <div className="rounded-sm bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-slate-900/90 dark:via-[#11162B] dark:to-[#121626] p-6 sm:p-7 shadow-sm">
              {/* Mail Icon in Purple Square */}
              <div className="h-9 w-9 rounded-sm bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3.5">
                <Mail className="h-4.5 w-4.5" />
              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Stay in the loop
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 mb-4 leading-relaxed">
                Get the latest features, interview tips, and career resources — straight to your inbox.
              </p>

              {/* Email Form */}
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-sm bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {subscribed && (
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Thanks for subscribing! Check your inbox soon.</span>
                </div>
              )}

              {/* Social Proof Avatars Row */}
              <div className="flex items-center gap-2 mt-4 pt-1">
                <div className="flex items-center -space-x-2 shrink-0">
                  <img
                    src="/aman.jpg"
                    alt="Subscriber"
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
                  />
                  <img
                    src="/priya.jpg"
                    alt="Subscriber"
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
                  />
                  <img
                    src="/rohit.jpg"
                    alt="Subscriber"
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
                  />
                  <img
                    src="/ai-interviewer.jpg"
                    alt="Subscriber"
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
                  />
                </div>

                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  10K+ learners already subscribed!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Heart Tagline, Language Dropdown */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          {/* Left */}
          <div className="text-slate-500 dark:text-slate-400">
            &copy; 2026 Intervexa. All rights reserved.
          </div>

          {/* Center */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium text-center">
            <span className="text-purple-600 dark:text-purple-400 text-sm">💜</span>
            <span>Built with AI for dreamers, doers and future professionals.</span>
          </div>

          {/* Right: Language Pill */}
          <div className="relative">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>English</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
