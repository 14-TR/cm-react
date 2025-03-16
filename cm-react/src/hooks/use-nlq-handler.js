import { useState } from "react";

// Adjust to match your EC2 FastAPI server
const NLQ_API_URL = "http://18.218.227.30:8000/nlq";

export const useNlqHandler = () => {
  const [nlqResults, setNlqResults] = useState([]);
  const [nlqLoading, setNlqLoading] = useState(false);
  const [nlqError, setNlqError] = useState(null);

  const fetchNlqResults = async (userQuery) => {
    // reset error/loading for new query
    setNlqError(null);
    setNlqLoading(true);

    try {
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

      // data should be an array of objects from the DB
      setNlqResults(data);
    } catch (err) {
      console.error("❌ Error processing NLQ query:", err);
      setNlqError(err.message);
    } finally {
      setNlqLoading(false);
    }
  };

  return { nlqResults, fetchNlqResults, nlqLoading, nlqError };
};
