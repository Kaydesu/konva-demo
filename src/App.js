import React, { useState, useEffect } from 'react';
import "./index.scss";
import { KonvaController } from './TextService/KonvaController';

const controller = new KonvaController();

function App() {
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    controller.initialize();
  }, []);

  const handleToolClick = () => {
    setEnable(!enable);
    controller.setEnableTool(!enable);
  }

  return (
    <div className="app">
      <div className="tool-select">
        <button
          style={{
            backgroundColor: enable ? "green" : "red",
            color: "#fff",
          }}
          onClick={handleToolClick}>
          Text box tool
        </button>
      </div>
      <div 
        id="konva-container"
        className={`${enable ? "konva-container tool-enabled" : "konva-container"}`}></div>
    </div>
  );
}

export default App;
