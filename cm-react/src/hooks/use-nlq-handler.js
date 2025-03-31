import { useState } from "react";

// Adjust to match your EC2 FastAPI server
const NLQ_API_URL = "http://3.21.183.77:8000/nlq";

export const useNlqHandler = () => {
  const [nlqResults, setNlqResults] = useState([]);
  const [nlqLoading, setNlqLoading] = useState(false);
  const [nlqError, setNlqError] = useState(null);

  const fetchNlqResults = async (userQuery) => {
    // reset error/loading for new query
    setNlqError(null);
    setNlqLoading(true);

    try {
      console.log(`Processing NLQ query: "${userQuery}"`);
      
      // POST to /nlq with the user's query
      const response = await fetch(NLQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📡 NLQ Response (parsed data):", data);

      // Check if data is empty
      if (!data || data.length === 0) {
        console.log("No results returned from NLQ query");
        setNlqResults([]);
        setNlqError("No results found for this query");
        return;
      }
      
      // Check if data contains location information (spatial query)
      // Look for standard location fields in the first item
      const firstItem = data[0];
      const hasSpatialData = firstItem && 
                            (firstItem.latitude !== undefined || 
                             firstItem.longitude !== undefined ||
                             firstItem.lat !== undefined ||
                             firstItem.lon !== undefined ||
                             firstItem.geo_lat !== undefined ||
                             firstItem.geo_lon !== undefined);
      
      if (hasSpatialData) {
        // Process data to ensure it has event_type and standardize location fields
        const processedData = data.map(item => {
          // First, standardize location fields
          const latitude = item.latitude || item.lat || item.geo_lat || null;
          const longitude = item.longitude || item.lon || item.geo_lon || null;
          
          // Then, ensure every item has an event_type
          const eventType = item.event_type || 
                            (item.type ? item.type.toLowerCase() : 
                            (item.disorder_type ? item.disorder_type.toLowerCase() : "nlq_result"));
          
          return {
            ...item,
            latitude,
            longitude,
            event_type: eventType,
            // Add additional fields for NLQ results to help with tooltips/display
            source: item.source || "NLQ query",
            nlq_query: userQuery
          };
        });
        
        // Final check for valid coordinates in the processed data
        const validSpatialData = processedData.filter(
          item => item.latitude && item.longitude && 
                 !isNaN(Number(item.latitude)) && 
                 !isNaN(Number(item.longitude))
        );
        
        if (validSpatialData.length === 0) {
          console.warn("NLQ returned data has location fields but no valid coordinates");
          setNlqError("Query returned data but without valid coordinates");
          setNlqResults([]);
          return;
        }
        
        console.log(`Processed ${validSpatialData.length} spatial results with event types`);
        setNlqResults(validSpatialData);
      } else {
        // This is an aggregated/statistical result, not map data
        console.log(`Received ${data.length} aggregated/statistical results`);
        setNlqResults(data);
      }
    } catch (err) {
      console.error("❌ Error processing NLQ query:", err);
      setNlqError(err.message);
      setNlqResults([]); // Clear results on error
    } finally {
      setNlqLoading(false);
    }
  };

  return { nlqResults, setNlqResults, fetchNlqResults, nlqLoading, nlqError };
};
