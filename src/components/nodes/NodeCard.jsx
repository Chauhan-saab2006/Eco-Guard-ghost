import React from "react";
import { SensorGauge } from "../common/SensorGauge";
import { StatusBadge } from "../common/StatusBadge";
import { Radio, Battery, Wifi, Clock, ArrowRight } from "lucide-react";

export const NodeCard = ({ node, isSelected, onViewDetails, onViewHistory }) => {
  const isNode1 = node.id === "node-1";

  return (
    <div
      id={`node-card-${node.id}`}
      className={`p-4 sm:p-5 rounded-3xl bg-slate-900/95 border transition-all duration-300 shadow-xl flex flex-col justify-between min-w-0 w-full ${
        isSelected
          ? isNode1
            ? "border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-900"
            : "border-cyan-500 ring-2 ring-cyan-500/30 bg-slate-900"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Node Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-2xl text-white shrink-0 ${
                isNode1
                  ? "bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/60"
                  : "bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-950/60"
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-extrabold tracking-tight leading-snug ${
                isNode1 ? "text-emerald-400" : "text-cyan-400"
              }`}>
                {node.name}
              </h3>
              {/* Both LoRa and GSM Connected badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <StatusBadge type="online" text={node.status} />
                <StatusBadge type="lora" text="LoRa Connected" />
                <StatusBadge type="gsm" text="GSM Connected" />
              </div>
            </div>
          </div>

          {/* Telemetry pill */}
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 shrink-0">
            <div className="flex items-center gap-1" title="Battery Level">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{node.battery}%</span>
            </div>
            <div className="flex items-center gap-1" title="Signal Strength">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>{node.signalStrength} dBm</span>
            </div>
          </div>
        </div>

        {/* Sensor Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
          {isNode1 ? (
            <>
              <SensorGauge
                title="Temperature"
                value={node.sensors.temperature.value}
                unit="°C"
                min={0}
                max={50}
                safeRange={node.sensors.temperature.safeRange}
                status={node.sensors.temperature.status}
              />
              <SensorGauge
                title="Humidity"
                value={node.sensors.humidity.value}
                unit="%"
                min={0}
                max={100}
                safeRange={node.sensors.humidity.safeRange}
                status={node.sensors.humidity.status}
              />
              <SensorGauge
                title="Soil Moisture"
                value={node.sensors.soilMoisture.value}
                unit="%"
                min={0}
                max={100}
                safeRange={node.sensors.soilMoisture.safeRange}
                warningThreshold={70}
                criticalThreshold={85}
                status={node.sensors.soilMoisture.status}
              />
              <SensorGauge
                title="Rainfall"
                value={node.sensors.rainfall.value}
                unit="mm/h"
                min={0}
                max={100}
                safeRange={node.sensors.rainfall.safeRange}
                warningThreshold={25}
                criticalThreshold={40}
                status={node.sensors.rainfall.status}
              />
            </>
          ) : (
            <>
              <SensorGauge
                title="Temperature"
                value={node.sensors.temperature.value}
                unit="°C"
                min={0}
                max={50}
                safeRange={node.sensors.temperature.safeRange}
                status={node.sensors.temperature.status}
              />
              <SensorGauge
                title="Humidity"
                value={node.sensors.humidity.value}
                unit="%"
                min={0}
                max={100}
                safeRange={node.sensors.humidity.safeRange}
                status={node.sensors.humidity.status}
              />
              <SensorGauge
                title="Air (PM2.5)"
                value={node.sensors.pm25.value}
                unit="µg/m³"
                min={0}
                max={250}
                safeRange={node.sensors.pm25.safeRange}
                warningThreshold={50}
                criticalThreshold={100}
                status={node.sensors.pm25.status}
              />
              <SensorGauge
                title="Vibration"
                value={node.sensors.vibration?.value}
                unit=""
                min={0}
                max={1}
                safeRange={["Not Detected"]}
                status={node.sensors.vibration?.status}
                isText={true}
              />
            </>
          )}
        </div>
      </div>

      {/* Node Footer Actions — Fixed width & no overflow */}
      <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate min-w-0">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">Updated: <strong className="text-slate-200">{node.lastUpdate}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onViewDetails(node)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onViewHistory(node)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1"
          >
            <span>History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
