import React from "react";
import { useApp } from "../context/AppContext";
import { LineChart, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export const AnalyticsPage = () => {
  const { computedRisk } = useApp();

  const healthScore = Math.max(10, 100 - computedRisk.overallScore);

  const correlationData = [
    { factor: "Soil vs Rain", correlation: "+0.88", strength: "Very Strong", status: "Critical Impact" },
    { factor: "Water vs Rain", correlation: "+0.74", strength: "Strong", status: "Elevated Risk" },
    { factor: "PM2.5 vs Wind", correlation: "-0.62", strength: "Inverse", status: "Dispersion" },
    { factor: "Temp vs Humidity", correlation: "-0.78", strength: "Inverse", status: "Normal" },
  ];

  const accuracyData = [
    { epoch: "E1", accuracy: 82, precision: 80, recall: 84 },
    { epoch: "E2", accuracy: 85, precision: 83, recall: 86 },
    { epoch: "E3", accuracy: 87, precision: 86, recall: 88 },
    { epoch: "E4", accuracy: 91, precision: 89, recall: 92 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <LineChart className="w-6 h-6 text-emerald-400" />
            Environmental Analytics & AI Performance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System Health Index, Node vs API Correlation & ML Model Confusion Metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">Health Index</span>
            <span className="text-lg font-black text-white">{healthScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Confusion / Accuracy Chart */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            ML Prediction Model Accuracy Trend (%)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} />
                <YAxis domain={[70, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="accuracy" name="Accuracy %" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" name="Precision %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" name="Recall %" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Matrix Table */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-3">
              Environmental Factor Correlation Matrix
            </h3>

            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden text-xs">
              {correlationData.map((row, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{row.factor}</span>
                    <span className="text-[10px] text-slate-400">{row.strength} Correlation</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 block">{row.correlation}</span>
                    <span className="text-[10px] text-slate-300 font-semibold">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
            *High positive correlation between Soil Moisture & Rainfall intensity (+0.88) represents the primary statistical driver behind Landslide Risk prediction alerts.
          </p>
        </div>
      </div>
    </div>
  );
};
