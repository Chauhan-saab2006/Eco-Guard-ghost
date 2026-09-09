import React from "react";
import { Modal } from "../common/Modal";
import { Radio, Battery, Wifi, Cpu, Clock, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export const NodeDetailModal = ({ isOpen, onClose, node }) => {
  if (!node) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${node.name} — Hardware Diagnostic`}>
      <div className="space-y-5">
        {/* Status Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">System Status</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> {node.status}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Communication</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{node.communication}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Battery Health</span>
            <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
              <Battery className="w-4 h-4 text-emerald-400" /> {node.battery}%
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Signal Strength</span>
            <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
              <Wifi className="w-4 h-4 text-cyan-400" /> {node.signalStrength} dBm
            </span>
          </div>
        </div>

        {/* Detailed Spec Sheet */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Hardware & Telemetry Parameters</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Hardware Unit:</span>
                <span className="text-slate-200 font-mono">{node.hardwareVersion}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Firmware Build:</span>
                <span className="text-slate-200 font-mono">{node.firmwareVersion}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Protocol:</span>
                <span className="text-slate-200 font-mono">{node.protocol}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Geo Location:</span>
                <span className="text-slate-200 font-mono">{node.lat}, {node.lng}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Elevation:</span>
                <span className="text-slate-200">{node.elevation}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Installed:</span>
                <span className="text-slate-200">{node.installationDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sensor Threshold Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Sensor Verification</h4>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden">
            {Object.entries(node.sensors).map(([key, sensor]) => (
              <div key={key} className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white capitalize">{key}</span>
                  <span className="text-[10px] text-slate-400 block">
                    Safe Range: {sensor.safeRange ? `${sensor.safeRange[0]}–${sensor.safeRange[1]} ${sensor.unit}` : "Standard"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">
                    {sensor.value} {sensor.unit}
                  </span>
                  <span
                    className={`block text-[10px] font-bold uppercase ${
                      sensor.status === "critical"
                        ? "text-red-400"
                        : sensor.status === "warning"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {sensor.status || "NORMAL"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
