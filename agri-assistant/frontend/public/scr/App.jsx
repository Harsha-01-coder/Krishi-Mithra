import React from "react";
import Weather from "./components/Weather";
import SoilSensor from "./components/SoilSensor";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <div>
      <h1>Agri Assistant</h1>
      <Weather />
      <SoilSensor />
      <Chatbot />
    </div>
  );
}

export default App;
