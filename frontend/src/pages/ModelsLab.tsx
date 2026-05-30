import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { Cpu, RefreshCw, Layers, CheckCircle2, ShieldAlert, BarChart3, UploadCloud } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const ModelsLab: React.FC = () => {
  const { isManager } = useAuth();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrainLoading, setRetrainLoading] = useState<string | null>(null);
  
  // Active Retrained Stats
  const [activeResult, setActiveResult] = useState<any>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    try {
      const res = await api.getModelsStatus();
      setModels(res);
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRetrain = async (type: string) => {
    if (!isManager) return;
    setRetrainLoading(type);
    try {
      const res = await api.retrainModel(type);
      setActiveResult(res);
      fetchModels();
    } catch (err) {
      console.error("Retrain failed:", err);
    } finally {
      setRetrainLoading(null);
    }
  };

  const modelMap = [
    { type: "lead_scoring", label: "Lead Scoring Classifier", algo: "Logistic Regression" },
    { type: "client_churn", label: "Churn Classifier", algo: "Random Forest" },
    { type: "expense_classifier", label: "Expense Parser", algo: "Multinomial Naive Bayes" },
    { type: "demand_predictor", label: "Demand Regressor", algo: "Random Forest Regressor" }
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Accessing AI Models Lab parameters...</div>;
  }

  // Format feature importance for charting
  const featureChartData = activeResult?.feature_importance
    ? Object.entries(activeResult.feature_importance).map(([name, val]: [any, any]) => ({
        name: name.replace("_", " "),
        coefficient: parseFloat(val.toFixed(4)),
      }))
    : [];

  return (
    <div className="p-8 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">AI Models Lab</h2>
        <p className="text-slate-400 text-xs mt-1">
          Scikit-learn model evaluation parameters, training triggers, and feature maps
        </p>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modelMap.map((m) => {
          const matchedDb = models.find(dbm => dbm.model_name.includes(m.algo));
          const isTuning = retrainLoading === m.type;
          
          return (
            <GlassCard key={m.type} className="flex flex-col justify-between h-56">
              <div>
                <span className="text-[10px] text-brand-cyan font-bold uppercase tracking-wider">{m.algo}</span>
                <h4 className="text-sm font-bold text-white mt-1">{m.label}</h4>
                <div className="flex items-baseline gap-2 mt-4">
                  <p className="text-3xl font-extrabold text-white">
                    {matchedDb ? `${Math.round(matchedDb.accuracy * 100)}%` : "N/A"}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">accuracy</span>
                </div>
              </div>

              <div>
                <p className="text-[9px] text-slate-500 mb-3">Trained: {matchedDb ? new Date(matchedDb.trained_at).toLocaleDateString() : "Never"}</p>
                {isManager && (
                  <button
                    onClick={() => handleRetrain(m.type)}
                    disabled={isTuning}
                    className="w-full py-2.5 rounded-xl text-xs font-bold border border-brand-border bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isTuning ? "animate-spin" : ""} />
                    {isTuning ? "Retraining..." : "Retrain Model"}
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Retro Retrain metrics details */}
      {activeResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Confusion Matrix */}
          <GlassCard>
            <h4 className="text-sm font-bold text-white mb-2">Confusion Matrix - {activeResult.model_name}</h4>
            <p className="text-[11px] text-slate-400 mb-6">Evaluation mapping: predictions vs actual validations</p>
            
            {activeResult.confusion_matrix && activeResult.confusion_matrix.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-center text-xs">
                <div className="p-4 rounded-xl bg-white/5 border border-brand-cyan/20">
                  <p className="text-slate-500 font-medium">True Negative (TN)</p>
                  <p className="text-2xl font-bold text-white mt-1">{activeResult.confusion_matrix[0][0]}</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-pink/5 border border-brand-pink/20">
                  <p className="text-slate-500 font-medium">False Positive (FP)</p>
                  <p className="text-2xl font-bold text-brand-pink mt-1">{activeResult.confusion_matrix[0][1]}</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-violet/5 border border-brand-violet/20">
                  <p className="text-slate-500 font-medium">False Negative (FN)</p>
                  <p className="text-2xl font-bold text-brand-violet mt-1">{activeResult.confusion_matrix[1][0]}</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20">
                  <p className="text-slate-500 font-medium">True Positive (TP)</p>
                  <p className="text-2xl font-bold text-brand-cyan mt-1">{activeResult.confusion_matrix[1][1]}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Feature weights computed. No matrix output generated for regressor models.</p>
            )}
          </GlassCard>

          {/* Feature Importance charts */}
          <GlassCard className="h-64 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Feature Weight Coefficients</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Parameters influencing the prediction weights</p>
            </div>
            <div className="h-44 w-full mt-4">
              {featureChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureChartData} layout="vertical">
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10, 16, 36, 0.95)",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="coefficient" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500">Select model retraining parameters.</p>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Dataset Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <GlassCard className="lg:col-span-1 flex flex-col justify-between h-64">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Simulate Dataset Upload</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Upload custom business telemetry tables (CSV/JSON formats) to seed models.
            </p>
          </div>
          <div className="border border-dashed border-brand-border/80 hover:border-brand-cyan/60 rounded-xl p-8 text-center bg-white/5 cursor-pointer flex flex-col items-center justify-center transition-colors">
            <UploadCloud size={24} className="text-brand-cyan animate-bounce" />
            <p className="text-[10px] text-slate-400 mt-2">Drag & Drop training tables, or browse files</p>
            <span className="text-[8px] text-slate-600 mt-1">Limits: 50MB (CSV, XLS)</span>
          </div>
        </GlassCard>

        {/* Comparison grid */}
        <GlassCard className="lg:col-span-2">
          <h4 className="text-sm font-bold text-white mb-4">ML Algorithms Comparative Matrix</h4>
          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border/40 text-slate-400 font-bold">
                  <th className="pb-3">Algorithm</th>
                  <th className="pb-3">Use Case Mapping</th>
                  <th className="pb-3">Training Parameters</th>
                  <th className="pb-3">Accuracy Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/20 text-slate-300">
                <tr>
                  <td className="py-2.5 font-bold text-white">ARIMA (Time Series)</td>
                  <td className="py-2.5">Revenue Forecast</td>
                  <td className="py-2.5">Lag, Seasonal Horizon</td>
                  <td className="py-2.5 text-brand-cyan">91% Accuracy</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Logistic Regression</td>
                  <td className="py-2.5">Lead Scoring Conversion</td>
                  <td className="py-2.5">Engagement, Spend, Tickets</td>
                  <td className="py-2.5 text-brand-cyan">84% Accuracy</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Random Forest Classify</td>
                  <td className="py-2.5">CRM Account Churn Risks</td>
                  <td className="py-2.5">Monthly Spend, Support Tickets</td>
                  <td className="py-2.5 text-brand-cyan">89% Accuracy</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Naive Bayes Classifier</td>
                  <td className="py-2.5">Finance Expense Categories</td>
                  <td className="py-2.5">Description Text Vectors</td>
                  <td className="py-2.5 text-brand-cyan">94% Accuracy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default ModelsLab;
