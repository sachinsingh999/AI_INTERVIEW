import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../utils/toast";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  // Onboarding steps: 1 = Credentials, 2 = Role Selection, 3 = Complete
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [experience, setExperience] = useState("Mid-level");
  
  const [loading, setLoading] = useState(false);

  // Password strength checker logic
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "Enter password", color: "bg-brand-border" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score === 1) return { score: 25, text: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 50, text: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 75, text: "Good", color: "bg-blue-500" };
    return { score: 100, text: "Strong", color: "bg-emerald-500" };
  };

  const strength = calculatePasswordStrength(password);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !email || !password) {
        toast.error("Please fill out all credentials before moving forward.", "Missing Fields");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/register", {
        name,
        email,
        password,
        role: targetRole,
        experienceLevel: experience,
      });

      toast.success("Your account is created! Redirecting to login...", "Registration successful");
      setStep(3);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Please verify your credentials and try again.",
        "Registration failed"
      );
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = (provider) => {
    setLoading(true);
    setTimeout(() => {
      setName(`OAuth ${provider} User`);
      setEmail(`user@${provider.toLowerCase()}.com`);
      setPassword("oauth-generated-random-pwd-123!");
      setStep(2);
      setLoading(false);
      toast.success("Please set your career targets to finish onboarding.", "Linked with " + provider);
    }, 900);
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

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        
        {/* Onboarding Details card left side */}
        <section className="hidden lg:block">
          <div className="rounded-2xl border border-brand-border bg-brand-card/60 backdrop-blur-md p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.03)]">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-650">
              ✦ Progress timeline
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-brand-text xl:text-4xl">
              Launch your mock interview prep in seconds.
            </h2>
            
            {/* Step markers visual feedback */}
            <div className="mt-8 space-y-4">
              {[
                { s: 1, label: "Set credentials or connect GitHub/Google" },
                { s: 2, label: "Define target developer roles & experience levels" },
                { s: 3, label: "Confirm mock dashboard launch" },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-transform duration-200 ${
                    step === item.s
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-brand-border/40 bg-brand-card/40 opacity-70"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white ${
                    step >= item.s ? "bg-indigo-600" : "bg-slate-350"
                  }`}>
                    {item.s}
                  </span>
                  <span className="font-bold text-brand-text text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Multi-Step Signup Form Right Side */}
        <div className="w-full rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-md sm:p-10">
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650">Onboarding</span>
              <span className="text-[10px] text-slate-300 font-bold">·</span>
              <span className="text-[10px] font-black text-brand-secondary">Step {step} of 3</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              {step === 1 && "Create your account"}
              {step === 2 && "Configure target role"}
              {step === 3 && "Account created"}
            </h1>
            <p className="mt-1.5 text-xs text-brand-secondary font-semibold leading-relaxed">
              {step === 1 && "Start practicing coding and system design with instant summaries."}
              {step === 2 && "Let our LLM generate relevant scenarios for your specific career path."}
              {step === 3 && "Redirecting to mock practice space..."}
            </p>
          </div>



          {step === 1 && (
            <>
              {/* OAuth triggers */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignUp("Google")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-xs font-bold text-brand-text hover:bg-brand-bg hover:scale-[1.02] active:scale-95 duration-100 transition-all"
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
                  onClick={() => handleOAuthSignUp("GitHub")}
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
                  or register with email
                </span>
              </div>

              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-705">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-705">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-705">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-brand-border bg-brand-bg/50 pl-4 pr-11 py-2.5 outline-none transition focus:border-blue-500 focus:bg-brand-card"
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

                  {/* Password strength meter */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-brand-secondary mb-1">
                      <span>Password Strength: {strength.text}</span>
                      <span>{strength.score}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-bg border border-brand-border">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 font-black shadow-md hover:scale-[1.01] active:scale-95 duration-100 transition-all"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-705">
                  Target Developer Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-brand-card"
                >
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>DevOps / Cloud Engineer</option>
                  <option>Mobile App Developer (iOS/Android)</option>
                  <option>Data Engineer</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-705">
                  Experience Seniority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Junior-level", "Mid-level", "Senior-level"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperience(level)}
                      className={`rounded-xl border px-3 py-3 text-center text-xs font-bold transition hover:scale-[1.02] active:scale-95 duration-100 ${
                        experience === level
                          ? "border-blue-600 dark:border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-450 ring-4 ring-blue-500/20"
                          : "border-brand-border bg-brand-bg/30 text-brand-secondary hover:bg-brand-card"
                      }`}
                    >
                      {level.split("-")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 rounded-xl border border-brand-border bg-brand-card py-3 text-xs font-black text-brand-text hover:bg-brand-bg hover:scale-[1.01] active:scale-95 duration-100 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 font-black shadow-md hover:scale-[1.01] active:scale-95 duration-100 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Finish Signup"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                <span className="text-emerald-600 text-xl font-black">✓</span>
              </div>
              <h2 className="text-xl font-black text-brand-text">Configuring Dashboard...</h2>
              <p className="mt-1 text-xs text-brand-secondary font-semibold">Redirecting to candidate mock space.</p>
              <div className="mt-6 h-1 w-24 overflow-hidden rounded-full bg-brand-bg relative">
                <div className="h-full bg-emerald-500 absolute left-0 top-0 animate-[shimmer_1.5s_infinite_linear]" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs font-semibold text-brand-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-black text-blue-650 hover:text-blue-700 hover:scale-[1.03] active:scale-95 duration-100 inline-block"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
