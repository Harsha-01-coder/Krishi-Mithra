import React, { useState } from 'react';
import axios from 'axios';
import './Weather.css'; // We will create this

// Icon for the search button
const SearchIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

function Weather() {
    const [city, setCity] = useState('');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!city) {
            setError("Please enter a city name.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await axios.get(`http://127.0.0.1:5000/weather?city=${city}`);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || "Error fetching weather data.");
            console.error("Weather fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format the AI advice
    const formatAdvice = (advice) => {
        return advice.split('\n').map((line, index) => {
            if (line.startsWith('*') || line.startsWith('-')) {
                return <li key={index}>{line.substring(1).trim()}</li>;
            }
            return null; // Ignore non-bullet lines if any
        }).filter(Boolean); // Remove nulls
    };

    return (
        <div className="weather-container">
            <div className="weather-card">
                <h2>Weather Forecast</h2>
                <p>Get weather predictions for better farm planning</p>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for a city..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? <div className="loader"></div> : <SearchIcon />}
                    </button>
                </div>

                {/* --- Results Section --- */}
                {error && <div className="error-box">{error}</div>}

                {data && (
                    <div className="results-wrapper">
                        
                        {/* --- Current Weather --- */}
                        <div className="current-weather">
                            <h3>{data.current.city_name}</h3>
                            <div className="current-main">
                                <img 
                                    src={`http://openweathermap.org/img/wn/${data.forecast[0].icon}@2x.png`} 
                                    alt={data.current.condition}
                                    className="weather-icon"
                                />
                                <div className="current-temp">{Math.round(data.current.temperature)}°C</div>
                            </div>
                            
                            {/* --- THIS IS THE FIX --- */}
                            <p className="current-condition">{data.current.condition}</p>
                            
                            <div className="current-details">
                                <div className="detail-item">
                                    <span>Humidity</span>
                                    <strong>{data.current.humidity}%</strong>
                                </div>
                                <div className="detail-item">
                                    <span>Wind</span>
                                    <strong>{Math.round(data.current.wind_speed)} km/h</strong>
                                </div>
                            </div>
                        </div>

                        {/* --- 5-Day Forecast --- */}
                        <div className="forecast-section">
                            <h4>5-Day Forecast</h4>
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
                        </div>

                        {/* --- Agricultural Advice --- */}
                        <div className="advice-section">
                            <h4>Agricultural Advice</h4>
                            <ul className="advice-list">
                                {formatAdvice(data.advice)}
                            </ul>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default Weather;