// Helper to generate time series data points
export const generateHistoryData = (timeframe = "24h") => {
  let count = 12;
  let labelFormatter = (i) => `${i}:00`;

  if (timeframe === "1h") {
    count = 12; // every 5 min
    labelFormatter = (i) => `${i * 5}m ago`;
  } else if (timeframe === "6h") {
    count = 12; // every 30 min
    labelFormatter = (i) => `${(12 - i) * 0.5}h ago`;
  } else if (timeframe === "24h") {
    count = 24; // hourly
    labelFormatter = (i) => `${(i).toString().padStart(2, "0")}:00`;
  } else if (timeframe === "7d") {
    count = 7;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    labelFormatter = (i) => days[i % 7];
  } else if (timeframe === "30d") {
    count = 15;
    labelFormatter = (i) => `Day ${i * 2}`;
  }

  // ML Risk score history dataset
  const mlRiskHistory = Array.from({ length: count }, (_, i) => {
    const time = labelFormatter(i);
    const progress = i / count;
    return {
      time,
      overallRisk: Math.min(95, Math.max(20, Math.round(45 + Math.sin(progress * Math.PI * 2) * 25 + (i > count * 0.6 ? 20 : 0)))),
      landslideRisk: Math.min(98, Math.max(15, Math.round(40 + Math.cos(progress * Math.PI * 2) * 20 + (i > count * 0.5 ? 30 : 0)))),
      floodRisk: Math.min(90, Math.max(10, Math.round(30 + Math.sin(progress * Math.PI) * 25))),
      airQualityRisk: Math.min(85, Math.max(25, Math.round(50 + Math.cos(progress * Math.PI) * 15))),
    };
  });

  // Node 1 History dataset (Temp, Humidity, Soil Moisture, Rainfall)
  const node1History = Array.from({ length: count }, (_, i) => {
    const time = labelFormatter(i);
    const step = i / count;
    return {
      time,
      temperature: Number((17.5 + Math.sin(step * 6) * 2.5).toFixed(1)),
      humidity: Math.round(60 + Math.cos(step * 4) * 12),
      soilMoisture: Math.round(45 + step * 32 + Math.random() * 3), // rising soil moisture
      rainfall: Number((Math.max(0, Math.sin(step * Math.PI) * 45 + Math.random() * 5)).toFixed(1)),
    };
  });

  // Node 2 History dataset (Temp, Humidity, PM2.5, Water Level)
  const node2History = Array.from({ length: count }, (_, i) => {
    const time = labelFormatter(i);
    const step = i / count;
    return {
      time,
      temperature: Number((21.0 + Math.sin(step * 5) * 3).toFixed(1)),
      humidity: Math.round(65 + Math.sin(step * 4) * 10),
      pm25: Math.round(45 + Math.sin(step * 8) * 35),
      waterLevel: Number((1.2 + step * 0.6 + Math.random() * 0.1).toFixed(2)), // rising water level
    };
  });

  // API History dataset (Temp, AQI, PM2.5, Rainfall, Wind Speed, Pressure)
  const apiHistory = Array.from({ length: count }, (_, i) => {
    const time = labelFormatter(i);
    const step = i / count;
    return {
      time,
      temperature: Number((20.5 + Math.sin(step * 5) * 2.5).toFixed(1)),
      aqi: Math.round(65 + Math.sin(step * 6) * 20),
      pm25: Math.round(48 + Math.sin(step * 6) * 18),
      rainfall: Number((Math.max(0, Math.sin(step * Math.PI) * 15)).toFixed(1)),
      windSpeed: Number((10 + Math.cos(step * 8) * 6).toFixed(1)),
      pressure: Number((1015 - step * 4).toFixed(1)),
    };
  });

  return { mlRiskHistory, node1History, node2History, apiHistory };
};
