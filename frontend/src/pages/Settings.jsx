import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import {
  User,
  Sliders,
  ShieldAlert,
  Palette,
  Mic,
  Camera,
  Check,
  Save,
  Lock,
  Bell,
  Volume2,
  Key,
  Database,
  Trash2,
  Sparkles,
  ShieldCheck,
  Radio
} from "lucide-react";

function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || {
      name: "Sachin Kumar",
      email: "sachin@example.com",
      role: "Full Stack Engineer",
      bio: "Passionate developer building AI interview & practice platforms.",
    };
  });

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "Full Stack Engineer");
  const [bio, setBio] = useState(user.bio || "");

  // App state mocks
  const [notifications, setNotifications] = useState({
    emailMocks: true,
    weeklyReport: true,
    soundCues: true,
    interviewReminders: true,
  });

  const [proctoringLevel, setProctoringLevel] = useState("flexible"); // strict, flexible, off
  const [audioInput, setAudioInput] = useState("default");
  const [videoInput, setVideoInput] = useState("default");
  const [micVolume, setMicVolume] = useState(65);
  const [isTestingMic, setIsTestingMic] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { theme, resolvedTheme, setTheme } = useTheme();

  // Handle URL hash changes for tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["general", "hardware-devices", "proctoring-rules", "appearance", "security"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, name, email, role, bio };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Notify Navbar using custom event
    window.dispatchEvent(new Event("storage"));

    toast.success("Your candidate profile details have been saved successfully.", "Profile Updated");
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Your account password has been updated securely.", "Security Updated");
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.info("Preferences saved.");
  };

  const tabs = [
    { id: "general", label: "Profile & Account", icon: <User className="w-4 h-4" /> },
    { id: "hardware-devices", label: "Hardware & Media", icon: <Mic className="w-4 h-4" /> },
    { id: "proctoring-rules", label: "Proctoring & AI Rules", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance & Theme", icon: <Palette className="w-4 h-4" /> },
    { id: "security", label: "Security & Data", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden transition-colors duration-150">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-sm bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sliders className="w-3 h-3" /> System Preferences
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-brand-text leading-none mt-2">Settings</h1>
            <p className="text-xs text-brand-secondary font-semibold mt-1.5">
              Customize your developer environment, audio/video devices, AI proctoring parameters, and account security.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success("Environment synced with cloud servers.");
              }}
              className="rounded-sm border border-brand-border bg-brand-card px-3 py-2 text-xs font-black text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-white/5 transition duration-150 cursor-pointer flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              <span>Sync Cloud Settings</span>
            </button>
          </div>
        </div>

        {/* Main Settings Grid */}
        <div className="grid gap-8 md:grid-cols-[240px_1fr] items-start">
          {/* Settings Navigation Tabs */}
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-3 md:pb-0 md:overflow-visible sticky top-24">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.location.hash = tab.id;
                  }}
                  className={`flex items-center gap-3 shrink-0 rounded-sm px-3.5 py-2.5 text-xs font-black transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? "bg-[#F59E0B]/15 text-amber-700 dark:text-amber-400 border border-[#F59E0B]/30 shadow-sm"
                      : "text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text border border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings Content Panels */}
          <div className="space-y-6">
            {/* General Profile Section */}
            {(activeTab === "general" || activeTab === "all") && (
              <section
                id="general"
                className="rounded-sm border border-brand-border bg-brand-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-brand-text leading-tight">
                        Profile & Candidate Information
                      </h2>
                      <p className="text-[11px] text-brand-secondary font-semibold">
                        This information is displayed during mock interviews and exported reports.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        Target Role / Specialization
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        Developer Bio
                      </label>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Short bio or tagline..."
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="rounded-sm bg-[#F59E0B] hover:bg-[#D97706] px-5 py-2.5 text-xs font-black text-[#0F172A] shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Hardware Devices Settings */}
            {(activeTab === "hardware-devices" || activeTab === "all") && (
              <section
                id="hardware-devices"
                className="rounded-sm border border-brand-border bg-brand-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-brand-text leading-tight">
                        Hardware Devices & Audio Inspection
                      </h2>
                      <p className="text-[11px] text-brand-secondary font-semibold">
                        Select default microphone and camera feeds for AI voice interviews.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5 flex items-center gap-1.5">
                        <Mic className="w-3 h-3 text-amber-500" /> Microphone (Audio Input)
                      </label>
                      <select
                        value={audioInput}
                        onChange={(e) => setAudioInput(e.target.value)}
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card cursor-pointer"
                      >
                        <option value="default">Default System Microphone</option>
                        <option value="external">External USB Microphone Pro</option>
                        <option value="airpods">AirPods / Wireless Headset</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5 flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-amber-500" /> Camera (Video Feed)
                      </label>
                      <select
                        value={videoInput}
                        onChange={(e) => setVideoInput(e.target.value)}
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card cursor-pointer"
                      >
                        <option value="default">FaceTime HD Camera (Built-in)</option>
                        <option value="obs">OBS Virtual Camera Source</option>
                        <option value="usb">External 4K Webcam</option>
                      </select>
                    </div>
                  </div>

                  {/* Audio Level Testing Widget */}
                  <div className="rounded-sm bg-brand-bg p-4 border border-brand-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${isTestingMic ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                        <span className="text-xs font-bold text-brand-text">Live Microphone Input Level</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTestingMic(!isTestingMic);
                          if (!isTestingMic) {
                            toast.info("Testing microphone input signal...");
                          }
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        {isTestingMic ? "Stop Mic Test" : "Test Signal"}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full rounded-sm bg-brand-border overflow-hidden flex gap-0.5 p-0.5">
                        {Array.from({ length: 24 }).map((_, idx) => {
                          const isActive = isTestingMic ? idx < Math.floor((micVolume / 100) * 24) : idx < 12;
                          return (
                            <div
                              key={idx}
                              className={`flex-1 h-full rounded-xs transition-colors duration-75 ${
                                isActive
                                  ? idx > 18
                                    ? "bg-rose-500"
                                    : idx > 14
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                  : "bg-brand-border/40"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-brand-secondary uppercase tracking-widest">
                        <span>-40 dB</span>
                        <span>0 dB (Optimal)</span>
                        <span>+12 dB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Proctoring Rules Configuration */}
            {(activeTab === "proctoring-rules" || activeTab === "all") && (
              <section
                id="proctoring-rules"
                className="rounded-sm border border-brand-border bg-brand-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-brand-text leading-tight">
                        Proctoring & Assessment Rules
                      </h2>
                      <p className="text-[11px] text-brand-secondary font-semibold">
                        Configure strictness levels and anti-cheat policies during live technical evaluations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        id: "strict",
                        label: "Strict Mode",
                        desc: "Full camera locks, tab-switch monitoring, copy-paste block",
                        badge: "Recommended for Exams",
                      },
                      {
                        id: "flexible",
                        label: "Flexible Mode",
                        desc: "Monitored warnings, soft tab checks, allowed reference lookups",
                        badge: "Standard Practice",
                      },
                      {
                        id: "off",
                        label: "No Proctoring",
                        desc: "Open practice sandbox environment without tracking",
                        badge: "Casual Learning",
                      },
                    ].map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => {
                          setProctoringLevel(level.id);
                          toast.success(`Proctoring set to ${level.label}`);
                        }}
                        className={`rounded-sm border p-4 text-left hover:scale-[1.01] active:scale-95 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                          proctoringLevel === level.id
                            ? "border-amber-500 bg-amber-500/10 text-brand-text ring-2 ring-amber-500/20"
                            : "border-brand-border bg-brand-bg/30 text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-black text-brand-text">{level.label}</p>
                            {proctoringLevel === level.id && (
                              <Check className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-[10px] font-semibold opacity-80 leading-relaxed mt-1">{level.desc}</p>
                        </div>
                        <span className="mt-3 inline-block rounded-xs bg-brand-bg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-secondary border border-brand-border self-start">
                          {level.badge}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-brand-border pt-4 space-y-3">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-2">
                      Notification & Audio Alerts
                    </span>
                    <label className="flex items-center gap-3 text-xs font-semibold text-brand-secondary cursor-pointer hover:text-brand-text">
                      <input
                        type="checkbox"
                        checked={notifications.soundCues}
                        onChange={() => handleToggleNotification("soundCues")}
                        className="h-4 w-4 rounded-xs border-brand-border text-amber-500 focus:ring-0 bg-brand-card cursor-pointer"
                      />
                      <span>Play audio chime warnings before round timers expire</span>
                    </label>

                    <label className="flex items-center gap-3 text-xs font-semibold text-brand-secondary cursor-pointer hover:text-brand-text">
                      <input
                        type="checkbox"
                        checked={notifications.emailMocks}
                        onChange={() => handleToggleNotification("emailMocks")}
                        className="h-4 w-4 rounded-xs border-brand-border text-amber-500 focus:ring-0 bg-brand-card cursor-pointer"
                      />
                      <span>Send detailed AI evaluation report summaries to registered email</span>
                    </label>

                    <label className="flex items-center gap-3 text-xs font-semibold text-brand-secondary cursor-pointer hover:text-brand-text">
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReport}
                        onChange={() => handleToggleNotification("weeklyReport")}
                        className="h-4 w-4 rounded-xs border-brand-border text-amber-500 focus:ring-0 bg-brand-card cursor-pointer"
                      />
                      <span>Receive weekly progress and skill heatmap digests</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* Appearance Settings */}
            {(activeTab === "appearance" || activeTab === "all") && (
              <section
                id="appearance"
                className="rounded-sm border border-brand-border bg-brand-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-brand-text leading-tight">
                        Appearance & Theme Mode
                      </h2>
                      <p className="text-[11px] text-brand-secondary font-semibold">
                        Choose your visual workspace aesthetic for practice sessions & code editor.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: "light", label: "Light Theme", desc: "Clean bright workspace with high contrast text" },
                      { id: "dark", label: "Dark Modern", desc: "Sleek dark background with warm accent glows" },
                      { id: "system", label: "System Default", desc: "Automatically sync with your operating system" },
                    ].map((themeOption) => (
                      <button
                        key={themeOption.id}
                        type="button"
                        onClick={() => {
                          setTheme(themeOption.id);
                          toast.success(`Theme updated to ${themeOption.label}`);
                        }}
                        className={`rounded-sm border p-4 text-left hover:scale-[1.01] active:scale-95 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                          theme === themeOption.id
                            ? "border-amber-500 bg-amber-500/10 text-brand-text ring-2 ring-amber-500/20"
                            : "border-brand-border bg-brand-bg/30 text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-black text-brand-text">{themeOption.label}</p>
                            {theme === themeOption.id && (
                              <Check className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-[10px] font-semibold opacity-80 leading-relaxed mt-1">{themeOption.desc}</p>
                        </div>
                        <span className="mt-3 text-[9px] font-black uppercase tracking-widest text-brand-secondary">
                          Active Mode: {resolvedTheme}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Security & Password Section */}
            {(activeTab === "security" || activeTab === "all") && (
              <section
                id="security"
                className="rounded-sm border border-brand-border bg-brand-card p-6 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-brand-text leading-tight">
                        Security & Authentication
                      </h2>
                      <p className="text-[11px] text-brand-secondary font-semibold">
                        Update your account password and manage data export or deletion.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-text">Change Password</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-sm border border-brand-border bg-brand-bg/50 px-3.5 py-2 text-xs font-bold text-brand-text outline-none transition focus:border-amber-500 focus:bg-brand-card"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="rounded-sm border border-brand-border bg-brand-bg hover:bg-slate-100 dark:hover:bg-white/5 px-4 py-2 text-xs font-black text-brand-text transition cursor-pointer flex items-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>

                <div className="border-t border-brand-border pt-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-text">Data & Danger Zone</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-sm border border-brand-border bg-brand-bg/40">
                    <div>
                      <p className="text-xs font-bold text-brand-text">Export Personal Interview Data</p>
                      <p className="text-[10px] font-semibold text-brand-secondary">
                        Download all historical transcripts, scores, and practice metrics as JSON.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Preparing your account data export file...");
                      }}
                      className="rounded-sm border border-brand-border bg-brand-card px-3 py-1.5 text-xs font-bold text-brand-text hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;

