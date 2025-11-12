import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [aiContent, setAiContent] = useState({ advice: "", news: "" });
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  const renderList = (text) => {
    if (!text) return null;
    return text
      .split("*")
      .map((item, i) => item.trim() && <li key={i}>{item.trim()}</li>);
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/dashboard-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(res.data);
        setError(res.data.error || null);
      } catch (err) {
        setError("Could not load dashboard data.");
        console.error(err);
      }
    };

    const fetchMyPosts = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/my-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyPosts(res.data);
      } catch (err) {
        console.error("Could not fetch user posts.", err);
      }
    };

    const loadAllData = async () => {
      setIsLoading(true);
      if (!token) {
        setError("You are not logged in.");
        setIsLoading(false);
        navigate("/login");
        return;
      }
      await Promise.all([fetchDashboardData(), fetchMyPosts()]);
      setIsLoading(false);
    };

    loadAllData();
  }, [token, navigate]);

  // 🧠 Fetch AI Advice + News separately (non-blocking)
  useEffect(() => {
    const fetchAIContent = async () => {
      try {
        setAiLoading(true);
        const res = await axios.get("http://127.0.0.1:5000/dashboard-ai-content", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAiContent({
          advice: res.data.advice || "No advice available.",
          news: res.data.news || "No news available.",
        });
      } catch (err) {
        console.error("AI Content fetch failed:", err);
      } finally {
        setAiLoading(false);
      }
    };

    if (token) fetchAIContent();
  }, [token]);

  if (isLoading) return <div className="loader">Loading Dashboard...</div>;

  if (error && !dashboardData?.user) {
    return <div className="error-box">{error}</div>;
  }

  if (!dashboardData)
    return <div className="error-box">Could not load dashboard data.</div>;

  const { user, weather } = dashboardData;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">
        Namaskar, {user.full_name || user.username}!
      </h1>
      <p className="dashboard-location">
        Your dashboard for:{" "}
        <strong>{user.location || "No Location Set"}</strong>
        <Link to="/profile" className="change-location-link">
          (Change/Set)
        </Link>
      </p>

      {error && <div className="error-box">{error}</div>}

      <div className="dashboard-grid">
        {/* 1️⃣ Weather & AI Advice */}
        {weather ? (
          <div className="dashboard-card weather-card">
            <div className="weather-main">
              <img
                src={`http://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                alt={weather.current.condition}
                className="weather-icon"
                onError={(e) => {
                  e.target.src = "https://placehold.co/100x100/f0f0f0/666?text=?";
                }}
              />
              <div className="weather-details">
                <div className="weather-temp">
                  {Math.round(weather.current.temperature)}°C
                </div>
                <div className="weather-condition">
                  {weather.current.condition}
                </div>
                <div className="weather-sub">
                  Humidity: {weather.current.humidity}% | Wind:{" "}
                  {Math.round(weather.current.wind_speed)} km/h
                </div>
              </div>
            </div>

            <div className="advice-section">
              <h3>🤖 AI Agri-Advice</h3>
              {aiLoading ? (
                <p className="loading-ai">Loading smart advice...</p>
              ) : (
                <ul className="advice-list">{renderList(aiContent.advice)}</ul>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-card loader">Loading weather...</div>
        )}

        {/* 2️⃣ My Posts */}
        <div className="dashboard-card">
          <h3>✍️ My Forum Posts</h3>
          <div className="my-posts-list">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <div key={post.id} className="my-post-item">
                  <div className="my-post-title">
                    <Link to={`/forum/post/${post.id}`}>{post.title}</Link>
                  </div>
                  <div className="my-post-actions">
                    <Link
                      to={`/forum/edit-post/${post.id}`}
                      className="post-action-btn edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="post-action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-posts-msg">You haven’t created any posts yet.</p>
            )}
            <Link to="/forum/new-post" className="btn-new-post-dash">
              + Create New Post
            </Link>
          </div>
        </div>

        {/* 3️⃣ Tools */}
        <div className="dashboard-card">
          <h3>🛠️ Quick Tools</h3>
          <div className="actions-grid">
            <Link to="/pest" className="action-button">
              <span className="action-icon">📸</span>
              <strong>Identify Pest</strong>
              <span>Upload an image</span>
            </Link>
            <Link to="/calculator" className="action-button">
              <span className="action-icon">🧪</span>
              <strong>Check Fertilizer</strong>
              <span>NPK calculator</span>
            </Link>
            <Link to="/crop" className="action-button">
              <span className="action-icon">🌾</span>
              <strong>Find New Crop</strong>
              <span>Get recommendations</span>
            </Link>
            <Link to="/prices" className="action-button">
              <span className="action-icon">📈</span>
              <strong>Market Prices</strong>
              <span>View graphs & data</span>
            </Link>
          </div>
        </div>

        {/* 4️⃣ Forecast */}
        {weather?.forecast && (
          <div className="dashboard-card">
            <h3>📅 5-Day Forecast</h3>
            <ul className="forecast-list">
              {weather.forecast.map((day) => (
                <li key={day.date}>
                  <img
                    src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.condition}
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/50x50/f0f0f0/666?text=?")
                    }
                  />
                  <strong>{day.day}</strong>
                  <span>{day.condition}</span>
                  <span>
                    {day.max_temp}° / {day.min_temp}°
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5️⃣ Admin */}
        <div className="dashboard-card admin-card">
          <h3>⚙️ Admin Panel</h3>
          <div className="actions-grid">
            <Link to="/admin/add-product" className="action-button">
              <span className="action-icon">📦</span>
              <strong>Add Product</strong>
              <span>Add to marketplace</span>
            </Link>
          </div>
        </div>

        {/* 6️⃣ News */}
        <div className="dashboard-card wide-card">
          <h3>📰 Latest News</h3>
          {aiLoading ? (
            <p className="loading-ai">Loading news...</p>
          ) : (
            <ul className="news-list">{renderList(aiContent.news)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
