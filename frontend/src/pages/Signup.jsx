import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/signup", {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      if (err.response) {
        // Backend returned an error response
        setError(err.response.data.error || "Signup failed");
      } else {
        // Network or other error
        setError("Could not connect to server");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

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
      <button onClick={handleSignup}>Sign Up</button>

      <p>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          style={{ color: "blue", cursor: "pointer" }}
        >
          Login
        </span>
      </p>
    </div>
  );
}

export default Signup;
