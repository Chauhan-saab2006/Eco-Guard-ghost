import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApiKeyMasker } from "../components/api/ApiKeyMasker";
import { exportToCsv } from "../utils/formatters";
import { generateHistoryData } from "../data/mockHistory";
import { CloudSun, Key, Download, CheckCircle2 } from "lucide-react";

export const ApiDataPage = () => {
  const { apiData, addToast } = useApp();
  const [timeframe, setTimeframe] = useState("24h");

  const handleExportCsv = () => {
    const { apiHistory } = generateHistoryData(timeframe);
    exportToCsv(`ecowatch-api-history-${timeframe}.csv`, apiHistory);
    addToast("Export Started", `Downloaded API history data (${timeframe}) as CSV.`, "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-purple-400" />
            Overall Area — API Data Integration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Region-Wide External Weather & Environmental Data Feed (Separate from Physical Nodes 1 & 2)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-950/50"
          >
            <Download className="w-4 h-4" />
            Export API Data (CSV)
          </button>
        </div>
      </div>

      {/* API Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Connection Status</span>
          <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5" /> 200 OK — Connected
          </span>
          <span className="text-[10px] text-slate-400 block">Latency: {apiData.latency}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">API Provider</span>
          <span className="text-base font-bold text-white block truncate">{apiData.provider}</span>
          <span className="text-[10px] text-purple-300 block">Rest API v2 Endpoint</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Requests Today</span>
          <span className="text-base font-bold text-white font-mono">{apiData.requestsToday} reqs</span>
          <span className="text-[10px] text-emerald-400 block">0 Errors (100% Reliability)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Data Freshness</span>
          <span className="text-base font-bold text-purple-400">{apiData.dataFreshness}</span>
          <span className="text-[10px] text-slate-400 block">Updated: {apiData.lastUpdate}</span>
        </div>
      </div>

      {/* API Key & Endpoint Security Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/30 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" />
          API Credential & Endpoint Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <ApiKeyMasker apiKey={apiData.apiKeyMasked} />
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-slate-300 flex items-center justify-between">
            <span className="text-slate-500 text-[10px]">Endpoint:</span>
            <span className="text-slate-200 text-[11px] truncate">{apiData.apiEndpoint}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
