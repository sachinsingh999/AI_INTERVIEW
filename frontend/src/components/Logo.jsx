import React from "react";

export default function Logo({ className = "h-8", showText = true, iconOnly = false }) {
  if (!showText || iconOnly) {
    return (
      <img
        src="/intervexa-icon.png"
        alt="Intervexa"
        className={`w-auto object-contain shrink-0 select-none ${className}`}
      />
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
      {/* Light mode logo */}
      <img
        src="/intervexa-logo.png"
        alt="Intervexa"
        className="h-full w-auto object-contain shrink-0 dark:hidden"
      />
      {/* Dark mode logo */}
      <img
        src="/intervexa-logo-dark.png"
        alt="Intervexa"
        className="h-full w-auto object-contain shrink-0 hidden dark:block"
      />
    </div>
  );
}

