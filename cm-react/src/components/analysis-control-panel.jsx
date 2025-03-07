// AnalysisControlPanel.jsx
import React from "react";

const AnalysisControlPanel = ({
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
  showChart,
  setShowChart
}) => {
  const toggleBrushing = () => setBrushingEnabled(!brushingEnabled);
  const handleRadiusChange = (e) => setBrushingRadius(Number(e.target.value));
  const toggleChart = () => setShowChart(!showChart);

  const panelStyles = {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "200px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
  };

  return (
    <div style={panelStyles}>
      <h3>Analysis Controls</h3>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={brushingEnabled}
          onChange={toggleBrushing}
          id="brushing-chk"
        />
        <label htmlFor="brushing-chk" style={{ marginLeft: "4px" }}>
          Enable Brushing
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Brushing Radius: </label>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={brushingRadius}
          onChange={handleRadiusChange}
        />
        <span> {brushingRadius}</span>
      </div>

      <hr style={{ margin: "10px 0" }} />

      <div style={{ marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={showChart}
          onChange={toggleChart}
          id="chart-chk"
        />
        <label htmlFor="chart-chk" style={{ marginLeft: "4px" }}>
          Show Chart
        </label>
      </div>
    </div>
  );
};

export default AnalysisControlPanel;
