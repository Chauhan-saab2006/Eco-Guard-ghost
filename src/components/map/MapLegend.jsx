import React from "react";

export const MapLegend = () => {
  return (
    <div className="absolute bottom-3 left-3 z-[1000] p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl text-slate-300 text-xs space-y-2 pointer-events-auto max-w-[200px] sm:max-w-xs">
      <p className="font-bold text-white text-[11px] uppercase tracking-wider text-slate-400">
        Map Layers & Legend
      </p>

      <div className="grid grid-cols-1 gap-1.5 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Node 1 — Hill Sector (LoRa)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
          <span>Node 2 — River Bank (GSM)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
          <span>Overall Area — API Data</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-red-500/40 border border-red-500" />
          <span>Critical Hazard Zone</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
          <span>Active Alert Location</span>
        </div>
      </div>
    </div>
  );
};
