import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <-- Requires AuthContext.jsx

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // Get user token and logout function

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleLinkClick = () => setOpenDropdown(null);

  // --- Logout Handler ---
  const handleLogout = () => {
    logout();
    navigate('/'); // Go home after logout
    handleLinkClick();
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click happened outside the dropdown wrapper
      if (openDropdown && !event.target.closest('.nav-dropdown-wrapper')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Styling uses inline styles based on the user's original query
  const navStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "linear-gradient(90deg, #4caf50, #2e7d32)", color: "white",
    padding: "12px 40px", position: "sticky", top: 0, zIndex: 1000,
    boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
  };

  const linkStyle = { color: "white", textDecoration: "none" };
  const dropdownLinkStyle = { 
    display: "block", padding: "10px 15px", textDecoration: "none", 
    color: "#2e7d32", fontWeight: 500, fontFamily: "inherit", fontSize: "1rem",
    width: "100%", textAlign: "left"
  };

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <div style={{ fontWeight: "bold", fontSize: "1.6rem" }}>
        <Link to="/" onClick={handleLinkClick} style={linkStyle}>
          🌾 Krishi Mithra
        </Link>
      </div>

      {/* Nav Links Container */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "25px",
          fontSize: "1rem", flexGrow: 1, marginLeft: "50px",
        }}
      >
        {/* Services Dropdown */}
        <div className="nav-dropdown-wrapper" style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("services")}
            style={{ background: "transparent", border: "none", color: "white", fontSize: "1rem", cursor: "pointer" }}
          >
            Services ▾
          </button>
          {openDropdown === "services" && (
            <div
              style={{
                position: "absolute", top: "100%", left: 0, background: "white",
                color: "#2e7d32", borderRadius: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                overflow: "hidden", minWidth: "190px", marginTop: "10px",
              }}
            >
              {/* --- FIX: AI Chatbot Link to /chatbot --- */}
              <Link to="/chatbot" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🤖 AI Chatbot
              </Link>
              
              <Link to="/schemes" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🧾 Government Schemes
              </Link>
              
              <Link to="/prices" onClick={handleLinkClick} style={dropdownLinkStyle}>
                💹 Market Prices
              </Link>
            </div>
          )}
        </div>

        {/* Features Dropdown */}
        <div className="nav-dropdown-wrapper" style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("features")}
            style={{ background: "transparent", border: "none", color: "white", fontSize: "1rem", cursor: "pointer" }}
          >
            Features ▾
          </button>
          {openDropdown === "features" && (
            <div
              style={{
                position: "absolute", top: "100%", left: 0, background: "white",
                color: "#2e7d32", borderRadius: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                overflow: "hidden", minWidth: "220px", marginTop: "10px",
              }}
            >
              <Link to="/weather" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🌦️ Weather Forecast
              </Link>

              <Link to="/soil" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🧪 Soil Fertility
              </Link>

              <Link to="/pest" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🐞 Pest Identification
              </Link>

              <Link to="/crop" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🌱 Crop Recommendation
              </Link>

              <Link to="/calculator" onClick={handleLinkClick} style={dropdownLinkStyle}>
                🧮 Fertilizer Calculator
              </Link>
            </div>
          )}
        </div>
        
        {/* Dashboard Link (Visible when logged in) */}
        {token && (
          <Link to="/dashboard" onClick={handleLinkClick} style={linkStyle}>
            Dashboard
          </Link>
        )}

        {/* Static Links */}
        <Link to="/about" onClick={handleLinkClick} style={linkStyle}>
          About Us
        </Link>
        <Link to="/contact" onClick={handleLinkClick} style={linkStyle}>
          Contact
        </Link>

        {/* Forum Link */}
        <Link to="/forum" onClick={handleLinkClick} style={linkStyle}>
          Forum
        </Link>
      </div>

      {/* Auth Links */}
      <div>
        {token ? (
          // --- SHOW THIS IF USER IS LOGGED IN ---
          <button
            onClick={handleLogout}
            style={{
              color: "#2e7d32", background: "white", padding: "6px 14px",
              borderRadius: "6px", textDecoration: "none", fontWeight: "bold",
              border: "none", fontSize: "1rem", cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          // --- SHOW THIS IF USER IS LOGGED OUT ---
          <>
            <Link to="/login" onClick={handleLinkClick} style={{ ...linkStyle, marginRight: "15px" }}>
              Login
            </Link>
            <Link
              to="/signup" onClick={handleLinkClick}
              style={{
                color: "#2e7d32", background: "white", padding: "6px 14px",
                borderRadius: "6px", textDecoration: "none", fontWeight: "bold",
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