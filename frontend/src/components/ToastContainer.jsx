import { useEffect, useState } from "react";

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { type, title, text } = e.detail;
      const id = Date.now() + Math.random();
      
      setToasts((prev) => [...prev, { id, type, title, text }]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener("toast", handleToast);
    return () => window.removeEventListener("toast", handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: (
      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const borders = {
    success: "border-l-4 border-emerald-500",
    error: "border-l-4 border-rose-500",
    info: "border-l-4 border-blue-500",
    warning: "border-l-4 border-amber-500",
  };

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto relative flex overflow-hidden rounded-xl border border-brand-border bg-brand-card/95 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-300 animate-slide-in ${borders[t.type]}`}
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-xs font-black text-brand-text uppercase tracking-wider">{t.title}</p>}
              <p className="mt-0.5 text-xs font-bold leading-relaxed text-slate-550">{t.text}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-brand-secondary hover:text-brand-secondary active:scale-95 duration-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Timed progress bar animation */}
          <div className="absolute bottom-0 left-0 h-1 bg-brand-bg w-full">
            <div
              className={`h-full animate-toast-shrink ${
                t.type === "success"
                  ? "bg-emerald-500"
                  : t.type === "error"
                    ? "bg-rose-500"
                    : t.type === "info"
                      ? "bg-blue-500"
                      : "bg-amber-500"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
