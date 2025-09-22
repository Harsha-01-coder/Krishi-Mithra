import React, { useState } from "react";
import axios from "axios";

function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);

  const fetchWeather = async () => {
    if (!city) return;
    try {
      const res = await axios.get(`http://127.0.0.1:5000/weather?city=${city}`);
      setData(res.data);
    } catch (err) {
      alert("Error fetching weather");
    }
  };

  return (
    <div>
      <input placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} />
      <button onClick={fetchWeather}>Get Weather</button>
      {data && (
        <div>
          <p>Temperature: {data.weather.temperature}°C</p>
          <p>Condition: {data.weather.condition}</p>
          <p>Recommended Crops: {data.recommended_crops.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default Weather;
