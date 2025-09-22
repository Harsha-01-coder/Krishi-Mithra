import React, { useState } from "react";
import { getWeather } from "../api";

function Weather() {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);

  const fetchWeather = async () => {
    const res = await getWeather(city, 3);
    setForecast(res.data);
  };

  return (
    <div>
      <h2>Weather Forecast</h2>
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" />
      <button onClick={fetchWeather}>Get Forecast</button>
      <ul>
        {forecast.map((item, i) => (
          <li key={i}>{item.date}: {item.temp}°C, {item.weather}</li>
        ))}
      </ul>
    </div>
  );
}

export default Weather;
