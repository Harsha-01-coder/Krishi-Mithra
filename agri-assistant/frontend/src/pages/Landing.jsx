// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Krishi Mithra 🌾</h1>
      <p>Your smart agriculture companion.</p>
      <div style={{ marginTop: "20px" }}>
        <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
      </div>
    </div>
  );
}

export default Landing;
