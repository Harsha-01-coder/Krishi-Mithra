import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // We will create this file next

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    setIsLoading(true);
    setError('');

    try {
      // Call your Flask backend's /login route
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username: username,
        password: password
      });

      // If login is successful, Flask sends back a token
      if (response.data.token) {
        // --- THIS IS THE MOST IMPORTANT PART ---
        // Store the token in localStorage to keep the user logged in
        localStorage.setItem('token', response.data.token);
        
        // Redirect to the homepage
        navigate('/');
      }
    } catch (err) {
      // If Flask sends an error (like 401 Invalid Credentials)
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Login failed. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Welcome back to Krishi Mithra</p>
        
        <form onSubmit={handleLogin}>
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
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="switch-auth">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;