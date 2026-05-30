import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { Plus, HelpCircle, RefreshCw, AlertTriangle, Info, MapPin } from "lucide-react";

export const Inventory: React.FC = () => {
  const { isManager } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>({ low_stock: [], dead_stock: [] });
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(10);
  const [price, setPrice] = useState(0.0);
  const [seasonalIdx, setSeasonalIdx] = useState(1.0);
  const [promo, setPromo] = useState(false);
  const [location, setLocation] = useState("Warehouse A");
  
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [invRes, alertRes, zoneRes] = await Promise.all([
        api.getInventory(),
        api.getInventoryAlerts(),
        api.getWarehouseOptimization()
      ]);
      setItems(invRes);
      setAlerts(alertRes);
      setZones(zoneRes);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInventoryItem({
        name,
        current_stock: stock,
        minimum_stock: minStock,
        price,
        seasonal_index: seasonalIdx,
        promo_active: promo,
        location
      });
      setName("");
      setStock(0);
      setMinStock(10);
      setPrice(0.0);
      setSeasonalIdx(1.0);
      setPromo(false);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create item:", err);
    }
  };

  const handlePredict = async (id: number) => {
    setActionLoading(id);
    try {
      await api.recalculateInventoryDemand(id);
      fetchData();
    } catch (err) {
      console.error("Failed to run demand prediction:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Inventory Intelligence...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">Inventory Intelligence</h2>
          <p className="text-slate-400 text-xs mt-1">XGBoost-powered stock level prediction and warehouse slotting</p>
        </div>
        {isManager && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold btn-neon-cyan text-brand-bg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add Inventory Item
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <GlassCard className="max-w-2xl border-brand-cyan/40">
          <h4 className="text-sm font-bold text-white mb-4">Register New Inventory Line</h4>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Item Name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price ($)</label>
              <input
                type="number" step="0.01" required value={price} onChange={e => setPrice(parseFloat(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Stock</label>
              <input
                type="number" required value={stock} onChange={e => setStock(parseInt(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Minimum Safety Stock</label>
              <input
                type="number" required value={minStock} onChange={e => setMinStock(parseInt(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seasonal Index factor (0.5 to 2.0)</label>
              <input
                type="number" step="0.1" required value={seasonalIdx} onChange={e => setSeasonalIdx(parseFloat(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Warehouse Placement</label>
              <select
                value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-cyan/60 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Warehouse A">Warehouse A</option>
                <option value="Warehouse B">Warehouse B</option>
                <option value="Warehouse C">Warehouse C</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox" id="promo" checked={promo} onChange={e => setPromo(e.target.checked)}
                className="w-4 h-4 accent-brand-cyan rounded border-brand-border"
              />
              <label htmlFor="promo" className="text-xs text-slate-300 font-medium">Promo Campaign Active</label>
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold btn-neon-violet text-white cursor-pointer">
                Confirm Add & Predict Initial Demand
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Alerts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Panel */}
        <GlassCard className="border-amber-500/20">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <AlertTriangle className="text-amber-500" size={16} /> Low Stock Warnings
          </h4>
          <div className="space-y-2">
            {alerts.low_stock.length === 0 ? (
              <p className="text-xs text-slate-500">No items below safety limits.</p>
            ) : (
              alerts.low_stock.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-amber-500/5 border border-amber-500/15">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="text-amber-400 font-bold">
                    {item.stock} / {item.minimum} left ({item.location})
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Dead Stock Panel */}
        <GlassCard className="border-brand-pink/20">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Info className="text-brand-pink" size={16} /> Dead Stock Risk Report
          </h4>
          <div className="space-y-2">
            {alerts.dead_stock.length === 0 ? (
              <p className="text-xs text-slate-500">No dead stock risks flagged.</p>
            ) : (
              alerts.dead_stock.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-brand-pink/5 border border-brand-pink/15">
                  <div>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Forecast demand: {item.predicted_demand} units</p>
                  </div>
                  <span className="text-brand-pink font-bold">
                    Locked Capital: ${item.capital_locked.toLocaleString()} ({item.stock} units)
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Main Stock Table */}
      <GlassCard>
        <h4 className="text-sm font-bold text-white mb-4">Inventory Lines & predicted Demand</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-border/40 text-slate-400 font-bold">
                <th className="pb-3">Item Name</th>
                <th className="pb-3">Unit Price</th>
                <th className="pb-3">Current Stock</th>
                <th className="pb-3">Minimum Safety</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Promo Flag</th>
                <th className="pb-3">Predicted demand (30d)</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-white">{item.name}</td>
                  <td className="py-3">${item.price.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={item.current_stock <= item.minimum_stock ? "text-amber-500 font-bold" : "text-white"}>
                      {item.current_stock}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{item.minimum_stock}</td>
                  <td className="py-3">{item.location}</td>
                  <td className="py-3">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.promo_active ? "bg-brand-cyan/25 text-brand-cyan" : "bg-white/5 text-slate-500"
                    }`}>
                      {item.promo_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-brand-violet font-bold">{item.demand_forecast} units</span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handlePredict(item.id)}
                      disabled={actionLoading === item.id}
                      className="p-1.5 rounded-lg border border-brand-border/60 hover:border-slate-500 text-slate-400 hover:text-white cursor-pointer transition-colors"
                      title="Recalculate Demand Prediction"
                    >
                      <RefreshCw size={12} className={actionLoading === item.id ? "animate-spin" : ""} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Slotting recommendations */}
      <GlassCard>
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <MapPin size={16} className="text-brand-cyan" /> Warehouse Layout & Slotting Optimization
        </h4>
        <p className="text-[11px] text-slate-400 mb-4">
          Placement algorithms recommending product relocations based on predicted sales speeds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((z, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                z.action_needed
                  ? "bg-brand-violet/5 border-brand-violet/40 hover:bg-brand-violet/10"
                  : "bg-white/5 border-brand-border/40 hover:bg-white/10"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-white">{z.name}</span>
                {z.action_needed && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-brand-pink/20 border border-brand-pink/40 text-brand-pink font-bold uppercase">
                    Relocation Advised
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{z.reason}</p>
              <div className="mt-3 flex justify-between text-[9px] text-slate-500">
                <span>Current: {z.current_location}</span>
                <span className="font-bold text-brand-cyan">Target: {z.recommended_zone}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
export default Inventory;
