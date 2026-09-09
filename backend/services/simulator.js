"use strict";

/**
 * Live Telemetry Simulator Service
 *
 * Mirrors the AppContext.jsx refreshAllData() logic on the backend:
 *  - Every N seconds, slightly perturbs Node 1 & Node 2 sensor readings
 *  - Writes new readings to the database
 *  - Broadcasts updated state via Socket.IO to all connected clients
 */

const { calculateRiskFromDb } = require("./riskEngine");

let simulatorTimer = null;

function loadThresholds(db) {
    const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'threshold_%'").all();
    const t = { soilMoisture: 70, rainfall: 40, pm25: 60, waterLevel: 2.0, aqi: 100 };
    rows.forEach(r => {
        const field = r.key.replace("threshold_", "");
        t[field] = parseFloat(r.value);
    });
    return t;
}

function getLatestSensor(db, nodeId, sensorKey, fallback) {
    const row = db
        .prepare(
            `SELECT value FROM node_sensor_readings
       WHERE node_id = ? AND sensor_key = ?
       ORDER BY recorded_at DESC LIMIT 1`,
        )
        .get(nodeId, sensorKey);
    return row ? row.value : fallback;
}

function buildNodePayload(db, nodeId) {
    const node = db.prepare("SELECT * FROM nodes WHERE id = ?").get(nodeId);
    if (!node) return null;

    // Get latest reading per sensor key using subquery
    const sensorRows = db
        .prepare(
            `SELECT r.sensor_key, r.value, r.unit, r.status
       FROM node_sensor_readings r
       INNER JOIN (
         SELECT sensor_key, MAX(recorded_at) as max_at
         FROM node_sensor_readings WHERE node_id = ?
         GROUP BY sensor_key
       ) latest ON r.sensor_key = latest.sensor_key AND r.recorded_at = latest.max_at
       WHERE r.node_id = ?`,
        )
        .all(nodeId, nodeId);

    const sensors = {};
    sensorRows.forEach(s => {
        sensors[s.sensor_key] = { value: s.value, unit: s.unit, status: s.status };
    });

    return {
        id: node.id,
        name: node.name,
        sector: node.sector,
        status: node.status,
        battery: node.battery,
        signalStrength: node.signal_strength,
        lat: node.lat,
        lng: node.lng,
        lastUpdate: "Just now",
        sensors,
    };
}

function tick(db, io) {
    const thresholds = loadThresholds(db);
    const ts = new Date().toISOString();

    const insertReading = db.prepare(`
    INSERT INTO node_sensor_readings (node_id, sensor_key, value, unit, status, recorded_at)
    VALUES (:node_id, :sensor_key, :value, :unit, :status, :recorded_at)
  `);

    const insertWeather = db.prepare(`
    INSERT INTO api_weather_readings
      (temperature, humidity, aqi, aqi_label, pm25, rainfall,
       wind_speed, wind_dir, pressure, visibility, uv_index, recorded_at)
    VALUES
      (:temperature, :humidity, :aqi, :aqi_label, :pm25, :rainfall,
       :wind_speed, :wind_dir, :pressure, :visibility, :uv_index, :recorded_at)
  `);

    db.exec("BEGIN");
    try {
        // ── Node 1: Soil Moisture + Rainfall ──────────────────────────────
        const currentSoil = getLatestSensor(db, "node-1", "soilMoisture", 70);
        const currentRain = getLatestSensor(db, "node-1", "rainfall", 30);
        const newSoil = parseFloat(Math.min(98, Math.max(20, currentSoil + (Math.random() - 0.45) * 1.5)).toFixed(1));
        const newRain = parseFloat(Math.max(0, currentRain + (Math.random() - 0.48) * 2.0).toFixed(1));

        insertReading.run({
            node_id: "node-1",
            sensor_key: "soilMoisture",
            value: newSoil,
            unit: "%",
            status: newSoil > thresholds.soilMoisture ? "critical" : "normal",
            recorded_at: ts,
        });
        insertReading.run({
            node_id: "node-1",
            sensor_key: "rainfall",
            value: newRain,
            unit: "mm/h",
            status: newRain > thresholds.rainfall ? "critical" : "normal",
            recorded_at: ts,
        });

        // ── Node 2: PM2.5 + Water Level ───────────────────────────────────
        const currentPm = getLatestSensor(db, "node-2", "pm25", 60);
        const currentWater = getLatestSensor(db, "node-2", "waterLevel", 1.5);
        const newPm = parseFloat(Math.min(250, Math.max(10, currentPm + (Math.random() - 0.46) * 3)).toFixed(1));
        const newWater = parseFloat(
            Math.min(5.0, Math.max(0.5, currentWater + (Math.random() - 0.48) * 0.05)).toFixed(2),
        );

        insertReading.run({
            node_id: "node-2",
            sensor_key: "pm25",
            value: newPm,
            unit: "µg/m³",
            status: newPm > thresholds.pm25 ? "warning" : "normal",
            recorded_at: ts,
        });
        insertReading.run({
            node_id: "node-2",
            sensor_key: "waterLevel",
            value: newWater,
            unit: "m",
            status: newWater > thresholds.waterLevel ? "warning" : "normal",
            recorded_at: ts,
        });

        // ── Regional Weather ──────────────────────────────────────────────
        const lastWeather = db
            .prepare("SELECT * FROM api_weather_readings ORDER BY recorded_at DESC LIMIT 1")
            .get() || {
            temperature: 21.8,
            humidity: 68,
            aqi: 78,
            aqi_label: "Moderate",
            pm25: 64,
            rainfall: 3.4,
            wind_speed: 12.6,
            wind_dir: "SSW",
            pressure: 1012.4,
            visibility: 8.5,
            uv_index: 4.2,
        };

        insertWeather.run({
            temperature: parseFloat((lastWeather.temperature + (Math.random() - 0.5) * 0.4).toFixed(1)),
            humidity: lastWeather.humidity,
            aqi: Math.round(Math.max(0, lastWeather.aqi + (Math.random() - 0.5) * 3)),
            aqi_label: "Moderate",
            pm25: parseFloat(Math.max(0, lastWeather.pm25 + (Math.random() - 0.5) * 2).toFixed(1)),
            rainfall: parseFloat(Math.max(0, lastWeather.rainfall + (Math.random() - 0.5) * 0.3).toFixed(1)),
            wind_speed: lastWeather.wind_speed,
            wind_dir: lastWeather.wind_dir,
            pressure: lastWeather.pressure,
            visibility: lastWeather.visibility,
            uv_index: lastWeather.uv_index,
            recorded_at: ts,
        });

        db.exec("COMMIT");
    } catch (err) {
        try {
            db.exec("ROLLBACK");
        } catch (_) {}
        console.error("[Simulator] Tick error:", err.message);
        return;
    }

    // ── Broadcast via Socket.IO ───────────────────────────────────────────
    if (io) {
        try {
            const node1Payload = buildNodePayload(db, "node-1");
            const node2Payload = buildNodePayload(db, "node-2");
            const risk = calculateRiskFromDb(db, thresholds);
            const latestWeather = db
                .prepare("SELECT * FROM api_weather_readings ORDER BY recorded_at DESC LIMIT 1")
                .get();

            io.emit("node:update", { nodes: [node1Payload, node2Payload], timestamp: ts });
            io.emit("weather:update", { weather: latestWeather, timestamp: ts });
            io.emit("risk:update", { risk, timestamp: ts });
        } catch (err) {
            console.error("[Simulator] Broadcast error:", err.message);
        }
    }

    console.log(`[Simulator] Tick @ ${new Date().toLocaleTimeString()} — data updated & broadcast.`);
}

function start(io, db, intervalSec = 15) {
    if (simulatorTimer) clearInterval(simulatorTimer);
    console.log(`[Simulator] Started — ticking every ${intervalSec}s.`);
    simulatorTimer = setInterval(() => tick(db, io), intervalSec * 1000);
}

function stop() {
    if (simulatorTimer) {
        clearInterval(simulatorTimer);
        simulatorTimer = null;
        console.log("[Simulator] Stopped.");
    }
}

module.exports = { start, stop, tick };
