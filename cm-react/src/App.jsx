import React from "react";
import DeckMap from "./components/deck-map";
import Header from "./components/header";
import SearchBar from "./components/search-bar"; // ✅ Ensure this import exists

function App() {
  return (
    <>
      <Header />
      <main style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
        <SearchBar onQuerySubmit={() => {}} /> {/* ✅ Now visible */}
        <DeckMap />
      </main>
    </>
  );
}

export default App;
