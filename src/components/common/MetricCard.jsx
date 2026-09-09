import React from "react";

export const MetricCard = ({ icon: Icon, title, value, unit, subtitle, status = "normal" }) => {
  let borderColor = "border-slate-800";
  let textColor = "text-slate-100";
  let iconBg = "bg-slate-800 text-slate-300";

  if (status === "warning") {
    borderColor = "border-amber-500/40";
    textColor = "text-amber-300";
    iconBg = "bg-amber-500/20 text-amber-400";
  } else if (status === "critical") {
    borderColor = "border-red-500/40";
    textColor = "text-red-300";
    iconBg = "bg-red-500/20 text-red-400";
  }

  return (
    <div
      className={`p-3 rounded-2xl bg-slate-900/80 border ${borderColor} flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-all`}
    >
      <div className="space-y-0.5 overflow-hidden">
        <span className="text-[11px] font-medium text-slate-400 block truncate">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${textColor}`}>{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
        </div>
        {subtitle && <span className="text-[10px] text-slate-500 block truncate">{subtitle}</span>}
      </div>

      {Icon && (
        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
