"use strict";

const express = require("express");
const { z } = require("zod");
const { getDb } = require("../db/database");

const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────────────
function buildNodeResponse(db, node) {
    // Get the latest reading per sensor for this node
    const sensorRows = db
        .prepare(
            `SELECT sensor_key, value, unit, status, MAX(recorded_at) as last_at
       FROM node_sensor_readings
       WHERE node_id = ?
       GROUP BY sensor_key`,
        )
        .all(node.id);

    const sensors = {};
    sensorRows.forEach(s => {
        sensors[s.sensor_key] = {
            value: s.value,
            unit: s.unit,
            status: s.status,
            lastAt: s.last_at,
        };
    });

    return {
        id: node.id,
        name: node.name,
        sector: node.sector,
        status: node.status,
        communication: node.communication,
        hasLora: node.has_lora === 1,
        hasGsm: node.has_gsm === 1,
        protocol: node.protocol,
        signalStrength: node.signal_strength,
        battery: node.battery,
        lat: node.lat,
        lng: node.lng,
        elevation: node.elevation,
        installationDate: node.installation_date,
        lastUpdate: node.last_update,
        hardwareVersion: node.hardware_version,
        firmwareVersion: node.firmware_version,
        sensors,
    };
}

// ── GET /api/nodes ─────────────────────────────────────────────────────────
// Returns all nodes with their latest sensor readings.
router.get("/", (req, res, next) => {
    try {
        const db = getDb();
        const nodes = db.prepare("SELECT * FROM nodes ORDER BY id ASC").all();
        const payload = nodes.map(n => buildNodeResponse(db, n));
        res.json({ success: true, data: payload });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/nodes/:id ──────────────────────────────────────────────────────
// Returns a single node with full sensor detail.
router.get("/:id", (req, res, next) => {
    try {
        const db = getDb();
        const node = db.prepare("SELECT * FROM nodes WHERE id = ?").get(req.params.id);
        if (!node) return res.status(404).json({ success: false, error: "Node not found" });
        res.json({ success: true, data: buildNodeResponse(db, node) });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/nodes/:id/history ──────────────────────────────────────────────
// Returns time-series sensor history.
// Query params: ?sensor=soilMoisture&limit=50
router.get("/:id/history", (req, res, next) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const sensorKey = req.query.sensor || null;
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);

        const node = db.prepare("SELECT id FROM nodes WHERE id = ?").get(id);
        if (!node) return res.status(404).json({ success: false, error: "Node not found" });

        let query = `
      SELECT sensor_key, value, unit, status, recorded_at
      FROM node_sensor_readings
      WHERE node_id = ?
    `;
        const params = [id];

        if (sensorKey) {
            query += " AND sensor_key = ?";
            params.push(sensorKey);
        }

        query += " ORDER BY recorded_at DESC LIMIT ?";
        params.push(limit);

        const rows = db.prepare(query).all(...params);

        // Group by sensor_key for convenience
        const grouped = {};
        rows.forEach(r => {
            if (!grouped[r.sensor_key]) grouped[r.sensor_key] = [];
            grouped[r.sensor_key].push({ value: r.value, unit: r.unit, status: r.status, timestamp: r.recorded_at });
        });

        res.json({ success: true, nodeId: id, data: grouped });
    } catch (err) {
        next(err);
    }
});

// ── PUT /api/nodes/:id/sensors ──────────────────────────────────────────────
// IoT device endpoint — push a new batch of sensor readings.
// Body: { readings: [{ sensorKey, value, unit, status }] }
const SensorReadingSchema = z.object({
    readings: z.array(
        z.object({
            sensorKey: z.string(),
            value: z.number(),
            unit: z.string(),
            status: z.enum(["normal", "warning", "critical"]).optional().default("normal"),
        }),
    ),
});

router.put("/:id/sensors", (req, res, next) => {
    try {
        const db = getDb();
        const { id } = req.params;

        const node = db.prepare("SELECT id FROM nodes WHERE id = ?").get(id);
        if (!node) return res.status(404).json({ success: false, error: "Node not found" });

        const parsed = SensorReadingSchema.parse(req.body);
        const ts = new Date().toISOString();

        const insert = db.prepare(`
      INSERT INTO node_sensor_readings (node_id, sensor_key, value, unit, status, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        db.exec("BEGIN");
        try {
            parsed.readings.forEach(r => {
                insert.run(id, r.sensorKey, r.value, r.unit, r.status, ts);
            });
            db.prepare("UPDATE nodes SET last_update = ? WHERE id = ?").run("Just now", id);
            db.exec("COMMIT");
        } catch (txErr) {
            try {
                db.exec("ROLLBACK");
            } catch (_) {}
            throw txErr;
        }
        res.json({
            success: true,
            message: `${parsed.readings.length} readings recorded for node ${id}.`,
            timestamp: ts,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
