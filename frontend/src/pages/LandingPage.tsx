import React, { useState } from "react";
import { Sparkles, ArrowRight, Zap, ShieldAlert, Cpu, BarChart3, Users, DollarSign, ArrowUpRight, CheckCircle2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onExploreAI: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDashboard, onExploreAI }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    { title: "Revenue Forecasting", desc: "ARIMA time-series projections model multi-year revenue horizons.", icon: BarChart3, color: "text-brand-cyan", bg: "bg-brand-cyan/10 border-brand-cyan/20" },
    { title: "Fraud Detection Scan", desc: "Isolation Forest algorithm audits transaction logs to detect anomalies.", icon: ShieldAlert, color: "text-brand-pink", bg: "bg-brand-pink/10 border-brand-pink/20" },
    { title: "CRM Churn Assessment", desc: "Random Forest assesses account risk metrics and support telemetry.", icon: Users, color: "text-brand-violet", bg: "bg-brand-violet/10 border-brand-violet/20" },
    { title: "Demand Intelligence", desc: "Gradient boosting regressor predicts inventory levels based on promotions.", icon: Cpu, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  ];

  const modules = [
    { name: "Models Lab Sandbox", val: "Tuning scikit-learn training states with conf matrix overlays.", icon: Zap },
    { name: "Financial Invoices", val: "GST-compliant invoicing and duplicate invoice flagging filters.", icon: DollarSign }
  ];

  const faqItems = [
    { q: "How do the machine learning algorithms train?", a: "BizIntel AI utilizes scikit-learn and statsmodels inside a FastAPI engine to run actual regressions, decision forests, and anomaly models on database transactions." },
    { q: "Can we link a live Supabase or PostgreSQL database?", a: "Yes. By configuring the connection parameters in settings.py, FastAPI redirects transactions to your database server. A local SQLite fallback acts as local host." },
    { q: "Is the platform responsive for mobile viewports?", a: "Yes, the UI utilizes Tailwind fluid grid systems to adapt controls across mobile, tablet, and desktop display dimensions." }
  ];

  return (
    <div className="bg-brand-bg text-slate-100 min-h-screen relative overflow-hidden cyber-grid">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary w-[500px] h-[500px] top-[-100px] left-[-100px]" />
      <div className="glow-orb glow-orb-secondary w-[600px] h-[600px] bottom-[-200px] right-[-100px]" />

      {/* Header / Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-cyan shadow-lg shadow-brand-violet/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
            BizIntel <span className="text-brand-cyan font-light">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={onLaunchDashboard}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-brand-border bg-white/5 hover:bg-white/10 hover:border-slate-500 cursor-pointer transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onLaunchDashboard}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold btn-neon-cyan cursor-pointer text-brand-bg font-extrabold"
          >
            Launch Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-[11px] font-bold uppercase tracking-wider mb-6 animate-pulse-slow">
            <Sparkles size={12} /> The Enterprise Intelligence Frontier
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            AI-Powered Business <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-indigo-400 to-brand-violet">
              Intelligence Platform
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Predict customer churn, forecast revenue trends, audit expenses for anomalies, and manage inventory levels using state-of-the-art Machine Learning algorithms.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onLaunchDashboard}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold btn-neon-violet flex items-center justify-center gap-2 cursor-pointer text-white"
            >
              Launch Dashboard <ArrowRight size={16} />
            </button>
            <button
              onClick={onExploreAI}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold border border-brand-border bg-white/5 hover:bg-white/10 hover:border-slate-500 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              Explore AI Features
            </button>
          </div>
        </motion.div>

        {/* 3D Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-5xl mx-auto relative group mt-6"
        >
          <div className="absolute -inset-1 bg-gradient-to-tr from-brand-violet to-brand-cyan rounded-2xl blur-xl opacity-30 group-hover:opacity-45 transition duration-1000" />
          <div className="glass-panel border border-brand-border/40 rounded-2xl p-3 overflow-hidden shadow-2xl relative">
            <div className="bg-brand-bg/90 rounded-xl overflow-hidden border border-brand-border/20 p-4">
              {/* Fake Window Header */}
              <div className="flex justify-between items-center pb-4 border-b border-brand-border/30 mb-4">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-white/5 border border-brand-border/30 px-6 py-0.5 rounded-md text-[10px] text-slate-500">
                  app.bizintel.ai/dashboard
                </div>
                <span className="w-4" />
              </div>
              {/* Fake dashboard content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-xl bg-white/5 border border-brand-border/20 relative overflow-hidden">
                  <p className="text-[10px] text-slate-400">Total Net Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">$458,240.50</p>
                  <div className="w-full h-8 bg-brand-cyan/5 border-t border-brand-cyan/20 mt-4 rounded flex items-center justify-center text-[10px] text-brand-cyan">
                    +14.2% Growth Period
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-brand-border/20">
                  <p className="text-[10px] text-slate-400">AI Health Assessment</p>
                  <p className="text-2xl font-bold text-brand-cyan mt-1">94% Score</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div className="bg-brand-cyan h-full w-[94%]" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-brand-border/20">
                  <p className="text-[10px] text-slate-400">Anomalies Detected</p>
                  <p className="text-2xl font-bold text-brand-pink mt-1">2 Flagged</p>
                  <div className="w-full h-8 bg-brand-pink/5 border-t border-brand-pink/20 mt-4 rounded flex items-center justify-center text-[10px] text-brand-pink">
                    Isolation Forest Active
                  </div>
                </div>
              </div>
              <div className="h-32 bg-gradient-to-t from-transparent to-brand-violet/5 border border-brand-border/20 rounded-xl mt-4 flex items-center justify-center text-slate-500 text-xs">
                Revenue Forecasting ARIMA Regression Model Active
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">Enterprise Machine Learning Suite</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Deep mathematical classifications and predictions mapped directly to operations telemetry.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={`p-6 rounded-2xl glass-panel border border-brand-border/40 hover:border-slate-600 transition-all group`}>
                <div className={`p-3 rounded-xl inline-block mb-4 ${f.bg} ${f.color}`}>
                  <Icon size={22} />
                </div>
                <h4 className="font-bold text-white mb-2 text-sm">{f.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Module */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-brand-border/30">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">Pricing Models</h3>
          <p className="text-slate-400 text-sm">Flexible licensing fitted for expanding enterprises.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 */}
          <div className="p-6 rounded-2xl glass-panel border border-brand-border/30 flex flex-col justify-between">
            <div>
              <p className="text-xs text-brand-cyan uppercase tracking-wider font-bold">Standard Tier</p>
              <h4 className="text-4xl font-extrabold text-white mt-4 mb-2">$99 <span className="text-xs text-slate-500 font-normal">/mo</span></h4>
              <p className="text-xs text-slate-400 mb-6">Ideal for smaller operations analyzing revenue curves.</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> ARIMA Sales Forecasting</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Local SQLite Integration</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> GST Invoice Generator</li>
              </ul>
            </div>
            <button onClick={onLaunchDashboard} className="mt-8 w-full py-2.5 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-xs font-semibold cursor-pointer transition-colors">
              Get Started
            </button>
          </div>
          {/* Plan 2 */}
          <div className="p-6 rounded-2xl glass-panel border border-brand-cyan/50 relative overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <div className="absolute top-0 right-0 bg-brand-cyan text-brand-bg text-[9px] font-bold px-3 py-1 uppercase rounded-bl-lg">
              Popular
            </div>
            <div>
              <p className="text-xs text-brand-violet uppercase tracking-wider font-bold">Professional</p>
              <h4 className="text-4xl font-extrabold text-white mt-4 mb-2">$299 <span className="text-xs text-slate-500 font-normal">/mo</span></h4>
              <p className="text-xs text-slate-400 mb-6">Full machine learning modeling and invoice scanner.</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Isolation Forest Anomalies</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Random Forest Churn Risk</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Collaborative Filtering</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Supabase Connection Hook</li>
              </ul>
            </div>
            <button onClick={onLaunchDashboard} className="mt-8 w-full py-2.5 rounded-xl btn-neon-cyan text-brand-bg text-xs font-extrabold cursor-pointer">
              Get Started Pro
            </button>
          </div>
          {/* Plan 3 */}
          <div className="p-6 rounded-2xl glass-panel border border-brand-border/30 flex flex-col justify-between">
            <div>
              <p className="text-xs text-brand-pink uppercase tracking-wider font-bold">Enterprise Custom</p>
              <h4 className="text-4xl font-extrabold text-white mt-4 mb-2">Custom <span className="text-xs text-slate-500 font-normal">/mo</span></h4>
              <p className="text-xs text-slate-400 mb-6">Dedicated deployment nodes and custom parameters.</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Custom Models Lab Retraining</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Warehouse optimization models</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-cyan" /> Unlimited user seats (Roles)</li>
              </ul>
            </div>
            <button onClick={onLaunchDashboard} className="mt-8 w-full py-2.5 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-20 relative z-10 border-t border-brand-border/30">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="glass-panel border border-brand-border/40 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex justify-between items-center text-left text-sm font-semibold text-white hover:bg-white/5 cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown size={14} className={`transform transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-5 border-t border-brand-border/30 bg-white/5 text-xs text-slate-400 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border/40 bg-brand-bg/80 relative z-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-cyan shadow">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              BizIntel <span className="text-brand-cyan font-light">AI</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} BizIntel AI, Inc. All rights reserved. Enterprise-grade operations automation systems.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
