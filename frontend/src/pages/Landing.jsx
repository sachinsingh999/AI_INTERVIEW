import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const { resolvedTheme, setTheme } = useTheme();

  const faqs = [
    {
      q: "How does the AI evaluate my interview responses?",
      a: "Our system parses your speech transcripts and coding logic using advanced LLMs (Gemini 2.0). It grades you based on industry standards: technical accuracy, clarity of thought, design pattern conventions, and communication effectiveness.",
    },
    {
      q: "Can I practice coding interviews in languages other than JavaScript?",
      a: "Yes. Our platform fully supports Python, Java, C++, TypeScript, and JavaScript. We use Monaco Editor and an integrated compiler sandbox to run and validate your test cases instantly.",
    },
    {
      q: "What is monitored during the proctored rounds?",
      a: "To simulate standard testing conditions, we optionally monitor tab switches, copy-paste shortcuts, and browser focus. Any violations are recorded in your final feedback report.",
    },
    {
      q: "Can recruiters view my practice logs?",
      a: "You have absolute control over your workspace privacy settings. You can generate custom PDF reports or shareable URLs to showcase your performance results directly with recruiters.",
    },
  ];

  const features = [
    {
      title: "Coding Sandbox",
      desc: "Complete split-screen IDE featuring syntax highlights, real-time code execution, and test suite logs.",
      icon: (
        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: "Video Rooms",
      desc: "Practice eye contact, speak with simulated virtual interviewers, and record camera metrics.",
      icon: (
        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "System Design Canvas",
      desc: "Draw architecture structures directly on an HTML5 whiteboard canvas with real-time AI feedback.",
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Mesh Glow Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[55%] h-[55%] rounded-full bg-emerald-500/5 blur-[130px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 p-[1.5px] shadow-lg shadow-indigo-500/10">
              <span className="flex h-full w-full items-center justify-center rounded-[9px] bg-brand-bg text-base font-black text-brand-text">M</span>
            </span>
            <span className="text-lg font-black tracking-tight text-brand-text">MockAI</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-bg/40 hover:bg-slate-150 dark:hover:bg-slate-900/60 text-brand-secondary hover:text-brand-text transition-all duration-205 cursor-pointer"
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-brand-secondary hover:text-brand-text transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-slate-950 dark:bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-slate-950 shadow-md hover:bg-indigo-650 dark:hover:bg-slate-100 transition-all duration-100"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-card/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 backdrop-blur-sm shadow-sm mb-6">
          ✦ The Next-Gen Mock Interview Suite
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 leading-tight">
          Supercharge your interview game with custom AI simulators.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-brand-secondary font-semibold sm:text-lg">
          Practice standard text responses, live compiler coding questions, voice video queries, and system design whiteboard round canvas drawings—all in one secure platform.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/register")}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-100"
          >
            Start Free Practice
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-xl border border-brand-border bg-brand-card p-4 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-brand-text hover:bg-slate-100 dark:hover:bg-brand-card/10 hover:scale-105 active:scale-95 transition-all duration-100"
          >
            Explore Dashboard
          </button>
        </div>

        {/* Floating Mock Terminal Preview */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-2xl p-1 relative shadow-indigo-500/5">
          <div className="flex items-center gap-2 border-b border-brand-border bg-brand-bg/80 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-xs font-bold text-brand-secondary">mockai-workspace --dev</span>
          </div>
          <div className="p-4 sm:p-6 text-left font-mono text-xs leading-relaxed text-slate-300">
            <p className="text-brand-secondary">// Initialize a proctored AI video mock session</p>
            <p className="mt-2"><span className="text-emerald-400">candidate$</span> npx mockai start-interview --role="Senior Frontend Developer" --mode="code"</p>
            <p className="mt-1 text-brand-secondary">◇ Connecting compiler sandbox... Connected</p>
            <p className="mt-1 text-brand-secondary">◇ Starting camera feed diagnostics... Ready (1080p, Rec active)</p>
            <p className="mt-1 text-indigo-400">◇ AI generated 10 challenges: Closures, Debounce, Layout trees, eQTL metrics...</p>
            <p className="mt-2 text-brand-secondary">// Ready to start. Tactical UI loaded.</p>
          </div>
        </div>
      </section>

      {/* Features showcase */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-brand-border/5">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Features</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-white">Full-Stack Simulation Tooling</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-brand-border bg-brand-card p-6 backdrop-blur-md shadow-sm hover:translate-y-[-4px] hover:border-brand-border transition-all duration-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-bg border border-brand-border mb-5">
                {feat.icon}
              </div>
              <h3 className="text-lg font-black text-brand-text">{feat.title}</h3>
              <p className="mt-2.5 text-sm font-semibold leading-relaxed text-brand-secondary">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-brand-border/5">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Pricing</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-white">Simple, transparent plans</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-brand-border bg-brand-card p-8 backdrop-blur-md relative">
            <h3 className="text-lg font-black text-brand-text">Developer Free</h3>
            <p className="mt-2 text-sm text-brand-secondary font-semibold leading-relaxed">Perfect for test practice sessions.</p>
            <p className="mt-6 text-4xl font-black text-brand-text">$0</p>
            <p className="text-xs font-semibold text-brand-secondary mt-1">free forever</p>
            <button
              onClick={() => navigate("/register")}
              className="mt-8 w-full rounded-xl border border-brand-border bg-brand-bg py-3 text-xs font-black uppercase tracking-wider text-brand-text hover:bg-slate-100 dark:hover:bg-brand-card/10 hover:scale-[1.01] active:scale-98 transition-all duration-100"
            >
              Get Started
            </button>
            <ul className="mt-8 space-y-3.5 text-xs font-semibold text-brand-secondary">
              <li className="flex items-center gap-2">✦ 5 AI Mock sessions / month</li>
              <li className="flex items-center gap-2">✦ Basic AI reports & critiques</li>
              <li className="flex items-center gap-2">✦ Multi-language code compiler</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-8 backdrop-blur-md relative shadow-lg shadow-indigo-500/5">
            <div className="absolute top-4 right-4 rounded-full bg-indigo-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-300">Popular</div>
            <h3 className="text-lg font-black text-indigo-300">Interview Pro</h3>
            <p className="mt-2 text-sm text-brand-secondary font-semibold leading-relaxed">Accelerated prep for high-level roles.</p>
            <p className="mt-6 text-4xl font-black">$19</p>
            <p className="text-xs font-semibold text-brand-secondary mt-1">per user / month</p>
            <button
              onClick={() => navigate("/register")}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-98 transition-all duration-100"
            >
              Get Professional Prep
            </button>
            <ul className="mt-8 space-y-3.5 text-xs font-semibold text-brand-secondary">
              <li className="flex items-center gap-2 text-indigo-300">✦ Unlimited AI sessions</li>
              <li className="flex items-center gap-2 text-indigo-300">✦ System Design rounds & whiteboard canvas</li>
              <li className="flex items-center gap-2 text-indigo-300">✦ Video body language eye-contact analytics</li>
              <li className="flex items-center gap-2">✦ Custom PDF candidate resume parsing logs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accordion FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-brand-border/5">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-400">FAQ</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-brand-border bg-brand-card p-5 backdrop-blur-sm cursor-pointer hover:border-brand-border transition-colors"
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-black text-brand-text">{faq.q}</h3>
                <span className="text-brand-secondary text-lg font-bold">{activeFaq === index ? "−" : "+"}</span>
              </div>
              {activeFaq === index && (
                <p className="mt-3 text-xs leading-relaxed text-brand-secondary font-semibold transition-all">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-brand-border bg-brand-card p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-brand-text">Ready to nail your dream job?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-secondary font-semibold">
            Get instant, customized AI mock interview training today. Practice in real code sandbox containers and video metrics tools.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="mt-8 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-100"
          >
            Create Your Account
          </button>
        </div>
      </section>
    </div>
  );
}

export default Landing;
