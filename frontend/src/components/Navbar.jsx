import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import {
  LayoutDashboard,
  Code2,
  Video,
  History,
  Map,
  BarChart3,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Layers,
  Check
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Global Search / Cmd+K State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);

  // Workspace Switcher State
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Personal Sandbox");

  // Notifications API
  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/users/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleNotificationClick = async (notif) => {
    setNotificationsOpen(false);
    try {
      if (!notif.read) {
        await api.put(`/users/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
      navigate(`/report/${notif.interview}`);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Scroll handler for subtle backdrop updates
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cmd+K palette listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
        setWorkspaceOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 80);
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Practice", path: "/practice", icon: <Code2 className="w-4 h-4" /> },
    { label: "Interview", path: "/create-interview", icon: <Video className="w-4 h-4" /> },
    { label: "History", path: "/history", icon: <History className="w-4 h-4" /> },
    { label: "Roadmap", path: "/roadmap", icon: <Map className="w-4 h-4" /> },
    { label: "Analytics", path: "/analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const commandItems = [
    { label: "Go to Dashboard", category: "Navigation", shortcut: "G D", action: () => navigate("/dashboard") },
    { label: "Go to Practice Hub", category: "Navigation", shortcut: "G P", action: () => navigate("/practice") },
    { label: "Launch Interview Studio", category: "Navigation", shortcut: "G I", action: () => navigate("/create-interview") },
    { label: "View Interview History", category: "Navigation", shortcut: "G H", action: () => navigate("/history") },
    { label: "Open Roadmap Guide", category: "Navigation", shortcut: "G R", action: () => navigate("/roadmap") },
    { label: "View Analytics Hub", category: "Navigation", shortcut: "G A", action: () => navigate("/analytics") },
    { label: "View Profile & Ranks", category: "Navigation", shortcut: "G O", action: () => navigate("/profile") },
    { label: "System Settings", shortcut: "S S", category: "Configuration", action: () => navigate("/settings") },
    { label: "Toggle Dark Mode", shortcut: "T D", category: "Actions", action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
    { label: "Sign Out Account", shortcut: "S O", category: "Actions", action: logout },
  ];

  const filteredCommands = commandItems.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCommandKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
  };

  return (
    <>
      {/* Premium Keyframe Style Overlays */}
      <style>{`
        @keyframes logo-glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.35)) drop-shadow(0 0 10px rgba(147, 51, 234, 0.15));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.65)) drop-shadow(0 0 20px rgba(147, 51, 234, 0.4));
          }
        }
        @keyframes copilot-hover-lift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes notification-bell-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-logo-glow-soft {
          animation: logo-glow-pulse 4s ease-in-out infinite;
        }
        .animate-copilot-hover {
          animation: copilot-hover-lift 3s ease-in-out infinite;
        }
        .animate-bell-badge-pulse {
          animation: notification-bell-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* Floating Navbar Wrapper: Compact Height Constraint (68-72px) */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-40 transition-all duration-300">
        <div className={`w-full h-[68px] flex items-center rounded-2xl border border-brand-border/40 dark:border-white/10 bg-brand-card/70 dark:bg-[#070b13]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 ${isScrolled ? "px-4 border-brand-border/60 dark:border-white/15" : "px-5"
          }`}>
          <div className="w-full flex items-center justify-between gap-3">

            {/* Left Section: Brand Logo & Readable Subtitle */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg/50 dark:bg-slate-900/50 border border-brand-border/60 dark:border-white/10 shadow-lg overflow-hidden animate-logo-glow-soft">
                <span className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/10" />
                <svg
                  viewBox="0 0 24 24"
                  className="relative h-5.5 w-5.5 text-blue-400 transition-transform duration-350 group-hover:scale-110"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 11.5C21 15.64 16.97 19 12 19C10.5 19 9.09 18.66 7.84 18.06L4 19L5.1 15.54C4.4 14.39 4 13.01 4 11.5C4 7.36 8.03 4 12 4C15.97 4 21 7.36 21 11.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8.5" cy="10" r="1.2" className="fill-blue-400" />
                  <circle cx="15.5" cy="9.5" r="1.2" className="fill-purple-400" />
                  <circle cx="12" cy="13" r="1.2" className="fill-cyan-400" />
                  <line x1="8.5" y1="10" x2="12" y2="13" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
                  <line x1="15.5" y1="9.5" x2="12" y2="13" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
                  <path d="M9.5 13.5L11.5 15.5L15 11.5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="hidden sm:flex flex-col select-none gap-0.5">
                <span className="text-sm font-black tracking-tight text-brand-text group-hover:text-blue-400 transition-colors duration-300">
                  MockAI
                </span>
                <span className="text-[7.5px] font-black uppercase tracking-[0.08em] text-brand-secondary leading-none">
                  AI Interview Platform
                </span>
              </div>
            </button>

            {/* Center Section: Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-brand-bg/50 dark:bg-slate-950/20 border border-brand-border dark:border-white/5 p-1 rounded-2xl shrink">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path === "/create-interview" && location.pathname.startsWith("/interview")) ||
                  (item.path !== "/dashboard" && item.path !== "/create-interview" && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-2 xl:px-3 xl:py-2 rounded-xl text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer group/nav ${isActive
                        ? "bg-white/15 dark:bg-white/5 text-blue-500 dark:text-blue-400 border border-brand-border dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                      }`}
                  >
                    <span className={`transition-transform duration-200 group-hover/nav:scale-110 ${isActive ? "text-blue-400" : "text-slate-500 group-hover/nav:text-slate-300"}`}>
                      {item.icon}
                    </span>
                    <span className="hidden xl:inline">{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-[2px] bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Center Search Input (Shown only on larger screens to prevent overflow) */}
            <div className="hidden 2xl:flex items-center relative w-48 3xl:w-60 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between rounded-2xl border border-brand-border bg-brand-bg/40 px-3 py-2 text-xs text-brand-secondary hover:border-blue-500/30 hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-all duration-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-brand-secondary" />
                  <span className="truncate">Search reports...</span>
                </div>
                <span className="rounded bg-slate-200 dark:bg-white/10 border border-brand-border dark:border-white/15 px-1.5 py-0.5 text-[9px] font-black text-brand-secondary dark:text-slate-300 font-mono tracking-tight shrink-0">
                  ⌘K
                </span>
              </button>
            </div>

            {/* Premium AI Copilot CTA */}
            <div className="hidden sm:block shrink-0">
              <button
                type="button"
                onClick={() => navigate("/practice")}
                className="relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 py-2 xl:px-4 xl:py-2.5 text-xs font-black text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_22px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.02] active:scale-95 duration-200 cursor-pointer group overflow-hidden animate-copilot-hover"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                <Sparkles className="w-4 h-4 text-white shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden 2xl:inline">AI Copilot</span>
              </button>
            </div>

            {/* Right Section: Workspace, Notifications & User Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Workspace Switcher */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setWorkspaceOpen(!workspaceOpen)}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-bg/40 hover:bg-slate-150 dark:hover:bg-slate-900/60 transition-all duration-200 px-2.5 py-2 cursor-pointer select-none text-brand-secondary hover:text-brand-text"
                  title="Switch Workspace"
                >
                  <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-[10px] font-black tracking-wide text-brand-text truncate max-w-[80px] hidden 2xl:inline">
                    {activeWorkspace}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-brand-secondary transition-transform duration-200 hidden 2xl:inline ${workspaceOpen ? "rotate-180" : ""}`} />
                </button>

                {workspaceOpen && (
                  <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-2.5 shadow-2xl z-50 animate-dropdown-in">
                    <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest block px-2.5 mb-1.5">Switch Workspace</span>
                    {["Personal Sandbox", "TalentAI Pro"].map((ws) => (
                      <button
                        key={ws}
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setWorkspaceOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black transition-all cursor-pointer ${activeWorkspace === ws
                            ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/10"
                            : "text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text border border-transparent"
                          }`}
                      >
                        <span>{ws}</span>
                        {activeWorkspace === ws && <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Compact Search trigger for smaller screens */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex xl:hidden h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-bg/40 hover:bg-slate-150 dark:hover:bg-slate-900/60 text-brand-secondary hover:text-brand-text transition-all duration-200 cursor-pointer"
                title="Search (⌘K)"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle Button: Matched height and styling */}
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-bg/40 hover:bg-slate-150 dark:hover:bg-slate-900/60 text-brand-secondary hover:text-brand-text transition-all duration-200 cursor-pointer"
                title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Bell Dropdown: Pulsing Badge */}
              {token && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-bg/40 hover:bg-slate-150 dark:hover:bg-slate-900/60 text-brand-secondary hover:text-brand-text transition-all duration-200 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white ring-2 ring-brand-card animate-bell-badge-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-2.5 shadow-2xl z-50 animate-dropdown-in">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-brand-border mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-text">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[9px] font-extrabold text-blue-400">{unreadCount} unread</span>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-[10px] text-slate-500 font-semibold">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left rounded-xl p-3 border transition active:scale-98 duration-100 cursor-pointer flex gap-3 ${notif.read
                                  ? "border-transparent bg-transparent hover:bg-white/5"
                                  : "border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10"
                                }`}
                            >
                              <div className={`h-7.5 w-7.5 rounded-full shrink-0 flex items-center justify-center ${notif.eligible
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                {notif.eligible ? "✓" : "⚡"}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[9px] text-slate-500 font-bold mt-1.5 block">
                                  {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {notif.eligible ? "Eligible" : "Reviewed"}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Section: Premium User Card */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-bg/40 hover:bg-slate-150 dark:hover:bg-slate-900/60 transition-all duration-200 p-1 cursor-pointer pr-2.5 relative select-none"
                >
                  <div className="relative h-7.5 w-7.5 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center text-xs font-black uppercase text-white shadow-md">
                    {(user?.name || "U").charAt(0)}
                    {/* Glowing online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <span className="hidden 2xl:inline-block text-[10px] font-black text-brand-text leading-none max-w-[80px] truncate">
                    {user?.name || "Candidate"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-secondary" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-2.5 shadow-2xl animate-dropdown-in z-50">
                    <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-brand-bg/60 p-3 border border-brand-border">
                      <span className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black uppercase text-white shadow-sm shrink-0">
                        {(user?.name || "U").charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-brand-text">
                          {user?.name || "Candidate"}
                        </p>
                        <p className="truncate text-[9px] font-bold text-brand-secondary mt-0.5">
                          {user?.email || "Account Profile"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-secondary" />
                        Profile & Ranks
                      </span>
                      <span className="text-[8px] font-black text-brand-secondary bg-brand-bg border border-brand-border px-2 py-0.5 rounded">Ranks</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/settings");
                      }}
                      className="mt-0.5 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-brand-secondary" />
                        Settings
                      </span>
                      <span className="text-[8px] font-black text-brand-secondary bg-brand-bg border border-brand-border px-2 py-0.5 rounded">Setup</span>
                    </button>

                    <div className="border-t border-brand-border my-1.5" />

                    <button
                      onClick={logout}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black text-rose-450 dark:text-rose-400 hover:bg-rose-500/10 active:scale-95 duration-100 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-450" />
                        Logout Account
                      </span>
                      <span className="text-[8px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">Exit</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-bg/40 text-brand-secondary hover:text-brand-text lg:hidden cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden w-full border border-brand-border bg-brand-card rounded-[24px] mt-2 p-5 shadow-2xl overflow-y-auto animate-dropdown-in max-h-[80vh]">
            <div className="flex flex-col gap-5">

              {/* Search shortcut for mobile */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-2xl border border-brand-border bg-brand-bg/40 px-3.5 py-3 text-xs text-brand-secondary"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Search interviews, questions...</span>
              </button>

              {/* Navigation Items */}
              <div className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path === "/create-interview" && location.pathname.startsWith("/interview")) ||
                    (item.path !== "/dashboard" && item.path !== "/create-interview" && location.pathname.startsWith(item.path));
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 text-left w-full cursor-pointer ${isActive
                          ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-400 border border-blue-500/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <span className={isActive ? "text-blue-400" : "text-slate-500"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Premium Copilot for mobile */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/practice");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-violet-650 py-3 text-xs font-black text-white shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5" />
                <span>Launch AI Copilot</span>
              </button>

              <div className="border-t border-white/5" />

              {/* Profile card */}
              <div className="flex items-center gap-2.5 rounded-xl bg-brand-bg/40 p-3.5 border border-brand-border">
                <span className="flex h-9.5 w-9.5 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black uppercase text-white shadow-sm shrink-0">
                  {(user?.name || "U").charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-brand-text">
                    {user?.name || "Candidate"}
                  </p>
                  <p className="truncate text-[9px] font-bold text-brand-secondary mt-0.5">
                    {user?.email || "Account Workspace"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-brand-bg/40 p-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-205"
                >
                  <User className="w-4.5 h-4.5 text-brand-secondary" />
                  <span className="text-[9px] font-black text-brand-secondary">Profile & Ranks</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-brand-bg/40 p-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-205"
                >
                  <SettingsIcon className="w-4.5 h-4.5 text-brand-secondary" />
                  <span className="text-[9px] font-black text-brand-secondary">Settings</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 py-3 text-xs font-black text-rose-400 cursor-pointer"
              >
                Logout Account
              </button>
            </div>
          </div>
        )}

      </header>

      {/* Spacer matching compact height */}
      <div className="h-24 select-none pointer-events-none" />

      {/* Command Palette (Cmd+K Modal) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/65 backdrop-blur-md transition-opacity"
          />

          <div className="relative w-full max-w-xl rounded-2xl border border-brand-border bg-brand-card p-4 shadow-2xl animate-dropdown-in flex flex-col max-h-[60vh] text-brand-text">
            <div className="flex items-center gap-3 border-b border-brand-border pb-3 mb-3.5">
              <Search className="w-5 h-5 text-brand-secondary shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleCommandKeyDown}
                placeholder="Search interviews, questions, categories, actions..."
                className="w-full bg-transparent text-sm text-brand-text font-semibold outline-none placeholder-slate-500"
              />
              <span className="rounded bg-brand-bg px-2 py-0.5 text-[9px] font-black text-brand-secondary font-mono tracking-tight shrink-0 select-none border border-brand-border">
                ESC
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {filteredCommands.length > 0 ? (
                Object.entries(
                  filteredCommands.reduce((acc, cmd) => {
                    acc[cmd.category] = acc[cmd.category] || [];
                    acc[cmd.category].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category} className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-2.5">
                      {category}
                    </span>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const globalIdx = filteredCommands.indexOf(item);
                        const isChosen = globalIdx === selectedIndex;
                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              item.action();
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-left transition-all cursor-pointer ${isChosen
                                ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-400 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.1)]"
                                : "text-brand-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-text border border-transparent"
                              }`}
                          >
                            <span className="font-bold">{item.label}</span>
                            {item.shortcut && (
                              <span className="rounded bg-brand-bg border border-brand-border px-2 py-0.5 text-[9px] font-black text-brand-secondary font-mono tracking-wider">
                                {item.shortcut}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 font-semibold">
                  No matching workspace actions found for "{searchQuery}".
                </div>
              )}
            </div>

            <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest select-none">
              <span>↑↓ Arrow keys to navigate</span>
              <span>ENTER to launch</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
