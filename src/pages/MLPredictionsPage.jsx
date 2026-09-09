import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { MLPredictionCenter } from "../components/ml/MLPredictionCenter";
import { MLHistoryChart } from "../components/ml/MLHistoryChart";
import { calculateRisk } from "../utils/riskCalculator";
import { BrainCircuit, Sliders, RefreshCw } from "lucide-react";

export const MLPredictionsPage = () => {
  const { thresholds, addToast } = useApp();

  // Interactive Scenario Simulator State
  const [simValues, setSimValues] = useState({
    soilMoisture: 78,
    rainfall: 42.6,
    waterLevel: 1.8,
    pm25: 82,
    aqi: 78,
  });

  // Calculate simulated risk state dynamically
  const mockNodesSim = [
    { id: "node-1", sensors: { soilMoisture: { value: simValues.soilMoisture }, rainfall: { value: simValues.rainfall } } },
    { id: "node-2", sensors: { waterLevel: { value: simValues.waterLevel }, pm25: { value: simValues.pm25 } } },
  ];

  const mockApiSim = { sensors: { rainfall: { value: 3.4 }, aqi: { value: simValues.aqi } } };

  const simRisk = calculateRisk(mockNodesSim, mockApiSim, thresholds);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-emerald-400" />
            AI ML Environmental Risk Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Predictive Analytics, Feature Importance Weights & Scenario Simulation Sandbox
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            Model v1.2 Active
          </span>
        </div>
      </div>

      {/* Main ML Center */}
      <MLPredictionCenter />

      {/* Interactive Scenario Sandbox Simulator */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                ML What-If Scenario Sandbox Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Adjust simulated sensor values to test instant AI risk score inference logic
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSimValues({ soilMoisture: 40, rainfall: 10, waterLevel: 1.0, pm25: 30, aqi: 45 });
              addToast("Sandbox Reset", "Reset sensor values to baseline normal levels", "info");
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Normal
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          {/* Soil Moisture Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Soil Moisture (Node 1)</span>
              <span className="text-emerald-400 font-mono">{simValues.soilMoisture} %</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={simValues.soilMoisture}
              onChange={(e) => setSimValues({ ...simValues, soilMoisture: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Rainfall Intensity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Rainfall (Node 1)</span>
              <span className="text-blue-400 font-mono">{simValues.rainfall} mm/h</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={simValues.rainfall}
              onChange={(e) => setSimValues({ ...simValues, rainfall: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Water Level Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">River Water Level (Node 2)</span>
              <span className="text-cyan-400 font-mono">{simValues.waterLevel} m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.1}
              value={simValues.waterLevel}
              onChange={(e) => setSimValues({ ...simValues, waterLevel: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* PM2.5 Air Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">PM2.5 (Node 2)</span>
              <span className="text-purple-400 font-mono">{simValues.pm25} µg/m³</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              value={simValues.pm25}
              onChange={(e) => setSimValues({ ...simValues, pm25: Number(e.target.value) })}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* Real-time Recalculated Simulated Output Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Simulated Overall Score</span>
            <span className="text-xl font-black text-white">{simRisk.overallScore} / 100</span>
            <span className="text-[10px] text-emerald-400 font-semibold block uppercase">{simRisk.overallLevel}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Landslide Risk</span>
            <span className="text-xl font-black text-red-400">{simRisk.landslideScore} / 100</span>
            <span className="text-[10px] text-red-400 font-semibold block uppercase">{simRisk.landslideLevel}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Flood Risk</span>
            <span className="text-xl font-black text-cyan-400">{simRisk.floodScore} / 100</span>
            <span className="text-[10px] text-cyan-400 font-semibold block uppercase">{simRisk.floodLevel}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Air Quality Risk</span>
            <span className="text-xl font-black text-purple-400">{simRisk.airQualityScore} / 100</span>
            <span className="text-[10px] text-purple-400 font-semibold block uppercase">{simRisk.airQualityLevel}</span>
          </div>
        </div>
      </div>

      {/* History Chart */}
      <MLHistoryChart />
    </div>
  );
};
