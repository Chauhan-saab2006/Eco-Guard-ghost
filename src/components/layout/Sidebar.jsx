import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Radio,
  BrainCircuit,
  LineChart,
  FileText,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Trees,
} from "lucide-react";

export const Sidebar = () => {
  const { activePage, setActivePage, lastRefreshedAt, computedRisk } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "nodes", label: "Nodes", icon: Radio },
    { id: "ml-predictions", label: "ML Predictions", icon: BrainCircuit },
    { id: "analytics", label: "Analytics", icon: LineChart },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "hazards", label: "Hazard Zones", icon: ShieldAlert },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-slate-900 border-r border-slate-800 transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-64"
      } hidden md:flex min-h-screen shrink-0`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 shrink-0">
              <Trees className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-bold text-lg text-white leading-tight tracking-tight">EcoWatch</h1>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase truncate">
                  Environmental Study & Alert
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
                title={collapsed ? item.label : ""}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"}`} />
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? "bg-white text-emerald-900" : "bg-red-500 text-white animate-pulse"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer — Status Indicator */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-emerald-400">System Online</span>
              </div>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Last Sync:</span>
                <span className="text-slate-200 font-mono">{lastRefreshedAt}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Env Status:</span>
                <span
                  className={`font-semibold ${
                    computedRisk.overallLevel === "CRITICAL" || computedRisk.overallLevel === "HIGH"
                      ? "text-red-400"
                      : computedRisk.overallLevel === "MODERATE"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {computedRisk.overallLevel} RISK
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2" title="System Online">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
