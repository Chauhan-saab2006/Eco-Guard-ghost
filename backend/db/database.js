"use strict";

const { DatabaseSync } = require("node:sqlite");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "evoguard.sqlite");

let db;

function getDb() {
    if (!db) {
        db = new DatabaseSync(DB_PATH);
        db.exec("PRAGMA journal_mode = WAL");
        db.exec("PRAGMA foreign_keys = ON");
        initSchema();
    }
    return db;
}

function initSchema() {
    db.exec(`
    -- ── NODES ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS nodes (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      sector            TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'Online',
      communication     TEXT,
      has_lora          INTEGER NOT NULL DEFAULT 0,
      has_gsm           INTEGER NOT NULL DEFAULT 0,
      protocol          TEXT,
      signal_strength   REAL,
      battery           REAL,
      lat               REAL NOT NULL,
      lng               REAL NOT NULL,
      elevation         TEXT,
      installation_date TEXT,
      last_update       TEXT,
      hardware_version  TEXT,
      firmware_version  TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── NODE SENSOR READINGS (time-series) ────────────────────────────────────
    CREATE TABLE IF NOT EXISTS node_sensor_readings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id     TEXT NOT NULL REFERENCES nodes(id),
      sensor_key  TEXT NOT NULL,    -- 'soilMoisture', 'rainfall', 'pm25', 'waterLevel', etc.
      value       REAL NOT NULL,
      unit        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'normal',   -- normal, warning, critical
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_time
      ON node_sensor_readings(node_id, sensor_key, recorded_at DESC);

    -- ── ALERTS ────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS alerts (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      source        TEXT NOT NULL,
      source_type   TEXT NOT NULL DEFAULT 'node',   -- node | api
      location      TEXT,
      message       TEXT NOT NULL,
      severity      TEXT NOT NULL DEFAULT 'MEDIUM',  -- LOW | MEDIUM | HIGH | CRITICAL
      status        TEXT NOT NULL DEFAULT 'Active',  -- Active | Acknowledged | Resolved
      sensor_key    TEXT,
      sensor_value  TEXT,
      ml_risk_score REAL,
      lat           REAL,
      lng           REAL,
      timestamp     TEXT NOT NULL DEFAULT (datetime('now')),
      time_ago      TEXT
    );

    -- ── HAZARD ZONES ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS hazards (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      type                TEXT NOT NULL,         -- 'Landslide Risk', 'Flood Risk', 'Soil Erosion'
      risk_level          TEXT NOT NULL,         -- LOW | MEDIUM | HIGH | CRITICAL
      color               TEXT NOT NULL DEFAULT '#ef4444',
      coordinates         TEXT NOT NULL,         -- JSON array of [lat,lng] pairs
      center_lat          REAL,
      center_lng          REAL,
      description         TEXT,
      vulnerability_score TEXT,
      primary_factors     TEXT,
      active_monitoring   INTEGER NOT NULL DEFAULT 1,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── FIELD INCIDENT REPORTS ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS reports (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      location     TEXT NOT NULL,
      severity     TEXT NOT NULL DEFAULT 'MEDIUM',
      status       TEXT NOT NULL DEFAULT 'New',    -- New | Under Review | Resolved
      reported_by  TEXT NOT NULL,
      description  TEXT NOT NULL,
      coord_lat    REAL,
      coord_lng    REAL,
      time_ago     TEXT,
      timestamp    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── SETTINGS (key/value store) ────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── REGIONAL API WEATHER SNAPSHOTS (time-series) ──────────────────────────
    CREATE TABLE IF NOT EXISTS api_weather_readings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature   REAL,
      humidity      REAL,
      aqi           REAL,
      aqi_label     TEXT,
      pm25          REAL,
      rainfall      REAL,
      wind_speed    REAL,
      wind_dir      TEXT,
      pressure      REAL,
      visibility    REAL,
      uv_index      REAL,
      recorded_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_weather_time
      ON api_weather_readings(recorded_at DESC);
  `);
}

module.exports = { getDb };
