/**
 * useFirebaseData.js
 * Reads from Firebase Realtime Database path: /sensorData
 *
 * Each push-key entry looks like:
 * {
 *   MQ3: 1801, MQ5: 1700, MQ7: 415,
 *   accelerometer: { x, y, z },
 *   distance: 0,
 *   gyroscope: { x, y, z },
 *   humidity: 0,
 *   imuTemperature: 127.9977,
 *   nodeID: "Node-A",
 *   soilMoisture: 91,
 *   soilRaw: 358,
 *   temperature: 0,
 *   timestamp: 46470,
 *   vibration: 1
 * }
 *
 * New entries are pushed to the bottom (push key = chronological order).
 * → Latest entry = current live sensor values (for Node Cards)
 * → All entries = history (for charts)
 *
 * nodeID mapping:
 *   "Node-A" → node-1 (Hill Sector)
 *   "Node-B" → node-2 (River Bank)
 */

import { useEffect, useState, useCallback } from "react";
import { ref, onValue, off } from "firebase/database";
import { db, isFirebaseConfigured } from "../firebase";
import { initialNodes } from "../data/mockNodes";
import { initialApiData } from "../data/mockApiData";
import { generateHistoryData } from "../data/mockHistory";

// ----- Field Mapping Helpers -----

/**
 * Map a raw Firebase sensorData record to the node-1 sensor shape
 * (Hill Sector: soilMoisture, rainfall-equivalent, temperature, humidity)
 */
const mapNode1Sensors = (rec, defaultNode) => {
    const soilMoisture = rec.soilMoisture ?? defaultNode.sensors.soilMoisture.value;
    const humidity = rec.humidity ?? defaultNode.sensors.humidity.value;
    // imuTemperature is the real temperature reading; fall back to temperature field
    const temperature = (rec.imuTemperature && rec.imuTemperature < 100)
        ? parseFloat(rec.imuTemperature.toFixed(1))
        : rec.temperature ?? defaultNode.sensors.temperature.value;
    // MQ3 is gas sensor — use as a proxy for air quality / particulates
    const mq3 = rec.MQ3 ?? 0;

    return {
        temperature: { ...defaultNode.sensors.temperature, value: temperature, status: getStatus(temperature, 10, 35) },
        humidity:    { ...defaultNode.sensors.humidity,    value: humidity,     status: getStatus(humidity, 30, 80) },
        soilMoisture: {
            ...defaultNode.sensors.soilMoisture,
            value: soilMoisture,
            status: soilMoisture > 85 ? "critical" : soilMoisture > 70 ? "warning" : "normal",
        },
        rainfall: {
            ...defaultNode.sensors.rainfall,
            value: mq3,
            unit: "ppm",
            status: mq3 > 1500 ? "critical" : mq3 > 800 ? "warning" : "normal",
        },
    };
};

/**
 * Map a raw Firebase sensorData record to the node-2 sensor shape
 * (River Bank: pm25, waterLevel, temperature, humidity)
 */
const mapNode2Sensors = (rec, defaultNode) => {
    const humidity     = rec.humidity ?? defaultNode.sensors.humidity.value;
    const temperature  = (rec.imuTemperature && rec.imuTemperature < 100)
        ? parseFloat(rec.imuTemperature.toFixed(1))
        : rec.temperature ?? defaultNode.sensors.temperature.value;
    const mq5      = rec.MQ5 ?? 0;   // gas sensor → proxy for PM2.5
    const distance = rec.distance ?? defaultNode.sensors.waterLevel.value;

    return {
        temperature: { ...defaultNode.sensors.temperature, value: temperature, status: getStatus(temperature, 10, 35) },
        humidity:    { ...defaultNode.sensors.humidity,    value: humidity,     status: getStatus(humidity, 30, 80) },
        pm25: {
            ...defaultNode.sensors.pm25,
            value: mq5,
            unit: "ppm",
            status: mq5 > 1500 ? "critical" : mq5 > 800 ? "warning" : "normal",
        },
        waterLevel: {
            ...defaultNode.sensors.waterLevel,
            value: typeof distance === "number" ? parseFloat(distance.toFixed(2)) : defaultNode.sensors.waterLevel.value,
            status: distance > 2.5 ? "critical" : distance > 1.5 ? "warning" : "normal",
        },
    };
};

const getStatus = (val, low, high) => {
    if (val < low || val > high) return "warning";
    return "normal";
};

// Build a history point for Node-1 chart from a raw Firebase record
const toNode1HistoryPoint = (rec, label) => ({
    time: label,
    temperature: (rec.imuTemperature && rec.imuTemperature < 100)
        ? parseFloat(rec.imuTemperature.toFixed(1))
        : rec.temperature ?? 0,
    humidity:     rec.humidity ?? 0,
    soilMoisture: rec.soilMoisture ?? 0,
    rainfall:     rec.MQ3 ?? 0,   // MQ3 gas sensor as rainfall proxy line
});

// Build a history point for Node-2 chart from a raw Firebase record
const toNode2HistoryPoint = (rec, label) => ({
    time: label,
    temperature: (rec.imuTemperature && rec.imuTemperature < 100)
        ? parseFloat(rec.imuTemperature.toFixed(1))
        : rec.temperature ?? 0,
    humidity:     rec.humidity ?? 0,
    pm25:         rec.MQ5 ?? 0,
    waterLevel:   rec.distance ?? 0,
});

// Build a history point for API/ML risk chart — derived from sensor data
const toApiHistoryPoint = (rec, label) => ({
    time: label,
    temperature: (rec.imuTemperature && rec.imuTemperature < 100)
        ? parseFloat(rec.imuTemperature.toFixed(1))
        : rec.temperature ?? 0,
    aqi:      Math.min(500, Math.round((rec.MQ3 ?? 0) / 5)),
    pm25:     Math.min(300, Math.round((rec.MQ5 ?? 0) / 6)),
    rainfall: Math.min(100, Math.round((rec.MQ7 ?? 0) / 10)),
    windSpeed: rec.vibration ?? 0,
    pressure:  1013,
});

// We will now read ML history directly from the backend via Firebase

// Format a timestamp label for chart X-axis
const makeTimeLabel = (rec, index, total) => {
    if (rec.timestamp && typeof rec.timestamp === "number") {
        const d = new Date(rec.timestamp * 1000);
        // If timestamp looks like seconds-since-epoch (> year 2000 in ms)
        if (rec.timestamp > 1_000_000_000) {
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        // Otherwise treat as seconds-since-boot → show index
        return `#${index + 1}`;
    }
    return `#${index + 1}`;
};

const defaultHistory = generateHistoryData("24h");

// ---- Main Hook ----

export const useFirebaseData = () => {
    const [firebaseNodes, setFirebaseNodes] = useState(initialNodes);
    const [firebaseApiData, setFirebaseApiData] = useState(initialApiData);
    const [firebaseHistory, setFirebaseHistory] = useState(defaultHistory);
    const [isFirebaseLoading, setIsFirebaseLoading] = useState(isFirebaseConfigured);

    useEffect(() => {
        if (!isFirebaseConfigured || !db) {
            setIsFirebaseLoading(false);
            return;
        }

        const sensorRef = ref(db, "sensorData");

        const unsubscribe = onValue(
            sensorRef,
            (snapshot) => {
                const raw = snapshot.val();
                if (!raw) {
                    setIsFirebaseLoading(false);
                    return;
                }

                // Convert push-key object to array sorted chronologically (push keys are time-ordered)
                const allRecords = Object.keys(raw)
                    .sort()
                    .map((k) => raw[k]);

                // Separate by nodeID
                const nodeARecords = allRecords.filter((r) => r.nodeID === "Node-A" || r.nodeID === "node-1" || !r.nodeID);
                const nodeBRecords = allRecords.filter((r) => r.nodeID === "Node-B" || r.nodeID === "node-2");

                // If no nodeB records, use nodeA for both (fallback)
                const effectiveNodeBRecords = nodeBRecords.length > 0 ? nodeBRecords : nodeARecords;

                // ---- Current sensor values (latest record) ----
                const latestA = nodeARecords[nodeARecords.length - 1];
                const latestB = effectiveNodeBRecords[effectiveNodeBRecords.length - 1];

                const defaultNode1 = initialNodes.find((n) => n.id === "node-1");
                const defaultNode2 = initialNodes.find((n) => n.id === "node-2");

                const updatedNode1 = {
                    ...defaultNode1,
                    lastUpdate: "Just now",
                    sensors: mapNode1Sensors(latestA, defaultNode1),
                };

                const updatedNode2 = {
                    ...defaultNode2,
                    lastUpdate: "Just now",
                    sensors: mapNode2Sensors(latestB, defaultNode2),
                };

                setFirebaseNodes([updatedNode1, updatedNode2]);

                // ---- History arrays for charts ----
                // Limit to last 24 points so charts don't get too crowded
                const limitHistory = (arr) => arr.slice(-24);

                const node1History = limitHistory(
                    nodeARecords.map((rec, i, arr) => toNode1HistoryPoint(rec, makeTimeLabel(rec, i, arr.length)))
                );

                const node2History = limitHistory(
                    effectiveNodeBRecords.map((rec, i, arr) => toNode2HistoryPoint(rec, makeTimeLabel(rec, i, arr.length)))
                );

                const apiHistory = limitHistory(
                    allRecords.map((rec, i, arr) => toApiHistoryPoint(rec, makeTimeLabel(rec, i, arr.length)))
                );

                setFirebaseHistory(prev => ({ ...prev, node1History, node2History, apiHistory }));

                // ---- Fetch Real Weather API (OpenWeatherMap) for Northern Eastern Manipur ----
                const owmKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
                if (owmKey) {
                    // Coordinates roughly for Northern/Eastern Manipur (Ukhrul/Senapati region)
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=25.1&lon=94.3&appid=${owmKey}&units=metric`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.main) {
                                setFirebaseApiData((prev) => ({
                                    ...prev,
                                    provider: "OpenWeatherMap API",
                                    name: "North East Manipur Weather",
                                    subtitle: data.name ? `${data.name}, Manipur` : "Regional Data",
                                    lastUpdate: "Just now",
                                    sensors: {
                                        ...prev.sensors,
                                        temperature: { ...prev.sensors.temperature, value: data.main.temp },
                                        humidity:    { ...prev.sensors.humidity, value: data.main.humidity },
                                        pressure:    { ...prev.sensors.pressure, value: data.main.pressure },
                                        windSpeed:   { ...prev.sensors.windSpeed, value: (data.wind?.speed * 3.6).toFixed(1) }, // m/s to km/h
                                        windDirection: `${data.wind?.deg}°`,
                                        visibility:  { ...prev.sensors.visibility, value: (data.visibility / 1000).toFixed(1) }, // meters to km
                                    },
                                }));
                            }
                        })
                        .catch(err => console.warn("OWM Fetch error:", err));
                } else {
                    // Fallback to local sensor logic if no API key is provided
                    setFirebaseApiData((prev) => ({
                        ...prev,
                        lastUpdate: "Just now",
                        sensors: {
                            ...prev.sensors,
                            temperature: { ...prev.sensors.temperature, value: updatedNode1.sensors.temperature.value },
                            humidity:    { ...prev.sensors.humidity,    value: latestA?.humidity ?? prev.sensors.humidity.value },
                            aqi:         { ...prev.sensors.aqi,         value: Math.min(500, Math.round((latestA?.MQ3 ?? 0) / 5)) },
                            pm25:        { ...prev.sensors.pm25,        value: Math.min(300, Math.round((latestA?.MQ5 ?? 0) / 6)) },
                        },
                    }));
                }

                setIsFirebaseLoading(false);
            },
            (err) => {
                console.warn("⚠️ Firebase sensorData stream error:", err.message);
                setIsFirebaseLoading(false);
            }
        );

        // --- Stream live ML Predictions ---
        const mlRef = ref(db, "mlPredictions");
        const unsubMl = onValue(
            mlRef,
            (snapshot) => {
                const raw = snapshot.val();
                if (!raw) return;
                
                const allRecords = Object.keys(raw)
                    .sort()
                    .map((k) => raw[k]);
                
                // Map to chart format
                const limitHistory = (arr) => arr.slice(-24);
                const mlRiskHistory = limitHistory(
                    allRecords.map((rec, i, arr) => ({
                        time: makeTimeLabel(rec, i, arr.length),
                        overallRisk: rec.overallRisk ?? 0,
                        landslideRisk: rec.landslideRisk ?? 0,
                        floodRisk: rec.floodRisk ?? 0,
                        airQualityRisk: rec.airQualityRisk ?? 0
                    }))
                );

                setFirebaseHistory(prev => ({ ...prev, mlRiskHistory }));
            }
        );

        return () => {
            off(sensorRef);
            off(mlRef);
        };
    }, []);

    return { firebaseNodes, firebaseApiData, firebaseHistory, isFirebaseLoading };
};
