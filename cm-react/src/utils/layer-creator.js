import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { colorRange } from "./map-config";

export const createLayers = ({ eventData, radius, upperPercentile, coverage }) => {
  if (!eventData || eventData.length === 0) {
    console.warn("⚠️ No event data available for layers."); // ✅ Keep only for debugging
    return [];
  }

  // ✅ Ensure only valid lat/lon data is used
  const filteredData = eventData.filter(d => d.latitude !== null && d.longitude !== null);
  
  if (filteredData.length === 0) {
    console.error("❌ No valid lat/lon data found!");
    return [];
  }

  console.log("🗺️ Creating Layers with Data:", filteredData);

  return [
    new HexagonLayer({
      id: "hexagon-layer",
      data: filteredData,
      getPosition: (d) => [d.longitude, d.latitude],
      radius,
      upperPercentile,
      coverage,
      colorRange,
      elevationRange: [0, 3000],
      elevationScale: filteredData.length > 0 ? 50 : 0,
      extruded: true,
      pickable: true,
    })
  ];
};
