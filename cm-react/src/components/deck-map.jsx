import React, { useRef, useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { lightingEffect, INITIAL_VIEW_STATE, MAP_STYLE } from "../utils/map-config";

// Data & NLQ hooks
import { useFetchEvents } from "../hooks/use-fetch-events";
import { useNlqHandler } from "../hooks/use-nlq-handler";

// The Speed Dial that toggles all sub-panels
import ControlPanelSpeedDial from "./control-panel-speeddial";

// Helper for building DeckGL layers
import { createLayers } from "../utils/layer-creator";

const DeckMap = () => {
  // 1. Layer control states
  const [radius, setRadius] = useState(1000);
  const [coverage, setCoverage] = useState(1.0);
  const [upperPercentile, setUpperPercentile] = useState(100);
  const [lowerPercentile, setLowerPercentile] = useState(0);

  // 2. Toggling different layers (optional)
  const [showBattlesLayer, setShowBattlesLayer] = useState(true);
  const [showExplosionsLayer, setShowExplosionsLayer] = useState(false);
  const [showViirsLayer, setShowViirsLayer] = useState(false);

  // 3. Analysis toggles
  const [brushingEnabled, setBrushingEnabled] = useState(false);
  const [brushingRadius, setBrushingRadius] = useState(2000);
  const [showChart, setShowChart] = useState(false);

  // 4. Data fetching & NLQ logic
  const { eventData, loading, error } = useFetchEvents();
  const { nlqResults, fetchNlqResults, nlqLoading, nlqError } = useNlqHandler();

  // 5. Display data for the map + aggregated stats
  const [displayData, setDisplayData] = useState([]);
  const [statsData, setStatsData] = useState([]);

  // Reference to Deck instance, if needed
  const deckRef = useRef(null);

  // Load event data once
  useEffect(() => {
    if (eventData.length && !displayData.length) {
      setDisplayData(eventData);
    }
  }, [eventData, displayData]);

  // Decide how to handle newly fetched NLQ data
  useEffect(() => {
    if (nlqResults.length > 0) {
      const firstRow = nlqResults[0];
      if ("latitude" in firstRow && "longitude" in firstRow) {
        // It's geospatial
        setDisplayData(nlqResults);
        setStatsData([]);
      } else {
        // Aggregated or non-geo
        setDisplayData([]);
        setStatsData(nlqResults);
      }
    } else {
      // No NLQ results, fallback to event data
      setDisplayData(eventData);
      setStatsData([]);
    }
  }, [eventData, nlqResults]);

  // Reset function
  const handleReset = () => {
    setDisplayData(eventData);
    setStatsData([]);
  };

  // Build deck.gl layers
  const layers =
    displayData.length > 0
      ? createLayers({
          eventData: displayData,
          radius,
          coverage,
          upperPercentile
          // Possibly incorporate showBattlesLayer, showExplosionsLayer, etc.
        })
      : [];

  // Show loading/error if needed
  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error loading data: {error}</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* 
        The Speed Dial with multiple sub-panels:
        - Search & Aggregation
        - Layer Controls
        - Analysis
        - Info 
      */}
      <ControlPanelSpeedDial
        // For SearchAggregationPanel
        onQuerySubmit={fetchNlqResults}
        onReset={handleReset}
        statsData={statsData}

        // For LayerControlPanel
        radius={radius}
        setRadius={setRadius}
        coverage={coverage}
        setCoverage={setCoverage}
        upperPercentile={upperPercentile}
        setUpperPercentile={setUpperPercentile}
        lowerPercentile={lowerPercentile}
        setLowerPercentile={setLowerPercentile}
        showBattlesLayer={showBattlesLayer}
        setShowBattlesLayer={setShowBattlesLayer}
        showExplosionsLayer={showExplosionsLayer}
        setShowExplosionsLayer={setShowExplosionsLayer}
        showViirsLayer={showViirsLayer}
        setShowViirsLayer={setShowViirsLayer}

        // For AnalysisControlPanel
        brushingEnabled={brushingEnabled}
        setBrushingEnabled={setBrushingEnabled}
        brushingRadius={brushingRadius}
        setBrushingRadius={setBrushingRadius}
        showChart={showChart}
        setShowChart={setShowChart}
        

        // For CentralTendencyPanel
        displayData={displayData}
      />

      {/* If the NLQ is processing, show "Processing query..." */}
      {nlqLoading && (
        <div style={infoStyles}>Processing query...</div>
      )}
      {/* If there's an NLQ error, show it */}
      {nlqError && (
        <div style={{ ...infoStyles, color: "red" }}>{nlqError}</div>
      )}

      {/* The main Deck.gl map */}
      <DeckGL
        ref={deckRef}
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        <Map reuseMaps mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
};

/* ---------- Inline Styles ---------- */
const infoStyles = {
  position: "absolute",
  top: "80px",
  left: "20px",
  color: "#fff",
  background: "rgba(0,0,0,0.6)",
  padding: "4px 8px",
  borderRadius: "4px",
  zIndex: 999,
};

export default DeckMap;
