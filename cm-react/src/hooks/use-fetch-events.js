// hooks/use-fetch-events.js
import { useState, useEffect } from "react";
import Dexie from "dexie";

const API_URL = "http://127.0.0.1:8000/battles";
const DB_NAME = "EventsDatabase";
const STORE_NAME = "events";
const CACHE_TIMESTAMP_KEY = "dexieCacheTimestamp";
const CACHE_VALIDITY_HOURS = 6;
const PAGE_SIZE = 5000;


const db = new Dexie(DB_NAME);

db.version(1).stores({
  [STORE_NAME]: "event_id_cnty",
});

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_VALIDITY_HOURS * 60 * 60 * 1000;
};

export const useFetchEvents = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndCacheData = async () => {
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedTimestamp && isCacheValid(Number(cachedTimestamp))) {
        console.log("📦 Loading from IndexedDB cache...");
        const cachedEvents = await db[STORE_NAME].toArray();
        if (cachedEvents.length > 0) {
          setEventData(cachedEvents);
          setLoading(false);
          return;
        }
      }

      console.log("🌐 Fetching fresh data...");
      setLoading(true);

      try {
        let allData = [];
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(`${API_URL}?page=${page}&page_size=${PAGE_SIZE}`);
          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

          const dataChunk = await response.json();

          if (dataChunk.length === 0 || dataChunk.length < PAGE_SIZE) {
            hasMoreData = false;
          } else {
            page += 1;
          }

          allData = [...allData, ...dataChunk];
          setEventData([...allData]);
        }

        // Cache data into IndexedDB
        await db[STORE_NAME].clear();
        await db[STORE_NAME].bulkPut(allData);
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

        console.log("✅ Data cached successfully into IndexedDB!");

      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCacheData();
  }, []);

  return { eventData, loading, error };
};