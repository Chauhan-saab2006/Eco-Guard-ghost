import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initialNodes } from "../data/mockNodes";
import { initialApiData } from "../data/mockApiData";
import { initialAlerts } from "../data/mockAlerts";
import { initialHazards } from "../data/mockHazards";
import { initialReports } from "../data/mockReports";
import { initialMLState } from "../data/mockPredictions";
import { calculateRisk } from "../utils/riskCalculator";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activePage, setActivePage] = useState("home");
  const [nodes, setNodes] = useState(initialNodes);
  const [apiData, setApiData] = useState(initialApiData);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [hazards, setHazards] = useState(initialHazards);
  const [reports, setReports] = useState(initialReports);

  const [thresholds, setThresholds] = useState({
    soilMoisture: 70, // %
    rainfall: 40, // mm/h
    pm25: 60, // µg/m³
    waterLevel: 2.0, // m
    aqi: 100,
  });

  const [mlCategory, setMlCategory] = useState("Overall"); // Overall, Landslide, Flood, AirQuality
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [selectedHazardId, setSelectedHazardId] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);

  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [refreshRateSec, setRefreshRateSec] = useState(15);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date().toLocaleTimeString());

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("evoguard_theme") || "dark";
  });
  const [compactMode, setCompactMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Theme synchronization effect
  useEffect(() => {
    localStorage.setItem("evoguard_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  // Toast Helper
  const addToast = useCallback((title, message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compute live ML prediction state based on active nodes, api data, & thresholds
  const computedRisk = calculateRisk(nodes, apiData, thresholds);

  // Dynamic ML Prediction object
  const currentMLPrediction = {
    ...initialMLState,
    activeTab: mlCategory,
    currentCalculatedRisk: computedRisk,
  };

  // Refresh All Data (Manual or Live Sim tick)
  const refreshAllData = useCallback(
    (isAuto = false) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      setLastRefreshedAt(timeStr);

      // Slightly perturb Node 1 & Node 2 sensors for realistic telemetry simulation
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id === "node-1") {
            const currentSoil = n.sensors.soilMoisture.value;
            const currentRain = n.sensors.rainfall.value;
            const deltaSoil = (Math.random() - 0.45) * 1.5;
            const deltaRain = (Math.random() - 0.48) * 2.0;

            const newSoil = Number(Math.min(98, Math.max(20, currentSoil + deltaSoil)).toFixed(1));
            const newRain = Number(Math.max(0, currentRain + deltaRain).toFixed(1));

            return {
              ...n,
              lastUpdate: "Just now",
              sensors: {
                ...n.sensors,
                soilMoisture: {
                  ...n.sensors.soilMoisture,
                  value: newSoil,
                  status: newSoil > thresholds.soilMoisture ? "critical" : "normal",
                },
                rainfall: {
                  ...n.sensors.rainfall,
                  value: newRain,
                  status: newRain > thresholds.rainfall ? "critical" : "normal",
                },
              },
            };
          }

          if (n.id === "node-2") {
            const currentPm = n.sensors.pm25.value;
            const currentWater = n.sensors.waterLevel.value;
            const deltaPm = (Math.random() - 0.46) * 3;
            const deltaWater = (Math.random() - 0.48) * 0.05;

            const newPm = Number(Math.min(250, Math.max(10, currentPm + deltaPm)).toFixed(1));
            const newWater = Number(Math.min(5.0, Math.max(0.5, currentWater + deltaWater)).toFixed(2));

            return {
              ...n,
              lastUpdate: "Just now",
              sensors: {
                ...n.sensors,
                pm25: {
                  ...n.sensors.pm25,
                  value: newPm,
                  status: newPm > thresholds.pm25 ? "warning" : "normal",
                },
                waterLevel: {
                  ...n.sensors.waterLevel,
                  value: newWater,
                  status: newWater > thresholds.waterLevel ? "warning" : "normal",
                },
              },
            };
          }
          return n;
        })
      );

      // Perturb API Data
      setApiData((prevApi) => ({
        ...prevApi,
        lastUpdate: "Just now",
        sensors: {
          ...prevApi.sensors,
          temperature: {
            ...prevApi.sensors.temperature,
            value: Number((prevApi.sensors.temperature.value + (Math.random() - 0.5) * 0.4).toFixed(1)),
          },
          rainfall: {
            ...prevApi.sensors.rainfall,
            value: Number(Math.max(0, prevApi.sensors.rainfall.value + (Math.random() - 0.5) * 0.3).toFixed(1)),
          },
        },
      }));

      if (!isAuto) {
        addToast("Data Refreshed", `System synchronized at ${timeStr}`, "success");
      }
    },
    [thresholds, addToast]
  );

  // Live Simulation interval loop
  useEffect(() => {
    if (!isLiveSimulating) return;
    const timer = setInterval(() => {
      refreshAllData(true);
    }, refreshRateSec * 1000);
    return () => clearInterval(timer);
  }, [isLiveSimulating, refreshRateSec, refreshAllData]);

  // Alert Handlers
  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "Acknowledged" } : a))
    );
    addToast("Alert Acknowledged", `Alert ${alertId} status updated to Acknowledged.`, "warning");
  };

  const resolveAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "Resolved" } : a))
    );
    addToast("Alert Resolved", `Alert ${alertId} marked as Resolved.`, "success");
  };

  // Threshold update handler
  const updateThresholds = (newThresholds) => {
    setThresholds(newThresholds);
    addToast("Settings Saved", "Alert thresholds updated dynamically across all nodes.", "success");
  };

  // Add Incident Report
  const addReportedSection = (newReport) => {
    const reportObj = {
      id: `rep-${Date.now()}`,
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      status: "New",
      ...newReport,
    };
    setReports((prev) => [reportObj, ...prev]);
    addToast("Incident Reported", `New report '${reportObj.title}' logged into system.`, "info");
  };

  // Map Navigation helper
  const focusOnMap = (lat, lng, zoom = 14) => {
    setMapTarget({ lat, lng, zoom, timestamp: Date.now() });
    if (activePage !== "home") {
      setActivePage("home");
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        nodes,
        setNodes,
        apiData,
        alerts,
        reports,
        hazards,
        thresholds,
        updateThresholds,
        mlCategory,
        setMlCategory,
        computedRisk,
        currentMLPrediction,
        selectedNodeId,
        setSelectedNodeId,
        selectedAlertId,
        setSelectedAlertId,
        selectedHazardId,
        setSelectedHazardId,
        mapTarget,
        focusOnMap,
        isLiveSimulating,
        setIsLiveSimulating,
        refreshRateSec,
        setRefreshRateSec,
        lastRefreshedAt,
        refreshAllData,
        acknowledgeAlert,
        resolveAlert,
        addReportedSection,
        theme,
        setTheme,
        compactMode,
        setCompactMode,
        toasts,
        addToast,
        removeToast,
      }}
    >
      <div className={theme === "light" ? "light-theme min-h-screen" : "dark min-h-screen"}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
