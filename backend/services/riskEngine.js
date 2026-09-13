"use strict";

/**
 * Risk Engine — port of /src/utils/riskCalculator.js to Node.js.
 * Uses the exact same formulas as the frontend for consistency.
 */

/**
 * @param {Object} node1Sensors  - { soilMoisture: number, rainfall: number }
 * @param {Object} node2Sensors  - { waterLevel: number, pm25: number }
 * @param {Object} apiSensors    - { rainfall: number, aqi: number }
 * @param {Object} thresholds    - { soilMoisture, rainfall, waterLevel, pm25, aqi }
 */
function calculateRisk(node1Sensors, node2Sensors, apiSensors, thresholds) {
    const soil = node1Sensors?.soilMoisture ?? 70;
    const rain1 = node1Sensors?.rainfall ?? 30;
    const waterLevel = node2Sensors?.waterLevel ?? 1.5;
    const pm25 = node2Sensors?.pm25 ?? 60;
    const apiRain = apiSensors?.rainfall ?? 3.4;
    const apiAqi = apiSensors?.aqi ?? 75;

    const soilThresh = thresholds?.soilMoisture ?? 70;
    const rainThresh = thresholds?.rainfall ?? 40;
    const waterThresh = thresholds?.waterLevel ?? 2.0;
    const pm25Thresh = thresholds?.pm25 ?? 60;

    // Landslide: soil moisture + rainfall intensity
    const soilRatio = Math.min(1.3, soil / soilThresh);
    const rainRatio = Math.min(1.3, rain1 / rainThresh);
    const landslideScore = Math.min(99, Math.round((soilRatio * 55 + rainRatio * 45) * 0.75));

    // Flood: river water level + regional API rainfall
    const waterRatio = Math.min(1.3, waterLevel / waterThresh);
    const apiRainRatio = Math.min(1.3, apiRain / 20);
    const floodScore = Math.min(99, Math.round((waterRatio * 65 + apiRainRatio * 35) * 0.7));

    // Air Quality: PM2.5 + regional AQI
    const pm25Ratio = Math.min(1.3, pm25 / pm25Thresh);
    const aqiRatio = Math.min(1.3, apiAqi / 100);
    const airQualityScore = Math.min(99, Math.round((pm25Ratio * 60 + aqiRatio * 40) * 0.65));

    // Combined overall
    let overallScore = Math.round(landslideScore * 0.45 + floodScore * 0.35 + airQualityScore * 0.2);
    // Mimic the event active logic from the frontend to keep backend scores somewhat in sync
    if (landslideScore >= 90 || floodScore >= 85 || airQualityScore >= 60) {
        overallScore = Math.max(overallScore, landslideScore, floodScore, airQualityScore);
    }

    // Custom condition: when soil moisture > 70, add 15 to ML prediction
    const node2Soil = node2Sensors?.soilMoisture ?? 0;
    if (node2Soil > 70) {
        overallScore += 15;
    }

    overallScore = Math.min(99, overallScore);

    return {
        overallScore,
        landslideScore,
        floodScore,
        airQualityScore,
        overallLevel: getRiskLevel(overallScore),
        landslideLevel: getRiskLevel(landslideScore),
        floodLevel: getRiskLevel(floodScore),
        airQualityLevel: getRiskLevel(airQualityScore),
    };
}

function getRiskLevel(score) {
    if (score >= 80) return "CRITICAL";
    if (score >= 65) return "HIGH";
    if (score >= 45) return "MODERATE";
    return "LOW";
}

function getRiskColor(level) {
    switch (level) {
        case "CRITICAL":
            return "red";
        case "HIGH":
            return "orange";
        case "MODERATE":
            return "amber";
        default:
            return "green";
    }
}

/**
 * Load the latest sensor values from DB and calculate risk.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {Object} thresholds
 */
function calculateRiskFromDb(db, thresholds) {
    const latestSensor = db.prepare(`
    SELECT sensor_key, value FROM node_sensor_readings
    WHERE node_id = ? AND sensor_key = ?
    ORDER BY recorded_at DESC LIMIT 1
  `);

    const getVal = (nodeId, key, fallback) => {
        const row = latestSensor.get(nodeId, key);
        return row ? row.value : fallback;
    };

    const node1Sensors = {
        soilMoisture: getVal("node-1", "soilMoisture", 70),
        rainfall: getVal("node-1", "rainfall", 30),
    };

    const node2Sensors = {
        waterLevel: getVal("node-2", "waterLevel", 1.5),
        pm25: getVal("node-2", "pm25", 60),
    };

    const latestWeather = db
        .prepare(
            `
    SELECT rainfall, aqi FROM api_weather_readings
    ORDER BY recorded_at DESC LIMIT 1
  `,
        )
        .get() || { rainfall: 3.4, aqi: 75 };

    return calculateRisk(node1Sensors, node2Sensors, latestWeather, thresholds);
}

module.exports = { calculateRisk, calculateRiskFromDb, getRiskLevel, getRiskColor };
