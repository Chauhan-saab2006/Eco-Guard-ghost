"use strict";

/**
 * Seed script — populates the database with initial data mirrored from
 * the frontend's /src/data/ mock files. Safe to re-run (uses INSERT OR IGNORE).
 *
 * Usage: node db/seed.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { getDb } = require("./database");

const db = getDb();

// ── Transaction helpers using node:sqlite ──────────────────────────────────
function beginTransaction() { db.exec("BEGIN"); }
function commitTransaction() { db.exec("COMMIT"); }
function rollbackTransaction() { try { db.exec("ROLLBACK"); } catch (_) {} }

function runTransaction(fn) {
  beginTransaction();
  try {
    fn();
    commitTransaction();
  } catch (err) {
    rollbackTransaction();
    throw err;
  }
}

const now = () => new Date().toISOString();

// ── NODES ──────────────────────────────────────────────────────────────────
function seedNodes() {
  const insertNode = db.prepare(`
    INSERT OR IGNORE INTO nodes
      (id, name, sector, status, communication, has_lora, has_gsm, protocol,
       signal_strength, battery, lat, lng, elevation, installation_date,
       last_update, hardware_version, firmware_version)
    VALUES
      (:id, :name, :sector, :status, :communication, :has_lora, :has_gsm, :protocol,
       :signal_strength, :battery, :lat, :lng, :elevation, :installation_date,
       :last_update, :hardware_version, :firmware_version)
  `);

  const insertSensor = db.prepare(`
    INSERT INTO node_sensor_readings
      (node_id, sensor_key, value, unit, status, recorded_at)
    VALUES (:node_id, :sensor_key, :value, :unit, :status, :recorded_at)
  `);

  const nodes = [
    {
      id: "node-1", name: "Node 1 — Hill Sector", sector: "Hill Sector",
      status: "Online", communication: "LoRa & GSM Connected",
      has_lora: 1, has_gsm: 1,
      protocol: "LoRaWAN + 4G LTE/GSM (Dual Redundant)",
      signal_strength: -78, battery: 92,
      lat: 25.275, lng: 91.732, elevation: "1,240 m",
      installation_date: "2024-03-15", last_update: "Just now",
      hardware_version: "EcoNode-v2.4 Dual", firmware_version: "fw-3.8.1-dual",
    },
    {
      id: "node-2", name: "Node 2 — River Bank", sector: "River Bank",
      status: "Online", communication: "LoRa & GSM Connected",
      has_lora: 1, has_gsm: 1,
      protocol: "LoRaWAN + 4G LTE/GSM (Dual Redundant)",
      signal_strength: -65, battery: 88,
      lat: 25.26, lng: 91.748, elevation: "310 m",
      installation_date: "2024-04-01", last_update: "Just now",
      hardware_version: "EcoNode-v2.4 Dual", firmware_version: "fw-3.8.4-dual",
    },
  ];

  const node1Sensors = [
    { sensor_key: "temperature",  value: 18.4, unit: "°C",   status: "normal" },
    { sensor_key: "humidity",     value: 67,   unit: "%",    status: "normal" },
    { sensor_key: "soilMoisture", value: 78,   unit: "%",    status: "warning" },
    { sensor_key: "rainfall",     value: 42.6, unit: "mm/h", status: "critical" },
  ];

  const node2Sensors = [
    { sensor_key: "temperature", value: 22.1, unit: "°C",    status: "normal" },
    { sensor_key: "humidity",    value: 71,   unit: "%",     status: "normal" },
    { sensor_key: "pm25",        value: 82,   unit: "µg/m³", status: "warning" },
    { sensor_key: "waterLevel",  value: 1.8,  unit: "m",     status: "warning" },
  ];

  runTransaction(() => {
    nodes.forEach((n) => insertNode.run(n));

    const count = db.prepare("SELECT COUNT(*) as c FROM node_sensor_readings").get().c;
    if (count === 0) {
      // Seed 48 historical readings (24h, every 30 min) for both nodes
      const totalPoints = 48;
      for (let i = totalPoints; i >= 0; i--) {
        const ts = new Date(Date.now() - i * 30 * 60 * 1000).toISOString();
        node1Sensors.forEach((s) => {
          const noise = (Math.random() - 0.5) * (s.value * 0.12);
          const v = Math.max(0, s.value + noise);
          insertSensor.run({ node_id: "node-1", sensor_key: s.sensor_key, value: v, unit: s.unit, status: s.status, recorded_at: ts });
        });
        node2Sensors.forEach((s) => {
          const noise = (Math.random() - 0.5) * (s.value * 0.12);
          const v = Math.max(0, s.value + noise);
          insertSensor.run({ node_id: "node-2", sensor_key: s.sensor_key, value: v, unit: s.unit, status: s.status, recorded_at: ts });
        });
      }
    }
  });

  console.log("✅ Nodes seeded.");
}

// ── ALERTS ─────────────────────────────────────────────────────────────────
function seedAlerts() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO alerts
      (id, title, source, source_type, location, message, severity, status,
       sensor_key, sensor_value, ml_risk_score, lat, lng, timestamp, time_ago)
    VALUES
      (:id, :title, :source, :source_type, :location, :message, :severity, :status,
       :sensor_key, :sensor_value, :ml_risk_score, :lat, :lng, :timestamp, :time_ago)
  `);

  const alerts = [
    { id: "alert-101", title: "High Landslide Risk", source: "Node 1 — Hill Sector", source_type: "node",
      location: "Hill Sector (25.275, 91.732)", severity: "HIGH", status: "Active",
      message: "Soil moisture (78%) and rainfall intensity (42.6 mm/h) exceeded critical slope safety thresholds.",
      sensor_key: "soilMoisture", sensor_value: "78 %", ml_risk_score: 82,
      lat: 25.275, lng: 91.732, timestamp: new Date(Date.now() - 2*60*1000).toISOString(), time_ago: "2 minutes ago" },
    { id: "alert-102", title: "Air Quality Deteriorating", source: "Node 2 — River Bank", source_type: "node",
      location: "River Bank (25.260, 91.748)", severity: "MEDIUM", status: "Active",
      message: "PM2.5 concentration risen to 82 µg/m³, exceeding safe particulate limits for sensitive groups.",
      sensor_key: "pm25", sensor_value: "82 µg/m³", ml_risk_score: 61,
      lat: 25.26, lng: 91.748, timestamp: new Date(Date.now() - 14*60*1000).toISOString(), time_ago: "14 minutes ago" },
    { id: "alert-103", title: "Heavy Rainfall Detected", source: "Overall Area — API Data", source_type: "api",
      location: "Regional Monitored Area", severity: "MEDIUM", status: "Active",
      message: "Regional API weather radar indicates dense convective cell approaching eastern hill slopes.",
      sensor_key: "rainfall", sensor_value: "3.4 mm/h (Radar: 35 mm/h)", ml_risk_score: 68,
      lat: 25.268, lng: 91.74, timestamp: new Date(Date.now() - 35*60*1000).toISOString(), time_ago: "35 minutes ago" },
    { id: "alert-104", title: "Water Level Threshold Approaching", source: "Node 2 — River Bank", source_type: "node",
      location: "River Bank Basin", severity: "MEDIUM", status: "Acknowledged",
      message: "River embankment water level reached 1.8 m (Warning threshold: 1.5 m).",
      sensor_key: "waterLevel", sensor_value: "1.8 m", ml_risk_score: 65,
      lat: 25.26, lng: 91.748, timestamp: new Date(Date.now() - 60*60*1000).toISOString(), time_ago: "1 hour ago" },
    { id: "alert-105", title: "LoRa Gateway Transient Disconnection", source: "Node 1 — Hill Sector", source_type: "node",
      location: "Hill Sector Ridge", severity: "LOW", status: "Resolved",
      message: "Signal drop detected during storm front passing. Restored automatically.",
      sensor_key: "signalStrength", sensor_value: "-78 dBm", ml_risk_score: 35,
      lat: 25.275, lng: 91.732, timestamp: new Date(Date.now() - 180*60*1000).toISOString(), time_ago: "3 hours ago" },
  ];

  runTransaction(() => alerts.forEach((a) => insert.run(a)));
  console.log("✅ Alerts seeded.");
}

// ── HAZARDS ────────────────────────────────────────────────────────────────
function seedHazards() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO hazards
      (id, name, type, risk_level, color, coordinates, center_lat, center_lng,
       description, vulnerability_score, primary_factors, active_monitoring)
    VALUES
      (:id, :name, :type, :risk_level, :color, :coordinates, :center_lat, :center_lng,
       :description, :vulnerability_score, :primary_factors, :active_monitoring)
  `);

  const hazards = [
    { id: "zone-a", name: "Zone A — North Ridge", type: "Landslide Risk", risk_level: "HIGH", color: "#ef4444",
      coordinates: JSON.stringify([[25.282,91.725],[25.285,91.738],[25.272,91.742],[25.268,91.728]]),
      center_lat: 25.276, center_lng: 91.733,
      description: "Frequent slope movement detected along steep NH-11 bypass cut.",
      vulnerability_score: "88/100", primary_factors: "High slope angle (>45°), saturation > 75%, active deforestation.", active_monitoring: 1 },
    { id: "zone-b", name: "Zone B — River Basin", type: "Flood Risk", risk_level: "MEDIUM", color: "#f59e0b",
      coordinates: JSON.stringify([[25.263,91.742],[25.265,91.758],[25.253,91.755],[25.251,91.74]]),
      center_lat: 25.258, center_lng: 91.749,
      description: "Water level rising near embankments due to upstream torrential flow.",
      vulnerability_score: "64/100", primary_factors: "Low elevation basin, sediment buildup in riverbed.", active_monitoring: 1 },
    { id: "zone-c", name: "Zone C — Hill Cut Area", type: "Soil Erosion", risk_level: "HIGH", color: "#f97316",
      coordinates: JSON.stringify([[25.271,91.715],[25.278,91.722],[25.265,91.725],[25.262,91.718]]),
      center_lat: 25.269, center_lng: 91.72,
      description: "Unstable terrain under active observation for surface shear cracks.",
      vulnerability_score: "81/100", primary_factors: "Road construction excavation, loose clay topsoil.", active_monitoring: 1 },
  ];

  runTransaction(() => hazards.forEach((h) => insert.run(h)));
  console.log("✅ Hazard zones seeded.");
}

// ── REPORTS ────────────────────────────────────────────────────────────────
function seedReports() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO reports
      (id, title, location, severity, status, reported_by, description,
       coord_lat, coord_lng, time_ago, timestamp)
    VALUES
      (:id, :title, :location, :severity, :status, :reported_by, :description,
       :coord_lat, :coord_lng, :time_ago, :timestamp)
  `);

  const reports = [
    { id: "rep-201", title: "Blocked Road", location: "NH-13, Near Pine Village",
      severity: "HIGH", status: "New", reported_by: "Community Ranger Unit 4",
      description: "Minor rockfall blocking northbound lane. Clearance machinery requested.",
      coord_lat: 25.279, coord_lng: 91.731, time_ago: "1 hour ago", timestamp: "2026-09-05T11:00:00Z" },
    { id: "rep-202", title: "Fallen Trees", location: "East Ridge Trail",
      severity: "MEDIUM", status: "Under Review", reported_by: "Local Forestry Patrol",
      description: "2 large pine trees downed across power line service road during high gust.",
      coord_lat: 25.271, coord_lng: 91.737, time_ago: "3 hours ago", timestamp: "2026-09-05T09:00:00Z" },
    { id: "rep-203", title: "Water Level Rise", location: "Som River Bridge",
      severity: "MEDIUM", status: "Resolved", reported_by: "Node 2 Automated Sensor Alert",
      description: "River gauge registered +0.4m rise in 20 minutes. Gates inspected and clear.",
      coord_lat: 25.261, coord_lng: 91.745, time_ago: "6 hours ago", timestamp: "2026-09-05T06:00:00Z" },
    { id: "rep-204", title: "Soil Cracks", location: "South Slope Cut, Sector 3",
      severity: "HIGH", status: "Under Review", reported_by: "Geotechnical Field Team",
      description: "Tension cracks measuring 3cm width observed over 15 meter stretch.",
      coord_lat: 25.267, coord_lng: 91.722, time_ago: "12 hours ago", timestamp: "2026-09-05T00:00:00Z" },
    { id: "rep-205", title: "Slope Movement", location: "Hill Sector West Slope",
      severity: "CRITICAL", status: "Resolved", reported_by: "Drone LiDAR Survey",
      description: "Minor slumping detected on non-populated cliff wall.",
      coord_lat: 25.273, coord_lng: 91.728, time_ago: "1 day ago", timestamp: "2026-09-04T12:00:00Z" },
  ];

  runTransaction(() => reports.forEach((r) => insert.run(r)));
  console.log("✅ Reports seeded.");
}

// ── SETTINGS ───────────────────────────────────────────────────────────────
function seedSettings() {
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (:key, :value, :updated_at)"
  );

  const defaults = [
    { key: "threshold_soilMoisture", value: "70" },
    { key: "threshold_rainfall",     value: "40" },
    { key: "threshold_pm25",         value: "60" },
    { key: "threshold_waterLevel",   value: "2.0" },
    { key: "threshold_aqi",          value: "100" },
    { key: "refreshRateSec",         value: "15" },
    { key: "theme",                  value: "dark" },
  ];

  runTransaction(() =>
    defaults.forEach((s) => upsert.run({ key: s.key, value: s.value, updated_at: now() }))
  );
  console.log("✅ Settings seeded.");
}

// ── WEATHER ────────────────────────────────────────────────────────────────
function seedWeatherReadings() {
  const count = db.prepare("SELECT COUNT(*) as c FROM api_weather_readings").get().c;
  if (count > 0) { console.log("ℹ️  Weather readings already exist, skipping."); return; }

  const insert = db.prepare(`
    INSERT INTO api_weather_readings
      (temperature, humidity, aqi, aqi_label, pm25, rainfall,
       wind_speed, wind_dir, pressure, visibility, uv_index, recorded_at)
    VALUES
      (:temperature, :humidity, :aqi, :aqi_label, :pm25, :rainfall,
       :wind_speed, :wind_dir, :pressure, :visibility, :uv_index, :recorded_at)
  `);

  const base = { temperature: 21.8, humidity: 68, aqi: 78, aqi_label: "Moderate",
    pm25: 64, rainfall: 3.4, wind_speed: 12.6, wind_dir: "SSW",
    pressure: 1012.4, visibility: 8.5, uv_index: 4.2 };

  runTransaction(() => {
    for (let i = 48; i >= 0; i--) {
      const ts = new Date(Date.now() - i * 30 * 60 * 1000).toISOString();
      insert.run({
        temperature: parseFloat((base.temperature + (Math.random()-0.5)*2).toFixed(1)),
        humidity: base.humidity,
        aqi: Math.round(base.aqi + (Math.random()-0.5)*10),
        aqi_label: "Moderate",
        pm25: parseFloat(Math.max(0, base.pm25 + (Math.random()-0.5)*8).toFixed(1)),
        rainfall: parseFloat(Math.max(0, base.rainfall + (Math.random()-0.5)*1).toFixed(1)),
        wind_speed: base.wind_speed, wind_dir: base.wind_dir,
        pressure: base.pressure, visibility: base.visibility, uv_index: base.uv_index,
        recorded_at: ts,
      });
    }
  });
  console.log("✅ Weather readings seeded (49 historical snapshots).");
}

// ── RUN ────────────────────────────────────────────────────────────────────
console.log("🌱 Starting EvoGuard database seed...");
seedNodes();
seedAlerts();
seedHazards();
seedReports();
seedSettings();
seedWeatherReadings();
console.log("✅ Database seeding complete!");

