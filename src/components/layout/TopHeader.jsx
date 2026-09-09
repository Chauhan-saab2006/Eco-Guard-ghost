import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Bell,
  RefreshCw,
  Play,
  Pause,
  User,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Sun,
  Moon,
} from "lucide-react";

export const TopHeader = ({ onMobileMenuToggle }) => {
  const {
    alerts,
    lastRefreshedAt,
    refreshAllData,
    isLiveSimulating,
    setIsLiveSimulating,
    setActivePage,
    addToast,
    focusOnMap,
    nodes,
    theme,
    setTheme,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === "Active");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();

    // Check node 1, node 2, or overall area
    if (q.includes("1") || q.includes("hill")) {
      focusOnMap(nodes[0].lat, nodes[0].lng, 15);
      addToast("Navigated to Map", "Focused on Node 1 — Hill Sector", "info");
    } else if (q.includes("2") || q.includes("river")) {
      focusOnMap(nodes[1].lat, nodes[1].lng, 15);
      addToast("Navigated to Map", "Focused on Node 2 — River Bank", "info");
    } else {
      addToast("Search Result", `Searching area matching: "${searchQuery}"`, "info");
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-white leading-tight">
            Environmental Study & Quick Alert System
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Real-time Monitoring • Predictive Analysis • Quick Alerts
          </p>
        </div>
      </div>

      {/* Search Bar & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, node, or zone..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-1.5 pl-9 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        {/* Live Simulation Toggle Switch */}
        <button
          onClick={() => {
            setIsLiveSimulating(!isLiveSimulating);
            addToast(
              "Simulation Mode",
              `Live telemetry simulation turned ${!isLiveSimulating ? "ON" : "OFF"}`,
              !isLiveSimulating ? "success" : "warning"
            );
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isLiveSimulating
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
          }`}
          title="Toggle automatic sensor value simulation updates"
        >
          {isLiveSimulating ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Live Sim:</span>
          <span>{isLiveSimulating ? "ON" : "OFF"}</span>
        </button>

        {/* Global Refresh Button */}
        <button
          onClick={() => refreshAllData(false)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-medium"
          title="Refresh All Sensor Data Now"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span className="hidden xl:inline">Refresh</span>
        </button>

        {/* Quick Theme Switcher Button */}
        <button
          onClick={() => {
            const nextTheme = theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
            addToast(
              "Theme Preference",
              `Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Theme`,
              "info"
            );
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Online</span>
          <span className="text-slate-500 text-[11px] font-mono border-l border-slate-800 pl-2">
            {lastRefreshedAt}
          </span>
        </div>

        {/* Notifications Icon with Badge & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">Active Notifications</span>
                <button
                  onClick={() => {
                    setActivePage("alerts");
                    setShowNotifications(false);
                  }}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  View All ({alerts.length})
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-2">
                {activeAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span>No active alerts!</span>
                  </div>
                ) : (
                  activeAlerts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        focusOnMap(a.lat, a.lng, 15);
                        setShowNotifications(false);
                      }}
                      className="p-2.5 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          {a.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{a.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              EV
            </div>
            <span className="text-xs font-semibold hidden md:inline">Operator</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-2 text-xs space-y-1">
              <div className="p-2 border-b border-slate-800">
                <p className="font-bold text-white">Environmental Control</p>
                <p className="text-[10px] text-slate-400">Node Operator #42</p>
              </div>
              <button
                onClick={() => {
                  setActivePage("settings");
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Threshold Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
