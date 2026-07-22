import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../utils/toast";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Welcome back. Taking you to your dashboard now.", "Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Please check your email and password, then try again.",
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      // Mock successful OAuth signup
      const mockUser = {
        _id: "oauth-user-id",
        name: `OAuth ${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
      };
      localStorage.setItem("token", "mock-oauth-token-12345");
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      toast.success(`Successfully authenticated using ${provider}. Entering dashboard...`, "OAuth Success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden px-4 py-10 text-brand-text flex items-center justify-center">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-card hover:bg-slate-150 dark:hover:bg-slate-900/60 text-brand-secondary hover:text-brand-text transition-all duration-205 cursor-pointer"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 w-4" /> : <Moon className="w-4 w-4" />}
        </button>
      </div>

      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/15 blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-blue-200/10 blur-[100px]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-border/65 bg-brand-card px-4 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 shadow-sm">
            ✦ AI Mock Interview
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-brand-text xl:text-5xl">
            Practice mock interviews with real-time feedback.
          </h1>
          <p className="mt-5 max-w-xl text-sm font-semibold leading-relaxed text-brand-secondary">
            Prepare role-specific questions, submit your responses, and review comprehensive AI summaries of your progress.
          </p>
          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              {
                title: "Role-Based",
                desc: "Tailored to industry standards",
                icon: (
                  <svg className="h-5 w-5 text-indigo-650 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" strokeWidth="2" />
                  </svg>
                )
              },
              {
                title: "AI Critique",
                desc: "Instant score & improvement analysis",
                icon: (
                  <svg className="h-5 w-5 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Detail Reports",
                desc: "Track pacing & filler word indicators",
                icon: (
                  <svg className="h-5 w-5 text-emerald-650 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                )
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-brand-border bg-brand-card/70 backdrop-blur-md p-5 shadow-sm hover:-translate-y-0.5 hover:border-slate-350 transition-all duration-200"
              >
                {item.icon}
                <p className="font-black text-brand-text text-sm">{item.title}</p>
                <p className="text-xs text-brand-secondary mt-1.5 font-bold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-md sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-650">
              Welcome back
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Sign in to continue
            </h1>
            <p className="mt-2 text-sm leading-6 text-brand-secondary">
              Start your interview simulation sessions in one click.
            </p>
          </div>



          {/* Social Logins */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin("Google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-xs font-bold text-brand-text hover:bg-brand-bg hover:scale-[1.02] active:scale-95 duration-100 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 2.27v1.88h3.58c2.1-1.93 3.3-4.77 3.3-8z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.58-2.77c-1 .67-2.28 1.07-4.38 1.07-3.37 0-6.22-2.28-7.24-5.35H1.1v2.96A11.98 11.98 0 0012 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.76 13.97a7.18 7.18 0 010-4.54V6.47H1.1a11.98 11.98 0 000 10.46l3.66-2.96z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43A11.98 11.98 0 001.1 6.47l3.66 2.96c1.02-3.07 3.87-5.35 7.24-5.35z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin("GitHub")}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-xs font-bold text-brand-text hover:bg-brand-bg hover:scale-[1.02] active:scale-95 duration-100 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <span className="relative bg-brand-card/95 px-3 text-xs font-semibold text-brand-secondary">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-text">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-100/50"
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
                  className="w-full rounded-xl border border-brand-border bg-brand-bg/50 pl-4 pr-11 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card focus:ring-4 focus:ring-blue-100/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-secondary active:scale-95 duration-100"
                >
                  {showPassword ? (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 font-black shadow-md shadow-indigo-900/10 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 transition-all duration-100"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-semibold text-brand-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-black text-blue-650 hover:text-blue-700 hover:scale-[1.03] active:scale-95 duration-100 inline-block"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
