"use strict";

const express = require("express");
const { z } = require("zod");
const { getDb } = require("../db/database");

const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────────────
function loadThresholds(db) {
    const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'threshold_%'").all();
    const t = {};
    rows.forEach(r => {
        const field = r.key.replace("threshold_", "");
        t[field] = parseFloat(r.value);
    });
    return {
        soilMoisture: t.soilMoisture ?? 70,
        rainfall: t.rainfall ?? 40,
        pm25: t.pm25 ?? 60,
        waterLevel: t.waterLevel ?? 2.0,
        aqi: t.aqi ?? 100,
    };
}

// ── GET /api/settings/thresholds ──────────────────────────────────────────
router.get("/thresholds", (req, res, next) => {
    try {
        const db = getDb();
        res.json({ success: true, data: loadThresholds(db) });
    } catch (err) {
        next(err);
    }
});

// ── PUT /api/settings/thresholds ──────────────────────────────────────────
const ThresholdsSchema = z.object({
    soilMoisture: z.number().min(10).max(95).optional(),
    rainfall: z.number().min(5).max(100).optional(),
    pm25: z.number().min(15).max(250).optional(),
    waterLevel: z.number().min(0.5).max(6.0).optional(),
    aqi: z.number().min(10).max(500).optional(),
});

router.put("/thresholds", (req, res, next) => {
    try {
        const db = getDb();
        const parsed = ThresholdsSchema.parse(req.body);
        const ts = new Date().toISOString();

        const upsert = db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)");

        db.exec("BEGIN");
        try {
            Object.entries(parsed).forEach(([field, value]) => {
                upsert.run(`threshold_${field}`, String(value), ts);
            });
            db.exec("COMMIT");
        } catch (txErr) {
            try {
                db.exec("ROLLBACK");
            } catch (_) {}
            throw txErr;
        }
        res.json({ success: true, data: loadThresholds(db), message: "Thresholds updated." });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/settings/refresh-rate ────────────────────────────────────────
router.get("/refresh-rate", (req, res, next) => {
    try {
        const db = getDb();
        const row = db.prepare("SELECT value FROM settings WHERE key = 'refreshRateSec'").get();
        res.json({ success: true, data: { refreshRateSec: row ? parseInt(row.value) : 15 } });
    } catch (err) {
        next(err);
    }
});

// ── PUT /api/settings/refresh-rate ────────────────────────────────────────
const RefreshRateSchema = z.object({
    refreshRateSec: z.number().int().min(5).max(600),
});

router.put("/refresh-rate", (req, res, next) => {
    try {
        const db = getDb();
        const { refreshRateSec } = RefreshRateSchema.parse(req.body);
        const ts = new Date().toISOString();

        db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('refreshRateSec', ?, ?)").run(
            String(refreshRateSec),
            ts,
        );

        res.json({ success: true, data: { refreshRateSec }, message: "Refresh rate updated." });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/settings/all ──────────────────────────────────────────────────
router.get("/all", (req, res, next) => {
    try {
        const db = getDb();
        const rows = db.prepare("SELECT key, value, updated_at FROM settings").all();
        const data = {};
        rows.forEach(r => (data[r.key] = { value: r.value, updatedAt: r.updated_at }));
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
