"use strict";

const express = require("express");
const { getDb } = require("../db/database");

const router = express.Router();

function formatWeather(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: "Overall Area — API Data",
        subtitle: "Region-wide environmental conditions",
        status: "API Connected",
        provider: "GlobalWeather & EnviroNet API",
        lat: 25.268,
        lng: 91.74,
        lastUpdate: row.recorded_at,
        sensors: {
            temperature: { value: row.temperature, unit: "°C" },
            humidity: { value: row.humidity, unit: "%" },
            aqi: { value: row.aqi, label: row.aqi_label || "Moderate", unit: "AQI" },
            pm25: { value: row.pm25, unit: "µg/m³" },
            rainfall: { value: row.rainfall, unit: "mm/h" },
            windSpeed: { value: row.wind_speed, unit: "km/h" },
            windDirection: row.wind_dir,
            pressure: { value: row.pressure, unit: "hPa" },
            visibility: { value: row.visibility, unit: "km" },
            uvIndex: { value: row.uv_index, unit: "UV" },
        },
    };
}

// ── GET /api/weather/current ─────────────────────────────────────────────
// Returns the most recent weather snapshot.
router.get("/current", (req, res, next) => {
    try {
        const db = getDb();
        const row = db.prepare("SELECT * FROM api_weather_readings ORDER BY recorded_at DESC LIMIT 1").get();
        res.json({ success: true, data: formatWeather(row) });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/weather/history ──────────────────────────────────────────────
// Returns time-series weather history.
// Query params: ?limit=50&field=temperature,aqi,rainfall
router.get("/history", (req, res, next) => {
    try {
        const db = getDb();
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);

        const rows = db
            .prepare(
                `SELECT temperature, humidity, aqi, pm25, rainfall, wind_speed,
                pressure, visibility, uv_index, recorded_at
         FROM api_weather_readings
         ORDER BY recorded_at DESC
         LIMIT ?`,
            )
            .all(limit);

        // Return chronological order (oldest first) for charting
        const data = rows.reverse().map(r => ({
            timestamp: r.recorded_at,
            temperature: r.temperature,
            humidity: r.humidity,
            aqi: r.aqi,
            pm25: r.pm25,
            rainfall: r.rainfall,
            windSpeed: r.wind_speed,
            pressure: r.pressure,
            visibility: r.visibility,
            uvIndex: r.uv_index,
        }));

        res.json({ success: true, count: data.length, data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
