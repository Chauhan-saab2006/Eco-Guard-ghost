import L from "leaflet";

export const createNodeIcon = (label, colorClass = "emerald", isSelected = false) => {
  const isNode1 = label.includes("Node 1");
  const isNode2 = label.includes("Node 2");
  const isApi = label.includes("API");

  let mainColor = "#10b981"; // Emerald
  let bgGradient = "linear-gradient(135deg, #10b981, #059669)";

  if (isNode2) {
    mainColor = "#06b6d4"; // Cyan
    bgGradient = "linear-gradient(135deg, #06b6d4, #0284c7)";
  } else if (isApi) {
    mainColor = "#a855f7"; // Purple
    bgGradient = "linear-gradient(135deg, #a855f7, #7c3aed)";
  }

  const borderStyle = isSelected ? "3px solid #ffffff" : "2px solid rgba(255, 255, 255, 0.7)";
  const scale = isSelected ? "transform: scale(1.15);" : "";

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; ${scale}">
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${bgGradient};
        border: ${borderStyle};
        box-shadow: 0 0 15px ${mainColor}80;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
      ">
        ${isNode1 ? "N1" : isNode2 ? "N2" : "API"}
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.9);
        color: #f8fafc;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
      ">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-leaflet-marker",
    iconSize: [40, 60],
    iconAnchor: [20, 20],
  });
};
