import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { NodeCard } from "../components/nodes/NodeCard";
import { NodeDetailModal } from "../components/nodes/NodeDetailModal";
import { NodeHistoryModal } from "../components/nodes/NodeHistoryModal";
import { Radio, Cpu, Zap } from "lucide-react";

export const NodesPage = () => {
  const { nodes, addToast } = useApp();
  const [selectedNodeModal, setSelectedNodeModal] = useState(null);
  const [selectedNodeHistoryModal, setSelectedNodeHistoryModal] = useState(null);

  const handleRunDiagnostic = (nodeName) => {
    addToast("Diagnostic Initiated", `Running full ping & packet test on ${nodeName}...`, "info");
    setTimeout(() => {
      addToast("Diagnostic Passed", `${nodeName} hardware & sensors 100% operational!`, "success");
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-400" />
            Physical IoT Hardware Nodes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry & Diagnostic Management for 2 Physical Deployed Hardware Stations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            2 / 2 Nodes Online
          </span>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nodes.map((node) => (
          <div key={node.id} className="space-y-4">
            <NodeCard
              node={node}
              isSelected={true}
              onViewDetails={(n) => setSelectedNodeModal(n)}
              onViewHistory={(n) => setSelectedNodeHistoryModal(n)}
            />

            {/* Diagnostic Control Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Diagnostic Test:</span>
                <span className="font-semibold text-slate-200">Self-Check Ready</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunDiagnostic(node.name)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Run Self-Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Node Detail Modal */}
      {selectedNodeModal && (
        <NodeDetailModal
          isOpen={!!selectedNodeModal}
          onClose={() => setSelectedNodeModal(null)}
          node={selectedNodeModal}
        />
      )}

      {/* Node History Modal */}
      {selectedNodeHistoryModal && (
        <NodeHistoryModal
          isOpen={!!selectedNodeHistoryModal}
          onClose={() => setSelectedNodeHistoryModal(null)}
          node={selectedNodeHistoryModal}
        />
      )}
    </div>
  );
};
