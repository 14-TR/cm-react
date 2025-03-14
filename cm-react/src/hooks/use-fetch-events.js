// hooks/use-fetch-events.js
import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000/battles";

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
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ Successfully fetched ${data.length} events.`);
          setEventData(data);
        } else {
          console.warn("⚠️ No event data received!");
          setEventData([]); // Ensure the state doesn't keep old data
        }
      } catch (err) {
        console.error("❌ Error fetching events:", err);
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
