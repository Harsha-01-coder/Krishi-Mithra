import React from "react";
// 1. NO Navbar or Footer imports
import Chatbot from "../components/Chatbot";
import SoilSensor from "../components/SoilSensor";

function Home() {
  return (
    // 2. NO "page-container" or "content-wrap" divs.
    //    Just a simple div or React Fragment.
    <div>
      {/* The Chatbot is position:fixed, so it's fine here */}
      <Chatbot />

      {/* 3. All your page content goes directly inside */}
      <div id="soil" style={{ minHeight: "300px", padding: "20px" }}>
        <SoilSensor />
      </div>
      {/* ...other sections... */}

      {/* 4. NO Footer component here */}
    </div>
  );
}

export default Home;
