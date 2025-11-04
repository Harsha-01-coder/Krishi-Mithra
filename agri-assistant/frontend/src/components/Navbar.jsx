import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <-- 1. Import Auth Context

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // <-- 2. Get user token and logout function

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleLinkClick = () => setOpenDropdown(null);

  // --- NEW: Logout Handler ---
  const handleLogout = () => {
    logout();
    navigate('/'); // Go home after logout
    handleLinkClick();
  };

  // helper for scrolling to sections on the home page
  const handleScrollTo = (sectionId) => {
    navigate("/"); // ensure we're on home page
    setOpenDropdown(null); // Close dropdown after clicking
    setTimeout(() => {
      const section = document.querySelector(sectionId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(90deg, #4caf50, #2e7d32)",
        color: "white",
        padding: "12px 40px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo */}
      <div style={{ fontWeight: "bold", fontSize: "1.6rem" }}>
        <Link
          to="/"
          onClick={handleLinkClick}
          style={{ textDecoration: "none", color: "white" }}
        >
          🌾 Krishi Mithra
        </Link>
      </div>

      {/* Nav Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
          fontSize: "1rem",
          flexGrow: 1,
          marginLeft: "50px",
        }}
      >
        {/* Services Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("services")}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Services ▾
          </button>
          {openDropdown === "services" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "white",
                color: "#2e7d32",
                borderRadius: "6px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                overflow: "hidden",
                minWidth: "190px",
              }}
            >
              <button
                onClick={() => handleScrollTo("#ai-chatbot")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  color: "#2e7d32",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                🤖 AI Chatbot
              </button>
              
              <Link
                to="/schemes"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  color: "#2e7d32",
                  cursor: "pointer",
                  textDecoration: "none",
                  fontFamily: "inherit",
                  fontSize: "1rem"
                }}
              >
                🧾 Government Schemes
              </Link>
              
              <Link
                to="/prices"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  color: "#2e7d32",
                  cursor: "pointer",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              >
                💹 Market Prices
              </Link>
            </div>
          )}
        </div>

        {/* Features Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("features")}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Features ▾
          </button>
          {openDropdown === "features" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "white",
                color: "#2e7d32",
                borderRadius: "6px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                overflow: "hidden",
                minWidth: "220px",
              }}
            >
              <Link
                to="/weather"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🌦️ Weather Forecast
              </Link>

              <Link
                to="/soil"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🧪 Soil Fertility
              </Link>

              <Link
                to="/pest"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🐞 Pest Identification
              </Link>

              <Link
                to="/crop"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🌱 Crop Recommendation
              </Link>

              <Link
                to="/calculator"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🧮 Fertilizer Calculator
              </Link>

            </div>
          )}
        </div>

        {/* --- 3. ADDED THE DASHBOARD LINK HERE --- */}
        {token && (
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            style={{ color: "white", textDecoration: "none" }}
          >
            Dashboard
          </Link>
        )}

        {/* Static Links */}
        <Link
          to="/about"
          onClick={handleLinkClick}
          style={{ color: "white", textDecoration: "none" }}
        >
          About Us
        </Link>
        <Link
          to="/contact"
          onClick={handleLinkClick}
          style={{ color: "white", textDecoration: "none" }}
        >
          Contact
        </Link>
      </div>

      {/* --- 4. UPDATED AUTH LINKS --- */}
      <div>
        {token ? (
          // --- SHOW THIS IF USER IS LOGGED IN ---
          <button
            onClick={handleLogout}
            style={{
              color: "#2e7d32",
              background: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          // --- SHOW THIS IF USER IS LOGGED OUT ---
          <>
            <Link
              to="/login"
              onClick={handleLinkClick}
              style={{
                color: "white",
                textDecoration: "none",
                marginRight: "15px",
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={handleLinkClick}
              style={{
                color: "#2e7d32",
                background: "white",
                padding: "6px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;