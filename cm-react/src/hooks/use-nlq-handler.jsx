import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/nlq"; // FastAPI NLQ endpoint

export const useNlqHandler = () => {
  const [nlqResults, setNlqResults] = useState([]);
  const [nlqLoading, setNlqLoading] = useState(false);
  const [nlqError, setNlqError] = useState(null);

  const fetchNlqResults = async (query) => {
    setNlqLoading(true);
    setNlqError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();
      setNlqResults(data);
    } catch (err) {
      setNlqError(err.message);
    } finally {
      setNlqLoading(false);
    }
  };

  return { nlqResults, fetchNlqResults, nlqLoading, nlqError };
};
