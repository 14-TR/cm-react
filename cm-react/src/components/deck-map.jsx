import React, { useState, useEffect, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { lightingEffect, INITIAL_VIEW_STATE, MAP_STYLE } from "../utils/map-config";

// Hooks
import { useFetchEvents } from "../hooks/use-fetch-events";
import { useNlqHandler } from "../hooks/use-nlq-handler";

// Components
import ControlPanelSpeedDial from "./control-panel-speeddial";
import TimeSlider from "./time-slider";

// Helpers
import { createLayers } from "../utils/layer-creator";

const DeckMap = () => {
  // 1) Layer controls
  const [radius, setRadius] = useState(1000);
  const [coverage, setCoverage] = useState(1.0);
  const [upperPercentile, setUpperPercentile] = useState(100);
  const [lowerPercentile, setLowerPercentile] = useState(0);

  // 2) Toggles
  const [showBattlesLayer, setShowBattlesLayer] = useState(true);
  const [showExplosionsLayer, setShowExplosionsLayer] = useState(false);
  const [showViirsLayer, setShowViirsLayer] = useState(false);

  // 3) Analysis toggles
  const [brushingEnabled, setBrushingEnabled] = useState(false);
  const [brushingRadius, setBrushingRadius] = useState(2000);
  const [showChart, setShowChart] = useState(false);

  // 4) Data fetching & NLQ
  const { eventData, loading, error } = useFetchEvents();
  const { nlqResults, fetchNlqResults, nlqLoading, nlqError } = useNlqHandler();

  // 5) The data the map will display
  const [displayData, setDisplayData] = useState([]);
  const [statsData, setStatsData] = useState([]);

  // 6) deck.gl ref
  const deckRef = useRef(null);

  // If we have NLQ data, override the time-filtered data
  useEffect(() => {
    if (!nlqResults.length) {
      // No NLQ results, use whatever the slider gave us
      return;
    }
    // If the result has lat/lon, it's geospatial
    const firstRow = nlqResults[0];
    if ("latitude" in firstRow && "longitude" in firstRow) {
      setDisplayData(nlqResults);
      setStatsData([]);
    } else {
      // Aggregated / no lat/long
      setDisplayData([]);
      setStatsData(nlqResults);
    }
  }, [nlqResults]);

  // Reset function
  const handleReset = () => {
    // On reset, go back to the data the slider is currently controlling
    // In practice, the TimeSlider is always controlling displayData
    setStatsData([]);
    // If you'd like to fully re-init the slider on reset,
    // you can add an additional "key" or prop to the slider
    // or call a function from TimeSlider
  };

  // Build deck.gl layers
  const layers = createLayers({
    eventData: displayData,
    radius,
    coverage,
    upperPercentile,
  });

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* SpeedDial for all other controls */}
      <ControlPanelSpeedDial
        onQuerySubmit={fetchNlqResults}
        onReset={handleReset}
        statsData={statsData}
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
        brushingEnabled={brushingEnabled}
        setBrushingEnabled={setBrushingEnabled}
        brushingRadius={brushingRadius}
        setBrushingRadius={setBrushingRadius}
        showChart={showChart}
        setShowChart={setShowChart}
        displayData={displayData}
      />

      {/* Time Slider is the ONLY driver of initial load & date filtering */}
      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 1000 }}>
        <TimeSlider 
          eventData={eventData}     // Full dataset
          setFilteredData={setDisplayData} // The slider calls this for both initial load & subsequent changes
        />
      </div>

      {/* If the NLQ is processing, show a status */}
      {nlqLoading && (
        <div style={infoStyles}>Processing query...</div>
      )}
      {nlqError && (
        <div style={{ ...infoStyles, color: "red" }}>
          {nlqError}
        </div>
      )}

      <DeckGL
        ref={deckRef}
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller
      >
        <Map reuseMaps mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
};

const infoStyles = {
  position: "absolute",
  top: 80,
  left: 20,
  color: "#fff",
  background: "rgba(0,0,0,0.6)",
  padding: "4px 8px",
  borderRadius: 4,
  zIndex: 999,
};

export default DeckMap;
