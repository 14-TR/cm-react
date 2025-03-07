// analysis-control-panel.jsx
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const AnalysisControlPanel = ({
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
  showChart,
  setShowChart,
  displayData
}) => {
  const toggleBrushing = () => setBrushingEnabled(!brushingEnabled);
  const handleRadiusChange = (e) => setBrushingRadius(Number(e.target.value));
  const toggleChart = () => setShowChart(!showChart);

  // 1) Group events by date
  let chartData = [];
  if (displayData && displayData.length > 0) {
    // Filter only items that have an event_date
    const dateCounts = {};

    displayData.forEach((item) => {
      // Expecting something like item.event_date = "2025-03-01" or "2025-03-01T12:00:00Z"
      if (item.event_date) {
        // Extract just the YYYY-MM-DD (or handle times if you want finer granularity)
        // For simplicity, let's just slice the date:
        const dateStr = item.event_date.slice(0, 10); // "YYYY-MM-DD"
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    // Convert dateCounts object into an array sorted by date
    chartData = Object.entries(dateCounts)
      .map(([date, count]) => ({
        date,
        count
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  const panelStyles = {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "250px",
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
          Show Time Series Chart
        </label>
      </div>

      {/* Render the chart if toggled on and we have data */}
      {showChart && chartData.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            background: "#fff",
            padding: "8px",
            color: "#000",
            width: "100%",
            height: "300px"
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {showChart && chartData.length === 0 && (
        <p style={{ marginTop: "12px", color: "#ff8787" }}>
          No valid date data found (check event_date fields).
        </p>
      )}
    </div>
  );
};

export default AnalysisControlPanel;
