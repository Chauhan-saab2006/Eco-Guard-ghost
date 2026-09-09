export const initialMLState = {
  modelName: "EnviroGuard-MultiHazard-XGBoost",
  modelVersion: "Environmental-Risk-v1.2",
  status: "ML Model Active",
  lastPredictionTime: "10:42 AM",
  activeTab: "Overall", // Overall, Landslide, Flood, AirQuality
  predictions: {
    Overall: {
      riskLevel: "HIGH",
      riskScore: 82,
      confidence: "87%",
      horizon: "Next 3 hours",
      hazard: "Potential Landslide & Flash Runoff",
      explanation:
        "High rainfall intensity (42.6 mm/h at Node 1) combined with elevated soil moisture (78%) and recent slope instability in Zone A increases landslide probability significantly.",
      recommendedActions: [
        "Issue Early Warning to Hill Sector residents & NH-13 traffic control",
        "Monitor Node 1 soil moisture continuously at 1-minute intervals",
        "Inspect vulnerable slope zones A & C for fresh tension cracks",
        "Notify local emergency services & road clearance teams",
        "Prepare evacuation routes along West Ridge bypass",
      ],
      inputInfluences: [
        { parameter: "Soil Moisture (Node 1)", value: "78 %", influence: "High", weight: 92, status: "critical" },
        { parameter: "Rainfall Intensity (Node 1)", value: "42.6 mm/h", influence: "High", weight: 88, status: "critical" },
        { parameter: "River Water Level (Node 2)", value: "1.8 m", influence: "Medium", weight: 64, status: "warning" },
        { parameter: "Air PM2.5 (Node 2)", value: "82 µg/m³", influence: "Medium", weight: 58, status: "warning" },
        { parameter: "Ambient Temperature", value: "18.4 °C", influence: "Low", weight: 28, status: "normal" },
        { parameter: "Relative Humidity", value: "67 %", influence: "Low", weight: 32, status: "normal" },
        { parameter: "Wind Speed (API)", value: "12.6 km/h", influence: "Low", weight: 24, status: "normal" },
        { parameter: "Historical 24h Rainfall Trend", value: "+18.4 mm", influence: "High", weight: 81, status: "warning" },
      ],
    },
    Landslide: {
      riskLevel: "CRITICAL",
      riskScore: 89,
      confidence: "91%",
      horizon: "Next 2 hours",
      hazard: "Slope Failure / Landslide on North Ridge",
      explanation:
        "Excessive pore water pressure detected via Node 1 soil sensors. Slope saturation exceeds 75% stability threshold with continuous rain.",
      recommendedActions: [
        "Close NH-13 Hill Sector section immediately to heavy vehicles",
        "Deploy drone LiDAR to scan Zone A tension cracks",
        "Set Node 1 telemetry rate to 30-second burst mode",
      ],
      inputInfluences: [
        { parameter: "Soil Moisture (Node 1)", value: "78 %", influence: "High", weight: 98, status: "critical" },
        { parameter: "Rainfall Intensity (Node 1)", value: "42.6 mm/h", influence: "High", weight: 94, status: "critical" },
        { parameter: "Slope Angle Correlation", value: "48°", influence: "High", weight: 85, status: "warning" },
        { parameter: "Historical Slope Movement", value: "Active", influence: "Medium", weight: 70, status: "warning" },
      ],
    },
    Flood: {
      riskLevel: "MODERATE",
      riskScore: 58,
      confidence: "82%",
      horizon: "Next 6 hours",
      hazard: "River Embankment Inundation",
      explanation:
        "Water level at Node 2 is elevated (1.8m) but river velocity remains within drainage capacity. Downstream surge monitored.",
      recommendedActions: [
        "Alert downstream agricultural zone owners",
        "Verify flood gate telemetry at Som River Dam",
        "Maintain hourly water gauge cross-verification",
      ],
      inputInfluences: [
        { parameter: "Water Level (Node 2)", value: "1.8 m", influence: "High", weight: 82, status: "warning" },
        { parameter: "Upstream Catchment Rain (API)", value: "3.4 mm/h", influence: "Medium", weight: 60, status: "normal" },
        { parameter: "Soil Saturation Buffer", value: "22 %", influence: "Medium", weight: 45, status: "normal" },
        { parameter: "River Flow Velocity", value: "2.1 m/s", influence: "Low", weight: 35, status: "normal" },
      ],
    },
    AirQuality: {
      riskLevel: "MODERATE",
      riskScore: 62,
      confidence: "85%",
      horizon: "Next 12 hours",
      hazard: "Particulate Elevation (PM2.5)",
      explanation:
        "Thermal inversion layer over River Bank valley holding localized industrial emissions & particulate matter.",
      recommendedActions: [
        "Issue public health advisory for elderly and children in River Bank zone",
        "Check local sensors for calibration drift",
        "Monitor wind speed dispersion forecast",
      ],
      inputInfluences: [
        { parameter: "PM2.5 (Node 2)", value: "82 µg/m³", influence: "High", weight: 88, status: "warning" },
        { parameter: "Regional AQI (API)", value: "78 AQI", influence: "High", weight: 75, status: "warning" },
        { parameter: "Wind Speed (API)", value: "12.6 km/h", influence: "Low", weight: 30, status: "normal" },
        { parameter: "Ambient Humidity", value: "71 %", influence: "Low", weight: 25, status: "normal" },
      ],
    },
  },
};
