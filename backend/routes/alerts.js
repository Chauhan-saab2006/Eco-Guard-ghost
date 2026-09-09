"use strict";

const express = require("express");
const { z } = require("zod");
const { getDb } = require("../db/database");

const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────────────
function formatAlert(row) {
    return {
        id: row.id,
        title: row.title,
        source: row.source,
        sourceType: row.source_type,
        location: row.location,
        message: row.message,
        severity: row.severity,
        status: row.status,
        sensorKey: row.sensor_key,
        sensorValue: row.sensor_value,
        mlRiskScore: row.ml_risk_score,
        lat: row.lat,
        lng: row.lng,
        timestamp: row.timestamp,
        timeAgo: row.time_ago,
    };
}

// ── GET /api/alerts ─────────────────────────────────────────────────────────
// Query params: ?status=Active&severity=HIGH
router.get("/", (req, res, next) => {
    try {
        const db = getDb();
        const { status, severity } = req.query;

        let query = "SELECT * FROM alerts WHERE 1=1";
        const params = [];

        if (status) {
            query += " AND status = ?";
            params.push(status);
        }
        if (severity) {
            query += " AND severity = ?";
            params.push(severity);
        }

        query += " ORDER BY timestamp DESC";
        const rows = db.prepare(query).all(...params);
        res.json({ success: true, data: rows.map(formatAlert) });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/alerts/:id ──────────────────────────────────────────────────────
router.get("/:id", (req, res, next) => {
    try {
        const db = getDb();
        const row = db.prepare("SELECT * FROM alerts WHERE id = ?").get(req.params.id);
        if (!row) return res.status(404).json({ success: false, error: "Alert not found" });
        res.json({ success: true, data: formatAlert(row) });
    } catch (err) {
        next(err);
    }
});

// ── POST /api/alerts ─────────────────────────────────────────────────────────
const CreateAlertSchema = z.object({
    title: z.string().min(1),
    source: z.string().min(1),
    sourceType: z.enum(["node", "api"]).optional().default("node"),
    location: z.string().optional(),
    message: z.string().min(1),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    sensorKey: z.string().optional(),
    sensorValue: z.string().optional(),
    mlRiskScore: z.number().min(0).max(100).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

router.post("/", (req, res, next) => {
    try {
        const db = getDb();
        const parsed = CreateAlertSchema.parse(req.body);
        const id = `alert-${Date.now()}`;
        const ts = new Date().toISOString();

        db.prepare(
            `
      INSERT INTO alerts
        (id, title, source, source_type, location, message, severity, status,
         sensor_key, sensor_value, ml_risk_score, lat, lng, timestamp, time_ago)
      VALUES
        (@id, @title, @source, @source_type, @location, @message, @severity, 'Active',
         @sensor_key, @sensor_value, @ml_risk_score, @lat, @lng, @timestamp, @time_ago)
    `,
        ).run({
            id,
            title: parsed.title,
            source: parsed.source,
            source_type: parsed.sourceType,
            location: parsed.location || null,
            message: parsed.message,
            severity: parsed.severity,
            sensor_key: parsed.sensorKey || null,
            sensor_value: parsed.sensorValue || null,
            ml_risk_score: parsed.mlRiskScore ?? null,
            lat: parsed.lat ?? null,
            lng: parsed.lng ?? null,
            timestamp: ts,
            time_ago: "Just now",
        });

        const row = db.prepare("SELECT * FROM alerts WHERE id = ?").get(id);
        res.status(201).json({ success: true, data: formatAlert(row) });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /api/alerts/:id/acknowledge ───────────────────────────────────────
router.patch("/:id/acknowledge", (req, res, next) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const alert = db.prepare("SELECT * FROM alerts WHERE id = ?").get(id);
        if (!alert) return res.status(404).json({ success: false, error: "Alert not found" });
        if (alert.status !== "Active")
            return res.status(400).json({ success: false, error: `Alert is already ${alert.status}` });

        db.prepare("UPDATE alerts SET status = 'Acknowledged' WHERE id = ?").run(id);
        const updated = db.prepare("SELECT * FROM alerts WHERE id = ?").get(id);
        res.json({ success: true, data: formatAlert(updated) });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /api/alerts/:id/resolve ───────────────────────────────────────────
router.patch("/:id/resolve", (req, res, next) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const alert = db.prepare("SELECT * FROM alerts WHERE id = ?").get(id);
        if (!alert) return res.status(404).json({ success: false, error: "Alert not found" });
        if (alert.status === "Resolved")
            return res.status(400).json({ success: false, error: "Alert is already Resolved" });

        db.prepare("UPDATE alerts SET status = 'Resolved' WHERE id = ?").run(id);
        const updated = db.prepare("SELECT * FROM alerts WHERE id = ?").get(id);
        res.json({ success: true, data: formatAlert(updated) });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
