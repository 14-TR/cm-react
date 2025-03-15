import React, { useState, useEffect, useRef, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { lightingEffect, INITIAL_VIEW_STATE, MAP_STYLE } from "../utils/map-config";
import { BrushingExtension } from '@deck.gl/extensions';

// Hooks
import { useFetchEvents } from "../hooks/use-fetch-events";
import { useNlqHandler } from "../hooks/use-nlq-handler";

// Components
import ControlPanelSpeedDial from "./control-panel-speeddial";
import TimeSlider from "./time-slider";
import MapTooltip from "./map-tooltip";

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
  
  // 6) Brushed data
  const [brushedData, setBrushedData] = useState([]);
  
  // 7) Active data - the data that should be used by all components
  const [activeData, setActiveData] = useState([]);

  // 8) deck.gl ref
  const deckRef = useRef(null);

  // 9) Tooltip state
  const [hoverInfo, setHoverInfo] = useState(null);
  const [clickInfo, setClickInfo] = useState(null);
  
  // 10) Mouse position for brushing
  const [mousePosition, setMousePosition] = useState(null);
  
  // 11) Data source tracking
  const [dataSource, setDataSource] = useState('time-slider');

  // Cleanup function to handle unmounting
  useEffect(() => {
    return () => {
      // Clean up any global objects or event listeners when component unmounts
      if (window.controls) {
        if (window.controls.domElement) {
          window.controls.domElement.onmousemove = null;
          window.controls.domElement.onmousedown = null;
          window.controls.domElement.onmouseup = null;
          window.controls.domElement.onwheel = null;
        }
        window.controls = null;
      }
      
      // Clean up any scene-related objects
      if (window.scene) {
        window.scene = null;
      }
    };
  }, []);

  // Update active data whenever the data source changes
  useEffect(() => {
    if (dataSource === 'nlq' && nlqResults.length > 0) {
      // NLQ results take precedence
      setActiveData(nlqResults);
    } else if (dataSource === 'brushing' && brushedData.length > 0) {
      // Brushing data is second priority
      setActiveData(brushedData);
    } else {
      // Time slider data is the default
      setActiveData(displayData);
    }
  }, [dataSource, displayData, brushedData, nlqResults]);

  // If we have NLQ data, override the time-filtered data
  useEffect(() => {
    if (!nlqResults.length) {
      // No NLQ results, revert to previous data source
      if (dataSource === 'nlq') {
        setDataSource(brushingEnabled && brushedData.length > 0 ? 'brushing' : 'time-slider');
      }
      return;
    }
    
    // If the result has lat/lon, it's geospatial
    const firstRow = nlqResults[0];
    if ("latitude" in firstRow && "longitude" in firstRow) {
      setDataSource('nlq');
      setStatsData([]);
    } else {
      // Aggregated / no lat/long
      setStatsData(nlqResults);
      // Keep using the current spatial data for the map
    }
  }, [nlqResults, brushingEnabled, brushedData]);

  // Reset function
  const handleReset = () => {
    // On reset, go back to the data the slider is currently controlling
    setDataSource('time-slider');
    setStatsData([]);
    // If you'd like to fully re-init the slider on reset,
    // you can add an additional "key" or prop to the slider
    // or call a function from TimeSlider
  };

  // Handle hover events
  const onHover = useCallback((info) => {
    setHoverInfo(info.picked ? info : null);
  }, []);

  // Handle click events
  const onClick = useCallback((info) => {
    if (info.picked) {
      setClickInfo(info);
    } else {
      setClickInfo(null);
    }
  }, []);
  
  // Handle mouse move for brushing
  const onMouseMove = useCallback((event) => {
    if (brushingEnabled && event.coordinate) {
      setMousePosition(event.coordinate);
    }
  }, [brushingEnabled]);
  
  // Update brushed data when mouse position or brushing settings change
  useEffect(() => {
    if (brushingEnabled && mousePosition && displayData.length > 0) {
      // Filter data points within the brushing radius
      const [mouseX, mouseY] = mousePosition;
      const filtered = displayData.filter(point => {
        const dx = (point.longitude - mouseX) * 111000; // rough conversion to meters
        const dy = (point.latitude - mouseY) * 111000;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= brushingRadius;
      });
      
      setBrushedData(filtered);
      
      // Only set brushing as data source if NLQ isn't active
      if (dataSource !== 'nlq') {
        setDataSource('brushing');
      }
    } else {
      setBrushedData([]);
      
      // If brushing was the data source, revert to time slider
      if (dataSource === 'brushing') {
        setDataSource('time-slider');
      }
    }
  }, [brushingEnabled, mousePosition, brushingRadius, displayData, dataSource]);

  // Create brushing extension
  const brushingExtension = new BrushingExtension();

  // Build deck.gl layers
  const layers = createLayers({
    eventData: activeData,
    radius,
    coverage,
    upperPercentile,
    lowerPercentile,
    showBattlesLayer,
    showExplosionsLayer,
    showViirsLayer,
    onHover,
    onClick
  });
  
  // Apply brushing to layers if enabled
  if (brushingEnabled && mousePosition) {
    layers.forEach(layer => {
      if (layer.id.includes('layer')) {
        layer.props.brushingRadius = brushingRadius;
        layer.props.brushingEnabled = true;
        layer.props.extensions = [brushingExtension];
        layer.props.brushingTarget = 'source';
      }
    });
  }

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
        displayData={activeData}
        dataSource={dataSource}
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
      
      {/* Show brushing indicator if enabled */}
      {brushingEnabled && mousePosition && (
        <div style={{
          ...infoStyles,
          top: 120,
          backgroundColor: 'rgba(0,100,255,0.7)'
        }}>
          Brushing: {brushedData.length} events selected
        </div>
      )}
      
      {/* Show data source indicator */}
      <div style={{
        ...infoStyles,
        top: 160,
        backgroundColor: 'rgba(0,0,0,0.6)'
      }}>
        Data Source: {dataSource === 'nlq' ? 'Search Query' : dataSource === 'brushing' ? 'Brushing' : 'Time Filter'}
      </div>

      {/* Render the hover tooltip */}
      {hoverInfo && !clickInfo && <MapTooltip info={hoverInfo} />}

      {/* Render the click tooltip (takes precedence over hover) */}
      {clickInfo && <MapTooltip info={clickInfo} />}

      <DeckGL
        ref={deckRef}
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller
        getTooltip={({object}) => object && `${object.points ? object.points.length : 0} events`}
        onClick={(info) => {
          // Clear the tooltip if clicking on empty space
          if (!info.picked) {
            setClickInfo(null);
          } else {
            onClick(info);
          }
        }}
        onHover={onHover}
        onMouseMove={onMouseMove}
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
