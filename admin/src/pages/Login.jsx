import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user?.role === "admin") {
      navigate("/dashboard");
    }

    if (searchParams.get("error") === "not-authorized") {
      setErrorMsg("Access denied. Only administrators are authorized to enter this dashboard.");
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/users/login", { email, password });
      const user = res.data.user;

      if (user.role !== "admin") {
        setErrorMsg("Access denied. You do not have administrator privileges.");
        localStorage.clear();
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMsg("Success! Directing to Admin Controls...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        "Login failed. Please verify your administrator credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden px-4 py-10 text-brand-text flex items-center justify-center">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-card hover:bg-slate-150 dark:hover:bg-slate-900/60 text-brand-secondary hover:text-brand-text transition-all duration-250 cursor-pointer"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {resolvedTheme === "dark" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636 9 9 0 0117.657 17.657z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-card/85 backdrop-blur-md p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-2 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="CodeForge Logo"
              className="h-24 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => navigate("/dashboard")}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
            CodeForge Console
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight">
            Admin Portal
          </h1>
          <p className="mt-1.5 text-xs text-brand-secondary font-semibold">
            Secure admin authentication gateway.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-bold text-rose-500">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-bold text-emerald-500">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-text">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-text">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-brand-border bg-brand-bg/50 pl-4 pr-11 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text active:scale-95 duration-100"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 py-3 font-black text-white shadow-md hover:bg-indigo-600 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 transition-all duration-100 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            {loading ? "Authenticating..." : "Admin Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
