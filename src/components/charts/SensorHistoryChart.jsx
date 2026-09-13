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
import { isFirebaseConfigured } from "../../firebase";
import { LineChart as ChartIcon, Radio, CloudSun } from "lucide-react";

export const SensorHistoryChart = ({ title, type = "node1" }) => {
  const [timeframe, setTimeframe] = useState("24h");

  // Try Firebase history from context; fall back to generated mock data
  const { firebaseHistory, isFirebaseLoading, nodes, apiData } = useApp();
  // We no longer use mockHistory for fallbacks
  
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

  const historyLimit = { "1h": 12, "6h": 36, "24h": 144, "7d": 1008 }[timeframe];
  
  const selectLatest = (history, nodeType) => {
    if (!history?.length) {
      // If there is no data of that node, fetch the last known data of that node (from app state)
      if (nodeType === "api") {
        return [
          { time: "-5m", temperature: apiData.sensors.temperature.value, aqi: apiData.sensors.aqi.value, pm25: 15, rainfall: 0 },
          { time: "Latest", temperature: apiData.sensors.temperature.value, aqi: apiData.sensors.aqi.value, pm25: 15, rainfall: 0 }
        ];
      }
      
      const node = nodes.find(n => n.id === (nodeType === "node1" ? "node-1" : "node-2"));
      if (!node) return [];
      
      const pt = {
        time: "Latest",
        temperature: node.sensors.temperature.value,
        humidity: node.sensors.humidity.value,
        soilMoisture: node.sensors.soilMoisture?.value ?? 0,
        rainfall: node.sensors.rainfall?.value ?? 0,
        pm25: node.sensors.pm25?.value ?? 0,
        waterLevel: node.sensors.waterLevel?.value ?? 0
      };
      
      // Return 2 points so the LineChart can draw a flat line
      return [{ ...pt, time: "-5m" }, pt];
    }

    return history.slice(-historyLimit);
  };

  const { node1History, node2History, apiHistory } = firebaseHistory || {};
  let data = selectLatest(node1History, "node1");
  let lineConfigs = [
    { key: "temperature", name: "Temp (°C)", color: "#ef4444", paramKey: "p1" },
    { key: "humidity", name: "Humidity (%)", color: "#06b6d4", paramKey: "p2" },
    { key: "soilMoisture", name: "Soil Moisture (%)", color: "#d97706", paramKey: "p3" },
    { key: "rainfall", name: "MQ3 Gas (ppm)", color: "#2563eb", paramKey: "p4" },
  ];

  if (type === "node2") {
    data = selectLatest(node2History, "node2");
    lineConfigs = [
      { key: "temperature", name: "Temp (°C)", color: "#ef4444", paramKey: "p1" },
      { key: "humidity", name: "Humidity (%)", color: "#06b6d4", paramKey: "p2" },
      { key: "pm25", name: "MQ5 Gas (ppm)", color: "#a855f7", paramKey: "p3" },
      { key: "waterLevel", name: "Distance (m)", color: "#10b981", paramKey: "p4" },
    ];
  } else if (type === "api") {
    data = selectLatest(apiHistory, "api");
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
        {isFirebaseLoading && isFirebaseConfigured ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Loading Firebase sensor history...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No Firebase sensor readings available.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
