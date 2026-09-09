import React from "react";
import { useApp } from "../../context/AppContext";
import { AlertCard } from "./AlertCard";
import { BellRing, ArrowRight } from "lucide-react";

export const AlertPanel = ({ onSelectAlert }) => {
  const { alerts, setActivePage } = useApp();
  const activeAlerts = alerts.filter((a) => a.status === "Active");

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">Active Alert System</h3>
        </div>

        <button
          onClick={() => setActivePage("alerts")}
          className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {activeAlerts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No active critical alerts.</p>
        ) : (
          activeAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onSelectAlert={onSelectAlert} />
          ))
        )}
      </div>
    </div>
  );
};
