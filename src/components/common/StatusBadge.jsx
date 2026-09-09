import React from "react";
import { getRiskColor } from "../../utils/riskCalculator";

export const StatusBadge = ({ type, text }) => {
  if (type === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {text || "Online"}
      </span>
    );
  }

  if (type === "lora") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
        📡 {text || "LoRa Connected"}
      </span>
    );
  }

  if (type === "gsm") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
        📶 {text || "GSM Connected"}
      </span>
    );
  }

  if (type === "api") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
        🌐 {text || "API Connected"}
      </span>
    );
  }

  if (type === "risk") {
    const styling = getRiskColor(text);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styling.badge}`}>
        {text} RISK
      </span>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
      {text}
    </span>
  );
};
