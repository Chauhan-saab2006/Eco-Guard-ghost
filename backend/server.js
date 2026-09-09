"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { getDb } = require("./db/database");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const simulator = require("./services/simulator");

// ── Route modules ──────────────────────────────────────────────────────────
const nodesRouter = require("./routes/nodes");
const alertsRouter = require("./routes/alerts");
const hazardsRouter = require("./routes/hazards");
const reportsRouter = require("./routes/reports");
const apidataRouter = require("./routes/apidata");
const settingsRouter = require("./routes/settings");
const mlRouter = require("./routes/ml");

// ── Config ─────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const SIMULATION_INTERVAL = parseInt(process.env.SIMULATION_INTERVAL_SEC) || 15;

// ── App Setup ──────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
    },
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
if (process.env.NODE_ENV !== "production") {
    app.use((req, _res, next) => {
        console.log(`[API] ${req.method} ${req.path}`);
        next();
    });
}

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    const db = getDb();
    const nodeCount = db.prepare("SELECT COUNT(*) as c FROM nodes").get().c;
    const alertCount = db.prepare("SELECT COUNT(*) as c FROM alerts").get().c;
    const weatherCount = db.prepare("SELECT COUNT(*) as c FROM api_weather_readings").get().c;

    res.json({
        status: "ok",
        version: "1.0.0",
        db: { nodes: nodeCount, alerts: alertCount, weatherReadings: weatherCount },
        simulatorRunning: true,
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/nodes", nodesRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/hazards", hazardsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/weather", apidataRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/ml", mlRouter);

// ── API Index ──────────────────────────────────────────────────────────────
app.get("/api", (req, res) => {
    res.json({
        name: "EvoGuard Environmental Monitoring API",
        version: "1.0.0",
        endpoints: {
            nodes: {
                list: "GET /api/nodes",
                detail: "GET /api/nodes/:id",
                history: "GET /api/nodes/:id/history",
                push: "PUT /api/nodes/:id/sensors",
            },
            alerts: {
                list: "GET /api/alerts",
                detail: "GET /api/alerts/:id",
                create: "POST /api/alerts",
                acknowledge: "PATCH /api/alerts/:id/acknowledge",
                resolve: "PATCH /api/alerts/:id/resolve",
            },
            hazards: {
                list: "GET /api/hazards",
                detail: "GET /api/hazards/:id",
                create: "POST /api/hazards",
                update: "PATCH /api/hazards/:id",
            },
            reports: {
                list: "GET /api/reports",
                detail: "GET /api/reports/:id",
                create: "POST /api/reports",
                status: "PATCH /api/reports/:id/status",
            },
            weather: { current: "GET /api/weather/current", history: "GET /api/weather/history" },
            settings: {
                thresholds: "GET|PUT /api/settings/thresholds",
                refreshRate: "GET|PUT /api/settings/refresh-rate",
                all: "GET /api/settings/all",
            },
            ml: { risk: "GET /api/ml/risk", predictions: "GET /api/ml/predictions" },
        },
        socketEvents: {
            emitted: ["node:update", "weather:update", "risk:update", "alert:new"],
        },
    });
});

// ── Error Handling ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Socket.IO Connection ───────────────────────────────────────────────────
io.on("connection", socket => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // On connect: send current snapshot immediately
    try {
        const db = getDb();
        const latestWeather = db.prepare("SELECT * FROM api_weather_readings ORDER BY recorded_at DESC LIMIT 1").get();
        const nodes = db.prepare("SELECT * FROM nodes").all();

        if (latestWeather)
            socket.emit("weather:update", { weather: latestWeather, timestamp: new Date().toISOString() });

        // Load threshold settings
        const threshRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'threshold_%'").all();
        const t = {};
        threshRows.forEach(r => (t[r.key.replace("threshold_", "")] = parseFloat(r.value)));
        const thresholds = {
            soilMoisture: t.soilMoisture ?? 70,
            rainfall: t.rainfall ?? 40,
            pm25: t.pm25 ?? 60,
            waterLevel: t.waterLevel ?? 2.0,
            aqi: t.aqi ?? 100,
        };

        const { calculateRiskFromDb } = require("./services/riskEngine");
        const risk = calculateRiskFromDb(db, thresholds);
        socket.emit("risk:update", { risk, timestamp: new Date().toISOString() });
    } catch (e) {
        console.error("[Socket.IO] Error sending initial snapshot:", e.message);
    }

    socket.on("disconnect", () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

// ── Bootstrap ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log("");
    console.log("╔════════════════════════════════════════════════╗");
    console.log("║  🌿 EvoGuard Backend API                       ║");
    console.log(`║  🚀 Running on http://localhost:${PORT}            ║`);
    console.log(`║  📡 Socket.IO active (CORS: ${CORS_ORIGIN})  ║`);
    console.log(`║  🔁 Simulator tick: every ${SIMULATION_INTERVAL}s               ║`);
    console.log("╚════════════════════════════════════════════════╝");
    console.log("");

    // Initialize DB (creates tables if not exists)
    getDb();

    // Start live simulation loop
    simulator.start(io, getDb(), SIMULATION_INTERVAL);
});

module.exports = { app, server, io };
