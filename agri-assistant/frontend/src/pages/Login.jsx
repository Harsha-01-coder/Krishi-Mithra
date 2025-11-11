import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Import your new CSS file

function Login() {
  // State for form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for handling errors and loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get auth functions and navigation
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any previous errors
    setLoading(true); // Set loading state to disable the button

    try {
      // Use the login function from your AuthContext
      const { success, error: authError } = await login(username, password);

      if (success) {
        navigate('/dashboard'); // Redirect to dashboard on success
      } else {
        // Show error from auth context or a default message
        setError(authError || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      // Catch any unexpected errors during the login attempt
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false); // Re-enable the button
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Welcome back to Krishi Mitra</p>

        <form onSubmit={handleSubmit}>
          
          {/* Conditionally render the error box if an error exists */}
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading} // Disable input when loading
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
              disabled={loading} // Disable input when loading
            />
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="switch-auth">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;