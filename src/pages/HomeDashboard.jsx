import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertPanel } from "../components/alerts/AlertPanel";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { ReportedSections } from "../components/hazards/ReportedSections";
import { HazardZones } from "../components/hazards/HazardZones";
import { MapPanel } from "../components/map/MapPanel";
import { NodeCard } from "../components/nodes/NodeCard";
import { NodeDetailModal } from "../components/nodes/NodeDetailModal";
import { NodeHistoryModal } from "../components/nodes/NodeHistoryModal";
import { ApiOverviewCard } from "../components/api/ApiOverviewCard";
import { MLPredictionCenter } from "../components/ml/MLPredictionCenter";
import { MLHistoryChart } from "../components/ml/MLHistoryChart";
import { SensorHistoryChart } from "../components/charts/SensorHistoryChart";
import { Modal } from "../components/common/Modal";
import { FilePlus, ShieldAlert, Radio, CloudSun, Activity } from "lucide-react";

export const HomeDashboard = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, addReportedSection, setActivePage, alerts } = useApp();

  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [selectedNodeForModal, setSelectedNodeForModal] = useState(null);
  const [selectedNodeHistoryForModal, setSelectedNodeHistoryForModal] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [reportForm, setReportForm] = useState({
    title: "",
    location: "Hill Sector NH-13",
    severity: "HIGH",
    reportedBy: "Operator Station",
    description: "",
  });

  const node1 = nodes.find((n) => n.id === "node-1") || nodes[0];
  const node2 = nodes.find((n) => n.id === "node-2") || nodes[1];

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.description) return;
    addReportedSection(reportForm);
    setIsReportModalOpen(false);
    setReportForm({
      title: "",
      location: "Hill Sector NH-13",
      severity: "HIGH",
      reportedBy: "Operator Station",
      description: "",
    });
  };

  const { computedRisk, apiData } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* HERO COMMAND CENTER METRIC BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Risk */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-red-500/40 transition-all duration-300 shadow-xl flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Global AI Risk Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{computedRisk.overallScore}</span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-tight">{computedRisk.overallLevel} RISK</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Real-time model inference</span>
          </div>
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Metric 2: IoT Hardware Telemetry */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-xl flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Hardware Nodes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">2 / 2</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-tight">100% ONLINE</span>
            </div>
            <span className="text-[11px] text-slate-400 block">LoRa & GSM mesh connected</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Regional Weather */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 shadow-xl flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Regional API Telemetry
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{apiData.sensors.temperature.value}°C</span>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-tight">AQI {apiData.sensors.aqi.value}</span>
            </div>
            <span className="text-[11px] text-slate-400 block">OpenWeather API Connected</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform">
            <CloudSun className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Early Warnings */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Warnings
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{alerts.filter(a => a.status === 'Active').length}</span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-tight">ALERT ACTIVE</span>
            </div>
            <span className="text-[11px] text-slate-400 block">3 Critical Zones Monitored</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION 1: Map Panel (8 Cols) & Live Regional API / Alert Overview (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <MapPanel
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              const card = document.getElementById(`node-card-${id}`);
              if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <ApiOverviewCard onViewApiHistory={() => setActivePage("api-data")} />
          <AlertPanel onSelectAlert={(a) => setSelectedAlertForModal(a)} />
        </div>
      </div>

      {/* SECTION 2: Live IoT Node Hardware Cards (50/50 Grid - 6 Cols Each) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <NodeCard
          node={node1}
          isSelected={selectedNodeId === "node-1"}
          onViewDetails={(n) => setSelectedNodeForModal(n)}
          onViewHistory={(n) => setSelectedNodeHistoryForModal(n)}
        />
        <NodeCard
          node={node2}
          isSelected={selectedNodeId === "node-2"}
          onViewDetails={(n) => setSelectedNodeForModal(n)}
          onViewHistory={(n) => setSelectedNodeHistoryForModal(n)}
        />
      </div>

      {/* SECTION 3: ML Prediction Command Center (Full Width 12 Cols) */}
      <MLPredictionCenter
        onViewAlertModal={() => {
          const activeAlert = alerts[0];
          if (activeAlert) setSelectedAlertForModal(activeAlert);
          else setActivePage("alerts");
        }}
        onCreateReportModal={() => setIsReportModalOpen(true)}
      />

      {/* SECTION 4: Reported Incident Sections & Critical Hazard Zones (Side-by-Side 50/50 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ReportedSections />
        <HazardZones />
      </div>

      {/* SECTION 5: ML Risk Prediction Trajectory History Chart (Full Width) */}
      <MLHistoryChart />

      {/* SECTION 5: Environmental Sensor Histories (Full Width 3-Column Grid) */}
      <div id="sensor-history-section" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-base font-bold text-white tracking-tight">
            Environmental Sensor Histories
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Telemetry Streams</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <SensorHistoryChart title="Node 1 — Hill Sector" type="node1" />
          <SensorHistoryChart title="Node 2 — River Bank" type="node2" />
          <SensorHistoryChart title="API History (Region)" type="api" />
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlertForModal && (
        <AlertDetailModal
          isOpen={!!selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          alert={selectedAlertForModal}
        />
      )}

      {/* Node Hardware Detail Modal */}
      {selectedNodeForModal && (
        <NodeDetailModal
          isOpen={!!selectedNodeForModal}
          onClose={() => setSelectedNodeForModal(null)}
          node={selectedNodeForModal}
        />
      )}

      {/* Node Sensor History Modal */}
      {selectedNodeHistoryForModal && (
        <NodeHistoryModal
          isOpen={!!selectedNodeHistoryForModal}
          onClose={() => setSelectedNodeHistoryForModal(null)}
          node={selectedNodeHistoryForModal}
        />
      )}

      {/* Create Incident Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Log Incident Report — Field Patrol"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Incident Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Landslide Debris, Water Surge, Rockfall"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Location / Sector</label>
              <input
                type="text"
                value={reportForm.location}
                onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Severity</label>
              <select
                value={reportForm.severity}
                onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description & Field Notes</label>
            <textarea
              rows={3}
              required
              placeholder="Describe observations, affected road lanes, or structural stress..."
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <FilePlus className="w-4 h-4" />
              Submit Incident Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
