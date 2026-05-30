import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, KeyRound, Mail, AlertCircle, ArrowLeft } from "lucide-react";

interface LoginProps {
  onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="bg-brand-bg min-h-screen flex items-center justify-center relative px-4 cyber-grid">
      {/* Glow effects */}
      <div className="glow-orb glow-orb-primary w-[350px] h-[350px] top-1/4 left-1/4" />
      <div className="glow-orb glow-orb-secondary w-[400px] h-[400px] bottom-1/4 right-1/4" />

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-8 left-8 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Product Site
      </button>

      <div className="w-full max-w-md glass-panel border border-brand-border rounded-2xl p-8 relative z-10 shadow-2xl">
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan shadow-xl shadow-brand-violet/20 mb-4">
            <Sparkles size={26} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Access Operations Node</h2>
          <p className="text-slate-400 text-xs mt-1">Authenticate credentials to synchronize dashboards</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@bizintel.ai"
                className="w-full bg-brand-bg/80 border border-brand-border/60 hover:border-brand-border focus:border-brand-cyan/60 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password Auth
            </label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-bg/80 border border-brand-border/60 hover:border-brand-border focus:border-brand-cyan/60 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold btn-neon-violet cursor-pointer text-white flex items-center justify-center"
          >
            {loading ? "Authenticating session..." : "Verify Identity"}
          </button>
        </form>

        {/* Preset Credential Picker */}
        <div className="mt-8 pt-6 border-t border-brand-border/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
            Demo Portal Credentials (Quick Selection)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => selectPreset("admin@bizintel.ai", "adminpassword")}
              className="py-2 px-1 text-[10px] rounded-lg border border-brand-border bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer text-center font-semibold truncate"
              title="Admin role (Full privileges)"
            >
              Enterprise Admin
            </button>
            <button
              onClick={() => selectPreset("manager@bizintel.ai", "managerpassword")}
              className="py-2 px-1 text-[10px] rounded-lg border border-brand-border bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer text-center font-semibold truncate"
              title="Manager role (Writes / Retraining)"
            >
              Operations Mgr
            </button>
            <button
              onClick={() => selectPreset("employee@bizintel.ai", "employeepassword")}
              className="py-2 px-1 text-[10px] rounded-lg border border-brand-border bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer text-center font-semibold truncate"
              title="Employee role (Read-only)"
            >
              Staff Analyst
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
