import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { SensorHistoryChart } from "../charts/SensorHistoryChart";
import { Radio, History, Download, Calendar } from "lucide-react";
import { exportToCsv } from "../../utils/formatters";
import { generateHistoryData } from "../../data/mockHistory";

export const NodeHistoryModal = ({ isOpen, onClose, node }) => {
  const [timeframe, setTimeframe] = useState("24h");

  if (!node) return null;

  const isNode1 = node.id === "node-1";

  const handleExportCsv = () => {
    const { node1History, node2History } = generateHistoryData(timeframe);
    const data = isNode1 ? node1History : node2History;
    exportToCsv(`${node.id}-history-${timeframe}.csv`, data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${node.name} — Sensor Telemetry History`}>
      <div className="space-y-4">
        {/* Header summary bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">{node.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
              LoRa + GSM Active
            </span>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>
        </div>

        {/* Recharts chart */}
        <SensorHistoryChart title={`${node.name} Time-Series Data`} type={isNode1 ? "node1" : "node2"} />
      </div>
    </Modal>
  );
};
