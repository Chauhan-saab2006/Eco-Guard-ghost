import React from "react";
import { useApp } from "../../context/AppContext";
import { ApiKeyMasker } from "./ApiKeyMasker";
import { StatusBadge } from "../common/StatusBadge";
import { MetricCard } from "../common/MetricCard";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Gauge,
  Eye,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const ApiOverviewCard = ({ onViewApiHistory }) => {
  const { apiData, setActivePage } = useApp();

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 shadow-xl space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-950/50">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{apiData.name}</h3>
              <p className="text-xs text-purple-300 font-medium">{apiData.subtitle}</p>
            </div>
          </div>

          <StatusBadge type="api" text={apiData.status} />
        </div>


      </div>

      {/* Environmental Metric Cards Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Region-wide Telemetry</h4>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            icon={Thermometer}
            title="Temperature"
            value={`${apiData.sensors.temperature.value} °C`}
          />
          <MetricCard
            icon={Droplets}
            title="Humidity"
            value={`${apiData.sensors.humidity.value} %`}
          />
          <MetricCard
            icon={Activity}
            title="Air Quality (AQI)"
            value={apiData.sensors.aqi.value}
            subtitle={apiData.sensors.aqi.label}
            status="warning"
          />
          <MetricCard
            icon={Wind}
            title="PM2.5"
            value={`${apiData.sensors.pm25.value} µg/m³`}
          />
          <MetricCard
            icon={CloudRain}
            title="Rainfall"
            value={`${apiData.sensors.rainfall.value} mm/h`}
          />
          <MetricCard
            icon={Wind}
            title="Wind Speed"
            value={`${apiData.sensors.windSpeed.value} km/h`}
            subtitle={apiData.sensors.windDirection}
          />
          <MetricCard
            icon={Gauge}
            title="Pressure"
            value={`${apiData.sensors.pressure.value} hPa`}
          />
          <MetricCard
            icon={Eye}
            title="Visibility"
            value={`${apiData.sensors.visibility.value} km`}
          />
        </div>
      </div>

      {/* Button Action */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (onViewApiHistory) onViewApiHistory();
            else setActivePage("api-data");
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>View API History & Data Diagnostics</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
