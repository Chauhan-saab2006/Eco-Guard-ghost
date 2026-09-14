import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { isFirebaseConfigured } from "../../firebase";
import { BrainCircuit } from "lucide-react";

export const MLHistoryChart = () => {
  const { firebaseHistory, isFirebaseLoading } = useApp();
  const mlRiskHistory = firebaseHistory?.mlRiskHistory?.slice(-50) || [];

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Prediction Data History</h3>
          </div>
        </div>
      </div>

      {/* Recharts Multi-line Chart */}
      <div className="h-64 w-full">
        {isFirebaseLoading && isFirebaseConfigured ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Loading Firebase sensor history...
          </div>
        ) : mlRiskHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No Firebase sensor records available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mlRiskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#f8fafc",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Line
              type="monotone"
              dataKey="overallRisk"
              name="Overall Risk"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="landslideRisk"
              name="Landslide Risk"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="floodRisk"
              name="Flood Risk"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="airQualityRisk"
              name="Air Quality Risk"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
            />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
