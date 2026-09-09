import React from "react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, MapPin, CheckCircle2, ShieldAlert, Radio, CloudSun } from "lucide-react";

export const AlertDetailModal = ({ isOpen, onClose, alert }) => {
  const { acknowledgeAlert, resolveAlert, focusOnMap } = useApp();

  if (!alert) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Alert Detail — ${alert.title}`}>
      <div className="space-y-4">
        {/* Severity Banner */}
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">{alert.title}</h4>
              <p className="text-xs text-slate-300">{alert.location}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-500 text-white font-bold text-xs">
            {alert.severity}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Source</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              {alert.sourceType === "node" ? <Radio className="w-3.5 h-3.5 text-emerald-400" /> : <CloudSun className="w-3.5 h-3.5 text-purple-400" />}
              {alert.source}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Triggered Sensor Value</span>
            <span className="font-bold text-amber-400 font-mono mt-0.5 block">{alert.sensorValue}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">ML Risk Score</span>
            <span className="font-bold text-red-400 mt-0.5 block">{alert.mlRiskScore} / 100</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Status</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">{alert.status}</span>
          </div>
        </div>

        {/* Alert Description */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Trigger Narrative</span>
          <p className="text-xs text-slate-200 leading-relaxed">{alert.message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              focusOnMap(alert.lat, alert.lng, 15);
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            Focus Map Coordinates
          </button>

          <div className="flex items-center gap-2">
            {alert.status === "Active" && (
              <button
                onClick={() => {
                  acknowledgeAlert(alert.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
              >
                Acknowledge
              </button>
            )}

            {alert.status !== "Resolved" && (
              <button
                onClick={() => {
                  resolveAlert(alert.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Resolve Alert
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
