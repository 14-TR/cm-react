import React, { useState } from "react";

const NlqSearchBar = ({ onQuerySubmit }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onQuerySubmit(query);
    setQuery(""); // clear input after submit if desired
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "10px", display: "flex" }}>
      <input
        type="text"
        placeholder="Ask about conflict events (e.g. 'Show me battles in Kyiv')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ flex: 1, padding: "8px", fontSize: "1rem" }}
      />
      <button type="submit" style={{ padding: "8px 15px", fontSize: "1rem", cursor: "pointer" }}>
        Search
      </button>
    </form>
  );
};

export default NlqSearchBar;
