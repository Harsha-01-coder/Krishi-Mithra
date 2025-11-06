import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // We will create this CSS file

function Profile() {
    const [fullName, setFullName] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // 1. Fetch current profile data on load
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError("You are not logged in.");
                return;
            }
            try {
                const res = await axios.get("http://127.0.0.1:5000/get-profile", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFullName(res.data.full_name || 'User');
                setLocation(res.data.default_location || '');
            } catch (err) {
                setError("Could not load your profile.");
            }
        };
        fetchProfile();
    }, [token]);

    // 2. Handle saving changes
    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const res = await axios.post("http://127.0.0.1:5000/update-profile", 
                { 
                    location: location,
                    fullName: fullName // Send both fields
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setMessage(res.data.message);
            // Go back to the dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "Could not update profile.");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Your Profile</h2>
                <p>Update your name and default location. This will be used to personalize your dashboard.</p>

                <form onSubmit={handleSave}>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Harsha "
                    />

                    <label htmlFor="location">Your Default Location (City)</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Bengaluru"
                    />
                    
                    <button type="submit" className="save-button">Save Changes</button>
                </form>

                {message && <div className="message-box success">{message}</div>}
                {error && <div className="message-box error">{error}</div>}
            </div>
        </div>
    );
}

export default Profile;