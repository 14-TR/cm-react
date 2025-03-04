import React from "react";
import MapView from "./components/map-view";
import Header from "./components/header";

function App() {
  return (
    <>
      <Header />
      <div style={{ height: "100vh", width: "100vw" }}>
        <MapView />
      </div>
    </>
  );
}

export default App;
