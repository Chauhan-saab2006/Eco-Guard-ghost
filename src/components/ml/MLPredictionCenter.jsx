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

      {/* Sensor event evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {detectedEvents.map((event) => (
          <div
            key={event.title}
            className={`p-3 rounded-2xl border ${event.active
              ? "bg-red-500/15 border-red-500/50"
              : "bg-slate-950/60 border-slate-800"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200">{event.title}</span>
              <span className={`text-[10px] font-bold ${event.active ? "text-red-400" : "text-emerald-400"}`}>
                {event.active ? "DETECTED" : "CLEAR"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{event.details}</p>
          </div>
        ))}
      </div>

      {/* Central Visual Data Flow Pipeline */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] text-xs font-semibold text-slate-300 px-2 py-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>Node 1 (LoRa)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
            <Radio className="w-3.5 h-3.5" />
            <span>Node 2 (GSM)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-400">
            <CloudSun className="w-3.5 h-3.5" />
            <span>API Weather</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
            <History className="w-3.5 h-3.5" />
            <span>24h Trends</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ML Model</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Score</span>
          </div>
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
            <div className="flex justify-between text-slate-400">
              <span>Model Confidence:</span>
              <span className="text-emerald-400 font-bold">{activeCategoryData.confidence}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Prediction Horizon:</span>
              <span className="text-cyan-300 font-semibold">{activeCategoryData.horizon}</span>
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

      {/* Dynamic Explanation Section */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <Info className="w-4 h-4" />
          <span>Why is the ML Model predicting this?</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans pl-6">
          "{dynamicExplanation}"
        </p>
      </div>

      {/* Recommended Action Footer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
            Recommended Operational Action
          </span>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Issue Early Warning & Alert Field Patrol
          </h4>
          <ul className="text-xs text-slate-400 space-y-0.5 pl-5 list-disc">
            {activeCategoryData.recommendedActions.slice(0, 3).map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (onViewAlertModal) onViewAlertModal();
              else setActivePage("alerts");
            }}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <BellRing className="w-4 h-4" />
            <span>View Active Alert</span>
          </button>

          <button
            onClick={() => {
              if (onCreateReportModal) onCreateReportModal();
              else setActivePage("reports");
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4" />
            <span>Create Incident Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
