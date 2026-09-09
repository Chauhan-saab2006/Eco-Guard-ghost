"use strict";

const express = require("express");
const { z } = require("zod");
const { getDb } = require("../db/database");

const router = express.Router();

function formatHazard(row) {
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        riskLevel: row.risk_level,
        color: row.color,
        coordinates: JSON.parse(row.coordinates || "[]"),
        center: [row.center_lat, row.center_lng],
        description: row.description,
        vulnerabilityScore: row.vulnerability_score,
        primaryFactors: row.primary_factors,
        activeMonitoring: row.active_monitoring === 1,
        createdAt: row.created_at,
    };
}

// ── GET /api/hazards ──────────────────────────────────────────────────────
router.get("/", (req, res, next) => {
    try {
        const db = getDb();
        const rows = db.prepare("SELECT * FROM hazards ORDER BY risk_level DESC, name ASC").all();
        res.json({ success: true, data: rows.map(formatHazard) });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/hazards/:id ──────────────────────────────────────────────────
router.get("/:id", (req, res, next) => {
    try {
        const db = getDb();
        const row = db.prepare("SELECT * FROM hazards WHERE id = ?").get(req.params.id);
        if (!row) return res.status(404).json({ success: false, error: "Hazard zone not found" });
        res.json({ success: true, data: formatHazard(row) });
    } catch (err) {
        next(err);
    }
});

// ── POST /api/hazards ─────────────────────────────────────────────────────
const CreateHazardSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    color: z.string().optional().default("#ef4444"),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(3),
    centerLat: z.number(),
    centerLng: z.number(),
    description: z.string().optional(),
    vulnerabilityScore: z.string().optional(),
    primaryFactors: z.string().optional(),
    activeMonitoring: z.boolean().optional().default(true),
});

router.post("/", (req, res, next) => {
    try {
        const db = getDb();
        const parsed = CreateHazardSchema.parse(req.body);
        const id = `zone-${Date.now()}`;

        db.prepare(
            `
      INSERT INTO hazards
        (id, name, type, risk_level, color, coordinates, center_lat, center_lng,
         description, vulnerability_score, primary_factors, active_monitoring)
      VALUES
        (@id, @name, @type, @risk_level, @color, @coordinates, @center_lat, @center_lng,
         @description, @vulnerability_score, @primary_factors, @active_monitoring)
    `,
        ).run({
            id,
            name: parsed.name,
            type: parsed.type,
            risk_level: parsed.riskLevel,
            color: parsed.color,
            coordinates: JSON.stringify(parsed.coordinates),
            center_lat: parsed.centerLat,
            center_lng: parsed.centerLng,
            description: parsed.description || null,
            vulnerability_score: parsed.vulnerabilityScore || null,
            primary_factors: parsed.primaryFactors || null,
            active_monitoring: parsed.activeMonitoring ? 1 : 0,
        });

        const row = db.prepare("SELECT * FROM hazards WHERE id = ?").get(id);
        res.status(201).json({ success: true, data: formatHazard(row) });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /api/hazards/:id ────────────────────────────────────────────────
const UpdateHazardSchema = z.object({
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    description: z.string().optional(),
    activeMonitoring: z.boolean().optional(),
    vulnerabilityScore: z.string().optional(),
    primaryFactors: z.string().optional(),
});

router.patch("/:id", (req, res, next) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const existing = db.prepare("SELECT * FROM hazards WHERE id = ?").get(id);
        if (!existing) return res.status(404).json({ success: false, error: "Hazard zone not found" });

        const parsed = UpdateHazardSchema.parse(req.body);
        const updates = [];
        const params = [];

        if (parsed.riskLevel !== undefined) {
            updates.push("risk_level = ?");
            params.push(parsed.riskLevel);
        }
        if (parsed.description !== undefined) {
            updates.push("description = ?");
            params.push(parsed.description);
        }
        if (parsed.activeMonitoring !== undefined) {
            updates.push("active_monitoring = ?");
            params.push(parsed.activeMonitoring ? 1 : 0);
        }
        if (parsed.vulnerabilityScore !== undefined) {
            updates.push("vulnerability_score = ?");
            params.push(parsed.vulnerabilityScore);
        }
        if (parsed.primaryFactors !== undefined) {
            updates.push("primary_factors = ?");
            params.push(parsed.primaryFactors);
        }

        if (updates.length > 0) {
            db.prepare(`UPDATE hazards SET ${updates.join(", ")} WHERE id = ?`).run(...params, id);
        }

        const row = db.prepare("SELECT * FROM hazards WHERE id = ?").get(id);
        res.json({ success: true, data: formatHazard(row) });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
