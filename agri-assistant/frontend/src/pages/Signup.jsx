import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './Login.css'; // Make sure this CSS file contains the .auth-card styles

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth(); // Get the login function from context

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // --- STEP 1: Create the account ---
      await axios.post('http://127.0.0.1:5000/signup', {
        username: username,
        password: password
      });

      // --- STEP 2 (The Fix): Log the user in immediately ---
      console.log("Signup successful! Now logging in...");
      const loginResponse = await axios.post('http://127.0.0.1:5000/login', {
        username: username,
        password: password
      });
      
      // --- STEP 3: Save the token and redirect to DASHBOARD ---
      if (loginResponse.data.token) {
        auth.login(loginResponse.data.token); // Save token
        navigate('/dashboard'); // Go to the dashboard!
      } else {
        setError('Login failed after signup. Please go to the login page.');
      }

    } catch (err) {
      // Handle errors (like "Username already exists")
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Signup failed. Please try again.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Uses the CSS classes you just provided
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join Krishi Mithra today</p>
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* Note: We don't need the .success-box because we are
            redirecting to the dashboard immediately on success.
          */}
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="switch-auth">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;