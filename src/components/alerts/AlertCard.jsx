import React from "react";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, Radio, CloudSun, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const AlertCard = ({ alert, onSelectAlert }) => {
  const { focusOnMap } = useApp();

  const isNode = alert.sourceType === "node";
  let severityBg = "bg-amber-500/10 border-amber-500/30 text-amber-300";
  let badgeColor = "bg-amber-500 text-slate-950 font-bold";

  if (alert.severity === "HIGH" || alert.severity === "CRITICAL") {
    severityBg = "bg-red-500/10 border-red-500/30 text-red-300";
    badgeColor = "bg-red-500 text-white font-bold";
  }

  return (
    <div
      onClick={() => {
        focusOnMap(alert.lat, alert.lng, 15);
        if (onSelectAlert) onSelectAlert(alert);
      }}
      className={`p-3.5 rounded-2xl border ${severityBg} hover:border-slate-600 transition-all cursor-pointer shadow-md space-y-2 group`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-white tracking-tight">{alert.title}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${badgeColor}`}>
          {alert.severity}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        {isNode ? <Radio className="w-3 h-3 text-emerald-400" /> : <CloudSun className="w-3 h-3 text-purple-400" />}
        <span className="font-semibold text-slate-300">{alert.source}</span>
        <span>•</span>
        <span>{alert.timeAgo}</span>
      </div>

      <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">{alert.message}</p>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
        <span>Value: <strong className="text-white">{alert.sensorValue}</strong></span>
        <span className="text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:underline">
          Map View <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
