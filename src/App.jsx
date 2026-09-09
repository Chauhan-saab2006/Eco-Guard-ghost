import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopHeader } from "./components/layout/TopHeader";
import { ToastContainer } from "./components/common/Toast";

// Pages
import { HomeDashboard } from "./pages/HomeDashboard";
import { NodesPage } from "./pages/NodesPage";
import { MLPredictionsPage } from "./pages/MLPredictionsPage";
import { ApiDataPage } from "./pages/ApiDataPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { HazardZonesPage } from "./pages/HazardZonesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { X, Trees } from "lucide-react";

const MainContent = () => {
  const { activePage, setActivePage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "nodes":
        return <NodesPage />;
      case "ml-predictions":
        return <MLPredictionsPage />;
      case "api-data":
        return <ApiDataPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "alerts":
        return <AlertsPage />;
      case "reports":
        return <ReportsPage />;
      case "hazards":
        return <HazardZonesPage />;
      case "settings":
        return <SettingsPage />;
      case "home":
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans app-container">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-md">
          <div className="w-64 bg-slate-900 h-full p-4 space-y-4 border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                    <Trees className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-white text-base">EcoWatch</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-4">
                {[
                  { id: "home", label: "Home" },
                  { id: "nodes", label: "Nodes" },
                  { id: "ml-predictions", label: "ML Predictions" },
                  { id: "api-data", label: "API Data" },
                  { id: "analytics", label: "Analytics" },
                  { id: "alerts", label: "Alerts" },
                  { id: "reports", label: "Reports" },
                  { id: "hazards", label: "Hazard Zones" },
                  { id: "settings", label: "Settings" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-xs ${
                      activePage === item.id ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <TopHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1920px] w-full mx-auto">{renderPage()}</main>
      </div>

      {/* Global Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
