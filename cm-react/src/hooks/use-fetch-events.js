import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000/battles"; // ✅ Fetches ALL data in one go

export const useFetchEvents = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data once on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log(`📡 Fetching all data from: ${API_URL}`);

        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📡 API Response:", data);

        // If data is an array, set it in state
        if (Array.isArray(data) && data.length > 0) {
          setEventData(data);
        } else {
          console.warn("⚠️ No event data received!");
        }
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // Empty dependency array → runs once

  return { eventData, loading, error };
};
