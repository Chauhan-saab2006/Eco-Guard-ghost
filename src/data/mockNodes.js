export const initialNodes = [
  {
    id: "node-1",
    name: "Node 1 — Hill Sector",
    sector: "Hill Sector",
    status: "Online",
    communication: "LoRa & GSM Connected",
    hasLora: true,
    hasGsm: true,
    protocol: "LoRaWAN + 4G LTE/GSM (Dual Redundant)",
    signalStrength: -78, // dBm
    battery: 92, // %
    lat: 25.275,
    lng: 91.732,
    elevation: "1,240 m",
    installationDate: "2024-03-15",
    lastUpdate: "2 minutes ago",
    hardwareVersion: "EcoNode-v2.4 Dual",
    firmwareVersion: "fw-3.8.1-dual",
    sensors: {
      temperature: { value: 18.4, unit: "°C", safeRange: [10, 30], status: "normal" },
      humidity: { value: 67, unit: "%", safeRange: [30, 80], status: "normal" },
      soilMoisture: { value: 78, unit: "%", safeRange: [20, 70], status: "warning" },
      rainfall: { value: 42.6, unit: "mm/h", safeRange: [0, 25], status: "critical" },
    },
  },
  {
    id: "node-2",
    name: "Node 2 — River Bank",
    sector: "River Bank",
    status: "Online",
    communication: "LoRa & GSM Connected",
    hasLora: true,
    hasGsm: true,
    protocol: "LoRaWAN + 4G LTE/GSM (Dual Redundant)",
    signalStrength: -65, // dBm
    battery: 88, // %
    lat: 25.26,
    lng: 91.748,
    elevation: "310 m",
    installationDate: "2024-04-01",
    lastUpdate: "1 minute ago",
    hardwareVersion: "EcoNode-v2.4 Dual",
    firmwareVersion: "fw-3.8.4-dual",
    sensors: {
      temperature: { value: 22.1, unit: "°C", safeRange: [10, 35], status: "normal" },
      humidity: { value: 71, unit: "%", safeRange: [30, 80], status: "normal" },
      pm25: { value: 82, unit: "µg/m³", safeRange: [0, 50], status: "warning" },
      waterLevel: { value: 1.8, unit: "m", safeRange: [0, 1.5], status: "warning" },
    },
  },
];
