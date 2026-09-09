# EvoGuard Backend API

Real-time environmental monitoring backend for the EvoGuard/EcoWatch dashboard.

## Stack

- **Node.js + Express** — REST API
- **SQLite (better-sqlite3)** — Zero-config embedded database
- **Socket.IO** — Real-time sensor data push to frontend
- **Zod** — Request validation

## Quick Start

```bash
cd backend
npm install
npm run seed       # Populate DB with initial data
npm run dev        # Start dev server with hot-reload (nodemon)
```

Server starts on **http://localhost:3001**

## API Reference

| Method | Endpoint                      | Description                               |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/api/nodes`                  | All IoT nodes with latest sensor readings |
| GET    | `/api/nodes/:id`              | Single node detail                        |
| GET    | `/api/nodes/:id/history`      | Sensor time-series history                |
| PUT    | `/api/nodes/:id/sensors`      | Push sensor readings from IoT device      |
| GET    | `/api/alerts`                 | List alerts (filter: status, severity)    |
| POST   | `/api/alerts`                 | Create new alert                          |
| PATCH  | `/api/alerts/:id/acknowledge` | Acknowledge an alert                      |
| PATCH  | `/api/alerts/:id/resolve`     | Resolve an alert                          |
| GET    | `/api/hazards`                | All hazard zones with geo-coordinates     |
| POST   | `/api/hazards`                | Create hazard zone                        |
| PATCH  | `/api/hazards/:id`            | Update hazard zone                        |
| GET    | `/api/reports`                | Field incident reports                    |
| POST   | `/api/reports`                | File new incident report                  |
| PATCH  | `/api/reports/:id/status`     | Update report status                      |
| GET    | `/api/weather/current`        | Latest regional weather snapshot          |
| GET    | `/api/weather/history`        | Weather time-series data                  |
| GET    | `/api/settings/thresholds`    | Get alert thresholds                      |
| PUT    | `/api/settings/thresholds`    | Update alert thresholds                   |
| GET    | `/api/ml/risk`                | Live ML risk scores                       |
| GET    | `/api/ml/predictions`         | Full multi-hazard prediction output       |
| GET    | `/health`                     | API health check                          |

## Socket.IO Events (emitted to clients)

| Event            | Payload                  | Description              |
| ---------------- | ------------------------ | ------------------------ |
| `node:update`    | `{ nodes, timestamp }`   | Sensor data updated      |
| `weather:update` | `{ weather, timestamp }` | Regional weather updated |
| `risk:update`    | `{ risk, timestamp }`    | ML risk scores updated   |
| `alert:new`      | `{ alert }`              | New alert created        |

## Environment Variables

Copy `.env` and adjust:

```
PORT=3001
DB_PATH=./db/evoguard.sqlite
CORS_ORIGIN=http://localhost:5173
SIMULATION_INTERVAL_SEC=15
```
