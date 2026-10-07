import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  AlertCircle, 
  Clock, 
  CheckCheck, 
  Trash2, 
  ArrowRight,
  Filter,
  Flame,
  Target
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "../utils/toast";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get("/users/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Fallback demo notifications if empty API
      setNotifications([
        {
          _id: "notif-1",
          message: "Congratulations! You completed the Mock Interview: Full Stack Arrays & Algorithms with an 8.5/10 score.",
          read: false,
          eligible: true,
          interview: "mock-123",
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          _id: "notif-2",
          message: "Your profile has reached the TOP 5% Solver badge ranking in Weekly Problem Solving!",
          read: false,
          eligible: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        },
        {
          _id: "notif-3",
          message: "Daily Streak Alert: You have maintained a 136-day coding streak. Keep building!",
          read: true,
          eligible: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          _id: "notif-4",
          message: "System Update: CodeForge 2.0 AI Resume Intelligence is now available in your profile.",
          read: true,
          eligible: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) =>
          api.put(`/users/notifications/${n._id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => {})
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read!");
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.read && notif._id) {
      try {
        await api.put(`/users/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error("Error marking read:", err);
      }
    }

    const targetId = notif.interview || notif.interviewId || notif.reportId;
    if (targetId) {
      navigate(`/interview/${targetId}/responses`);
    } else {
      navigate("/history");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins || 1}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 max-w-5xl mx-auto space-y-3.5">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-card border border-brand-border rounded-sm p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-brand-primary/15 text-brand-primary flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight flex items-center gap-2">
                <span>Notifications Center</span>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black">
                    {unreadCount} Unread
                  </span>
                )}
              </h1>
              <p className="text-xs font-semibold text-brand-muted mt-0.5">
                Stay updated with interview results, streak milestones, and platform alerts.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-sm bg-brand-elevated hover:bg-brand-border border border-brand-border text-xs font-bold text-brand-text transition-colors flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* FILTER BAR & COUNTS */}
        <div className="flex items-center justify-between gap-3 border-b border-brand-border pb-3">
          <div className="flex items-center gap-1.5 bg-brand-card p-1 rounded-sm border border-brand-border">
            {[
              { id: "all", label: `All (${notifications.length})` },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "read", label: `Read (${notifications.length - unreadCount})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                  filter === f.id
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-elevated"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-brand-muted hidden sm:inline">
            Showing {filteredNotifications.length} notifications
          </span>
        </div>

        {/* NOTIFICATION ITEMS LIST */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-brand-card border border-brand-border rounded-sm animate-pulse" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-brand-card border border-brand-border rounded-sm p-12 text-center space-y-3 shadow-sm">
              <Bell className="w-12 h-12 text-brand-muted mx-auto opacity-40" />
              <h3 className="text-sm font-black text-brand-text">No Notifications Found</h3>
              <p className="text-xs font-semibold text-brand-muted max-w-sm mx-auto">
                {filter === "unread" 
                  ? "You have read all your notifications!" 
                  : "Notifications about your interview scores and streaks will appear here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleItemClick(notif)}
                className={`p-4 rounded-sm border transition-all cursor-pointer flex items-start justify-between gap-4 shadow-2xs group ${
                  notif.read
                    ? "bg-brand-card border-brand-border hover:border-brand-primary/30 opacity-90"
                    : "bg-brand-elevated border-amber-500/30 hover:border-amber-500/50 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon Indicator */}
                  <div
                    className={`w-9 h-9 rounded-sm flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                      notif.eligible !== false
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {notif.eligible !== false ? (
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    ) : (
                      <Sparkles className="w-4.5 h-4.5" />
                    )}
                  </div>

                  {/* Message & Time */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
                      )}
                      <p className={`text-xs sm:text-sm font-bold ${notif.read ? "text-brand-text" : "text-brand-text font-black"}`}>
                        {notif.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-brand-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-muted" />
                        <span>{formatTimestamp(notif.createdAt)}</span>
                      </span>
                      {notif.interview && (
                        <span className="text-brand-primary font-bold hover:underline flex items-center gap-1">
                          <span>View Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
