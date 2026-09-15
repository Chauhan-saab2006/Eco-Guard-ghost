import { createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { initialAlerts } from "../data/mockAlerts";
import { initialApiData } from "../data/mockApiData";
import { initialHazards } from "../data/mockHazards";
import { initialNodes } from "../data/mockNodes";
import { initialMLState } from "../data/mockPredictions";
import { initialReports } from "../data/mockReports";
import { calculateRisk } from "../utils/riskCalculator";
import { useFirebaseData } from "../hooks/useFirebaseData";

const RAW_API_URL = import.meta.env.VITE_API_URL || "";
export const API_URL = RAW_API_URL ? RAW_API_URL.replace(/\/$/, "") : "";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [activePage, setActivePage] = useState("home");

    // Firebase Realtime Database — live sensor data & history
    const {
        firebaseNodes,
        firebaseApiData,
        firebaseHistory,
        isFirebaseLoading,
    } = useFirebaseData();

    const [nodes, setNodes] = useState(initialNodes);
    const [apiData, setApiData] = useState(initialApiData);

    // Sync Firebase live data into local state whenever it updates
    useEffect(() => {
        setNodes(firebaseNodes);
    }, [firebaseNodes]);

    useEffect(() => {
        setApiData(firebaseApiData);
    }, [firebaseApiData]);
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

    const [isLiveSimulating, setIsLiveSimulating] = useState(false);
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
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = id => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Initial Data Fetching from Backend API (if API_URL configured)
    useEffect(() => {
        if (!API_URL) return;

        // Fetch Nodes
        fetch(`${API_URL}/api/nodes`)
            .then(res => res.json())
            .then(json => {
                if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                    setNodes(json.data);
                }
            })
            .catch(err => console.warn("Failed to fetch /api/nodes:", err.message));

        // Fetch Alerts
        fetch(`${API_URL}/api/alerts`)
            .then(res => res.json())
            .then(json => {
                if (json.success && Array.isArray(json.data)) {
                    setAlerts(json.data);
                }
            })
            .catch(err => console.warn("Failed to fetch /api/alerts:", err.message));

        // Fetch Hazards
        fetch(`${API_URL}/api/hazards`)
            .then(res => res.json())
            .then(json => {
                if (json.success && Array.isArray(json.data)) {
                    setHazards(json.data);
                }
            })
            .catch(err => console.warn("Failed to fetch /api/hazards:", err.message));

        // Fetch Reports
        fetch(`${API_URL}/api/reports`)
            .then(res => res.json())
            .then(json => {
                if (json.success && Array.isArray(json.data)) {
                    setReports(json.data);
                }
            })
            .catch(err => console.warn("Failed to fetch /api/reports:", err.message));

        // Fetch Weather
        fetch(`${API_URL}/api/weather/current`)
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data) {
                    setApiData(json.data);
                }
            })
            .catch(err => console.warn("Failed to fetch /api/weather/current:", err.message));

        // Fetch Thresholds
        fetch(`${API_URL}/api/settings/thresholds`)
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data) {
                    setThresholds(prev => ({ ...prev, ...json.data }));
                }
            })
            .catch(err => console.warn("Failed to fetch /api/settings/thresholds:", err.message));
    }, []);

    // Real-time Socket.IO Connection
    useEffect(() => {
        if (!API_URL) return;

        const socket = io(API_URL, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
            console.log("Connected to EvoGuard Socket.IO server:", API_URL);
        });

        socket.on("node:update", payload => {
            if (payload && Array.isArray(payload.nodes)) {
                setNodes(payload.nodes);
                setLastRefreshedAt(new Date().toLocaleTimeString());
            }
        });

        socket.on("weather:update", payload => {
            if (payload && payload.weather) {
                setApiData(prev => ({
                    ...prev,
                    lastUpdate: "Just now",
                    sensors: {
                        ...prev.sensors,
                        temperature: {
                            ...prev.sensors.temperature,
                            value: payload.weather.temperature ?? prev.sensors.temperature.value,
                        },
                        aqi: {
                            ...prev.sensors.aqi,
                            value: payload.weather.aqi ?? prev.sensors.aqi.value,
                        },
                        rainfall: {
                            ...prev.sensors.rainfall,
                            value: payload.weather.rainfall ?? prev.sensors.rainfall.value,
                        },
                    },
                }));
            }
        });

        socket.on("alert:new", payload => {
            if (payload && payload.alert) {
                setAlerts(prev => [payload.alert, ...prev]);
                addToast("Critical Alert", payload.alert.title, "warning");
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [addToast]);

    // Compute live ML prediction state based on active nodes, api data, & thresholds
    const computedRisk = calculateRisk(nodes, apiData, thresholds);

    const prevEventsRef = useRef({});
    
    useEffect(() => {
        const events = computedRisk.events || {};
        
        // Check for newly active events
        Object.keys(events).forEach(key => {
            const isNowActive = events[key].active;
            const wasActive = prevEventsRef.current[key]?.active;
            
            if (isNowActive && !wasActive) {
                let severity = "error"; // Default all ML alerts to red (error)
                
                addToast(events[key].title || "Alert", events[key].details || "New event detected", severity);
            }
        });
        
        // Check for vibration specifically
        const node2 = nodes.find(n => n.id === "node-2");
        const isVibNow = node2?.telemetry?.sw420 === 1 || node2?.sensors?.vibration?.value === "Detected";
        const wasVib = prevEventsRef.current['vibrationAlert'];
        
        if (isVibNow && !wasVib) {
            addToast("Vibration Alert", "Vibration detected on River Bank node.", "error");
        }
        
        prevEventsRef.current = {
            ...events,
            vibrationAlert: isVibNow
        };
    }, [computedRisk.events, nodes, addToast]);

    // Dynamic ML Prediction object
    const currentMLPrediction = {
        ...initialMLState,
        activeTab: mlCategory,
        currentCalculatedRisk: computedRisk,
    };

    // Refresh All Data (Manual or Live Sim fallback tick)
    const refreshAllData = useCallback(
        (isAuto = false) => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            setLastRefreshedAt(timeStr);

            // If backend API URL is configured, trigger re-fetch of current nodes & weather
            if (API_URL) {
                fetch(`${API_URL}/api/nodes`)
                    .then(r => r.json())
                    .then(d => d.success && d.data && setNodes(d.data))
                    .catch(() => {});
                fetch(`${API_URL}/api/weather/current`)
                    .then(r => r.json())
                    .then(d => d.success && d.data && setApiData(d.data))
                    .catch(() => {});
                if (!isAuto) {
                    addToast("Data Refreshed", `System synchronized at ${timeStr}`, "success");
                }
                return;
            }

            // Local Fallback simulation if no backend URL is set
            setNodes(prevNodes =>
                prevNodes.map(n => {
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
                }),
            );

            // Perturb API Data
            setApiData(prevApi => ({
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
                        value: Number(
                            Math.max(0, prevApi.sensors.rainfall.value + (Math.random() - 0.5) * 0.3).toFixed(1),
                        ),
                    },
                },
            }));

            if (!isAuto) {
                addToast("Data Refreshed", `System synchronized at ${timeStr}`, "success");
            }
        },
        [thresholds, addToast],
    );

    // Live Simulation interval loop (fallback or sync ticker)
    useEffect(() => {
        if (!isLiveSimulating) return;
        const timer = setInterval(() => {
            refreshAllData(true);
        }, refreshRateSec * 1000);
        return () => clearInterval(timer);
    }, [isLiveSimulating, refreshRateSec, refreshAllData]);

    // Alert Handlers
    const acknowledgeAlert = alertId => {
        setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: "Acknowledged" } : a)));
        addToast("Alert Acknowledged", `Alert ${alertId} status updated to Acknowledged.`, "warning");

        if (API_URL) {
            fetch(`${API_URL}/api/alerts/${alertId}/acknowledge`, { method: "PATCH" }).catch(err =>
                console.warn("Failed to sync acknowledge to backend:", err.message),
            );
        }
    };

    const resolveAlert = alertId => {
        setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: "Resolved" } : a)));
        addToast("Alert Resolved", `Alert ${alertId} marked as Resolved.`, "success");

        if (API_URL) {
            fetch(`${API_URL}/api/alerts/${alertId}/resolve`, { method: "PATCH" }).catch(err =>
                console.warn("Failed to sync resolve to backend:", err.message),
            );
        }
    };

    // Threshold update handler
    const updateThresholds = newThresholds => {
        setThresholds(newThresholds);
        addToast("Settings Saved", "Alert thresholds updated dynamically across all nodes.", "success");

        if (API_URL) {
            fetch(`${API_URL}/api/settings/thresholds`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newThresholds),
            }).catch(err => console.warn("Failed to sync thresholds to backend:", err.message));
        }
    };

    // Add Incident Report
    const addReportedSection = newReport => {
        const reportObj = {
            id: `rep-${Date.now()}`,
            timeAgo: "Just now",
            timestamp: new Date().toISOString(),
            status: "New",
            ...newReport,
        };
        setReports(prev => [reportObj, ...prev]);
        addToast("Incident Reported", `New report '${reportObj.title}' logged into system.`, "info");

        if (API_URL) {
            fetch(`${API_URL}/api/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newReport.title,
                    location: newReport.location,
                    severity: newReport.severity,
                    reportedBy: newReport.reportedBy,
                    description: newReport.description,
                }),
            }).catch(err => console.warn("Failed to sync report to backend:", err.message));
        }
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
                firebaseHistory,
                isFirebaseLoading,
            }}
        >
            <div className={theme === "light" ? "light-theme min-h-screen" : "dark min-h-screen"}>{children}</div>
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
