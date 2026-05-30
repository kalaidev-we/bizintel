import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { Plus, Users, Calendar, Activity, ChevronRight, UserPlus, FileText, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";

export const CRM: React.FC = () => {
  const { isManager } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [spend, setSpend] = useState(0.0);
  const [engage, setEngage] = useState(50.0);
  const [tickets, setTickets] = useState(0);
  const [contract, setContract] = useState(12);
  const [status, setStatus] = useState("Lead");

  const [scoreLoading, setScoreLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await api.getClients();
      setClients(res);
      if (res.length > 0 && !selectedClient) {
        handleSelectClient(res[0]);
      }
    } catch (err) {
      console.error("Failed to fetch crm clients:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectClient = async (client: any) => {
    setSelectedClient(client);
    try {
      const [timelineRes, recsRes] = await Promise.all([
        api.getClientTimeline(client.id),
        api.getClientRecommendations(client.id)
      ]);
      setTimeline(timelineRes);
      setRecs(recsRes.recommendations || []);
    } catch (err) {
      console.error("Failed to load client details:", err);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClient({
        name,
        email,
        company,
        monthly_spend: spend,
        engagement_score: engage,
        support_tickets: tickets,
        contract_months: contract,
        status
      });
      setName("");
      setEmail("");
      setCompany("");
      setSpend(0.0);
      setEngage(50.0);
      setTickets(0);
      setContract(12);
      setStatus("Lead");
      setShowAddForm(false);
      fetchClients();
    } catch (err) {
      console.error("Failed to write CRM client:", err);
    }
  };

  const handleRecalculateScores = async (id: number) => {
    setScoreLoading(id);
    try {
      const updated = await api.recalculateClientScores(id);
      fetchClients();
      if (selectedClient && selectedClient.id === id) {
        handleSelectClient(updated);
      }
    } catch (err) {
      console.error("Failed to update lead/churn scores:", err);
    } finally {
      setScoreLoading(null);
    }
  };

  const renderTimelineIcon = (iconName: string) => {
    switch (iconName) {
      case "user_plus": return <UserPlus size={12} className="text-brand-cyan" />;
      case "file_text": return <FileText size={12} className="text-brand-violet" />;
      case "alert": return <AlertOctagon size={12} className="text-brand-pink animate-pulse" />;
      default: return <CheckCircle2 size={12} className="text-green-400" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Syncing Customer Intelligence...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">CRM Intelligence Center</h2>
          <p className="text-slate-400 text-xs mt-1">
            Random Forest churn assessment matrices and Logistic Regression lead scoring systems
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold btn-neon-cyan text-brand-bg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add Client Account
          </button>
        )}
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <GlassCard className="max-w-2xl border-brand-cyan/40">
          <h4 className="text-sm font-bold text-white mb-4">Register CRM Account / Lead</h4>
          <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company</label>
              <input
                type="text" required value={company} onChange={e => setCompany(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Spend ($)</label>
              <input
                type="number" step="10" required value={spend || ""} onChange={e => setSpend(parseFloat(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Engagement score (0 - 100)</label>
              <input
                type="number" required value={engage || ""} onChange={e => setEngage(parseFloat(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Support Tickets raised</label>
              <input
                type="number" required value={tickets} onChange={e => setTickets(parseInt(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contract term (Months)</label>
              <input
                type="number" required value={contract} onChange={e => setContract(parseInt(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Pipeline Status</label>
              <select
                value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold btn-neon-violet text-white cursor-pointer">
                Create CRM Entry & Execute ML Analysis
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Main CRM Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h4 className="text-sm font-bold text-white mb-4">Enterprise Accounts & Leads Directory</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/40 text-slate-400 font-bold">
                    <th className="pb-3">Client Name</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Spend</th>
                    <th className="pb-3">Pipeline Status</th>
                    <th className="pb-3">Lead Conversion Probability</th>
                    <th className="pb-3">Churn Risk index</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {clients.map((c) => {
                    const isSelected = selectedClient?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSelectClient(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-3 font-semibold text-white pl-2">
                          <p>{c.name}</p>
                          <span className="text-[10px] text-slate-500">{c.email}</span>
                        </td>
                        <td className="py-3 text-slate-300">{c.company || "N/A"}</td>
                        <td className="py-3 font-medium text-slate-300">
                          {c.monthly_spend > 0 ? `$${c.monthly_spend.toLocaleString()}/mo` : "Lead"}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.status === "Active" ? "bg-brand-cyan/20 text-brand-cyan" : "bg-brand-violet/20 text-brand-violet"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-green-400 font-bold">{Math.round(c.conversion_probability * 100)}%</span>
                        </td>
                        <td className="py-3">
                          <span className={c.churn_risk_score > 0.6 ? "text-brand-pink font-bold" : "text-slate-400"}>
                            {Math.round(c.churn_risk_score * 100)}%
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecalculateScores(c.id);
                            }}
                            className="text-[10px] text-brand-cyan hover:underline cursor-pointer"
                            disabled={scoreLoading === c.id}
                          >
                            {scoreLoading === c.id ? "Analyzing..." : "Re-evaluate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Selected Client details panel */}
        <div className="lg:col-span-1 space-y-6">
          {selectedClient ? (
            <>
              {/* Recommendations */}
              <GlassCard className="border-brand-cyan/30">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                  <Activity size={14} className="text-brand-cyan animate-pulse" /> AI Cross-Sell Recommendations
                </h4>
                <p className="text-[10px] text-slate-500 mb-4">Collaborative Filtering match for {selectedClient.name}</p>
                <div className="space-y-3">
                  {recs.length === 0 ? (
                    <p className="text-xs text-slate-500">All matched services are already purchased.</p>
                  ) : (
                    recs.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-brand-border/40">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200">{rec.service}</span>
                          <span className="text-[10px] text-brand-cyan font-bold">
                            {Math.round(rec.confidence * 100)}% Conf
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-brand-cyan h-full" style={{ width: `${rec.confidence * 100}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Interaction Timeline */}
              <GlassCard>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Calendar size={14} className="text-brand-violet" /> Customer Engagement Timeline
                </h4>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-brand-border/50">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-brand-slate border border-brand-border flex items-center justify-center shrink-0 z-10">
                        {renderTimelineIcon(event.icon)}
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-xs font-bold text-white">{event.event}</span>
                          <span className="text-[9px] text-slate-500 shrink-0">{event.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{event.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center text-center py-20 text-slate-500">
              <Users size={32} className="mb-3" />
              <p className="text-xs">Select a CRM account to check timelines and recommendations.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
export default CRM;
