import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- Add useNavigate
import axios from 'axios';
import './Dashboard.css'; 

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [myPosts, setMyPosts] = useState([]); // <-- 1. New state for posts
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token"); // Get auth token
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        const fetchDashboardData = async () => {
            // ... (this is your existing fetchData logic) ...
            try {
                const res = await axios.get("http://127.0.0.1:5000/dashboard-data", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setDashboardData(res.data);
                if (res.data.error) {
                    setError(res.data.error);
                } else {
                    setError(null);
                }
            } catch (err) {
                setError("Could not load dashboard data.");
                console.error(err);
            }
        };

        const fetchMyPosts = async () => {
            // <-- 2. New fetch function for user's posts
            try {
                const res = await axios.get("http://127.0.0.1:5000/api/my-posts", {
                    headers: { 'Authorization': `Bearer ${token}` }
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
                return;
            }
            // Run both fetches at the same time
            await Promise.all([fetchDashboardData(), fetchMyPosts()]);
            setIsLoading(false);
        }

        loadAllData();
    }, [token]); // Re-run if token changes

    // Helper to render bullet points
    const renderList = (text) => {
        // ... (your existing renderList function)
        if (!text) return null;
        return text.split('*').map((item, index) => 
            item.trim() && <li key={index}>{item.trim()}</li>
        );
    };

    // <-- 3. New function to handle post deletion
    const handleDelete = async (postId, postTitle) => {
        if (!window.confirm(`Are you sure you want to delete this post?\n\n"${postTitle}"`)) {
            return;
        }

        try {
            await axios.delete(`http://127.0.0.1:5000/api/post/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Refresh the post list by filtering out the deleted one
            setMyPosts(myPosts.filter(post => post._id !== postId));
        } catch (err) {
            alert("Error: Could not delete post.");
            console.error(err);
        }
    };

    if (isLoading) {
        return <div className="loader">Loading Dashboard...</div>;
    }

    // Handle error case first
    if (error && !dashboardData?.user) {
        return <div className="error-box">{error}</div>;
    }

    const { user, weather, news } = dashboardData;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-welcome">
                Namaskar, {user.full_name || user.username}!
            </h1>
            {/* ... (rest of your welcome/location code) ... */}
            <p className="dashboard-location">
                Your dashboard for: <strong>{user.location || "No Location Set"}</strong>
                <Link to="/profile" className="change-location-link">(Change/Set)</Link>
            </p>

            {error && <div className="error-box">{error}</div>}
            
            {/* --- NEW LAYOUT GRID --- */}
            <div className="dashboard-grid">
                
                {/* --- 1. Weather & Advice Card --- */}
                {weather ? (
                    // <-- FIX: REMOVED 'wide-card' class to allow 2-column layout
                    <div className="dashboard-card weather-card"> 
                        <div className="weather-main">
                            <img 
                                src={`http://openweathermap.org/img/wn/${weather.current.icon}@2x.png`} 
                                alt={weather.current.condition}
                                className="weather-icon"
                            />
                            <div className="weather-details">
                                <div className="weather-temp">{Math.round(weather.current.temperature)}°C</div>
                                <div className="weather-condition">{weather.current.condition}</div>
                                <div className="weather-sub">
                                    Humidity: {weather.current.humidity}% | Wind: {Math.round(weather.current.wind_speed)} km/h
                                </div>
                            </div>
                        </div>
                        <div className="advice-section">
                            <h3>🤖 AI Agri-Advice</h3>
                            <ul className="advice-list">{renderList(weather.advice)}</ul>
                        </div>
                    </div>
                ) : !error && (
                    // <-- FIX: REMOVED 'wide-card' class
                    <div className="dashboard-card loader">Loading weather...</div>
                )}

                {/* --- 2. "MY POSTS" CARD (MOVED) --- */}
                <div className="dashboard-card">
                    <h3>✍️ My Forum Posts</h3>
                    <div className="my-posts-list">
                        {myPosts.length > 0 ? (
                            myPosts.map(post => (
                                <div key={post._id} className="my-post-item">
                                    <div className="my-post-title">
                                        <Link to={`/forum/post/${post._id}`}>{post.title}</Link>
                                    </div>
                                    <div className="my-post-actions">
                                        <Link to={`/edit-post/${post._id}`} className="post-action-btn edit">Edit</Link>
                                        <button 
                                            onClick={() => handleDelete(post._id, post.title)} 
                                            className="post-action-btn delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-posts-msg">You haven't created any posts yet.</p>
                        )}
                        <Link to="/forum/new-post" className="btn-new-post-dash">
                            + Create New Post
                        </Link>
                    </div>
                </div>

                {/* --- 3. Quick Actions Card --- */}
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

                {/* --- 4. Forecast Card --- */}
                {weather ? (
                    <div className="dashboard-card">
                        <h3>📅 5-Day Forecast</h3>
                        <ul className="forecast-list">
                            {weather.forecast.map(day => (
                                <li key={day.date}>
                                    <img 
                                        src={`http://openweathermap.org/img/wn/${day.icon}.png`} 
                                        alt={day.condition}
                                    />
                                    <strong>{day.day}</strong>
                                    <span>{day.condition}</span>
                                    <span>{day.max_temp}° / {day.min_temp}°</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : !error && (
                    <div className="dashboard-card loader">Loading forecast...</div>
                )}

                {/* --- 5. News Card (Now spans full width) --- */}
                <div className="dashboard-card wide-card"> {/* This card stays wide */}
                    <h3>📰 Latest News</h3>
                    <ul className="news-list">
                        {renderList(news)}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;