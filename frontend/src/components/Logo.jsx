import React from "react";

export default function Logo({ className = "h-8", showText = true }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Brand Logo Image */}
      <img
        src="/logo.png"
        alt="CodeForge"
        className="h-8.5 w-auto object-contain shrink-0 filter drop-shadow-sm transition-transform duration-200"
      />
      {/* Text logo with Plus Jakarta Sans */}
      {showText && (
        <span className="text-xl font-extrabold font-brand-logo tracking-tight text-brand-text leading-none">
          Code<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Forge</span>
        </span>
      )}
    </div>
  );
}
