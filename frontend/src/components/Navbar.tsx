import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Search, Bell, Moon, Sun, ShieldCheck } from "lucide-react";

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock list of notifications matching backend alerts
  const notifications = [
    { id: 1, title: "Low Stock Alert", text: "Enterprise Router Pro v4 is below minimum stock level.", time: "5 mins ago", unread: true },
    { id: 2, title: "Financial Outlier Flagged", text: "Expense of $3,500 for Travel classified as outlier.", time: "1 hour ago", unread: true },
    { id: 3, title: "Lead Converted", text: "Acme Corp lead scoring converted with 95% confidence.", time: "2 hours ago", unread: false },
  ];

  return (
    <header className="glass-panel border-b border-brand-border h-20 px-8 flex items-center justify-between relative z-20">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white capitalize">
          {title.replace("_", " ")}
        </h1>
        <p className="text-xs text-slate-400">BizIntel AI Operations Control</p>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI metrics, clients..."
            className="w-64 bg-brand-slate/40 border border-brand-border/60 hover:border-brand-border focus:border-brand-cyan/60 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-brand-slate/40 border border-brand-border hover:border-slate-500 text-slate-400 hover:text-white cursor-pointer transition-colors"
          title="Toggle Accent Accent"
        >
          {theme === "purple" ? <Sun size={16} className="text-brand-pink" /> : <Moon size={16} className="text-brand-cyan" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-brand-slate/40 border border-brand-border hover:border-slate-500 text-slate-400 hover:text-white cursor-pointer relative transition-colors"
            title="Notifications"
          >
            <Bell size={16} />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-pink animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel border border-brand-border rounded-2xl p-4 shadow-2xl z-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-white">Notifications</span>
                <span className="text-[10px] text-brand-cyan cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border border-brand-border/30 transition-all ${
                      n.unread ? "bg-white/5" : "bg-transparent opacity-70"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-white">{n.title}</span>
                      <span className="text-[9px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-brand-border">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                {user.full_name}
                <ShieldCheck size={12} className="text-brand-cyan" />
              </p>
              <p className="text-[9px] text-brand-violet uppercase tracking-wider font-semibold">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center font-bold text-white text-xs shadow-md border border-white/15">
              {user.full_name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
