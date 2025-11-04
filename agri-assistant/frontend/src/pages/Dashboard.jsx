import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css'; // We will create this

function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [prices, setPrices] = useState([]);
  const [news, setNews] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the location update form
  const [newLocation, setNewLocation] = useState('');

  // This function fetches all dashboard data
  const fetchData = async () => {
    setLoading(true);
    setError('');

    // We must send the token to protected routes
    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };

    try {
      // 1. Get User Profile
      const profileRes = await axios.get('http://127.0.0.1:5000/get-profile', config);
      setUser(profileRes.data);
      const location = profileRes.data.default_location;

      if (location) {
        setNewLocation(location); // Pre-fill the form
        
        // 2. Get data that depends on location
        const [weatherRes, pricesRes, newsRes] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/weather?city=${location}`),
          axios.get(`http://127.0.0.1:5000/market-prices?limit=5&state=${location}`), // Assuming your API can take a state filter
          axios.get('http://127.0.0.1:5000/get-dashboard-news', config)
        ]);
        
        setWeather(weatherRes.data);
        setPrices(pricesRes.data);
        setNews(newsRes.data.news_headlines);
      } else {
        // No location set, so we can't fetch other data
        setError("Please set your default location to see personalized data.");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout(); // Token is bad or expired, log the user out
        navigate('/login');
      }
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component load
  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      navigate('/login'); // If no token, kick to login
    }
  }, [token]); // Re-run if token changes

  // Handle saving a new location
  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    setError('');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    try {
      await axios.post('http://127.0.0.1:5000/update-profile', { location: newLocation }, config);
      fetchData(); // Refresh all data with new location
    } catch (err) {
      setError("Failed to update location.");
    }
  };

  // Helper to format AI news
  const formatNews = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('*') || line.startsWith('-')) {
        return <li key={index}>{line.substring(1).trim()}</li>;
      }
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user?.username || 'Farmer'}!</h1>
      
      {/* --- Location Settings Form --- */}
      <div className="location-widget">
        <form onSubmit={handleLocationUpdate}>
          <label htmlFor="location">Your Default Location (State/City):</label>
          <input 
            type="text" 
            id="location" 
            value={newLocation} 
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="e.g., Nagpur or Maharashtra"
          />
          <button type="submit">Save</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>

      {/* --- Main Dashboard Grid --- */}
      <div className="dashboard-grid">

        {/* --- Weather Widget --- */}
        <div className="dashboard-widget weather">
          <h3>Local Weather</h3>
          {weather ? (
            <div>
              <div className="weather-main">
                <img src={`http://openweathermap.org/img/wn/${weather.forecast[0].icon}@2x.png`} alt="weather" />
                <span className="weather-temp">{Math.round(weather.current.temperature)}°C</span>
              </div>
              <p className="weather-condition">{weather.current.condition}</p>
            </div>
          ) : <p>Set location to see weather.</p>}
        </div>

        {/* --- Market Prices Widget --- */}
        <div className="dashboard-widget prices">
          <h3>Market Prices</h3>
          {prices.length > 0 ? (
            <ul>
              {prices.slice(0, 4).map((item, i) => ( // Show max 4
                <li key={i}>
                  <span className="price-item">{item.commodity}</span>
                  <span className="price-value">₹ {item.price}</span>
                </li>
              ))}
            </ul>
          ) : <p>Set location to see prices.</p>}
        </div>

        {/* --- Agri-News Widget --- */}
        <div className="dashboard-widget news">
          <h3>Regional News</h3>
          {news ? (
            <ul className="news-list">
              {formatNews(news)}
            </ul>
          ) : <p>Set location to see news.</p>}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;