import React, { useRef, useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { lightingEffect, INITIAL_VIEW_STATE, MAP_STYLE } from "../utils/map-config";
import { useFetchEventsStream } from "../hooks/use-fetch-events-stream"; // ✅ Fixed import
import { useNlqHandler } from "../hooks/use-nlq-handler";
import SearchBar from "./search-bar";
import { createLayers } from "../utils/layer-creator";

const DeckMap = ({ radius = 1000, upperPercentile = 100, coverage = 1 }) => {
  const { eventData, loading, error } = useFetchEventsStream(); // ✅ Streaming Hook
  const { nlqResults, fetchNlqResults, nlqLoading, nlqError } = useNlqHandler(); // NLQ API results
  const [displayData, setDisplayData] = useState([]);
  const deckRef = useRef(null);

  useEffect(() => {
    console.log("🔥 Streaming Event Data:", eventData);
    console.log("🔍 NLQ Results:", nlqResults);

    if (nlqResults.length > 0) {
      setDisplayData(nlqResults);
    } else if (eventData.length > 0) {
      setDisplayData(eventData);
    }
  }, [eventData, nlqResults]);

  // ✅ Prevent rendering before data is available
  const layers = displayData.length > 0 ? createLayers({ eventData: displayData, radius, upperPercentile, coverage }) : [];

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <SearchBar onQuerySubmit={fetchNlqResults} />
      {loading && <div>Loading streaming data...</div>}
      {error && <div>Error loading streaming data: {error}</div>}
      {nlqLoading && <div>Processing query...</div>}
      {nlqError && <div>Error processing query: {nlqError}</div>}

      <DeckGL
        ref={deckRef}
        layers={layers} // ✅ Now only rendering when data is ready
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
