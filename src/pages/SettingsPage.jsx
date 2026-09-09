import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Settings, Sliders, Moon, Sun, Save } from "lucide-react";

export const SettingsPage = () => {
  const {
    thresholds,
    updateThresholds,
    refreshRateSec,
    setRefreshRateSec,
    theme,
    setTheme,
  } = useApp();

  const [formThresholds, setFormThresholds] = useState(thresholds);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateThresholds(formThresholds);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            System & Safety Threshold Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Live Alert Safety Triggers, Display Preferences & Auto-Sync Intervals
          </p>
        </div>
      </div>

      {/* Threshold Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Critical Alert Safety Thresholds</h3>
            <p className="text-xs text-slate-400">Modifying thresholds dynamically updates alert triggers system-wide</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Soil Moisture */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold text-white">
              <span>Soil Moisture Threshold</span>
              <span className="text-emerald-400 font-mono">{formThresholds.soilMoisture} %</span>
            </div>
            <input
              type="number"
              min={10}
              max={95}
              value={formThresholds.soilMoisture}
              onChange={(e) => setFormThresholds({ ...formThresholds, soilMoisture: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block">Values above this trigger High Soil Saturation alert</span>
          </div>

          {/* Rainfall Intensity */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold text-white">
              <span>Rainfall Intensity Threshold</span>
              <span className="text-blue-400 font-mono">{formThresholds.rainfall} mm/h</span>
            </div>
            <input
              type="number"
              min={5}
              max={100}
              value={formThresholds.rainfall}
              onChange={(e) => setFormThresholds({ ...formThresholds, rainfall: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block">Torrential downpour warning limit</span>
          </div>

          {/* PM2.5 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold text-white">
              <span>PM2.5 Air Quality Limit</span>
              <span className="text-purple-400 font-mono">{formThresholds.pm25} µg/m³</span>
            </div>
            <input
              type="number"
              min={15}
              max={250}
              value={formThresholds.pm25}
              onChange={(e) => setFormThresholds({ ...formThresholds, pm25: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block">Unhealthy air particulate threshold</span>
          </div>

          {/* River Water Level */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold text-white">
              <span>River Water Level Limit</span>
              <span className="text-cyan-400 font-mono">{formThresholds.waterLevel} m</span>
            </div>
            <input
              type="number"
              step={0.1}
              min={0.5}
              max={6.0}
              value={formThresholds.waterLevel}
              onChange={(e) => setFormThresholds({ ...formThresholds, waterLevel: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block">Embankment flood warning line</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save & Update Thresholds
          </button>
        </div>
      </form>

      {/* Refresh Rate & Display Mode Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl text-xs">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
          Telemetry Refresh & Interface Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block">Live Simulation Tick Rate</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 10, label: "10 sec" },
                { sec: 30, label: "30 sec" },
                { sec: 60, label: "1 min" },
                { sec: 300, label: "5 min" },
              ].map((item) => (
                <button
                  key={item.sec}
                  type="button"
                  onClick={() => setRefreshRateSec(item.sec)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    refreshRateSec === item.sec
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-bold block">Theme Preference</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "dark"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-950 text-slate-400 border border-slate-800"
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark Theme
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "light"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-950 text-slate-400 border border-slate-800"
                }`}
              >
                <Sun className="w-4 h-4" />
                Light Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
