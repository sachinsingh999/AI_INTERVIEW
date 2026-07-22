function Message({ type = "info", title, children }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${styles[type]}`}>
      {title && (
        <p className="text-sm font-black uppercase tracking-[0.12em]">
          {title}
        </p>
      )}
      <div className={title ? "mt-1 text-sm font-semibold leading-6" : "text-sm font-semibold leading-6"}>
        {children}
      </div>
    </div>
  );
}

export default Message;
