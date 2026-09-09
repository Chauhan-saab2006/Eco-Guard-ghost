import React from "react";
import { getRiskColor } from "../../utils/riskCalculator";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

export const RiskIndicator = ({ score = 82, level = "HIGH" }) => {
  const styles = getRiskColor(level);

  let Icon = CheckCircle2;
  if (level === "CRITICAL" || level === "HIGH") Icon = ShieldAlert;
  if (level === "MODERATE") Icon = AlertTriangle;

  return (
    <div className={`p-4 rounded-3xl border ${styles.border} ${styles.bg} flex flex-col items-center justify-center text-center space-y-2 shadow-lg`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-6 h-6 ${styles.text}`} />
        <span className={`text-2xl font-black tracking-tight ${styles.text}`}>
          {level} RISK
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-slate-400 font-bold">/ 100</span>
      </div>

      <span className="text-[11px] text-slate-300 font-medium">
        Calculated AI Environmental Risk Score
      </span>
    </div>
  );
};
