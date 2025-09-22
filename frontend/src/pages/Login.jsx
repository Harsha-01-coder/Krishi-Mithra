import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // Clear previous error

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.data.token) {
        setToken(res.data.token);
        navigate("/"); // Redirect to home page
      }
    } catch (err) {
      if (err.response) {
        // Backend returned an error response
        setError(err.response.data.error || "Login failed");
      } else {
        // Network or other error
        setError("Could not connect to server");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>

      <p>
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/signup")}
          style={{ color: "blue", cursor: "pointer" }}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}

export default Login;
