import React from "react";
import DeckMap from "./components/deck-map";
import Header from "./components/header";

function App() {
  return (
    <>
      <Header />
      <main style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
        <DeckMap />
      </main>
    </>
  );
}

export default App;
