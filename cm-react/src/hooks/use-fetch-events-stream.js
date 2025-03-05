import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000/battles/stream"; // ✅ Using the streaming API

export const useFetchEventsStream = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        console.log(`📡 Fetching streaming data from: ${API_URL}`);

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // ✅ Process only complete JSON objects from the stream
          const jsonObjects = buffer.split("\n").filter((line) => line.trim() !== "");
          for (let jsonObject of jsonObjects) {
            try {
              const newData = JSON.parse(jsonObject);
              setEventData((prevData) => [...prevData, ...newData]); // ✅ Append new data
            } catch (e) {
              console.error("🚨 JSON Parse Error:", e);
            }
          }

          buffer = "";
        }
      } catch (err) {
        console.error("❌ Error fetching streaming events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, []);

  return { eventData, loading, error };
};
