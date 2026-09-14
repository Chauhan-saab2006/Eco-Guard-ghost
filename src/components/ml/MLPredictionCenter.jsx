import React from "react";
import { useApp } from "../../context/AppContext";
import { RiskIndicator } from "./RiskIndicator";
import { ModelInputBar } from "./ModelInputBar";
import { getPredictionExplanation } from "../../utils/riskCalculator";
import {
  BrainCircuit,
  Radio,
  CloudSun,
  History,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FilePlus,
  BellRing,
  Info,
} from "lucide-react";

export const MLPredictionCenter = ({ onViewAlertModal, onCreateReportModal }) => {
  const {
    currentMLPrediction,
    mlCategory,
    setMlCategory,
    computedRisk,
    nodes,
    apiData,
    setActivePage,
    alerts,
  } = useApp();

  const detectedEvents = Object.values(computedRisk.events || {});

  const activeCategoryData =
    currentMLPrediction.predictions[mlCategory] || currentMLPrediction.predictions.Overall;

  // Use dynamically calculated score from computedRisk
  let currentScore = computedRisk.overallScore;
  let currentLevel = computedRisk.overallLevel;

  if (mlCategory === "Landslide") {
    currentScore = computedRisk.landslideScore;
    currentLevel = computedRisk.landslideLevel;
  } else if (mlCategory === "Flood") {
    currentScore = computedRisk.floodScore;
    currentLevel = computedRisk.floodLevel;
  } else if (mlCategory === "AirQuality") {
    currentScore = computedRisk.airQualityScore;
    currentLevel = computedRisk.airQualityLevel;
  }

  const dynamicExplanation = getPredictionExplanation(
    mlCategory,
    currentLevel,
    nodes,
    apiData
  );

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-950/60">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              ML Prediction Center
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                AI Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">AI-based Environmental Risk Assessment & Early Warning Engine</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto overflow-x-auto">
          {["Overall", "Landslide", "Flood", "AirQuality"].map((cat) => {
            const isActive = mlCategory === cat;
            const labels = {
              Overall: "Overall Risk",
              Landslide: "Landslide",
              Flood: "Flood",
              AirQuality: "Air Quality",
            };
            return (
              <button
                key={cat}
                onClick={() => setMlCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>
      </div>



      {/* Main Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Risk score indicator & model specs */}
        <div className="lg:col-span-4 space-y-4">
          <RiskIndicator score={currentScore} level={currentLevel} />

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Predicted Hazard:</span>
              <span className="text-white font-bold">{activeCategoryData.hazard}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
              <span>Model Version:</span>
              <span className="text-slate-300 font-mono">{currentMLPrediction.modelVersion}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Last Inferenced:</span>
              <span className="text-slate-300 font-mono">{currentMLPrediction.lastPredictionTime}</span>
            </div>
          </div>
        </div>

        {/* Right: Model Input Parameters & Influence */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Model Input Parameters & Feature Influence
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Normalized Feature Weights</span>
            </div>

            <div className="space-y-2.5">
              {activeCategoryData.inputInfluences.map((input, idx) => (
                <ModelInputBar key={idx} {...input} />
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
