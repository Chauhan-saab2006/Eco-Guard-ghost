/**
 * Dynamic Risk Calculation Engine
 * Calculates overall, landslide, flood, and air quality risk scores (0-100)
 * based on live sensor readings from Node 1, Node 2, API Data, and editable thresholds.
 */

export const calculateRisk = (nodes, apiData, thresholds) => {
  const node1 = nodes.find((n) => n.id === "node-1") || nodes[0];
  const node2 = nodes.find((n) => n.id === "node-2") || nodes[1];

  const soil = node1?.sensors?.soilMoisture?.value || 70;
  const rain1 = node1?.sensors?.rainfall?.value || 30;
  const waterLevel = node2?.sensors?.waterLevel?.value || 1.5;
  const pm25 = node2?.sensors?.pm25?.value || 60;
  const apiRain = apiData?.sensors?.rainfall?.value || 3.4;
  const apiAqi = apiData?.sensors?.aqi?.value || 75;

  // Retrieve threshold settings
  const soilThresh = thresholds?.soilMoisture || 70;
  const rainThresh = thresholds?.rainfall || 40;
  const waterThresh = thresholds?.waterLevel || 2.0;
  const pm25Thresh = thresholds?.pm25 || 60;

  // Calculate component scores
  // Landslide Risk formula: weighted combination of Soil Moisture & Rainfall
  const soilRatio = Math.min(1.3, soil / soilThresh);
  const rainRatio = Math.min(1.3, rain1 / rainThresh);
  const landslideScore = Math.min(99, Math.round((soilRatio * 55 + rainRatio * 45) * 0.75));

  // Flood Risk formula: River Water level ratio & regional API rainfall
  const waterRatio = Math.min(1.3, waterLevel / waterThresh);
  const apiRainRatio = Math.min(1.3, apiRain / 20);
  const floodScore = Math.min(99, Math.round((waterRatio * 65 + apiRainRatio * 35) * 0.7));

  // Air Quality Risk formula: PM2.5 ratio & regional AQI
  const pm25Ratio = Math.min(1.3, pm25 / pm25Thresh);
  const aqiRatio = Math.min(1.3, apiAqi / 100);
  const airQualityScore = Math.min(99, Math.round((pm25Ratio * 60 + aqiRatio * 40) * 0.65));

  // Combined Overall Risk score
  const overallScore = Math.min(
    99,
    Math.round(landslideScore * 0.45 + floodScore * 0.35 + airQualityScore * 0.2)
  );

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
};

export const getRiskLevel = (score) => {
  if (score >= 80) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 45) return "MODERATE";
  return "LOW";
};

export const getRiskColor = (level) => {
  switch (level) {
    case "CRITICAL":
      return { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400", badge: "bg-red-500 text-white" };
    case "HIGH":
      return { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400", badge: "bg-orange-500 text-white" };
    case "MODERATE":
      return { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-400", badge: "bg-amber-500 text-slate-950 font-bold" };
    case "LOW":
    default:
      return { bg: "bg-emerald-500/20", border: "border-emerald-500/50", text: "text-emerald-400", badge: "bg-emerald-500 text-white" };
  }
};

export const getPredictionExplanation = (category, riskLevel, nodes, apiData) => {
  const node1 = nodes?.find((n) => n.id === "node-1");
  const node2 = nodes?.find((n) => n.id === "node-2");

  const soil = node1?.sensors?.soilMoisture?.value || 78;
  const rain = node1?.sensors?.rainfall?.value || 42.6;
  const water = node2?.sensors?.waterLevel?.value || 1.8;
  const pm25 = node2?.sensors?.pm25?.value || 82;

  if (category === "Landslide") {
    return `Soil moisture at Node 1 is currently ${soil}% with a rainfall intensity of ${rain} mm/h. High pore water pressure combined with steep slope gradients in Zone A creates elevated risk of slumping.`;
  }
  if (category === "Flood") {
    return `River gauge at Node 2 registers water level at ${water} m. Upstream precipitation monitored via API feed indicates gradual accumulation near river embankments.`;
  }
  if (category === "AirQuality") {
    return `Node 2 particulate sensor reports PM2.5 at ${pm25} µg/m³. Low wind vector is inhibiting atmospheric dispersion across River Bank basin.`;
  }

  return `Combined ML inference: Node 1 soil moisture (${soil}%) and rainfall (${rain} mm/h) drive high slope failure risk, while Node 2 water level (${water}m) maintains moderate valley flood vigilance.`;
};
