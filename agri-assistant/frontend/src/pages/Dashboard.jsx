import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './Dashboard.css'; // This CSS file is provided below
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORTED useAuth

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- 2. GET TOKEN FROM useAuth ---
    const { token } = useAuth(); 
    const navigate = useNavigate(); 

    // Helper to render bullet points
    const renderList = (text) => {
        if (!text) return null;
        return text.split('*').map((item, index) => 
            item.trim() && <li key={index}>{item.trim()}</li>
        );
    };

    // New function to handle post deletion
    const handleDelete = async (postId, postTitle) => {
        // We are now using postId which is post.id (the string ID)
        
        // --- 3. REMOVED window.confirm ---
        // We will just delete directly. 
        // A proper app would use a modal, but confirm() is not allowed.
        
        try {
            await axios.delete(`http://127.0.0.1:5000/api/post/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // FIX: Filter by 'id' property of the post object
            setMyPosts(myPosts.filter(post => post.id !== postId)); 
        } catch (err) {
            // Added check for 404/401 errors which result in this alert
            // alert("Error: Could not delete post. Ensure you are logged in and are the original author.");
            console.error("Error: Could not delete post. Ensure you are logged in and are the original author.", err);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
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
                navigate('/login'); // Redirect to login if no token
                return;
            }
            await Promise.all([fetchDashboardData(), fetchMyPosts()]);
            setIsLoading(false);
        }

        loadAllData();
    }, [token, navigate]); // Added navigate to dependency array

    if (isLoading) {
        return <div className="loader">Loading Dashboard...</div>;
    }

    if (error && !dashboardData?.user) {
        return <div className="error-box">{error}</div>;
    }

    // This handles the case where data fetch failed but user is technically set
    if (!dashboardData) {
        return <div className="error-box">Could not load dashboard data. Please try again.</div>
    }

    const { user, weather, news } = dashboardData;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-welcome">
                Namaskar, {user.full_name || user.username}!
            </h1>
            <p className="dashboard-location">
                Your dashboard for: <strong>{user.location || "No Location Set"}</strong>
                <Link to="/profile" className="change-location-link">(Change/Set)</Link>
            </p>

            {error && <div className="error-box">{error}</div>}
            
            <div className="dashboard-grid">
                
                {/* 1. Weather & Advice Card */}
                {weather ? (
                    <div className="dashboard-card weather-card"> 
                        <div className="weather-main">
                            <img 
                                src={`http://openweathermap.org/img/wn/${weather.current.icon}@2x.png`} 
                                alt={weather.current.condition}
                                className="weather-icon"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/f0f0f0/666?text=?' }}
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
                    <div className="dashboard-card loader">Loading weather...</div>
                )}

                {/* 2. "MY POSTS" CARD (Action points fixed) */}
                <div className="dashboard-card">
                    <h3>✍️ My Forum Posts</h3>
                    <div className="my-posts-list">
                        {myPosts.length > 0 ? (
                            myPosts.map(post => (
                                <div key={post.id} className="my-post-item">
                                    <div className="my-post-title">
                                        <Link to={`/forum/post/${post.id}`}>{post.title}</Link>
                                    </div>
                                    <div className="my-post-actions">
                                        <Link to={`/forum/edit-post/${post.id}`} className="post-action-btn edit">Edit</Link>
                                        <button 
                                            onClick={() => handleDelete(post.id, post.title)} 
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

                {/* 3. Quick Actions Card */}
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

                {/* 4. Forecast Card */}
                {weather ? (
                    <div className="dashboard-card">
                        <h3>📅 5-Day Forecast</h3>
                        <ul className="forecast-list">
                            {weather.forecast.map(day => (
                                <li key={day.date}>
                                    <img 
                                        src={`http://openweathermap.org/img/wn/${day.icon}.png`} 
                                        alt={day.condition}
                                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/50x50/f0f0f0/666?text=?' }}
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

                {/* --- 5. NEW ADMIN CARD --- */}
                <div className="dashboard-card admin-card">
                    <h3>⚙️ Admin Panel</h3>
                    <div className="actions-grid">
                        <Link to="/admin/add-product" className="action-button">
                            <span className="action-icon">📦</span>
                            <strong>Add Product</strong>
                            <span>Add item to marketplace</span>
                        </Link>
                        {/* You can add more admin links here later */}
                    </div>
                </div>


                {/* 6. News Card (Now spans full width) */}
                <div className="dashboard-card wide-card">
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