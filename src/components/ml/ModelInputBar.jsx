import React from "react";

export const ModelInputBar = ({ parameter, value, influence, weight, status }) => {
  let barColor = "bg-emerald-500";
  let textColor = "text-slate-300";

  if (influence === "High" || status === "critical") {
    barColor = "bg-red-500";
    textColor = "text-red-300 font-semibold";
  } else if (influence === "Medium" || status === "warning") {
    barColor = "bg-amber-500";
    textColor = "text-amber-300 font-semibold";
  }

  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between items-center text-slate-300">
        <span className="truncate font-medium">{parameter}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-white font-bold">{value}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 ${textColor}`}>
            {influence} Influence
          </span>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(10, weight))}%` }}
        />
      </div>
    </div>
  );
};
