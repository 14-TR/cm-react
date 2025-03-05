import React, { useState } from "react";

const SearchBar = ({ onQuerySubmit }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) {
      onQuerySubmit(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      background: "#ffffff",
      borderBottom: "1px solid #ddd",
      position: "absolute",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10,
      width: "80%",
      maxWidth: "500px",
      borderRadius: "5px",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about conflict events..."
        style={{
          flex: 1,
          padding: "8px",
          fontSize: "1rem",
          border: "none",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "8px 15px",
          fontSize: "1rem",
          cursor: "pointer",
          background: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "3px",
        }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
