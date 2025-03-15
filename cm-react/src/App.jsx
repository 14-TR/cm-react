import React, { useState, useEffect } from "react";
import DeckMap from "./components/deck-map";
import Header from "./components/header";
import ComponentDemo from "./components/component-demo";

function App() {
  const [showDemo, setShowDemo] = useState(false);

  // Cleanup function to remove any event listeners when switching views
  useEffect(() => {
    // When component unmounts or when showDemo changes, clean up any global event listeners
    return () => {
      // This will help prevent errors from event handlers trying to access unmounted components
      const cleanup = () => {
        // Remove any global event listeners that might be causing issues
        // This is a generic approach since we don't have direct access to scene.js
        if (window.controls && window.controls.domElement) {
          window.controls.domElement.onmousemove = null;
          window.controls.domElement.onmousedown = null;
          window.controls.domElement.onmouseup = null;
          window.controls.domElement.onwheel = null;
        }
      };
      
      cleanup();
    };
  }, [showDemo]);

  return (
    <>
      <Header />
      <main style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
        {showDemo ? (
          <ComponentDemo />
        ) : (
          <DeckMap />
        )}
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: 1000 
        }}>
          <button 
            onClick={() => setShowDemo(!showDemo)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#2c2c2c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            {showDemo ? 'Show Map' : 'Show Component Demo'}
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
