import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { GlassCard } from "../components/GlassCard";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Activity,
  Boxes,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiRes, revRes, expRes, recRes] = await Promise.all([
          api.getKpis(),
          api.getRevenueChart(),
          api.getExpensesChart(),
          api.getAiRecommendations(),
        ]);
        setKpis(kpiRes);
        setRevenueData(revRes);
        setExpensesData(expRes);
        setRecs(recRes);
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 border border-brand-border/30 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 lg:col-span-2 rounded-2xl bg-white/5 border border-brand-border/30 animate-pulse" />
          <div className="h-96 rounded-2xl bg-white/5 border border-brand-border/30 animate-pulse" />
        </div>
      </div>
    );
  }

  // Expense Chart Colors
  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#0088FE"];

  return (
    <div className="p-8 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Top Welcome / Status row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Operations Center</h2>
          <p className="text-slate-400 text-xs mt-1">Real-time analytical pipelines and predictive forecasting</p>
        </div>
        {kpis && (
          <div className="flex items-center gap-3 bg-brand-slate/40 border border-brand-border rounded-xl px-4 py-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
            <span className="text-slate-300">Predictive Engine Online</span>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Revenue */}
        <GlassCard className="relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Operating Revenue</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-bold text-white">${kpis?.revenue.value.toLocaleString()}</h3>
            <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp size={10} /> +{kpis?.revenue.growth}%
            </span>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-violet mt-4 rounded-full opacity-60" />
        </GlassCard>

        {/* KPI 2: Expenses */}
        <GlassCard>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational Expense</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-bold text-white">${kpis?.expenses.value.toLocaleString()}</h3>
            {kpis?.expenses.anomalies > 0 ? (
              <span className="text-[10px] text-brand-pink bg-brand-pink/10 border border-brand-pink/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <ShieldAlert size={10} /> {kpis?.expenses.anomalies} Anomaly
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 bg-white/5 border border-brand-border/40 px-2 py-0.5 rounded-md">
                Healthy
              </span>
            )}
          </div>
          <div className="w-full h-1 bg-brand-pink mt-4 rounded-full opacity-30" />
        </GlassCard>

        {/* KPI 3: Clients & Churn */}
        <GlassCard>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CRM Accounts</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-bold text-white">{kpis?.clients.total} Accounts</h3>
            {kpis?.clients.high_risk_churn > 0 ? (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {kpis?.clients.high_risk_churn} Churn Risk
              </span>
            ) : (
              <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-md">
                Low Risk
              </span>
            )}
          </div>
          <div className="w-full h-1 bg-brand-violet mt-4 rounded-full opacity-30" />
        </GlassCard>

        {/* KPI 4: Inventory Health */}
        <GlassCard>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inventory Health</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-bold text-white">{kpis?.inventory.total_items} Items</h3>
            {kpis?.inventory.low_stock_warnings > 0 ? (
              <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <AlertTriangle size={10} /> {kpis?.inventory.low_stock_warnings} Low Stock
              </span>
            ) : (
              <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-md">
                Fully Stocked
              </span>
            )}
          </div>
          <div className="w-full h-1 bg-green-500 mt-4 rounded-full opacity-30" />
        </GlassCard>
      </div>

      {/* Main Content: Chart & Health Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue/ARIMA Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between h-96">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Revenue Projections <span className="text-[10px] text-slate-500 font-normal">(ARIMA Forecast Active)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Time series models predicting next 3 periods</p>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 16, 36, 0.95)",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Historical Sales"
                />
                {revenueData.some((item) => item.is_forecast) && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    strokeDasharray="5 5"
                    fillOpacity={0.8}
                    fill="url(#colorForecast)"
                    name="ARIMA Forecast"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Business Health Meter */}
        <GlassCard className="flex flex-col items-center justify-center text-center h-96">
          <h4 className="text-sm font-bold text-white mb-2 self-start">Business Health Assessment</h4>
          <p className="text-[11px] text-slate-400 self-start mb-6 leading-relaxed">
            Overall operational index derived from churn ratios, stock flags, and financial audits.
          </p>

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Radial background grid */}
            <div className="absolute w-full h-full rounded-full border-[8px] border-brand-border/40" />
            <div
              className="absolute w-full h-full rounded-full border-[8px] border-brand-cyan border-r-transparent border-b-transparent animate-pulse-slow"
              style={{
                transform: `rotate(${(kpis?.health_score || 80) * 3.6 - 45}deg)`,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
            <div>
              <p className="text-4xl font-extrabold text-white">{kpis?.health_score || 85}%</p>
              <p className="text-[10px] text-brand-cyan font-bold tracking-widest uppercase mt-1">Health Score</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-6 leading-relaxed">
            {kpis && kpis.health_score > 80
              ? "All operations are performing within normal confidence thresholds."
              : "Operational issues detected. Review AI Recommendations."}
          </p>
        </GlassCard>
      </div>

      {/* Row 3: AI Insights Feed & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations list */}
        <GlassCard className="lg:col-span-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-brand-cyan" /> AI Decision Intelligence Feed
          </h4>
          <div className="space-y-3">
            {recs.length === 0 ? (
              <p className="text-xs text-slate-500">No suggestions or alerts found.</p>
            ) : (
              recs.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start gap-4 p-3 rounded-xl bg-white/5 border border-brand-border/40 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-bold uppercase mb-1">
                      {rec.type}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{rec.message}</p>
                  </div>
                  <span
                    className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      rec.impact === "High"
                        ? "bg-red-500/15 text-red-400 border border-red-500/20"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {rec.impact} Impact
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Expense breakdowns */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Operating Expense Allocation</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Breakdown of current operating cycle costs by category.
            </p>
          </div>
          <div className="h-44 w-full flex items-center justify-center mt-2">
            {expensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 16, 36, 0.95)",
                      border: "1px solid rgba(99, 102, 241, 0.4)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-600">No expense records found.</p>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 mt-2">
            {expensesData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate">{item.category}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default Dashboard;
