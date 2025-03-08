import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Rnd } from "react-rnd";

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

  let chartData = [];
  if (displayData && displayData.length > 0) {
    const dateCounts = {};
    displayData.forEach((item) => {
      if (item.event_date) {
        const dateStr = item.event_date.slice(0, 10);
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    chartData = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
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

      {showChart && chartData.length > 0 && (
        
        <Rnd
          disableDragging={true}
          enableResizing={{
            top: true, right: true, bottom: true, left: true,
            topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
          }}
          default={{
            width: 400,
            height: 300,
          }}
          style={{
            position: "absolute",
            bottom: "5vh",
            right: "5vw",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            padding: "10px",
            zIndex: 1000,
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
        </Rnd>

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
