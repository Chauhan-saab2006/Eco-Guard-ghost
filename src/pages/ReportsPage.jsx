import React from "react";
import { useApp } from "../context/AppContext";
import { exportToCsv } from "../utils/formatters";
import { FileText, Download, Printer } from "lucide-react";

const disasterImages = [
  {
    src: "/images/disasters/000_48PV2C8-1748767385.webp",
    title: "Flooded roadway",
    description: "Standing water affecting local road access.",
  },
  {
    src: "/images/disasters/commuters-wade-through-floodwaters-after-heavy-monsoon-rains-in-kolkata-india-on-september-24.webp",
    title: "Floodwater crossing",
    description: "Residents navigating floodwater after heavy rainfall.",
  },
  {
    src: "/images/disasters/family-walking-in-flowing-water-in-a-stream-in-rains.webp",
    title: "Rapid water flow",
    description: "Flowing water recorded near an affected settlement.",
  },
  {
    src: "/images/disasters/Flood-damage-on-NH6-in-Megahlya-India-East-Jaintia-Hills-Police-343x187.webp",
    title: "Road damage",
    description: "Flood damage reported along a major road route.",
  },
  {
    src: "/images/disasters/flooded-india-flood-victims-moving-to-evacuation-center-heavy-rains-cause-irregular-flood-uttar-pradesh-33407829.webp",
    title: "Evacuation activity",
    description: "Flood-affected residents moving toward assistance.",
  },
  {
    src: "/images/disasters/new-delhi-india-a-view-of-a-flood-water-logged-street-near-salimgarh-fort-back-side-of-red.webp",
    title: "Waterlogged street",
    description: "Urban street conditions during a flood event.",
  },
];

export const ReportsPage = () => {
  const { alerts, reports, hazards, computedRisk, addToast } = useApp();

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.severity === "HIGH" || a.severity === "CRITICAL").length;
  const resolvedAlerts = alerts.filter((a) => a.status === "Resolved").length;
  const reportedIncidents = reports.length;
  const hazardZoneCount = hazards.length;
  const avgScore = computedRisk.overallScore;

  const handleExportCsv = () => {
    const reportData = alerts.map((a) => ({
      ID: a.id,
      Title: a.title,
      Source: a.source,
      Severity: a.severity,
      Status: a.status,
      Timestamp: a.timestamp,
      SensorValue: a.sensorValue,
      MLRiskScore: a.mlRiskScore,
      Message: a.message,
    }));
    exportToCsv("ecowatch-environmental-report.csv", reportData);
    addToast("Report Generated", "Exported environmental incident summary CSV file.", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Environmental Study & Incident Reporting
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated Operational Summary, Field Incident Logs & CSV Audit Generation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Print Summary
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Metric Cards Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Alerts</span>
          <span className="text-xl font-black text-white">{totalAlerts}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/30">
          <span className="text-[10px] text-red-400 font-bold uppercase block">Critical Alerts</span>
          <span className="text-xl font-black text-red-400">{criticalAlerts}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Resolved Alerts</span>
          <span className="text-xl font-black text-emerald-400">{resolvedAlerts}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported Incidents</span>
          <span className="text-xl font-black text-cyan-400">{reportedIncidents}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Hazard Zones</span>
          <span className="text-xl font-black text-amber-400">{hazardZoneCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30">
          <span className="text-[10px] text-purple-300 font-bold uppercase block">Avg Risk Score</span>
          <span className="text-xl font-black text-purple-400">{avgScore} / 100</span>
        </div>
      </div>

      {/* Disaster Evidence Gallery */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Disaster Evidence Gallery</h3>
          <p className="text-xs text-slate-400 mt-1">Visual field references from recent flood and access incidents.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {disasterImages.map((image) => (
            <figure key={image.src} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              <figcaption className="p-3">
                <h4 className="text-sm font-bold text-white">{image.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{image.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight">Active & Historical Incidents Audit</h3>
        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden text-xs">
          {reports.map((rep) => (
            <div key={rep.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{rep.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                    {rep.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">Location: {rep.location} • Reported by: {rep.reportedBy}</p>
                <p className="text-slate-300 text-xs">{rep.description}</p>
              </div>

              <span className="text-[10px] text-slate-500 font-mono shrink-0">{rep.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
