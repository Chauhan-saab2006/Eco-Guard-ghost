import React, { useState } from "react";
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
import { generateHistoryData } from "../../data/mockHistory";
import { useApp } from "../../context/AppContext";
import { LineChart as ChartIcon, Radio, CloudSun } from "lucide-react";

export const SensorHistoryChart = ({ title, type = "node1" }) => {
  const [timeframe, setTimeframe] = useState("24h");

  // Try Firebase history from context; fall back to generated mock data
  const { firebaseHistory } = useApp();
  const mockHistory = generateHistoryData(timeframe);

  const { node1History, node2History, apiHistory } = firebaseHistory || mockHistory;

  // Active line toggles
  const [visibleLines, setVisibleLines] = useState({
    p1: true,
    p2: true,
    p3: true,
    p4: true,
  });

  const toggleLine = (key) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  let data = node1History?.length ? node1History : mockHistory.node1History;
  let lineConfigs = [
    { key: "temperature", name: "Temp (°C)", color: "#ef4444", paramKey: "p1" },
    { key: "humidity", name: "Humidity (%)", color: "#06b6d4", paramKey: "p2" },
    { key: "soilMoisture", name: "Soil Moisture (%)", color: "#d97706", paramKey: "p3" },
    { key: "rainfall", name: "MQ3 Gas (ppm)", color: "#2563eb", paramKey: "p4" },
  ];

  if (type === "node2") {
    data = node2History?.length ? node2History : mockHistory.node2History;
    lineConfigs = [
      { key: "temperature", name: "Temp (°C)", color: "#ef4444", paramKey: "p1" },
      { key: "humidity", name: "Humidity (%)", color: "#06b6d4", paramKey: "p2" },
      { key: "pm25", name: "MQ5 Gas (ppm)", color: "#a855f7", paramKey: "p3" },
      { key: "waterLevel", name: "Distance (m)", color: "#10b981", paramKey: "p4" },
    ];
  } else if (type === "api") {
    data = apiHistory?.length ? apiHistory : mockHistory.apiHistory;
    lineConfigs = [
      { key: "temperature", name: "Temp (°C)", color: "#ef4444", paramKey: "p1" },
      { key: "aqi", name: "AQI (MQ3÷5)", color: "#f59e0b", paramKey: "p2" },
      { key: "pm25", name: "PM2.5 (MQ5÷6)", color: "#a855f7", paramKey: "p3" },
      { key: "rainfall", name: "MQ7 (÷10)", color: "#2563eb", paramKey: "p4" },
    ];
  }

  let Icon = Radio;
  if (type === "api") Icon = CloudSun;

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
        </div>

        {/* Time selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          {["1h", "6h", "24h", "7d"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                timeframe === tf ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Toggles */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {lineConfigs.map((cfg) => {
          const isVisible = visibleLines[cfg.paramKey];
          return (
            <button
              key={cfg.key}
              onClick={() => toggleLine(cfg.paramKey)}
              className={`px-2 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                isVisible
                  ? "bg-slate-950 border-slate-700 text-slate-200"
                  : "bg-slate-950/40 border-slate-900 text-slate-600 line-through"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span>{cfg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Recharts Area */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "10px",
                fontSize: "11px",
                color: "#f8fafc",
              }}
            />
            {lineConfigs.map(
              (cfg) =>
                visibleLines[cfg.paramKey] && (
                  <Line
                    key={cfg.key}
                    type="monotone"
                    dataKey={cfg.key}
                    name={cfg.name}
                    stroke={cfg.color}
                    strokeWidth={2}
                    dot={false}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
