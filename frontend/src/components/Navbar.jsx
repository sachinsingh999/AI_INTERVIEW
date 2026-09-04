import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";
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
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  Flame,
  HelpCircle,
  Menu
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  // Breadcrumbs Helper
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = ["CodeForge"];
    if (path === "/dashboard") crumbs.push("Dashboard");
    else if (path.startsWith("/practice")) crumbs.push("AI Practice");
    else if (path.startsWith("/interview") || path.startsWith("/create-interview")) crumbs.push("Assessments");
    else if (path.startsWith("/history")) crumbs.push("History");
    else if (path.startsWith("/roadmap")) crumbs.push("Roadmap");
    else if (path.startsWith("/analytics")) crumbs.push("Analytics");
    else if (path.startsWith("/settings")) crumbs.push("Settings");
    else if (path.startsWith("/profile")) crumbs.push("Profile");
    else crumbs.push("Overview");
    return crumbs;
  };

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Global Search / Cmd+K State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);


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

  const handleNotificationClick = (notif) => {
    setNotificationsOpen(false);
    // Mark as read in background non-blocking
    if (notif._id && !notif.read && token) {
      api.put(`/users/notifications/${notif._id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch((err) => console.error("Error marking notification read:", err));
      setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
    }

    const interviewId = notif.interview || notif.interviewId || notif.reportId;
    if (interviewId) {
      navigate(`/interview/${interviewId}/responses`);
    } else {
      navigate("/history");
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

  // Cmd+K and Ctrl+B keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
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

  const mainItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { label: "Practice", path: "/practice", icon: <Code2 className="w-4.5 h-4.5" /> },
    { label: "Interview", path: "/create-interview", icon: <Video className="w-4.5 h-4.5" /> },
    { label: "Roadmap", path: "/roadmap", icon: <Map className="w-4.5 h-4.5" /> },
    { label: "History", path: "/history", icon: <History className="w-4.5 h-4.5" /> },
    { label: "Analytics", path: "/analytics", icon: <BarChart3 className="w-4.5 h-4.5" /> },
  ];

  const quickAccessItems = [
    { label: "Bookmarks", path: "/dashboard", icon: <Star className="w-4.5 h-4.5" /> },
    { label: "Daily Challenge", path: "/practice", icon: <Target className="w-4.5 h-4.5" /> },
    { label: "Streaks", path: "/dashboard", icon: <Flame className="w-4.5 h-4.5" /> },
  ];

  const settingsItems = [
    { label: "Profile", path: "/profile", icon: <User className="w-4.5 h-4.5" /> },
    { label: "Notifications", path: "/notifications", icon: <Bell className="w-4.5 h-4.5" />, badge: unreadCount > 0 ? unreadCount : 3 },
    { label: "Help & Support", path: "/dashboard", icon: <HelpCircle className="w-4.5 h-4.5" /> },
    { label: "Settings", path: "/settings", icon: <SettingsIcon className="w-4.5 h-4.5" /> },
    { label: "Dark Mode", path: null, icon: <Moon className="w-4.5 h-4.5" />, toggle: true },
  ];

  const commandItems = [
    { label: "Launch ForgeAI Studio", category: "AI Assistant", shortcut: "G F", action: () => navigate("/forge-ai") },
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

      {/* CSS Selector to offset main content and adjust search bar on desktop */}
      <style>{`
        @media (min-width: 1024px) {
          main, footer {
            margin-left: ${isSidebarCollapsed ? "5rem" : "16rem"} !important;
            width: calc(100% - ${isSidebarCollapsed ? "5rem" : "16rem"}) !important;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>

      {/* Global Top Navbar: spans full-width on all viewports with warm yellowish ambient tone */}
      <header
        id="sidebar-nav-desktop-header"
        className={`fixed top-0 left-0 right-0 w-full h-[76px] z-50 border-b border-brand-border/40 bg-[#FFFDF7]/95 dark:bg-[#0A0D15]/95 backdrop-blur-xl transition-all duration-300 ${isScrolled ? "shadow-md shadow-slate-900/5" : ""}`}
      >
        <div className="w-full h-full flex items-center justify-between px-4 sm:px-8">
          {/* Brand Logo & Breadcrumbs - Aligned far left */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center group cursor-pointer shrink-0"
            >
              <Logo className="h-16 shrink-0 transition-transform duration-300 group-hover:scale-105" />
            </button>


          </div>

          {/* Desktop Right Side Controls (lg+ viewports) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-between rounded-sm border border-brand-border bg-brand-bg/40 px-3 py-2 text-xs text-brand-secondary hover:border-blue-550/30 hover:bg-slate-150 dark:hover:bg-slate-900/60 transition-all duration-200 cursor-pointer w-48 xl:w-56"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-brand-secondary" />
                <span className="truncate">Search reports...</span>
              </div>
              <span className="rounded-sm bg-slate-200 dark:bg-white/10 border border-brand-border dark:border-white/15 px-1.5 py-0.5 text-[9px] font-black text-brand-secondary dark:text-slate-300 font-mono tracking-tight shrink-0">
                ⌘K
              </span>
            </button>

            {/* Premium ForgeAI CTA */}
            <button
              type="button"
              onClick={() => navigate("/forge-ai")}
              className="relative inline-flex items-center gap-1.5 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] px-3.5 py-2.5 text-xs font-black text-[#0F172A] shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:shadow-[0_0_22px_rgba(245,158,11,0.55)] transition-all hover:scale-[1.02] active:scale-95 duration-200 cursor-pointer group overflow-hidden"
            >
              <Sparkles className="w-4 h-4 text-[#0F172A] shrink-0 group-hover:rotate-12 transition-transform duration-300" />
              <span>ForgeAI</span>
            </button>
          </div>

          {/* Mobile Action Controls (lg- viewports) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-brand-border bg-brand-bg/40 text-brand-secondary hover:text-brand-text transition-all duration-200 cursor-pointer"
              title="Switch Theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#F59E0B]" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-brand-border bg-brand-bg/40 text-brand-secondary hover:text-brand-text cursor-pointer"
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

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="w-full border-t border-brand-border/40 bg-brand-card p-5 shadow-2xl overflow-y-auto animate-dropdown-in max-h-[80vh] flex flex-col gap-5 lg:hidden">
            {/* Search shortcut for mobile */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center gap-2.5 rounded-sm border border-brand-border bg-brand-bg/40 px-3.5 py-3 text-xs text-brand-secondary"
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
                    className={`flex items-center gap-3 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 text-left w-full cursor-pointer ${isActive
                        ? "bg-[#F59E0B]/15 text-amber-700 dark:text-amber-400 border border-[#F59E0B]/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <span className={isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Premium ForgeAI for mobile */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/forge-ai");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#F59E0B] hover:bg-[#D97706] py-3 text-xs font-black text-[#0F172A] shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span>Launch ForgeAI</span>
            </button>

            <div className="border-t border-white/5" />

            {/* Profile card */}
            <div className="flex items-center gap-2.5 rounded-sm bg-brand-bg/40 p-3.5 border border-brand-border">
              <span className="flex h-9.5 w-9.5 items-center justify-center rounded-sm bg-[#F59E0B] text-xs font-black uppercase text-[#0F172A] shadow-sm shrink-0">
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
                className="flex flex-col items-center justify-center gap-1.5 rounded-sm border border-brand-border bg-brand-bg/40 p-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-205"
              >
                <User className="w-4.5 h-4.5 text-brand-secondary" />
                <span className="text-[9px] font-black text-brand-secondary">Profile & Ranks</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/settings");
                }}
                className="flex flex-col items-center justify-center gap-1.5 rounded-sm border border-brand-border bg-brand-bg/40 p-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-205"
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
              className="w-full flex items-center justify-center gap-2 rounded-sm border border-rose-500/20 bg-rose-500/5 py-3 text-xs font-black text-rose-450 cursor-pointer"
            >
              Logout Account
            </button>
          </div>
        )}
      </header>

      {/* Desktop Sidebar: rendered fixed below the header with warm yellowish amber tone */}
      <aside
        id="sidebar-nav-desktop"
        className={`hidden lg:flex fixed top-[76px] left-0 bottom-0 z-40 bg-[#FFFDF7] dark:bg-[#080d17] border-r border-brand-border/40 flex-col py-4 px-3 justify-between transition-all duration-300 overflow-x-hidden ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="space-y-4 flex flex-col h-full min-h-0">

          {/* Categorized Menu Scroll Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3.5 py-1.5 pr-1 min-h-0 select-none no-scrollbar">
            {/* MAIN Category */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase block px-3 py-0.5">
                  MAIN
                </span>
              )}
              <div className="space-y-0.5">
                {mainItems.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path === "/create-interview" && location.pathname.startsWith("/interview")) ||
                    (item.path !== "/dashboard" && item.path !== "/create-interview" && location.pathname.startsWith(item.path));
                  return (
                    <div key={item.label} className="relative group">
                      <button
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-3 py-1.5 w-full rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 text-left cursor-pointer group/btn ${
                          isActive
                            ? "bg-[#F59E0B]/15 text-amber-700 dark:text-amber-400 border border-[#F59E0B]/30"
                            : "text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                        } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <span className={`transition-transform duration-250 group-hover/btn:scale-110 shrink-0 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500 group-hover/btn:text-slate-205"}`}>
                          {item.icon}
                        </span>
                        <span className={`transition-all duration-300 origin-left whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none hidden" : "w-auto opacity-100"}`}>
                          {item.label}
                        </span>
                      </button>

                      {isSidebarCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-sm border border-brand-border bg-slate-900 dark:bg-[#070b13] text-white text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK ACCESS Category */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase block px-3 py-0.5">
                  QUICK ACCESS
                </span>
              )}
              <div className="space-y-0.5">
                {quickAccessItems.map((item) => {
                  return (
                    <div key={item.label} className="relative group">
                      <button
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-3 py-1.5 w-full rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 text-left cursor-pointer group/btn text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <span className="transition-transform duration-250 group-hover/btn:scale-110 shrink-0 text-slate-400 dark:text-slate-500 group-hover/btn:text-slate-205">
                          {item.icon}
                        </span>
                        <span className={`transition-all duration-300 origin-left whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none hidden" : "w-auto opacity-100"}`}>
                          {item.label}
                        </span>
                      </button>

                      {isSidebarCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-sm border border-brand-border bg-slate-900 dark:bg-[#070b13] text-white text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SETTINGS Category */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase block px-3 py-0.5">
                  SETTINGS
                </span>
              )}
              <div className="space-y-0.5">
                {settingsItems.map((item) => {
                  const isActive = item.path && location.pathname === item.path;
                  const isDarkModeItem = item.toggle;
                  const isNotificationsItem = item.label === "Notifications";

                  return (
                    <div key={item.label} className="relative group">
                      <button
                        onClick={() => {
                          if (isDarkModeItem) {
                            setTheme(resolvedTheme === "dark" ? "light" : "dark");
                          } else if (isNotificationsItem) {
                            setNotificationsOpen(!notificationsOpen);
                            navigate("/notifications");
                          } else if (item.path) {
                            navigate(item.path);
                          }
                        }}
                        className={`flex items-center gap-3 px-3 py-1.5 w-full rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 text-left cursor-pointer group/btn ${
                          isActive
                            ? "bg-[#F59E0B]/15 text-amber-700 dark:text-amber-400 border border-[#F59E0B]/30"
                            : "text-brand-secondary hover:text-brand-text hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                        } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <span className={`transition-transform duration-250 group-hover/btn:scale-110 shrink-0 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500 group-hover/btn:text-slate-205"}`}>
                          {item.icon}
                        </span>
                        <span className={`transition-all duration-300 origin-left whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none hidden" : "w-auto opacity-100"}`}>
                          {item.label}
                        </span>

                        {/* Notifications Badge */}
                        {!isSidebarCollapsed && isNotificationsItem && item.badge > 0 && (
                          <span className="bg-[#F59E0B] text-[#0F172A] rounded-full text-[9px] font-black h-4 min-w-4 flex items-center justify-center px-1 shrink-0 ml-auto select-none shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                            {item.badge}
                          </span>
                        )}

                        {/* Dark Mode Switch Toggle */}
                        {!isSidebarCollapsed && isDarkModeItem && (
                          <div className="ml-auto flex items-center">
                            <div className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${resolvedTheme === "dark" ? "bg-[#F59E0B]" : "bg-slate-700"}`}>
                              <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${resolvedTheme === "dark" ? "translate-x-3.5" : "translate-x-0"}`} />
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Notifications Dropdown (Popout layout to the right of the sidebar, never overlapping menu links) */}
                      {isNotificationsItem && notificationsOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-[9990] bg-transparent" 
                            onClick={() => setNotificationsOpen(false)} 
                          />
                          <div className="absolute left-full bottom-0 ml-3.5 w-80 overflow-hidden rounded-sm border border-brand-border bg-brand-card p-3 shadow-2xl z-[9999] animate-dropdown-in">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-brand-border mb-2">
                              <span className="text-xs font-black uppercase tracking-wider text-brand-text">Notifications</span>
                              {unreadCount > 0 && (
                                <span className="text-[10px] font-extrabold text-amber-500">{unreadCount} unread</span>
                              )}
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-1.5 no-scrollbar">
                              {notifications.length === 0 ? (
                                <div className="py-8 text-center text-xs text-brand-muted font-semibold">
                                  No notifications yet.
                                </div>
                              ) : (
                                notifications.map((notif) => (
                                  <button
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left rounded-sm p-3 border transition active:scale-98 duration-100 cursor-pointer flex gap-3 ${
                                      notif.read
                                        ? "border-transparent bg-brand-elevated/40 hover:bg-brand-elevated"
                                        : "border-[#F59E0B]/20 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/15"
                                    }`}
                                  >
                                    <div className={`h-7.5 w-7.5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                                      notif.eligible
                                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20"
                                        : "bg-rose-500/15 text-rose-500 border border-rose-500/20"
                                    }`}>
                                      {notif.eligible ? "✓" : "⚡"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-brand-text leading-relaxed">
                                        {notif.message}
                                      </p>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                            <div className="pt-2 border-t border-brand-border mt-2 text-center">
                              <button
                                onClick={() => {
                                  setNotificationsOpen(false);
                                  navigate("/notifications");
                                }}
                                className="text-[11px] font-extrabold text-amber-500 hover:underline cursor-pointer"
                              >
                                View Notifications Center →
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {isSidebarCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-sm border border-brand-border bg-slate-900 dark:bg-[#070b13] text-white text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Combined User Profile & Actions Footer - Single Line Icon Layout */}
          <div className="pt-2 px-1 shrink-0">
            {!isSidebarCollapsed ? (
              <div className="rounded-sm border border-brand-border dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-1.5 flex items-center justify-between gap-1.5">
                {/* Profile info button */}
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 min-w-0 flex-1 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-sm transition cursor-pointer text-left select-none"
                  title="View Profile"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F59E0B] text-xs font-black uppercase text-[#0F172A] shrink-0 shadow-md">
                    {(user?.name || "SK").substring(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                      {user?.name || "Sachin Kumar"}
                    </div>
                    <div className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                      Premium User 👑
                    </div>
                  </div>
                </button>

                {/* Icon-only Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Sign Out Icon Button */}
                  <button
                    onClick={logout}
                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-500 transition cursor-pointer active:scale-95 duration-100"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                  </button>

                  {/* Collapse Sidebar Icon Button */}
                  <button
                    onClick={toggleSidebar}
                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-brand-border bg-brand-bg/40 text-brand-secondary hover:text-brand-text hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
                    title="Collapse Sidebar (Ctrl+B)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Collapsed state footer
              <div className="flex flex-col items-center gap-3">
                {/* Profile Avatar */}
                <div className="relative group w-full flex justify-center">
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex h-8 w-8 items-center justify-center rounded-sm bg-indigo-600 text-xs font-black uppercase text-white shrink-0 shadow-md hover:scale-105 transition cursor-pointer"
                  >
                    {(user?.name || "SK").substring(0, 2).toUpperCase()}
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-sm border border-brand-border bg-slate-900 dark:bg-[#070b13] text-white text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                    Profile
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="relative group w-full flex justify-center">
                  <button
                    onClick={logout}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-500 transition cursor-pointer active:scale-95 duration-100"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-sm border border-rose-500/20 bg-rose-950 text-rose-350 text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                    Sign Out
                  </div>
                </div>

                {/* Expand Toggle Button */}
                <div className="relative group w-full flex justify-center">
                  <button
                    onClick={toggleSidebar}
                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-brand-border bg-brand-bg/40 text-brand-secondary hover:text-brand-text hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-sm border border-brand-border bg-slate-900 dark:bg-[#070b13] text-white text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                    Expand Sidebar (Ctrl+B)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer matching top header height on all viewports */}
      <div className="h-[76px] select-none pointer-events-none w-full" />

      {/* Command Palette (Cmd+K Modal) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/65 backdrop-blur-md transition-opacity"
          />

          <div className="relative w-full max-w-xl rounded-sm border border-brand-border bg-brand-card p-4 shadow-2xl animate-dropdown-in flex flex-col max-h-[60vh] text-brand-text">
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
                            className={`w-full flex items-center justify-between rounded-sm px-3.5 py-2.5 text-xs font-semibold text-left transition-all cursor-pointer ${isChosen
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
                  No matching actions found for "{searchQuery}".
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
