import React, { useState, useRef, useEffect, useCallback } from "react";
import { Slider, Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

/**
 * TimeSlider uses the entire dataset (eventData).
 * - Initially sets displayData to last year from the most recent event.
 * - Whenever user moves the slider, sets displayData accordingly.
 */
const TimeSlider = ({ eventData, setFilteredData }) => {
  // Ref to ensure initial load logic runs once
  const didInitRef = useRef(false);

  // Local slider range 0..100
  const [timeRange, setTimeRange] = useState([0, 100]);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(50); // milliseconds per frame
  const animationRef = useRef(null);
  
  // Store animation settings for reuse
  const animationSettingsRef = useRef({
    initialStart: 0,
    initialEnd: 100,
    windowSize: 100,
    currentPosition: 0
  });

  // In a real scenario, minDate may be dynamic from your dataset's earliest date
  const minDate = new Date("2018-01-01");
  const maxDate = eventData.length
    ? new Date(
        Math.max(
          ...eventData.map(d => new Date(d.event_date).getTime())
        )
      )
    : new Date();

  // Computed "last year" from maxDate
  const oneYearAgo = new Date(maxDate);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Convert [startPercent, endPercent] to actual Date
  const filterData = useCallback((startPercent, endPercent) => {
    const startTime = new Date(
      minDate.getTime() + (startPercent / 100) * (maxDate - minDate)
    );
    const endTime = new Date(
      minDate.getTime() + (endPercent / 100) * (maxDate - minDate)
    );
    // Filter
    const filtered = eventData.filter(({ event_date }) => {
      const dt = new Date(event_date);
      return dt >= startTime && dt <= endTime;
    });
    setFilteredData(filtered);
  }, [eventData, minDate, maxDate, setFilteredData]);

  // On mount & if data loaded, do initial load once
  useEffect(() => {
    if (!didInitRef.current && eventData.length > 0) {
      didInitRef.current = true;
      // compute initial start
      const startPercent = ((oneYearAgo - minDate) / (maxDate - minDate)) * 100;
      const endPercent = 100;

      setTimeRange([startPercent, endPercent]);
      
      // Schedule the state update for the next tick to avoid updating during render
      setTimeout(() => {
        filterData(startPercent, endPercent);
      }, 0);
    }
  }, [eventData, filterData, oneYearAgo, minDate, maxDate]);

  const handleChange = (event, newValue) => {
    setTimeRange(newValue);
    filterData(newValue[0], newValue[1]);
  };

  // Animation functions
  const startAnimation = () => {
    if (animationRef.current) return;
    
    setIsAnimating(true);
    
    // Store the initial start position and window size
    const initialStart = timeRange[0];
    const initialEnd = timeRange[1];
    const windowSize = initialEnd - initialStart;
    
    // Save animation settings
    animationSettingsRef.current = {
      initialStart,
      initialEnd,
      windowSize,
      currentPosition: initialStart
    };
    
    const animate = () => {
      // Get current position from ref
      let { currentPosition, windowSize } = animationSettingsRef.current;
      
      // Increment the position
      currentPosition += 0.5;
      
      // If we've reached the end, loop back to beginning
      if (currentPosition >= 100) {
        currentPosition = 0; // Reset to beginning
      }
      
      // Calculate new end position, maintaining window size
      const newEnd = Math.min(100, currentPosition + windowSize);
      
      // Update the slider position
      setTimeRange([currentPosition, newEnd]);
      
      // Update the filtered data
      filterData(currentPosition, newEnd);
      
      // Save current position back to ref
      animationSettingsRef.current.currentPosition = currentPosition;
      
      // Schedule next frame
      animationRef.current = setTimeout(animate, animationSpeed);
    };
    
    // Start animation
    animationRef.current = setTimeout(animate, animationSpeed);
  };
  
  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };
  
  const resetAnimation = () => {
    stopAnimation();
    
    // Reset to initial position (start of the current window)
    const initialStart = Math.max(0, timeRange[0] - 10);
    const windowSize = timeRange[1] - timeRange[0];
    const newEnd = Math.min(100, initialStart + windowSize);
    
    setTimeRange([initialStart, newEnd]);
    filterData(initialStart, newEnd);
  };
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const [startPercent, endPercent] = timeRange;
  const startTime = new Date(
    minDate.getTime() + (startPercent / 100) * (maxDate - minDate)
  );
  const endTime = new Date(
    minDate.getTime() + (endPercent / 100) * (maxDate - minDate)
  );

  return (
    <Box
      sx={{
        width: 360,
        p: 2,
        backgroundColor: "#2c2c2c",
        borderRadius: 2,
        color: "#f5f5f5",
      }}
    >
      <Typography gutterBottom>Time Filter</Typography>
      <Slider
        value={timeRange}
        onChange={handleChange}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        sx={{ color: "#8884d8" }}
      />
      <Typography variant="caption" display="block">
        {`${startTime.toISOString().slice(0, 10)} → ${endTime
          .toISOString()
          .slice(0, 10)}`}
      </Typography>
      
      {/* Animation Controls */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption">Animation:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Reset">
            <IconButton 
              size="small" 
              onClick={resetAnimation}
              sx={{ color: '#f5f5f5' }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {isAnimating ? (
            <Tooltip title="Pause">
              <IconButton 
                size="small" 
                onClick={stopAnimation}
                sx={{ color: '#f5f5f5' }}
              >
                <PauseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Play">
              <IconButton 
                size="small" 
                onClick={startAnimation}
                sx={{ color: '#f5f5f5' }}
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Typography variant="caption" sx={{ ml: 1, minWidth: '80px' }}>
            {isAnimating ? startTime.toISOString().slice(0, 10) : ""}
          </Typography>
        </Box>
      </Box>
      
      {/* Animation Speed Control */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ mr: 1 }}>Speed:</Typography>
        <Slider
          size="small"
          value={100 - animationSpeed}
          onChange={(_, value) => setAnimationSpeed(100 - value)}
          min={0}
          max={95}
          sx={{ color: "#8884d8" }}
        />
      </Box>
    </Box>
  );
};

export default TimeSlider;
