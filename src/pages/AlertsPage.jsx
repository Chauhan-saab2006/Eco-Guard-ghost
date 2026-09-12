import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { BellRing, Filter, Search, CheckCircle2, MapPin } from "lucide-react";

export const AlertsPage = () => {
  const { alerts, acknowledgeAlert, resolveAlert, focusOnMap } = useApp();

  const [tab, setTab] = useState("Active"); // Active, Acknowledged, Resolved
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);

  const filteredAlerts = alerts.filter((a) => {
    if (a.status !== tab) return false;
    if (severityFilter !== "ALL" && a.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-red-400" />
            Alert Management Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive Operational Logs, Severity Filtering & Field Dispatch Acknowledgement
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["Active", "Acknowledged", "Resolved"].map((t) => {
            const count = alerts.filter((a) => a.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tab === t
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search alerts by title or node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-semibold">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Alerts Table/List View */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No alerts matching "{tab}" filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      alert.severity === "HIGH" || alert.severity === "CRITICAL"
                        ? "bg-red-500 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  <span className="text-xs text-slate-500">• {alert.timeAgo}</span>
                </div>

                <p className="text-xs text-slate-300 leading-snug">{alert.message}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Source: <strong className="text-slate-200">{alert.source}</strong></span>
                  <span>Sensor: <strong className="text-amber-400">{alert.sensorValue}</strong></span>
                  <span>ML Risk: <strong className="text-red-400">{alert.mlRiskScore}/100</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => focusOnMap(alert.lat, alert.lng, 15)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  View on Map
                </button>

                {alert.status === "Active" && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== "Resolved" && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}

                <button
                  onClick={() => setSelectedAlertForModal(alert)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAlertForModal && (
        <AlertDetailModal
          isOpen={!!selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          alert={selectedAlertForModal}
        />
      )}
    </div>
  );
};
