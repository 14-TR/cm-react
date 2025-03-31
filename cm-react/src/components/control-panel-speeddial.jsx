// ControlPanelSpeedDial.js
import React, { useState, lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

// MUI icons
import LayersIcon from "@mui/icons-material/Layers";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ElipsesIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CalculateIcon from "@mui/icons-material/Calculate";

// Lazy load sub-panels
const SearchAggregationPanel = lazy(() => import("./search-aggregation-panel"));
const LayerControlPanel = lazy(() => import("./layer-control-panel"));
const AnalysisControlPanel = lazy(() => import("./analysis-control-panel"));
const CentralTendencyPanel = lazy(() => import("./central-tendency-panel"));
const InfoPage = lazy(() => import("./info-page"));

const headerHeight = 64;

// The "actions" array for speed-dial
const actions = [
  { icon: <SearchIcon />, name: "Search & Aggregation", action: "toggleSearchAgg" },
  { icon: <LayersIcon />, name: "Layer Controls", action: "toggleLayerMenu" },
  { icon: <InsertChartIcon />, name: "Analysis Controls", action: "toggleAnalysisMenu" },
  { icon: <CalculateIcon />, name: "Central Tendency", action: "toggleCentralTendency" },
  { icon: <ElipsesIcon />, name: "Info Page", action: "toggleInfoPage" }
];

export default function ControlPanelSpeedDial({
  // For Search & Aggregation
  onQuerySubmit,
  onReset,
  statsData,
  nlqLoading,
  nlqError,

  // For layer controls
  radius,
  setRadius,
  coverage,
  setCoverage,

  // Toggling different layers
  showBattlesLayer,
  setShowBattlesLayer,
  showExplosionsLayer,
  setShowExplosionsLayer,
  showViirsLayer,
  setShowViirsLayer,

  // Analysis
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
  showChart,
  setShowChart,

  // Data
  displayData,
  dataSource = 'time-slider', // Default value
  
  // Layer information for other components
  layerInfo = {}
}) {
  const [activePanel, setActivePanel] = useState(null);

  // Toggle sub-panel
  const handleSpeedDialAction = (action) => {
    setActivePanel((prev) => (prev === action ? null : action));
  };

  return (
    <Box sx={{ position: "absolute", top: headerHeight, left: 16 }}>
      {/* The SpeedDial "FAB" */}
      <SpeedDial
        ariaLabel="Control Panel Actions"
        sx={{ position: "absolute", top: 0, left: 0 }}
        icon={<SpeedDialIcon />}
        direction="right"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleSpeedDialAction(action.action)}
          />
        ))}
      </SpeedDial>

      {/* ---------- Sub-Panel: Search & Aggregation ---------- */}
      <Box
        sx={{
          position: "absolute",
          top: 80,
          left: 80,
          zIndex: activePanel === "toggleSearchAgg" ? 1000 : "auto",
          display: activePanel === "toggleSearchAgg" ? "block" : "none",
        }}
      >
        <SearchAggregationPanel
          onQuerySubmit={onQuerySubmit}
          onReset={onReset}
          statsData={statsData}
          dataSource={dataSource}
          nlqLoading={nlqLoading}
          nlqError={nlqError}
        />
      </Box>

      {/* ---------- Sub-Panel: Layer Controls ---------- */}
      <Box
        sx={{
          position: "absolute",
          top: 80,
          left: 80,
          zIndex: activePanel === "toggleLayerMenu" ? 1000 : "auto",
          display: activePanel === "toggleLayerMenu" ? "block" : "none",
        }}
      >
        <LayerControlPanel
          radius={radius}
          setRadius={setRadius}
          coverage={coverage}
          setCoverage={setCoverage}
          showBattlesLayer={showBattlesLayer}
          setShowBattlesLayer={setShowBattlesLayer}
          showExplosionsLayer={showExplosionsLayer}
          setShowExplosionsLayer={setShowExplosionsLayer}
          showViirsLayer={showViirsLayer}
          setShowViirsLayer={setShowViirsLayer}
          dataSource={dataSource}
        />
      </Box>

      {/* ---------- Sub-Panel: Analysis Controls ---------- */}
      <Box
        sx={{
          position: "absolute",
          top: 80,
          left: 80,
          zIndex: activePanel === "toggleAnalysisMenu" ? 1000 : "auto",
          display: activePanel === "toggleAnalysisMenu" ? "block" : "none",
        }}
      >
        <AnalysisControlPanel
          brushingEnabled={brushingEnabled}
          setBrushingEnabled={setBrushingEnabled}
          brushingRadius={brushingRadius}
          setBrushingRadius={setBrushingRadius}
          displayData={displayData}
          showChart={showChart}
          setShowChart={setShowChart}
          dataSource={dataSource}
          layerInfo={layerInfo}
        />
      </Box>

      {/* ---------- Sub-Panel: Central Tendency ---------- */}
      <Box
        sx={{
          position: "absolute",
          top: 80,
          left: 80,
          zIndex: activePanel === "toggleCentralTendency" ? 1000 : "auto",
          display: activePanel === "toggleCentralTendency" ? "block" : "none",
        }}
      >
        <CentralTendencyPanel 
          displayData={displayData} 
          dataSource={dataSource}
        />
      </Box>

      {/* ---------- Sub-Panel: Info Page ---------- */}
      <Box
        sx={{
          position: "absolute",
          top: 80,
          left: 80,
          zIndex: activePanel === "toggleInfoPage" ? 1000 : "auto",
          display: activePanel === "toggleInfoPage" ? "block" : "none",
        }}
      >
        <InfoPage />
      </Box>
    </Box>
  );
}
