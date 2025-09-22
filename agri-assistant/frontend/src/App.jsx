import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { getToken } from "./utils/auth";

// ---------------- Private Route ----------------
function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

// ---------------- Inner App ----------------
function InnerApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ---------------- Main App ----------------
function App() {
  return (
    <Router>
      <InnerApp />
    </Router>
  );
}

export default App;
