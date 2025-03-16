// use-fetch-events.js
import { useState, useEffect } from "react";

// Toggle this to switch between mock data and real data:
const USE_MOCK = false;

// If you want to fetch from an actual local file in public/ folder, you can use:
// const MOCK_API_URL = "/mockEvents.json";

// Or  import directly from a JS/JSON file in src/data
import mockEvents from "../data/mockEvents.json";

// API endpoint (when not using mocks):
const REAL_API_URL = "http://18.218.227.30:8000/battles";

export const useFetchEvents = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        let data;

        if (USE_MOCK) {
          console.log("🧪 Using mock data...");

          // Option A) Direct import if you have a local mock JSON:
          data = mockEvents;

          // Option B) Fetch from a static file in /public:
          // const response = await fetch(MOCK_API_URL);
          // if (!response.ok) {
          //   throw new Error(`Mock data file not found or error: ${response.status}`);
          // }
          // data = await response.json();
        } else {
          console.log(`📡 Fetching real data from: ${REAL_API_URL}`);
          const response = await fetch(REAL_API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
          }
          data = await response.json();
        }

        // Make sure it's an array
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
  }, []);

  return { eventData, loading, error };
};
