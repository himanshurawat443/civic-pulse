import React, { useState } from "react";
import { CivicIssue } from "../types";
import { MapPin, AlertCircle, Eye, Info, CheckCircle2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommunityMapProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  onSelectCoordinates?: (coords: { lat: number; lng: number; address: string; neighborhood: string }) => void;
}

const mapBounds = {
  minLat: 12.9550,
  maxLat: 12.9850,
  minLng: 77.6200,
  maxLng: 77.6600
};

export default function CommunityMap({
  issues,
  selectedIssueId,
  onSelectIssue,
  onSelectCoordinates
}: CommunityMapProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [mapClickCoords, setMapClickCoords] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);

  // Convert GPS coordinate to local SVG layout coordinate (800x450 box)
  const getCoords = (lat: number, lng: number) => {
    // Clamp coordinates within bounds for stable visuals
    const clampedLat = Math.max(mapBounds.minLat, Math.min(mapBounds.maxLat, lat));
    const clampedLng = Math.max(mapBounds.minLng, Math.min(mapBounds.maxLng, lng));

    const x = ((clampedLng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 800;
    const y = (1 - (clampedLat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 450;
    return { x, y };
  };

  // Convert click in SVG space back to GPS coordinates
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 450;

    const lng = mapBounds.minLng + (x / 800) * (mapBounds.maxLng - mapBounds.minLng);
    const lat = mapBounds.minLat + (1 - y / 450) * (mapBounds.maxLat - mapBounds.minLat);

    // Identify neighborhood based on coordinates roughly
    let neighborhood = "100 Feet Road, Indiranagar";
    let address = `Shop No. ${Math.floor(10 + Math.random() * 150)}, 100 Feet Road, Indiranagar, Bengaluru`;

    if (lat > 12.9750 && lng < 77.6350) {
      neighborhood = "Defence Colony, Indiranagar";
      address = `House No. ${Math.floor(100 + Math.random() * 500)}, 4th Cross Road, Defence Colony, Bengaluru`;
    } else if (lat > 12.9700 && lng > 77.6450) {
      neighborhood = "Eshwara Layout, Indiranagar";
      address = `Plot No. ${Math.floor(10 + Math.random() * 90)}, 12th A Main Road, Eshwara Layout, Bengaluru`;
    } else if (lat < 12.9620) {
      neighborhood = "Domlur Layout";
      address = `Plot No. ${Math.floor(10 + Math.random() * 100)}, Domlur Stage II, near Inner Ring Road Flyover, Bengaluru`;
    }

    setMapClickCoords({ x, y, lat, lng });

    if (onSelectCoordinates) {
      onSelectCoordinates({
        lat,
        lng,
        address,
        neighborhood
      });
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Critical": return "bg-red-600 text-white shadow-red-500/50";
      case "High": return "bg-amber-500 text-white shadow-amber-500/50";
      case "Medium": return "bg-yellow-400 text-slate-900 shadow-yellow-400/50";
      default: return "bg-emerald-500 text-white shadow-emerald-500/50";
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filterCategory === "All") return true;
    return issue.category === filterCategory;
  });

  return (
    <div id="civic-community-map-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-indigo-600 animate-pulse" />
            Namma Bengaluru Civic Map
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Click on reported beacons to inspect issues, or click anywhere to drop a pin to report a new local problem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Water Leakage">Water Leakages</option>
            <option value="Streetlight">Streetlights</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Public Infrastructure">Infrastructure</option>
            <option value="Other">Other</option>
          </select>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              showHeatmap
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {showHeatmap ? "Hide Heatmap" : "Show Category Heatmap"}
          </button>
        </div>
      </div>

      {/* Vector Interactive SVG Map Area */}
      <div className="relative border border-slate-100 rounded-xl bg-slate-50 overflow-hidden shadow-inner h-[400px] md:h-[450px]">
        {/* Background Visual Grid & Neighborhood Labels */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
          <div className="flex justify-between items-start opacity-30 text-[10px] font-mono tracking-widest text-slate-600">
            <span>DEFENCE COLONY (RESIDENTIAL)</span>
            <span>ESHWARA LAYOUT</span>
          </div>
          <div className="text-center opacity-30 text-[11px] font-mono tracking-widest text-slate-600 font-bold">
            100 FEET ROAD COMMERCIAL CORRIDOR
          </div>
          <div className="flex justify-between items-end opacity-30 text-[10px] font-mono tracking-widest text-slate-600">
            <span>DOMLUR LAYOUT BLOCK</span>
            <span>INNER RING ROAD BYPASS</span>
          </div>
        </div>

        <svg
          viewBox="0 0 800 450"
          className="w-full h-full cursor-crosshair select-none"
          onClick={handleMapClick}
        >
          {/* Fictional Topography Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Neighborhood Shading/Zones */}
          {/* Defence Colony */}
          <path d="M0,0 L350,0 L300,180 L0,230 Z" fill="#eff6ff" opacity="0.4" />
          {/* Eshwara Layout */}
          <path d="M350,0 L800,0 L800,200 L450,220 Z" fill="#f0fdf4" opacity="0.4" />
          {/* Domlur Layout */}
          <path d="M0,320 L800,340 L800,450 L0,450 Z" fill="#f0f9ff" opacity="0.5" />

          {/* Rajakaluve / Stormwater Canal vector */}
          <path
            d="M 0,380 Q 200,390 400,400 T 800,410 L 800,450 L 0,450 Z"
            fill="#e0f2fe"
            opacity="0.8"
            stroke="#bae6fd"
            strokeWidth="3"
          />

          {/* Major Street Lines */}
          {/* 100 Feet Road (Diagonal) */}
          <path d="M 100,0 L 400,450" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" opacity="0.8" />
          <path d="M 100,0 L 400,450" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" strokeLinecap="round" />

          {/* 12th A Main Road (Horizontal Central) */}
          <path d="M 0,220 L 800,220" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" opacity="0.8" />
          <path d="M 0,220 L 800,220" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />

          {/* Double Road (Vertical East) */}
          <path d="M 550,0 L 550,340" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
          <path d="M 550,0 L 550,340" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />

          {/* Heatmap Overlays (Splatters) if selected */}
          {showHeatmap && filteredIssues.map((issue) => {
            const { x, y } = getCoords(issue.location.lat, issue.location.lng);
            return (
              <circle
                key={`heat-${issue.id}`}
                cx={x}
                cy={y}
                r="45"
                fill={
                  issue.category === "Pothole" ? "#f59e0b" :
                  issue.category === "Water Leakage" ? "#3b82f6" :
                  issue.category === "Streetlight" ? "#facc15" :
                  issue.category === "Waste Management" ? "#ef4444" : "#10b981"
                }
                opacity="0.12"
                className="transition-all duration-500 animate-pulse"
              />
            );
          })}

          {/* Render Active Issue Beacons */}
          {filteredIssues.map((issue) => {
            const { x, y } = getCoords(issue.location.lat, issue.location.lng);
            const isSelected = selectedIssueId === issue.id;

            return (
              <g
                key={issue.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIssue(issue);
                }}
              >
                {/* Ping animation effect */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "18" : "12"}
                  fill="none"
                  stroke={
                    issue.severity === "Critical" ? "#dc2626" :
                    issue.severity === "High" ? "#f59e0b" :
                    issue.severity === "Medium" ? "#eab308" : "#10b981"
                  }
                  strokeWidth="2"
                  opacity="0.4"
                  className="animate-ping"
                />

                {/* Main pin marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "9" : "6.5"}
                  fill={
                    issue.severity === "Critical" ? "#dc2626" :
                    issue.severity === "High" ? "#f59e0b" :
                    issue.severity === "Medium" ? "#facc15" : "#10b981"
                  }
                  stroke="#ffffff"
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  className="transition-all duration-300 group-hover:scale-125 shadow-md"
                />

                {/* Tooltip Hover Overlay */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect
                    x={x - 80}
                    y={y - 50}
                    width="160"
                    height="38"
                    rx="6"
                    fill="#1e293b"
                    opacity="0.95"
                  />
                  <text
                    x={x}
                    y={y - 36}
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {issue.title.length > 25 ? `${issue.title.slice(0, 23)}...` : issue.title}
                  </text>
                  <text
                    x={x}
                    y={y - 22}
                    fill="#94a3b8"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {issue.category} • {issue.severity} Severity
                  </text>
                </g>
              </g>
            );
          })}

          {/* User Custom Placed Pin */}
          {mapClickCoords && (
            <g>
              <g className="animate-bounce">
                {/* Custom Marker Pin Shape */}
                <path
                  d={`M ${mapClickCoords.x} ${mapClickCoords.y} m -12 -30 q 0 -12 12 -12 q 12 0 12 12 q 0 9 -12 24 q -12 -15 -12 -24 z`}
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle cx={mapClickCoords.x} cy={mapClickCoords.y - 30} r="4" fill="#ffffff" />
              </g>
              <ellipse
                cx={mapClickCoords.x}
                cy={mapClickCoords.y}
                rx="8"
                ry="3"
                fill="#334155"
                opacity="0.3"
              />
            </g>
          )}
        </svg>

        {/* Map Information Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-lg p-2.5 shadow-sm text-[10px] space-y-1 text-slate-600">
          <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1">BEACON SEVERITY</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Critical Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Low Priority</span>
          </div>
        </div>

        {/* Quick Instructions Overlay on Placement */}
        {mapClickCoords && (
          <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs shadow-md animate-fade-in flex items-center gap-2">
            <MapPin className="h-4 w-4 animate-bounce" />
            <span>Pin dropped! Filled details in the submission form below.</span>
            <button
              onClick={() => setMapClickCoords(null)}
              className="hover:text-slate-200 ml-1 font-bold font-mono"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
