import React, { useState } from 'react';
import axios from 'axios';
import './Weather.css';
import { motion } from 'framer-motion';
import { CloudRain, Wind, Droplets, Thermometer, Shield, Beef } from 'lucide-react';

const SearchIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

function Weather() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await axios.get(`http://127.0.0.1:5000/weather?city=${city}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching weather data.');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Advice Icon Map ---
  const adviceIcons = {
    waterlogging: <CloudRain className="advice-icon blue" />,
    fungal: <Shield className="advice-icon green" />,
    fertilizer: <Thermometer className="advice-icon orange" />,
    livestock: <Beef className="advice-icon brown" />,
    default: <Wind className="advice-icon gray" />,
  };

  // --- Advice Renderer ---
  const renderAdviceCards = (adviceText) => {
    const adviceList = adviceText.split(/\n|\r/).filter((line) => line.trim() !== '');
    return adviceList.map((line, i) => {
      const lower = line.toLowerCase();
      let icon = adviceIcons.default;

      if (lower.includes('waterlog')) icon = adviceIcons.waterlogging;
      else if (lower.includes('fungal')) icon = adviceIcons.fungal;
      else if (lower.includes('fertiliz')) icon = adviceIcons.fertilizer;
      else if (lower.includes('livestock')) icon = adviceIcons.livestock;

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="advice-card"
        >
          {icon}
          <p>{line.replace(/[*-]/g, '').trim()}</p>
        </motion.div>
      );
    });
  };

  return (
    <div className="weather-container">
      <div className="weather-card">
        <h2>🌤️ Weather Forecast</h2>
        <p>Get weather predictions for better farm planning</p>

        {/* --- Search Bar --- */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <div className="loader"></div> : <SearchIcon />}
          </button>
        </div>

        {/* --- Error Message --- */}
        {error && <div className="error-box">{error}</div>}

        {/* --- Results Section --- */}
        {data && (
          <div className="results-wrapper">
            {/* --- Current Weather --- */}
            <motion.div
              className="current-weather"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3>{data.current.city_name}</h3>
              <div className="current-main">
                <img
                  src={`http://openweathermap.org/img/wn/${data.forecast[0].icon}@2x.png`}
                  alt={data.current.condition}
                  className="weather-icon"
                />
                <div className="current-temp">
                  {Math.round(data.current.temperature)}°C
                </div>
              </div>
              <p className="current-condition">{data.current.condition}</p>

              <div className="current-details">
                <div className="detail-item">
                  <span>💧 Humidity</span>
                  <strong>{data.current.humidity}%</strong>
                </div>
                <div className="detail-item">
                  <span>🌬️ Wind</span>
                  <strong>{Math.round(data.current.wind_speed)} km/h</strong>
                </div>
              </div>
            </motion.div>

            {/* --- Forecast --- */}
            <motion.div
              className="forecast-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h4>📅 5-Day Forecast</h4>
              <ul className="forecast-list">
                {data.forecast.map((day) => (
                  <li key={day.date}>
                    <span className="forecast-day">{day.day}</span>
                    <img
                      src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.condition}
                      className="forecast-icon"
                    />
                    <span className="forecast-temp">
                      <strong>{day.max_temp}°</strong> / {day.min_temp}°
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* --- Agricultural Advice --- */}
            <motion.div
              className="advice-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h4>🌾 Agricultural Advice</h4>
              <div className="advice-list">
                {renderAdviceCards(data.advice)}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
