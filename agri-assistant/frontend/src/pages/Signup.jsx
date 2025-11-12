// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  // ✅ Handle Google OAuth login/signup
  const handleGoogleResponse = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await axios.post("http://127.0.0.1:5000/google-login", { token });

      const jwt = res.data.token;
      if (jwt) {
        auth.setToken(jwt);
        navigate("/dashboard");
      } else {
        setError("Google signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google signup failed. Please try again.");
    }
  };

  // ✅ Regular signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axios.post("http://127.0.0.1:5000/signup", {
        username: username.trim(),
        password: password.trim(),
      });

      console.log("✅ Signup successful, logging in...");
      const { success, error: loginError } = await auth.login(username, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError(loginError || "Login failed after signup. Try logging in manually.");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>
          Join <span className="brand-name">Krishi Mithra</span> today
        </p>

        {/* ✅ Google Sign-Up Button */}
        <div className="google-signin">
          <GoogleLogin
            onSuccess={handleGoogleResponse}
            onError={() => setError("Google signup failed")}
            text="signup_with"
            width="300"
          />
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        {/* Regular Signup */}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
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
