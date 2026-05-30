import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Boxes,
  CreditCard,
  TrendingUp,
  Cpu,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "crm", label: "CRM Intelligence", icon: Users },
    { id: "inventory", label: "Inventory Intel", icon: Boxes },
    { id: "finance", label: "Finance & Billing", icon: CreditCard },
    { id: "predictions", label: "Predictive Analytics", icon: TrendingUp },
    { id: "models_lab", label: "AI Models Lab", icon: Cpu },
    { id: "reports", label: "Reports Module", icon: FileText },
  ];

  const activeColor = theme === "purple" ? "text-brand-pink" : "text-brand-cyan";
  const activeBg = theme === "purple" ? "bg-brand-violet/20 border-brand-pink/50" : "bg-brand-cyan/15 border-brand-cyan/40";

  return (
    <div
      className={`glass-panel border-r border-brand-border h-screen flex flex-col justify-between transition-all duration-300 relative z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-brand-bg border border-brand-border text-slate-400 hover:text-white rounded-full p-1 cursor-pointer z-40 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-cyan shadow-[0_0_15px_rgba(139,92,246,0.4)]`}>
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-300">
              BizIntel <span className="text-brand-cyan font-light">AI</span>
            </span>
          )}
        </div>

        {/* User Brief Profile when expanded */}
        {!isCollapsed && user && (
          <div className="mx-4 mb-6 p-4 rounded-xl bg-brand-slate/50 border border-brand-border/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-violet to-brand-pink flex items-center justify-center font-bold text-white text-sm shadow-md">
              {user.full_name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-semibold uppercase">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Menu Items List */}
        <nav className="mt-4 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-transparent font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? `${activeBg} ${activeColor}`
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <Icon size={18} className={isActive ? "" : "text-slate-400"} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Area */}
      <div className="p-4">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-transparent font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Logout"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
