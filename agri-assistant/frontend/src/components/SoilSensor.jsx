import React, { useState } from "react";
import axios from "axios";
import "./SoilSensor.css"; // <-- 1. This imports your CSS file

// Icon for the title
const LeafIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="leaf-icon" // <-- 2. Uses the CSS class
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function SoilSensor() {
  const [city, setCity] = useState("");
  const [moisture, setMoisture] = useState("");
  const [ph, setPh] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitSoil = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const phValue = parseFloat(ph);
      const moistureValue = parseFloat(moisture);
      if (isNaN(phValue) || isNaN(moistureValue)) {
        throw new Error("Please enter valid numbers for moisture and pH.");
      }
      const res = await axios.post("http://127.0.0.1:5000/soil", {
        city,
        moisture: moistureValue,
        pH: phValue,
      });
      setData(res.data);
    } catch (err) {
      setError(err.message || "Error submitting soil data. Please try again.");
      console.error("Soil submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 3. All Tailwind classes are replaced with your CSS classes
    <div className="soil-sensor-card">
      <div className="card-header">
        <LeafIcon />
        <h2 className="card-title">Soil Analysis</h2>
        <p className="card-subtitle">
          Enter your soil data for crop recommendations.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            id="city"
            placeholder="e.g. Nagpur"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="moisture" className="form-label">
            Moisture (%)
          </label>
          <input
            type="number"
            id="moisture"
            placeholder="e.g. 60"
            value={moisture}
            onChange={(e) => setMoisture(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ph" className="form-label">
            Soil pH
          </label>
          <input
            type="number"
            id="ph"
            step="0.1"
            placeholder="e.g. 6.5"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <button
        onClick={submitSoil}
        disabled={isLoading}
        className="submit-button"
      >
        {isLoading ? "Analyzing..." : "Get Recommendations"}
      </button>

      <div className="results-container">
        {error && (
          <div className="error-box">
            <p className="error-title">Oops! Something went wrong.</p>
            <p className="error-message">{error}</p>
          </div>
        )}
        {data && (
          <div className="results-box">
            <h3 className="results-title">Recommended Crops:</h3>
            <p className="results-text">
              {data.recommended_crops.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SoilSensor;

