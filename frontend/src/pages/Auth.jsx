import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { toast } from "../utils/toast";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { isAuthenticated } from "../components/ProtectedRoute";
import {
  Sun,
  Moon,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Target,
  Zap,
  BarChart2,
  Check,
  CheckCircle2,
  Briefcase,
  Sparkles
} from "lucide-react";
import Logo from "../components/Logo";

export default function Auth({ initialMode = "login" }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  // Mode: "login" | "register"
  const [mode, setMode] = useState(() => {
    if (location.pathname === "/register") return "register";
    return initialMode;
  });

  useEffect(() => {
    if (location.pathname === "/register") setMode("register");
    else if (location.pathname === "/login") setMode("login");
  }, [location.pathname]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register multi-step form state
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [experience, setExperience] = useState("Mid-level");

  const [loading, setLoading] = useState(false);

  // Password strength calculator
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "Enter password", color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score === 1) return { score: 25, text: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 50, text: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 75, text: "Good", color: "bg-indigo-500" };
    return { score: 100, text: "Strong", color: "bg-emerald-500" };
  };

  const strength = calculatePasswordStrength(regPassword);

  // Handlers for Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/users/login", {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Welcome back! Taking you to your dashboard now.", "Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Please verify your email and password, then try again.",
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Register
  const handleRegNextStep = (e) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!regName || !regEmail || !regPassword) {
        toast.error("Please fill out all credentials before moving forward.", "Missing Fields");
        return;
      }
      setRegStep(2);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/register", {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: targetRole,
        experienceLevel: experience,
      });

      toast.success("Account created successfully! Initializing workspace...", "Registration successful");
      setRegStep(3);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
        "Registration failed"
      );
      setRegStep(1);
    } finally {
      setLoading(false);
    }
  };

  // OAuth Mock Handler
  const handleOAuth = (provider) => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        _id: "oauth-user-id",
        name: `OAuth ${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
      };
      localStorage.setItem("token", "mock-oauth-token-12345");
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      toast.success(`Successfully authenticated via ${provider}. Entering workspace...`, "OAuth Success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans relative overflow-hidden px-4 py-8 sm:py-12 flex items-center justify-center">
      {/* Tech Grid Background Surface */}
      <style>{`
        .bg-grid-tech {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
      <div className="absolute inset-0 bg-grid-tech pointer-events-none -z-10 opacity-70" />

      {/* Single Unified Card Container (Fixed Same Increased Height For Both Login & Register) */}
      <div className="mx-auto w-full max-w-5xl lg:h-[670px] min-h-[670px] rounded-sm border border-brand-border bg-brand-card shadow-2xl overflow-hidden flex flex-col">
        
        {/* Unified Card Top Header Bar */}
        <header className="border-b border-brand-border/60 bg-brand-bg/40 px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0">
          {/* Brand Logo */}
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo className="h-9" />
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher Segmented Control */}
            <div className="inline-flex p-1 rounded-sm border border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  navigate("/login");
                }}
                className={`px-3.5 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#F59E0B] text-[#0F172A] font-extrabold shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  navigate("/register");
                }}
                className={`px-3.5 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#F59E0B] text-[#0F172A] font-extrabold shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-all cursor-pointer"
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />}
            </button>
          </div>
        </header>

        {/* Card Body - Dual Column Grid */}
        <div className="grid lg:grid-cols-[0.92fr_1.08fr] flex-1 min-h-0">
          
          {/* Left Column: Info & Steps Panel */}
          <section className="hidden lg:flex flex-col justify-between p-8 lg:p-10 border-r border-[#E2E8F0] dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-slate-900/40 h-full overflow-hidden">
            <div>
              {mode === "login" ? (
                <>
                  <h1 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight text-[#0F172A] dark:text-white">
                    Practice Mock Interviews with Real-Time AI Feedback.
                  </h1>

                  <p className="mt-3 text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                    Access role-tailored questions, live code compiler execution, and comprehensive score summaries to land your target tech role.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      { title: "Role-Based", desc: "Top company rubrics", icon: <Target className="h-4 w-4 text-[#F59E0B] mb-1.5" /> },
                      { title: "AI Critique", desc: "Instant score & analysis", icon: <Zap className="h-4 w-4 text-[#F59E0B] mb-1.5" /> },
                      { title: "Detail Dossier", desc: "Speech pacing & logic", icon: <BarChart2 className="h-4 w-4 text-[#10B981] mb-1.5" /> }
                    ].map((item) => (
                      <div key={item.title} className="rounded-sm border border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900/60 p-3.5">
                        {item.icon}
                        <p className="font-bold text-[#0F172A] dark:text-white text-[11px] uppercase tracking-wider">{item.title}</p>
                        <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black leading-tight tracking-tight text-[#0F172A] dark:text-white">
                    Engineered for High-Performance Tech Career Growth.
                  </h2>

                  <p className="mt-3 text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                    Create your CodeForge candidate profile to unlock real-time compiler sandboxes, video STAR evaluators, and system design architecture canvases.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      { s: 1, title: "ACCOUNT CREDENTIALS", desc: "Set email & password or connect GitHub/Google OAuth" },
                      { s: 2, title: "TARGET DEVELOPER TRACK", desc: "Define primary role & experience level for custom rubrics" },
                      { s: 3, title: "WORKSPACE LAUNCH", desc: "Initialize AI candidate studio & compiler container" },
                    ].map((item) => (
                      <div
                        key={item.s}
                        className={`flex items-start gap-3.5 rounded-sm border p-3.5 transition-all ${
                          regStep === item.s
                            ? "border-[#F59E0B] bg-[#FEF3C7]/40 dark:bg-[#F59E0B]/10 shadow-sm"
                            : regStep > item.s
                            ? "border-[#10B981]/50 bg-[#10B981]/5"
                            : "border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900/30 opacity-60"
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-mono font-bold mt-0.5 ${
                          regStep > item.s ? "bg-[#10B981] text-white" : regStep === item.s ? "bg-[#F59E0B] text-[#0F172A]" : "bg-[#64748B] text-white"
                        }`}>
                          {regStep > item.s ? <Check className="w-3 h-3" /> : item.s}
                        </span>
                        <div>
                          <span className="font-bold text-[#0F172A] dark:text-white text-xs uppercase tracking-wider block">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium mt-0.5 block leading-tight">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Right Column: Form Section */}
          <div className="p-6 sm:p-9 flex flex-col justify-between bg-[#FFFFFF] dark:bg-slate-900 h-full overflow-hidden">
            
            {/* MODE 1: LOGIN FORM */}
            {mode === "login" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
                    Sign In To Workspace
                  </h2>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                    Enter your candidate credentials to access live mock sessions and analytics.
                  </p>
                </div>

                {/* OAuth Triggers */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuth("Google")}
                    className="flex items-center justify-center gap-2.5 rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/50 hover:bg-[#FFFFFF] dark:hover:bg-slate-800 hover:border-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:text-white active:scale-98 transition-all cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 2.27v1.88h3.58c2.1-1.93 3.3-4.77 3.3-8z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.58-2.77c-1 .67-2.28 1.07-4.38 1.07-3.37 0-6.22-2.28-7.24-5.35H1.1v2.96A11.98 11.98 0 0012 24z" />
                      <path fill="#FBBC05" d="M4.76 13.97a7.18 7.18 0 010-4.54V6.47H1.1a11.98 11.98 0 000 10.46l3.66-2.96z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43A11.98 11.98 0 001.1 6.47l3.66 2.96c1.02-3.07 3.87-5.35 7.24-5.35z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth("GitHub")}
                    className="flex items-center justify-center gap-2.5 rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/50 hover:bg-[#FFFFFF] dark:hover:bg-slate-800 hover:border-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:text-white active:scale-98 transition-all cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="relative mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E2E8F0] dark:border-slate-800"></div>
                  </div>
                  <span className="relative bg-[#FFFFFF] dark:bg-slate-900 px-3 text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-widest">
                    OR SIGN IN WITH EMAIL
                  </span>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-white font-semibold outline-none transition focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-slate-900"
                      />
                      <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 pl-10 pr-11 py-2.5 text-xs text-[#0F172A] dark:text-white font-semibold outline-none transition focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-slate-900"
                      />
                      <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] py-3 text-xs font-mono font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer border border-[#F59E0B]/30 flex items-center justify-center gap-2 mt-6 disabled:opacity-75"
                  >
                    {loading ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <span>Sign In To Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs font-medium text-[#64748B] border-t border-[#E2E8F0] dark:border-slate-800 pt-4">
                  Need a candidate account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      navigate("/register");
                    }}
                    className="font-bold text-amber-600 dark:text-amber-500 hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            )}

            {/* MODE 2: REGISTER MULTI-STEP FORM */}
            {mode === "register" && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                      STEP {regStep} OF 3: {regStep === 1 ? "CREDENTIALS" : regStep === 2 ? "CAREER TRACK" : "COMPLETE"}
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-6 transition-all duration-300 rounded-none ${
                            regStep >= i ? "bg-[#F59E0B]" : "bg-[#E2E8F0] dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
                    {regStep === 1 && "Create Your Account"}
                    {regStep === 2 && "Configure Career Target"}
                    {regStep === 3 && "Workspace Initialized"}
                  </h2>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                    {regStep === 1 && "Start practicing coding and system design with instant AI critiques."}
                    {regStep === 2 && "Tailor problem rubrics and AI interviewers to your career level."}
                    {regStep === 3 && "Redirecting to your candidate practice dashboard..."}
                  </p>
                </div>

                {regStep === 1 && (
                  <>
                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleOAuth("Google")}
                        className="flex items-center justify-center gap-2.5 rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/50 hover:bg-[#FFFFFF] dark:hover:bg-slate-800 hover:border-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:text-white active:scale-98 transition-all cursor-pointer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 2.27v1.88h3.58c2.1-1.93 3.3-4.77 3.3-8z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.58-2.77c-1 .67-2.28 1.07-4.38 1.07-3.37 0-6.22-2.28-7.24-5.35H1.1v2.96A11.98 11.98 0 0012 24z" />
                          <path fill="#FBBC05" d="M4.76 13.97a7.18 7.18 0 010-4.54V6.47H1.1a11.98 11.98 0 000 10.46l3.66-2.96z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43A11.98 11.98 0 001.1 6.47l3.66 2.96c1.02-3.07 3.87-5.35 7.24-5.35z" />
                        </svg>
                        <span>Google</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOAuth("GitHub")}
                        className="flex items-center justify-center gap-2.5 rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/50 hover:bg-[#FFFFFF] dark:hover:bg-slate-800 hover:border-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:text-white active:scale-98 transition-all cursor-pointer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        <span>GitHub</span>
                      </button>
                    </div>

                    <div className="relative mb-5 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E2E8F0] dark:border-slate-800"></div>
                      </div>
                      <span className="relative bg-[#FFFFFF] dark:bg-slate-900 px-3 text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-widest">
                        OR REGISTER WITH EMAIL
                      </span>
                    </div>

                    <form onSubmit={handleRegNextStep} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. Alex Morgan"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                            className="w-full rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-white font-semibold outline-none transition focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-slate-900"
                          />
                          <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="alex@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                            className="w-full rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-white font-semibold outline-none transition focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-slate-900"
                          />
                          <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            placeholder="Create password (6+ chars)"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                            className="w-full rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 pl-10 pr-11 py-2.5 text-xs text-[#0F172A] dark:text-white font-semibold outline-none transition focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-slate-900"
                          />
                          <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#64748B] mb-1">
                            <span>PASSWORD STRENGTH: {strength.text.toUpperCase()}</span>
                            <span>{strength.score}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-none bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700">
                            <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.score}%` }} />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] py-3 text-xs font-mono font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer border border-[#F59E0B]/30 flex items-center justify-center gap-2 mt-5"
                      >
                        <span>Continue To Career Track</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                )}

                {regStep === 2 && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                        Target Developer Role
                      </label>
                      <div className="relative">
                        <select
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-white font-bold outline-none transition focus:border-[#F59E0B] focus:bg-[#FFFFFF] dark:focus:bg-slate-900 appearance-none cursor-pointer"
                        >
                          <option>Frontend Developer</option>
                          <option>Backend Developer</option>
                          <option>Full Stack Developer</option>
                          <option>DevOps / Cloud Engineer</option>
                          <option>Mobile App Developer (iOS/Android)</option>
                          <option>Data Engineer</option>
                        </select>
                        <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                        Experience Seniority Level
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {["Junior-level", "Mid-level", "Senior-level"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setExperience(level)}
                            className={`rounded-sm border px-3 py-3 text-center text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              experience === level
                                ? "border-[#F59E0B] bg-[#FEF3C7]/40 dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B] shadow-sm"
                                : "border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/40 text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white"
                            }`}
                          >
                            {level.split("-")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="w-1/3 rounded-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-800 py-3 text-xs font-mono font-bold uppercase tracking-widest text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] py-3 text-xs font-mono font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer border border-[#F59E0B]/30 flex items-center justify-center gap-2 disabled:opacity-75"
                      >
                        {loading ? (
                          <span>Registering...</span>
                        ) : (
                          <>
                            <span>Finish Onboarding</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {regStep === 3 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="h-12 w-12 rounded-sm bg-[#10B981]/10 border border-[#10B981]/40 flex items-center justify-center mb-4 text-[#10B981]">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight">Initializing Workspace...</h3>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 font-medium">Redirecting to candidate mock space.</p>
                    <div className="mt-6 h-1.5 w-32 overflow-hidden rounded-none bg-[#F8FAFC] dark:bg-slate-800 relative border border-[#E2E8F0] dark:border-slate-700">
                      <div className="h-full bg-[#10B981] absolute left-0 top-0 animate-pulse w-full" />
                    </div>
                  </div>
                )}

                <p className="mt-6 text-center text-xs font-medium text-[#64748B] border-t border-[#E2E8F0] dark:border-slate-800 pt-4">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      navigate("/login");
                    }}
                    className="font-bold text-amber-600 dark:text-amber-500 hover:underline cursor-pointer"
                  >
                    Sign in to Workspace
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
