import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { GlassCard } from "../components/GlassCard";
import { FileText, Download, Sparkles, Database, FileSpreadsheet } from "lucide-react";

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    try {
      const res = await api.getReportsSummary();
      setSummary(res);
    } catch (err) {
      console.error("Failed to load reports summary:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadCSV = async (type: string) => {
    setExporting(type);
    try {
      const data = await api.getExportData(type);
      const targetData = type === "all" ? data : { [type]: data[type] };
      
      // Convert JSON structure to a CSV string
      Object.entries(targetData).forEach(([gridName, rows]: [string, any]) => {
        if (!rows || rows.length === 0) return;
        
        const headers = Object.keys(rows[0]);
        const csvRows = [
          headers.join(","), // header row
          ...rows.map((row: any) =>
            headers.map((h: string) => {
              const val = row[h];
              return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(",")
          ),
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bizintel_${gridName}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Assembling Business Analytics Briefs...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Reports & Exports</h2>
        <p className="text-slate-400 text-xs mt-1">
          Generate print-friendly documents, export Excel/CSV spreadsheets, and review AI summaries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI summary briefing */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-brand-border/40 pb-3">
            <Sparkles size={16} className="text-brand-cyan animate-pulse" /> AI Executive Summary Preview
          </h4>
          {summary ? (
            <pre className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-white/5 border border-brand-border/40 p-5 rounded-xl max-h-[450px] overflow-y-auto">
              {summary.executive_summary}
            </pre>
          ) : (
            <p className="text-xs text-slate-500">No summaries compile-able.</p>
          )}
        </GlassCard>

        {/* Action card */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="border-brand-cyan/20">
            <h4 className="text-sm font-bold text-white mb-2">Export Data center</h4>
            <p className="text-[11px] text-slate-400 mb-6">
              Download live database records in structural formats compatible with Excel, Google Sheets, or custom ERP systems.
            </p>
            <div className="space-y-3.5">
              <button
                onClick={() => handleDownloadCSV("sales")}
                disabled={exporting !== null}
                className="w-full py-3 rounded-xl border border-brand-border hover:border-slate-500 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-between px-4 cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-brand-cyan" /> Sales Transactions List
                </span>
                <Download size={14} />
              </button>

              <button
                onClick={() => handleDownloadCSV("expenses")}
                disabled={exporting !== null}
                className="w-full py-3 rounded-xl border border-brand-border hover:border-slate-500 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-between px-4 cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-brand-pink" /> Expenses Audit Log
                </span>
                <Download size={14} />
              </button>

              <button
                onClick={() => handleDownloadCSV("clients")}
                disabled={exporting !== null}
                className="w-full py-3 rounded-xl border border-brand-border hover:border-slate-500 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-between px-4 cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Database size={16} className="text-brand-violet" /> CRM Accounts & Leads
                </span>
                <Download size={14} />
              </button>

              <button
                onClick={() => handleDownloadCSV("inventory")}
                disabled={exporting !== null}
                className="w-full py-3 rounded-xl border border-brand-border hover:border-slate-500 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-between px-4 cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Database size={16} className="text-green-400" /> Inventory Stock Predictions
                </span>
                <Download size={14} />
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="text-xs font-bold text-white mb-2">Aggregation Log Indicators</h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Database Table Rows:</span>
                <span className="font-semibold text-slate-200">
                  {summary ? summary.sales_count + summary.expense_count + summary.client_count + summary.inventory_count : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Surplus Score:</span>
                <span className="font-semibold text-brand-cyan">${summary?.net_profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Export Cycle:</span>
                <span className="text-[10px] text-slate-500">Live Telemetry Hooked</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Reports;
