import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './Login.css'; // Your styles

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth(); // Get the auth context

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // --- STEP 1: Create the account ---
      // This part remains the same
      await axios.post('http://127.0.0.1:5000/signup', {
        username: username,
        password: password
      });

      // --- STEP 2 (The Fix): Log the user in ---
      console.log("Signup successful! Now logging in...");

      // Call the login function FROM YOUR CONTEXT.
      // It will handle the API call and token saving.
      const { success, error: loginError } = await auth.login(username, password);
      
      // --- STEP 3: Redirect to DASHBOARD ---
      if (success) {
        navigate('/dashboard'); // Go to the dashboard!
      } else {
        // This would happen if login (post-signup) failed
        setError(loginError || 'Login failed after signup. Please go to the login page.');
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