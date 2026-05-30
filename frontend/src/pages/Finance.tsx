import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { FileText, AlertTriangle, ShieldCheck, RefreshCw, Layers, Printer, Sparkles } from "lucide-react";

export const Finance: React.FC = () => {
  const { isManager } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  
  // Expense Form State
  const [amount, setAmount] = useState(0.0);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Auto"); // Default Naive Bayes classification

  // Invoice Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ name: "", quantity: 1, price: 0.0 }]);
  const [gstRate, setGstRate] = useState(18.0);
  const [invoiceResult, setInvoiceResult] = useState<any>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const res = await api.getExpenses();
      setExpenses(res);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({ amount, description: desc, category });
      setAmount(0.0);
      setDesc("");
      setCategory("Auto");
      fetchExpenses();
    } catch (err) {
      console.error("Failed to post expense:", err);
    }
  };

  const handleScanAnomalies = async () => {
    setScanLoading(true);
    try {
      await api.scanAnomalies();
      fetchExpenses();
    } catch (err) {
      console.error("Anomaly scan failed:", err);
    } finally {
      setScanLoading(false);
    }
  };

  const handleInvoiceItemChange = (idx: number, field: string, value: any) => {
    const nextItems = [...invoiceItems];
    nextItems[idx][field] = value;
    setInvoiceItems(nextItems);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { name: "", quantity: 1, price: 0.0 }]);
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.generateInvoice({
        client_name: clientName,
        client_email: clientEmail,
        items: invoiceItems,
        gst_rate: gstRate,
      });
      setInvoiceResult(res);
    } catch (err) {
      console.error("Failed to generate invoice:", err);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Synchronizing Finance Modules...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto print:bg-white print:text-black print:p-0">
      {/* Header (Hidden on print) */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-white">Finance & Audit Logs</h2>
          <p className="text-slate-400 text-xs mt-1">
            Isolation Forest expense anomaly scans and Naive Bayes text description categorizers
          </p>
        </div>
        {isManager && (
          <button
            onClick={handleScanAnomalies}
            disabled={scanLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-brand-pink/40 bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={scanLoading ? "animate-spin" : ""} />
            Scan Anomalies (Isolation Forest)
          </button>
        )}
      </div>

      {/* Main Grid: Forms & Tables (Hidden on print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Forms column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Add expense */}
          {isManager && (
            <GlassCard>
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-brand-cyan animate-pulse" /> Post Expense Record
              </h4>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expense Amount ($)</label>
                  <input
                    type="number" step="0.01" required value={amount || ""} onChange={e => setAmount(parseFloat(e.target.value))}
                    className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <input
                    type="text" required placeholder="AWS hosting billing for Q3" value={desc} onChange={e => setDesc(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category Classifier</label>
                  <select
                    value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Auto">AI Auto-Classify (Naive Bayes)</option>
                    <option value="Software">Software</option>
                    <option value="Travel">Travel</option>
                    <option value="Office">Office</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold btn-neon-violet text-white cursor-pointer">
                  Log Expense
                </button>
              </form>
            </GlassCard>
          )}

          {/* GST Invoicing Panel */}
          <GlassCard>
            <h4 className="text-sm font-bold text-white mb-4">GST Invoice Generator</h4>
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Name</label>
                <input
                  type="text" required value={clientName} onChange={e => setClientName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Email</label>
                <input
                  type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GST Tax Rate (%)</label>
                <input
                  type="number" step="0.5" required value={gstRate} onChange={e => setGstRate(parseFloat(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Invoiced items list */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Billing Items</label>
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text" required placeholder="Service" value={item.name}
                      onChange={e => handleInvoiceItemChange(idx, "name", e.target.value)}
                      className="w-1/2 bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-2 py-1 text-[11px] text-white"
                    />
                    <input
                      type="number" required placeholder="Qty" value={item.quantity || ""}
                      onChange={e => handleInvoiceItemChange(idx, "quantity", parseInt(e.target.value))}
                      className="w-1/4 bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-2 py-1 text-[11px] text-white"
                    />
                    <input
                      type="number" step="0.01" required placeholder="Price" value={item.price || ""}
                      onChange={e => handleInvoiceItemChange(idx, "price", parseFloat(e.target.value))}
                      className="w-1/4 bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-2 py-1 text-[11px] text-white"
                    />
                  </div>
                ))}
                <button
                  type="button" onClick={addInvoiceItem}
                  className="text-[10px] text-brand-cyan hover:underline cursor-pointer"
                >
                  + Add Row
                </button>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold btn-neon-cyan text-brand-bg">
                Assemble Invoice
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Expenses List column */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <h4 className="text-sm font-bold text-white mb-4">Expense Audit & Log History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/40 text-slate-400 font-bold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Audit flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-slate-400">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-white">{e.description}</td>
                      <td className="py-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-brand-slate text-[10px] font-semibold text-slate-300">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white">${e.amount.toFixed(2)}</td>
                      <td className="py-3 space-x-1.5">
                        {e.is_anomaly && (
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 animate-pulse"
                            title={`Isolation Forest anomaly score: ${e.anomaly_score}`}
                          >
                            Outlier
                          </span>
                        )}
                        {e.is_duplicate && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            Duplicate
                          </span>
                        )}
                        {!e.is_anomaly && !e.is_duplicate && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 text-green-400">
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Invoice Output Screen (Shown during print) */}
      {invoiceResult && (
        <div className="glass-panel border-brand-cyan rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl relative print:border-none print:shadow-none print:p-0">
          {/* Print button (Hidden on print) */}
          <button
            onClick={printInvoice}
            className="absolute top-6 right-6 p-2 rounded-xl bg-brand-slate/40 border border-brand-border hover:border-slate-500 text-slate-400 hover:text-white cursor-pointer transition-colors print:hidden"
            title="Print / Export PDF"
          >
            <Printer size={16} />
          </button>

          <div className="flex justify-between items-start pb-6 border-b border-brand-border/40 print:border-slate-300">
            <div>
              <h3 className="text-xl font-black text-white print:text-black">BIZINTEL AI CORP</h3>
              <p className="text-[10px] text-slate-400 mt-1 print:text-slate-600">Enterprise Operations billing Node</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan font-bold text-[10px] uppercase mb-1 print:text-cyan-700 print:border-cyan-700">
                GST Invoice
              </span>
              <p className="text-xs font-bold text-white print:text-black mt-1">{invoiceResult.invoice_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 text-xs border-b border-brand-border/40 print:border-slate-300">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px] mb-1">Bill To:</p>
              <p className="font-bold text-white print:text-black">{invoiceResult.client_name}</p>
              <p className="text-slate-400 print:text-slate-700 mt-0.5">{invoiceResult.client_email}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-semibold uppercase text-[10px] mb-1">Invoice Date:</p>
              <p className="font-bold text-white print:text-black">
                {new Date(invoiceResult.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-left text-xs border-collapse py-6">
            <thead>
              <tr className="border-b border-brand-border/30 text-slate-400 font-bold print:border-slate-300 print:text-slate-700">
                <th className="py-3">Billing Item</th>
                <th className="py-3">Quantity</th>
                <th className="py-3">Unit Price</th>
                <th className="py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/20 print:divide-slate-200">
              {invoiceItems.map((item, idx) => (
                <tr key={idx} className="print:text-black">
                  <td className="py-3 font-semibold text-white print:text-black">{item.name || "Custom Service"}</td>
                  <td className="py-3 text-slate-400 print:text-slate-700">{item.quantity}</td>
                  <td className="py-3 text-slate-400 print:text-slate-700">${item.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div className="border-t border-brand-border/40 pt-4 flex flex-col items-end text-xs space-y-1.5 print:border-slate-300 print:text-black">
            <div className="flex justify-between w-48 text-slate-400 print:text-slate-700">
              <span>Subtotal:</span>
              <span className="font-semibold text-white print:text-black">${invoiceResult.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-slate-400 print:text-slate-700">
              <span>GST Tax ({gstRate}%):</span>
              <span className="font-semibold text-white print:text-black">${invoiceResult.gst_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-sm font-bold border-t border-brand-border/40 pt-2 print:border-slate-300 print:text-black">
              <span>Total Due:</span>
              <span className="text-brand-cyan print:text-cyan-700">${invoiceResult.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Finance;
