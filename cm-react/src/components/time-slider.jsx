import React, { useState, useRef, useEffect, useCallback } from "react";
import { Slider, Box, Typography } from "@mui/material";

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
    if (!didInitRef.current && eventData.length) {
      didInitRef.current = true;
      // compute initial start
      const startPercent = ((oneYearAgo - minDate) / (maxDate - minDate)) * 100;
      const endPercent = 100;

      setTimeRange([startPercent, endPercent]);
      filterData(startPercent, endPercent);
    }
  }, [eventData, filterData, oneYearAgo, minDate, maxDate]);

  const handleChange = (event, newValue) => {
    setTimeRange(newValue);
    filterData(newValue[0], newValue[1]);
  };

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
      <Typography variant="caption">
        {`${startTime.toISOString().slice(0, 10)} → ${endTime
          .toISOString()
          .slice(0, 10)}`}
      </Typography>
    </Box>
  );
};

export default TimeSlider;
