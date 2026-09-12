import React from "react";
import { useApp } from "../context/AppContext";
import { ShieldAlert, MapPin } from "lucide-react";

export const HazardZonesPage = () => {
  const { hazards, focusOnMap } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
            Critical Hazard Risk Zones
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Geographic Risk Polygons & Terrain Vulnerability Assessment
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
          3 Active High-Risk Sectors
        </span>
      </div>

      {/* Hazard Zones Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hazards.map((hz) => (
          <div
            key={hz.id}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{hz.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    hz.riskLevel === "HIGH" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {hz.riskLevel}
                </span>
              </div>

              <span className="text-xs font-semibold text-emerald-400 block">{hz.type}</span>
              <p className="text-xs text-slate-300 leading-snug">{hz.description}</p>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs text-slate-400">
                <div>Vulnerability: <strong className="text-white">{hz.vulnerabilityScore}</strong></div>
                <div>Primary Risk Drivers: <span className="text-slate-300">{hz.primaryFactors}</span></div>
              </div>
            </div>

            <button
              onClick={() => focusOnMap(hz.center[0], hz.center[1], 15)}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Center on Map
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
