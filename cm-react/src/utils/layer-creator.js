import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { colorRange } from "./map-config";

export const createLayers = ({ 
  eventData, 
  radius, 
  upperPercentile, 
  lowerPercentile = 0,
  coverage,
  showBattlesLayer = true,
  showExplosionsLayer = false,
  showViirsLayer = false,
  onHover = () => {},
  onClick = () => {}
}) => {
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

  // Filter data by event type if needed
  const battleData = showBattlesLayer 
    ? filteredData.filter(d => d.event_type === 'Battle' || d.event_type === 'battle')
    : [];
  
  const explosionData = showExplosionsLayer 
    ? filteredData.filter(d => d.event_type === 'Explosion' || d.event_type === 'explosion')
    : [];
  
  const viirsData = showViirsLayer 
    ? filteredData.filter(d => d.event_type === 'VIIRS' || d.event_type === 'viirs')
    : [];

  // Create layers array
  const layers = [];

  // Add hexagon layer for aggregation
  layers.push(
    new HexagonLayer({
      id: "hexagon-layer",
      data: filteredData,
      getPosition: (d) => [d.longitude, d.latitude],
      radius,
      upperPercentile,
      lowerPercentile,
      coverage,
      colorRange,
      elevationRange: [0, 3000],
      elevationScale: filteredData.length > 0 ? 50 : 0,
      extruded: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 128],
      onHover,
      onClick,
      // Add tooltip info to the object
      getTooltip: (object) => {
        if (!object || !object.points) return null;
        return {
          html: `<div>
            <strong>Cluster</strong><br/>
            Events: ${object.points.length}<br/>
            Center: ${object.position[1].toFixed(4)}, ${object.position[0].toFixed(4)}
          </div>`,
          style: {
            backgroundColor: 'rgba(32, 32, 32, 0.9)',
            color: 'white',
            fontSize: '12px',
            padding: '8px',
            borderRadius: '4px',
          }
        };
      }
    })
  );

  // Add individual point layers for specific event types
  if (battleData.length > 0) {
    layers.push(
      new ScatterplotLayer({
        id: 'battle-layer',
        data: battleData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 3,
        radiusMaxPixels: 30,
        lineWidthMinPixels: 1,
        getPosition: d => [d.longitude, d.latitude],
        getRadius: d => Math.sqrt(d.fatalities || 1) * 5,
        getFillColor: [255, 0, 0],
        getLineColor: [0, 0, 0],
        onHover,
        onClick,
        visible: showBattlesLayer
      })
    );
  }

  if (explosionData.length > 0) {
    layers.push(
      new ScatterplotLayer({
        id: 'explosion-layer',
        data: explosionData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 3,
        radiusMaxPixels: 30,
        lineWidthMinPixels: 1,
        getPosition: d => [d.longitude, d.latitude],
        getRadius: d => Math.sqrt(d.fatalities || 1) * 5,
        getFillColor: [255, 165, 0],
        getLineColor: [0, 0, 0],
        onHover,
        onClick,
        visible: showExplosionsLayer
      })
    );
  }

  if (viirsData.length > 0) {
    layers.push(
      new ScatterplotLayer({
        id: 'viirs-layer',
        data: viirsData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 3,
        radiusMaxPixels: 30,
        lineWidthMinPixels: 1,
        getPosition: d => [d.longitude, d.latitude],
        getRadius: d => Math.sqrt(d.fatalities || 1) * 5,
        getFillColor: [0, 255, 0],
        getLineColor: [0, 0, 0],
        onHover,
        onClick,
        visible: showViirsLayer
      })
    );
  }

  return layers;
};
