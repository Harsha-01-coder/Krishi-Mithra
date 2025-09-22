import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { getToken } from "./utils/auth";

// ---------------- Private Route ----------------
function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

// ---------------- Chat Widget Loader ----------------
function ChatWidgetLoader() {
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === "/") {
      try {
        const script = document.createElement("script");
        script.src =
          "https://assets-chatflow.pabbly.com/production/ai-assistant/chat-widget/chat-widget.min.js?s_id=68c142f5e6f5fd512e5678a8&a_id=68c14365e6f5fd512e56a1a8&t=" +
          Date.now();
        script.async = true;
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        console.error("Failed to load chat widget:", err);
      }
    }
  }, [location.pathname]);

  return null;
}

// ---------------- Inner App ----------------
function InnerApp() {
  return (
    <>
      <ChatWidgetLoader />
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
    </>
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
