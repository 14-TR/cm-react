// hooks/use-fetch-events.js
import { useState, useEffect } from "react";

const API_URL = "http://18.218.227.30:8000/battles";

export const useFetchEvents = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      console.log(`📡 Fetching data from: ${API_URL}`);
      setLoading(true);
      setError(null); // Reset error state before fetching

      try {
        console.log("Starting fetch request...");
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          mode: "cors" // Explicitly set CORS mode
        });

        console.log("Response received:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Data parsed successfully");

        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ Successfully fetched ${data.length} events.`);
          setEventData(data);
        } else {
          console.warn("⚠️ No event data received!");
          setEventData([]); // Ensure the state doesn't keep old data
        }
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        console.error("Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
        setEventData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { eventData, loading, error };
};
