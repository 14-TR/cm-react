// hooks/use-fetch-events.js
import { useState, useEffect, useCallback } from "react";

// Calculate date range for last 5 years (increased from 2 years)
const getDateRange = () => {
  const today = new Date();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  
  // Format as YYYY-MM-DD
  const startDateStr = fiveYearsAgo.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];
  
  return { startDateStr, endDateStr };
};

const { startDateStr, endDateStr } = getDateRange();
console.log(`Fetching data from ${startDateStr} to ${endDateStr}`);

// Base API URL
const BASE_URL = "http://3.21.183.77:8000";
// Endpoints for different data types with date filtering
const ENDPOINTS = {
  battles: `${BASE_URL}/battles?start_date=${startDateStr}&end_date=${endDateStr}&limit=40000`,
  explosions: `${BASE_URL}/explosions?start_date=${startDateStr}&end_date=${endDateStr}&limit=40000`,
  viirs: `${BASE_URL}/viirs?start_date=${startDateStr}&end_date=${endDateStr}&limit=40000`
};

// For processing extremely large datasets
const BATCH_SIZE = 5000; // Increased batch size for better performance
const MAX_TOTAL_EVENTS = 150000; // Cap total events to prevent memory issues

export const useFetchEvents = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchEndpoint as a useCallback to prevent recreating on each render
  const fetchEndpoint = useCallback(async (url, eventType) => {
    console.log(`📡 Fetching from: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors"
      });
      
      console.log(`Response from ${url}:`, response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status} - ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log(`${url} response size: ${(text.length/1024).toFixed(2)}KB`);
      
      console.log(`Parsing JSON from ${url}...`);
      const startParse = performance.now();
      const data = JSON.parse(text);
      const endParse = performance.now();
      console.log(`JSON parsed in ${(endParse - startParse).toFixed(2)}ms`);
      
      if (!Array.isArray(data)) {
        console.warn(`${url} did not return an array!`);
        return [];
      }
      
      // Process data with sampling for very large datasets
      console.log(`Processing ${data.length} items from ${url} with type "${eventType}"...`);
      
      // Special handling for VIIRS data which might have a different structure
      if (eventType === 'viirs') {
        console.log("VIIRS data sample:", data.length > 0 ? data[0] : "Empty");
        return processViirsData(data, eventType);
      }
      
      // For other data types
      return processGenericData(data, eventType);
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  }, []);
  
  // Extract VIIRS data processing to a separate function
  const processViirsData = useCallback((data, eventType) => {
    const processedData = processInBatches(data, item => {
      // Convert acq_time from integer to string if needed
      let eventDate = item.event_date;
      if (!eventDate && item.acq_time) {
        // If acq_time is a number, format as string
        if (typeof item.acq_time === 'number') {
          // Convert to a time string - assumes acq_time is in HHMM format
          const hours = Math.floor(item.acq_time / 100);
          const minutes = item.acq_time % 100;
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          // Use current date from item or today
          const baseDate = item.event_date ? new Date(item.event_date) : new Date();
          eventDate = baseDate.toISOString().split('T')[0] + 'T' + timeStr;
        } else {
          eventDate = item.acq_time;
        }
      }
      
      // Use brightness temperature for sizing points
      const brightness = item.bright_ti4 || item.bright_ti5 || 300;
      
      return {
        ...item,
        event_type: eventType,
        // Make sure coordinates are numbers
        latitude: Number(item.latitude), 
        longitude: Number(item.longitude),
        // Use brightness for sizing points (scaled to be reasonable)
        fatalities: Math.max(1, Math.min(20, Math.round(brightness / 15))),
        // Ensure we have a date for filtering
        event_date: eventDate || new Date().toISOString().split('T')[0],
        // Add location field if missing (used in tooltips)
        location: item.location || `VIIRS ${item.satellite || ''} ${item.confidence || 'high'} confidence`,
        // Add notes
        notes: `Satellite: ${item.satellite || 'unknown'}, Brightness: ${brightness}, Confidence: ${item.confidence || 'unknown'}, Day/Night: ${item.daynight || 'unknown'}`
      };
    });
    
    return processedData;
  }, []);
  
  // Extract generic data processing to a separate function
  const processGenericData = useCallback((data, eventType) => {
    return processInBatches(data, item => ({
      ...item,
      event_type: eventType,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude)
    }));
  }, []);

  // For very large datasets, we process in batches to avoid stack overflow
  const processInBatches = useCallback((items, processFn) => {
    if (!items || items.length === 0) return [];
    
    // Sample large datasets to prevent memory issues
    const needsSampling = items.length > BATCH_SIZE * 2;
    const samplingRate = needsSampling ? BATCH_SIZE * 2 / items.length : 1;
    
    let itemsToProcess = items;
    if (needsSampling) {
      itemsToProcess = [];
      for (let i = 0; i < items.length; i++) {
        if (Math.random() < samplingRate) {
          itemsToProcess.push(items[i]);
        }
      }
      console.log(`Sampled ${items.length} items down to ${itemsToProcess.length} (${(samplingRate * 100).toFixed(1)}%)`);
    }
    
    const result = [];
    const totalItems = itemsToProcess.length;
    const batchCount = Math.ceil(totalItems / BATCH_SIZE);
    
    console.log(`Processing ${totalItems} items in ${batchCount} batches of size ${BATCH_SIZE}`);
    
    for (let i = 0; i < batchCount; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, totalItems);
      const batch = itemsToProcess.slice(start, end);
      
      console.log(`Processing batch ${i+1}/${batchCount} (${batch.length} items)`);
      const processedBatch = [];
      
      // Process each item individually to reduce memory pressure
      for (let j = 0; j < batch.length; j++) {
        processedBatch.push(processFn(batch[j]));
      }
      
      result.push(...processedBatch);
    }
    
    return result;
  }, []);

  useEffect(() => {
    // Immediately clear any previous data
    setEventData([]);
    setLoading(true);
    setError(null);
    
    const fetchAllEndpoints = async () => {
      try {
        console.log("📡 Fetching data from multiple endpoints...");
        console.log("Date range:", { startDate: startDateStr, endDate: endDateStr });
        
        // Fetch all data sources concurrently
        const results = await Promise.allSettled([
          fetchEndpoint(ENDPOINTS.battles, 'battle'),
          fetchEndpoint(ENDPOINTS.explosions, 'explosion'),
          fetchEndpoint(ENDPOINTS.viirs, 'viirs')
        ]);
        
        // Process results
        let allData = [];
        let errors = [];
        
        results.forEach((result, index) => {
          const endpointName = Object.keys(ENDPOINTS)[index];
          if (result.status === 'fulfilled') {
            console.log(`✅ Endpoint ${endpointName} returned ${result.value.length} items`);
            
            // Check if we need to sample to prevent memory issues
            let dataToAdd = result.value;
            if (allData.length + dataToAdd.length > MAX_TOTAL_EVENTS) {
              const remainingSpace = Math.max(0, MAX_TOTAL_EVENTS - allData.length);
              if (remainingSpace > 0) {
                // Sample data to fit remaining space
                const sampleRate = remainingSpace / dataToAdd.length;
                const sampledData = [];
                for (let i = 0; i < dataToAdd.length; i++) {
                  if (Math.random() < sampleRate) {
                    sampledData.push(dataToAdd[i]);
                  }
                }
                dataToAdd = sampledData;
                console.log(`⚠️ Sampled ${endpointName} down to ${dataToAdd.length} events to stay under memory limit`);
              } else {
                console.warn(`❗ Skipping ${endpointName} data - would exceed memory limit`);
                dataToAdd = [];
              }
            }
            
            allData.push(...dataToAdd);
          } else {
            console.error(`❌ Endpoint ${endpointName} failed:`, result.reason);
            errors.push(`${endpointName}: ${result.reason.message}`);
          }
        });
        
        console.log(`✅ Total combined data: ${allData.length} events`);
        
        if (allData.length > 0) {
          setEventData(allData);
        } else {
          console.warn("⚠️ No data received from any endpoint!");
          setEventData([]);
        }
        
        if (errors.length > 0) {
          setError(`Some endpoints failed: ${errors.join(', ')}`);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(err.message);
        setEventData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllEndpoints();
  }, [fetchEndpoint, processInBatches]);

  return { eventData, loading, error };
};
