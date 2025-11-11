import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleLinkClick = () => setOpenDropdown(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    handleLinkClick();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown && !e.target.closest(".nav-dropdown-wrapper")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(90deg, #4caf50, #2e7d32)",
    color: "white",
    padding: "12px 40px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
  };

  const linkStyle = { color: "white", textDecoration: "none" };

  const dropdownLinkStyle = {
    display: "block",
    padding: "10px 15px",
    textDecoration: "none",
    color: "#2e7d32",
    fontWeight: 500,
    fontSize: "1rem",
    width: "100%",
    textAlign: "left",
  };

  return (
    <nav style={navStyle}>
      {/* --- Logo --- */}
      <div style={{ fontWeight: "bold", fontSize: "1.6rem" }}>
        <Link to="/" onClick={handleLinkClick} style={linkStyle}>
          🌾 Krishi Mithra
        </Link>
      </div>

      {/* --- Center Nav Links --- */}
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
        {/* --- Services Dropdown --- */}
        <div className="nav-dropdown-wrapper" style={{ position: "relative" }}>
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
                borderRadius: "6px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                minWidth: "190px",
                marginTop: "10px",
                overflow: "hidden",
              }}
            >
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

        {/* --- Features Dropdown --- */}
        <div className="nav-dropdown-wrapper" style={{ position: "relative" }}>
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
                borderRadius: "6px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                minWidth: "220px",
                marginTop: "10px",
                overflow: "hidden",
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

        {/* --- Dashboard (only when logged in) --- */}
        {token && (
          <Link to="/dashboard" onClick={handleLinkClick} style={linkStyle}>
            Dashboard
          </Link>
        )}

        {/* --- Static Pages --- */}
        <Link to="/about" onClick={handleLinkClick} style={linkStyle}>
          About Us
        </Link>
        <Link to="/contact" onClick={handleLinkClick} style={linkStyle}>
          Contact
        </Link>
        <Link to="/forum" onClick={handleLinkClick} style={linkStyle}>
          Forum
        </Link>
        
        {/* --- NEW MARKETPLACE LINK --- */}
        <Link to="/marketplace" onClick={handleLinkClick} style={linkStyle}>
          🛍️ Marketplace
        </Link>
      </div>

      {/* --- Auth Links --- */}
      <div>
        {token ? (
          <button
            onClick={handleLogout}
            style={{
              color: "#2e7d32",
              background: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              fontWeight: "bold",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              onClick={handleLinkClick}
              style={{ ...linkStyle, marginRight: "15px" }}
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