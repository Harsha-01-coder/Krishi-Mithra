import React, { useState } from "react";
import axios from "axios";
// 1. Import the new CSS file
import './Weather.css'; 

// --- START: Inline SVG Weather Icons ---
/**
 * A component that renders an SVG icon based on the weather condition.
 * @param {{condition: string}} props
 */
const WeatherIcon = ({ condition }) => {
  // Common properties for all icons
  const iconProps = {
    viewBox: "0 0 32 32",
    width: 120,
    height: 120,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    // 2. The 'className' prop is removed from here
  };

  // Icon definitions
  const icons = {
    clear: (
      <svg {...iconProps}>
        <circle cx="16" cy="16" r="6" />
        <line x1="16" y1="2" x2="16" y2="4" />
        <line x1="16" y1="28" x2="16" y2="30" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="26.36" y1="26.36" x2="27.78" y2="27.78" />
        <line x1="2" y1="16" x2="4" y2="16" />
        <line x1="28" y1="16" x2="30" y2="16" />
        <line x1="4.22" y1="27.78" x2="5.64" y2="26.36" />
        <line x1="26.36" y1="5.64" x2="27.78" y2="4.22" />
      </svg>
    ),
    clouds: (
      <svg {...iconProps}>
        <path d="M20 16h-1.26A8 8 0 1 0 11 24h9a5 5 0 0 0 0-10z" />
        <path d="M20 16a5 5 0 0 0-5-5h-1.26A8 8 0 1 0 11 24h9a5 5 0 0 0 5-5 5 5 0 0 0-5-3z" />
      </svg>
    ),
    rain: (
      <svg {...iconProps}>
        <path d="M22 16a6 6 0 0 0-12 0 7 7 0 0 0-7 7h26a7 7 0 0 0-7-7z" />
        <line x1="16" y1="23" x2="16" y2="27" />
        <line x1="12" y1="23" x2="12" y2="27" />
        <line x1="20" y1="23" x2="20" y2="27" />
      </svg>
    ),
    thunderstorm: (
      <svg {...iconProps}>
        <path d="M21 16.9A5 5 0 0 0 17 15h-3.26a8 8 0 1 0-8.62 10.6" />
        <polygon points="13 11 9 17 14 17 11 23" fill="currentColor" />
      </svg>
    ),
    snow: (
      <svg {...iconProps}>
        <path d="M20 17.5A5 5 0 0 0 15 15h-3.26a8 8 0 1 0-8.62 10.6" />
        <line x1="16" y1="20" x2="16" y2="28" />
        <line x1="12" y1="22" x2="12" y2="30" />
        <line x1="20" y1="22" x2="20" y2="30" />
        <line x1="18" y1="24" x2="14" y2="24" />
        <line x1="22" y1="26" x2="18" y2="26" />
      </svg>
    ),
    fog: (
      <svg {...iconProps}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <line x1="2" y1="24" x2="30" y2="24" />
        <line x1="2" y1="28" x2="30" y2="28" />
      </svg>
    ),
  };

  // --- Icon Selection Logic ---
  const lowerCaseCondition = condition.toLowerCase();
  
  if (lowerCaseCondition.includes("clear")) return icons.clear;
  if (lowerCaseCondition.includes("thunderstorm")) return icons.thunderstorm;
  if (lowerCaseCondition.includes("rain")) return icons.rain;
  if (lowerCaseCondition.includes("drizzle")) return icons.rain;
  if (lowerCaseCondition.includes("snow")) return icons.snow;
  if (lowerCaseCondition.includes("mist")) return icons.fog;
  if (lowerCaseCondition.includes("fog")) return icons.fog;
  if (lowerCaseCondition.includes("haze")) return icons.fog;
  if (lowerCaseCondition.includes("smoke")) return icons.fog;
  if (lowerCaseCondition.includes("clouds")) return icons.clouds;

  return icons.clouds; // Default icon
};
// --- END: Inline SVG Weather Icons ---


function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setData(null);
    setError(null);
    try {
      // This endpoint now only returns weather data
      const res = await axios.get(`http://127.0.0.1:5000/weather?city=${city}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      if (err.response) {
        setError(err.response.data.error || "City not found.");
      } else {
        setError("Error connecting to the server.");
      }
    }
    setLoading(false);
  };

  return (
    // 3. All Tailwind classes replaced with CSS classes
    <div className="weather-card">
      <h2 className="weather-title">
        Live Weather
      </h2>
      
      {/* --- Input Section --- */}
      <div className="input-section">
        <input
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="city-input"
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button 
          onClick={fetchWeather} 
          disabled={loading}
          className="submit-button"
        >
          {loading ? "..." : "Get"}
        </button>
      </div>

      {/* --- Results & Error Section --- */}
      <div className="results-container">
        {error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}
        
        {data && data.weather && (
          <div className="results-box">
            
            {/* 4. Use the new .weather-icon class to style the SVG */}
            <div className="weather-icon">
              <WeatherIcon condition={data.weather.condition} />
            </div>
            
            <p className="results-temp">
              {data.weather.temperature.toFixed(1)}°C
            </p>
            
            <p className="results-condition">
              {data.weather.condition}
            </p>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;

