import { useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || { name: "Candidate", email: "candidate@example.com" }
  );
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  // App state mocks
  const [notifications, setNotifications] = useState({
    emailMocks: true,
    weeklyReport: false,
    soundCues: true,
  });
  const [proctoringLevel, setProctoringLevel] = useState("flexible"); // strict, flexible, off
  const [audioInput, setAudioInput] = useState("default");
  const [videoInput, setVideoInput] = useState("default");

  const { theme, setTheme } = useTheme();

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, name, email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Notify Navbar using custom event
    window.dispatchEvent(new Event("storage"));
    
    toast.success("Your candidate profile details have been saved successfully.", "Profile Updated");
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden transition-colors duration-155">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/10 dark:bg-indigo-950/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/10 dark:bg-emerald-950/10 blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-blue-200/5 dark:bg-blue-950/5 blur-[100px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Preferences</p>
          <h1 className="text-3xl font-black tracking-tight text-brand-text leading-none mt-2">Settings</h1>
          <p className="text-xs text-brand-secondary font-semibold mt-1">Configure your environment, audio/video devices, profile and proctoring parameters.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[240px_1fr] items-start">
          {/* Settings Navigation Tabs */}
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-3 md:pb-0 md:overflow-visible">
            {["General", "Hardware Devices", "Proctoring Rules", "Appearance"].map((tab) => (
              <a
                key={tab}
                href={`#${tab.toLowerCase().replace(/\s+/g, "-")}`}
                className="shrink-0 rounded-xl px-4 py-2.5 text-xs font-black text-brand-secondary transition hover:bg-brand-card hover:text-brand-text active:scale-95 duration-100"
              >
                {tab}
              </a>
            ))}
          </nav>

          {/* Form / Content Area */}
          <div className="space-y-6">
            {/* General Profile Section */}
            <section
              id="general"
              className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm"
            >
              <h2 className="text-lg font-black text-brand-text border-b border-brand-border pb-3 mb-5">
                Profile Details
              </h2>
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
                      className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:bg-brand-card"
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
                      className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:bg-brand-card"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-black text-white shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-95 duration-100 cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </section>

            {/* Hardware Devices Settings */}
            <section
              id="hardware-devices"
              className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm"
            >
              <h2 className="text-lg font-black text-brand-text border-b border-brand-border pb-3 mb-5">
                Hardware Devices
              </h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                      Microphone (Audio Input)
                    </label>
                    <select
                      value={audioInput}
                      onChange={(e) => setAudioInput(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:bg-brand-card cursor-pointer"
                    >
                      <option value="default">Default System Mic</option>
                      <option value="external">External USB Microphone</option>
                      <option value="virtual">Virtual Sound Loopback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-1.5">
                      Camera (Video Input)
                    </label>
                    <select
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:bg-brand-card cursor-pointer"
                    >
                      <option value="default">FaceTime HD Camera (Built-in)</option>
                      <option value="obs">OBS Virtual Camera</option>
                      <option value="usb">USB Webcam Pro (External)</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-bg p-4 border border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-brand-secondary">Testing live feedback volumes</span>
                  </div>
                  <div className="h-2 w-28 rounded-full bg-brand-border overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-pulse" style={{ width: "65%" }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Proctoring Rules Configuration */}
            <section
              id="proctoring-rules"
              className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm"
            >
              <h2 className="text-lg font-black text-brand-text border-b border-brand-border pb-3 mb-5">
                Proctoring Rules & Security
              </h2>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "strict", label: "Strict Mode", desc: "Full camera locks, copy-paste blocked" },
                    { id: "flexible", label: "Flexible", desc: "Monitored warnings, soft tab checks" },
                    { id: "off", label: "No Proctoring", desc: "Open practice sandbox environment" },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setProctoringLevel(level.id)}
                      className={`rounded-xl border p-4 text-left hover:scale-[1.02] active:scale-95 transition-all duration-100 cursor-pointer ${
                        proctoringLevel === level.id
                          ? "border-brand-primary bg-brand-primary/10 text-brand-text ring-4 ring-brand-primary/25"
                          : "border-brand-border bg-brand-bg/30 text-brand-secondary hover:bg-brand-card hover:text-brand-text"
                      }`}
                    >
                      <p className="text-sm font-black">{level.label}</p>
                      <p className="mt-1 text-[10px] font-semibold opacity-70 leading-relaxed">{level.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="border-t border-brand-border pt-4 space-y-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-2">Security preferences</span>
                  <label className="flex items-center gap-3 text-xs font-semibold text-brand-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.soundCues}
                      onChange={() => handleToggleNotification("soundCues")}
                      className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-0 bg-brand-card"
                    />
                    <span>Play countdown alert chimes before mock interview rounds</span>
                  </label>
                  <label className="flex items-center gap-3 text-xs font-semibold text-brand-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailMocks}
                      onChange={() => handleToggleNotification("emailMocks")}
                      className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-0 bg-brand-card"
                    />
                    <span>Send comprehensive AI scoring details via email digests</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Appearance Settings */}
            <section
              id="appearance"
              className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm"
            >
              <h2 className="text-lg font-black text-brand-text border-b border-brand-border pb-3 mb-5">
                Appearance
              </h2>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "light", label: "Light Theme", desc: "Clean white workspace" },
                    { id: "dark", label: "Dark Modern", desc: "Premium high contrast dark mesh" },
                    { id: "system", label: "System Default", desc: "Syncs with your device theme" },
                  ].map((themeOption) => (
                    <button
                      key={themeOption.id}
                      type="button"
                      onClick={() => {
                        setTheme(themeOption.id);
                        toast.success(`Theme changed to ${themeOption.label}`);
                      }}
                      className={`rounded-xl border p-4 text-left hover:scale-[1.02] active:scale-95 transition-all duration-100 cursor-pointer ${
                        theme === themeOption.id
                          ? "border-brand-primary bg-brand-primary/10 text-brand-text ring-4 ring-brand-primary/25"
                          : "border-brand-border bg-brand-bg/30 text-brand-secondary hover:bg-brand-card hover:text-brand-text"
                      }`}
                    >
                      <p className="text-sm font-black">{themeOption.label}</p>
                      <p className="mt-1 text-[10px] font-semibold opacity-70">{themeOption.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
