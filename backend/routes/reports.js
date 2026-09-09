"use strict";

const express = require("express");
const { z } = require("zod");
const { getDb } = require("../db/database");

const router = express.Router();

function formatReport(row) {
    return {
        id: row.id,
        title: row.title,
        location: row.location,
        severity: row.severity,
        status: row.status,
        reportedBy: row.reported_by,
        description: row.description,
        coordinates: row.coord_lat != null ? [row.coord_lat, row.coord_lng] : null,
        timeAgo: row.time_ago,
        timestamp: row.timestamp,
    };
}

// ── GET /api/reports ──────────────────────────────────────────────────────
// Query params: ?status=New&severity=HIGH
router.get("/", (req, res, next) => {
    try {
        const db = getDb();
        const { status, severity } = req.query;

        let query = "SELECT * FROM reports WHERE 1=1";
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
        res.json({ success: true, data: rows.map(formatReport) });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/reports/:id ──────────────────────────────────────────────────
router.get("/:id", (req, res, next) => {
    try {
        const db = getDb();
        const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
        if (!row) return res.status(404).json({ success: false, error: "Report not found" });
        res.json({ success: true, data: formatReport(row) });
    } catch (err) {
        next(err);
    }
});

// ── POST /api/reports ─────────────────────────────────────────────────────
const CreateReportSchema = z.object({
    title: z.string().min(1),
    location: z.string().min(1),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    reportedBy: z.string().optional().default("Operator Station"),
    description: z.string().min(1),
    coordLat: z.number().optional(),
    coordLng: z.number().optional(),
});

router.post("/", (req, res, next) => {
    try {
        const db = getDb();
        const parsed = CreateReportSchema.parse(req.body);
        const id = `rep-${Date.now()}`;
        const ts = new Date().toISOString();

        db.prepare(
            `
      INSERT INTO reports
        (id, title, location, severity, status, reported_by, description,
         coord_lat, coord_lng, time_ago, timestamp)
      VALUES
        (@id, @title, @location, @severity, 'New', @reported_by, @description,
         @coord_lat, @coord_lng, 'Just now', @timestamp)
    `,
        ).run({
            id,
            title: parsed.title,
            location: parsed.location,
            severity: parsed.severity,
            reported_by: parsed.reportedBy,
            description: parsed.description,
            coord_lat: parsed.coordLat ?? null,
            coord_lng: parsed.coordLng ?? null,
            timestamp: ts,
        });

        const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
        res.status(201).json({ success: true, data: formatReport(row) });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /api/reports/:id/status ─────────────────────────────────────────
const UpdateStatusSchema = z.object({
    status: z.enum(["New", "Under Review", "Resolved"]),
});

router.patch("/:id/status", (req, res, next) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const report = db.prepare("SELECT id FROM reports WHERE id = ?").get(id);
        if (!report) return res.status(404).json({ success: false, error: "Report not found" });

        const { status } = UpdateStatusSchema.parse(req.body);
        db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);

        const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
        res.json({ success: true, data: formatReport(row) });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
