import React from "react";

export const SensorGauge = ({
  title,
  value,
  unit,
  min = 0,
  max = 100,
  warningThreshold,
  criticalThreshold,
  safeRange,
  status = "normal", // normal | warning | critical
}) => {
  const numericVal = Number(value) || 0;
  const rangeMin = Array.isArray(safeRange) ? safeRange[0] : min;
  const rangeMax = Array.isArray(safeRange) ? safeRange[1] : max;
  const effectiveMin = Math.min(rangeMin, rangeMax);
  const effectiveMax = Math.max(rangeMin, rangeMax);
  const rangeSpan = Math.max(effectiveMax - effectiveMin, 1);
  const percentage = Math.min(100, Math.max(0, ((numericVal - effectiveMin) / rangeSpan) * 100));

  // Arc math: 0 to 180 degrees arc length = Math.PI * radius = Math.PI * 36 = ~113.1
  const radius = 36;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const lowerBoundary = Array.isArray(safeRange) ? safeRange[0] : min;
  const upperBoundary = Array.isArray(safeRange) ? safeRange[1] : max;
  const warningLimit = typeof warningThreshold === "number" ? warningThreshold : upperBoundary;
  const criticalLimit = typeof criticalThreshold === "number" ? criticalThreshold : upperBoundary;

  let strokeColor = "#10b981";

  if (status === "warning" || numericVal >= warningLimit || numericVal <= lowerBoundary) {
    strokeColor = "#f59e0b";
  }
  if (status === "critical" || numericVal > criticalLimit || numericVal < lowerBoundary * 0.85) {
    strokeColor = "#ef4444";
  }

  if (Array.isArray(safeRange)) {
    const isInsideSafeRange = numericVal >= lowerBoundary && numericVal <= upperBoundary;
    if (isInsideSafeRange) {
      strokeColor = "#10b981";
    } else if (numericVal > upperBoundary) {
      strokeColor = numericVal >= criticalLimit || numericVal >= upperBoundary * 1.15 ? "#ef4444" : "#f59e0b";
    } else if (numericVal < lowerBoundary) {
      strokeColor = numericVal <= lowerBoundary * 0.85 ? "#ef4444" : "#f59e0b";
    }
  }

  return (
    <div className="flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-md min-w-0 w-full overflow-hidden transition-all hover:border-slate-700">
      <div className="relative w-full max-w-[90px] aspect-[100/62] flex flex-col items-center justify-end mx-auto">
        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke="#1e293b"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0px 0px 4px ${strokeColor}88)`,
            }}
          />
        </svg>

        {/* Center Text Overlay */}
        <div className="absolute bottom-0 flex flex-col items-center justify-center leading-none text-center">
          <span className="text-sm sm:text-base font-black text-white tracking-tight">
            {numericVal}
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            {unit}
          </span>
        </div>
      </div>

      <span className="text-[11px] font-semibold text-slate-300 mt-2 text-center truncate w-full px-1">
        {title}
      </span>
    </div>
  );
};
