import React from "react";
import { useApp } from "../../context/AppContext";
import { ShieldAlert, ArrowRight, MapPin } from "lucide-react";

export const HazardZones = ({ onSelectHazard }) => {
  const { hazards, setSelectedHazardId, focusOnMap, setActivePage } = useApp();

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">Critical Hazard Zones</h3>
        </div>

        <button
          onClick={() => setActivePage("hazards")}
          className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {hazards.map((hz) => {
          let badgeBg = "bg-red-500/20 text-red-300 border-red-500/40";
          if (hz.riskLevel === "MEDIUM") {
            badgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/40";
          }

          return (
            <div
              key={hz.id}
              onClick={() => {
                setSelectedHazardId(hz.id);
                focusOnMap(hz.center[0], hz.center[1], 14);
                if (onSelectHazard) onSelectHazard(hz);
              }}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  {hz.name}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                  {hz.riskLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">{hz.type}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-0.5 group-hover:underline">
                  Map Zone <MapPin className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{hz.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
