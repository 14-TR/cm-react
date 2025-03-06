import React, { useRef, useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { lightingEffect, INITIAL_VIEW_STATE, MAP_STYLE } from "../utils/map-config";

// Single-fetch hook for your main data
import { useFetchEvents } from "../hooks/use-fetch-events";
// Hook for handling Natural Language Query
import { useNlqHandler } from "../hooks/use-nlq-handler";

// NLQ input bar
import SearchBar from "./nlq-search-bar";

// Build layers for the map
import { createLayers } from "../utils/layer-creator";

const DeckMap = ({ radius = 1000, upperPercentile = 100, coverage = 1 }) => {
  // 1. Single fetch of all event data
  const { eventData, loading, error } = useFetchEvents();

  // 2. NLQ hook with { nlqResults, fetchNlqResults, nlqLoading, nlqError }
  const { nlqResults, fetchNlqResults, nlqLoading, nlqError } = useNlqHandler();

  // 3. We'll display either default data or NLQ data
  const [displayData, setDisplayData] = useState([]);
  // 4. If the NLQ is just stats, store them here
  const [statsData, setStatsData] = useState([]);

  const deckRef = useRef(null);

  useEffect(() => {
    console.log("🔥 Default Event Data:", eventData);
    console.log("🔍 NLQ Results:", nlqResults);

    if (nlqResults.length > 0) {
      // Check if the first item has lat/lon
      const firstRow = nlqResults[0];
      const hasLatLon = "latitude" in firstRow && "longitude" in firstRow;

      if (hasLatLon) {
        // The NLQ returned geospatial rows → map them
        setDisplayData(nlqResults);
        setStatsData([]); // clear stats
      } else {
        // The NLQ likely returned aggregated or non-geo data
        setDisplayData([]);
        setStatsData(nlqResults); // store stats or aggregated results
      }
    } else {
      // No NLQ results, so show default data
      setDisplayData(eventData);
      setStatsData([]);
    }
  }, [eventData, nlqResults]);

  // Build layers from whatever is in displayData
  const layers =
    displayData.length > 0
      ? createLayers({ eventData: displayData, radius, upperPercentile, coverage })
      : [];

  if (loading) {
    return <div>Loading data...</div>;
  }
  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* NLQ Search Bar with absolute position */}
      <div
        style={{
          position: "absolute",
          top: "50px",
          left: "10px",
          zIndex: 999,
          background: "#ffffff",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        <SearchBar onQuerySubmit={fetchNlqResults} />
      </div>

      {/* Show loading / error for NLQ if needed */}
      {nlqLoading && <div style={{ position: "absolute", top: 120, left: 20 }}>Processing query...</div>}
      {nlqError && <div style={{ position: "absolute", top: 140, left: 20, color: "red" }}>{nlqError}</div>}

      {/* If the data is purely stats, show them in a side panel */}
      {statsData.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "150px",
            left: "20px",
            zIndex: 999,
            width: "300px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            overflow: "auto",
            maxHeight: "50vh",
          }}
        >
          <h4>NLQ Aggregated Results</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(statsData, null, 2)}
          </pre>
        </div>
      )}

      {/* Deck.gl Map */}
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

export default DeckMap;
