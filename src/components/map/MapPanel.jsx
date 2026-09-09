import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { useApp } from "../../context/AppContext";
import { createNodeIcon } from "../../utils/leafletIcons";
import { MapLegend } from "./MapLegend";
import {
  Layers,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Radio,
  CloudSun,
  ShieldAlert,
  Battery,
  Wifi,
} from "lucide-react";

// Map Re-centering & Resize Controller
const MapController = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.flyTo([target.lat, target.lng], target.zoom || 14, {
        duration: 1.5,
      });
    }
  }, [target, map]);
  return null;
};

export const MapPanel = ({ onSelectNode, onSelectHazard }) => {
  const { nodes, apiData, hazards, selectedNodeId, mapTarget, setSelectedNodeId, setSelectedHazardId } = useApp();

  const [mapTile, setMapTile] = useState("dark"); // dark | satellite | street
  const [isFullscreen, setIsFullscreen] = useState(false);

  const defaultCenter = [25.268, 91.738];
  const defaultZoom = 13;

  const tileUrls = {
    dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  const tileAttributions = {
    dark: "&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
    satellite: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    street: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  const node1 = nodes.find((n) => n.id === "node-1") || nodes[0];
  const node2 = nodes.find((n) => n.id === "node-2") || nodes[1];

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 h-[calc(100vh-2rem)]" : "h-full min-h-[520px] lg:min-h-[640px]"
      }`}
    >
      {/* Map Header Controls Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
        {/* Tile Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMapTile("dark")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mapTile === "dark" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setMapTile("satellite")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mapTile === "satellite" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapTile("street")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mapTile === "street" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Leaflet React Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer key={mapTile} url={tileUrls[mapTile]} attribution={tileAttributions[mapTile]} />
        {mapTile === "dark" && (
          <TileLayer key="dark-reference" url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
        )}
        <MapController target={mapTarget} />

        {/* Hazard Zone Polygons */}
        {hazards.map((hz) => (
          <Polygon
            key={hz.id}
            positions={hz.coordinates}
            pathOptions={{
              color: hz.color,
              fillColor: hz.color,
              fillOpacity: 0.25,
              weight: 2,
              dashArray: "4, 6",
            }}
            eventHandlers={{
              click: () => {
                setSelectedHazardId(hz.id);
                if (onSelectHazard) onSelectHazard(hz);
              },
            }}
          >
            <Popup>
              <div className="p-2 space-y-1.5 text-xs text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                  <span className="font-bold text-white flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    {hz.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                    {hz.riskLevel}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{hz.description}</p>
                <p className="text-[10px] text-slate-400">Vulnerability: {hz.vulnerabilityScore}</p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Node 1 Marker */}
        {node1 && (
          <Marker
            position={[node1.lat, node1.lng]}
            icon={createNodeIcon("Node 1 — Hill Sector", "emerald", selectedNodeId === "node-1")}
            eventHandlers={{
              click: () => {
                setSelectedNodeId("node-1");
                if (onSelectNode) onSelectNode("node-1");
              },
            }}
          >
            <Popup>
              <div className="p-2.5 space-y-2 text-xs text-slate-100 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Node 1 — Hill Sector
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <div>Comm: <span className="font-semibold text-teal-400">LoRa</span></div>
                  <div>Battery: <span className="font-semibold text-white">{node1.battery}%</span></div>
                  <div>Temp: <span className="font-semibold text-white">{node1.sensors.temperature.value} °C</span></div>
                  <div>Humidity: <span className="font-semibold text-white">{node1.sensors.humidity.value} %</span></div>
                  <div>Soil Moist: <span className="font-semibold text-amber-400">{node1.sensors.soilMoisture.value} %</span></div>
                  <div>Rainfall: <span className="font-semibold text-red-400">{node1.sensors.rainfall.value} mm/h</span></div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                  <span>Updated: {node1.lastUpdate}</span>
                  <span className="text-emerald-400 font-semibold cursor-pointer" onClick={() => onSelectNode("node-1")}>
                    View Card ↓
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Node 2 Marker */}
        {node2 && (
          <Marker
            position={[node2.lat, node2.lng]}
            icon={createNodeIcon("Node 2 — River Bank", "cyan", selectedNodeId === "node-2")}
            eventHandlers={{
              click: () => {
                setSelectedNodeId("node-2");
                if (onSelectNode) onSelectNode("node-2");
              },
            }}
          >
            <Popup>
              <div className="p-2.5 space-y-2 text-xs text-slate-100 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Node 2 — River Bank
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <div>Comm: <span className="font-semibold text-cyan-400">GSM</span></div>
                  <div>Battery: <span className="font-semibold text-white">{node2.battery}%</span></div>
                  <div>Temp: <span className="font-semibold text-white">{node2.sensors.temperature.value} °C</span></div>
                  <div>PM2.5: <span className="font-semibold text-amber-400">{node2.sensors.pm25.value} µg/m³</span></div>
                  <div>Water Level: <span className="font-semibold text-amber-400">{node2.sensors.waterLevel.value} m</span></div>
                  <div>Humidity: <span className="font-semibold text-white">{node2.sensors.humidity.value} %</span></div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                  <span>Updated: {node2.lastUpdate}</span>
                  <span className="text-cyan-400 font-semibold cursor-pointer" onClick={() => onSelectNode("node-2")}>
                    View Card ↓
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Overall Area API Marker */}
        {apiData && (
          <Marker
            position={[apiData.lat, apiData.lng]}
            icon={createNodeIcon("Overall API Area", "purple", false)}
          >
            <Popup>
              <div className="p-2.5 space-y-2 text-xs text-slate-100 min-w-[210px]">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-purple-400" />
                    Overall Area — API Data
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                    API Connected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <div>Temp: <span className="font-semibold text-white">{apiData.sensors.temperature.value} °C</span></div>
                  <div>AQI: <span className="font-semibold text-amber-400">{apiData.sensors.aqi.value}</span></div>
                  <div>PM2.5: <span className="font-semibold text-white">{apiData.sensors.pm25.value} µg/m³</span></div>
                  <div>Rainfall: <span className="font-semibold text-white">{apiData.sensors.rainfall.value} mm/h</span></div>
                  <div>Wind: <span className="font-semibold text-white">{apiData.sensors.windSpeed.value} km/h</span></div>
                  <div>Pressure: <span className="font-semibold text-white">{apiData.sensors.pressure.value} hPa</span></div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Overlay Legend */}
      <MapLegend />
    </div>
  );
};
