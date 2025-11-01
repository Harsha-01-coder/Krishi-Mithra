import React, { useState } from "react";
import { Link } from "react-router-dom";
// 1. Import HashLink to handle scrolling links
import { HashLink } from "react-router-hash-link";

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // 2. Helper function to close dropdown on link click
  const handleLinkClick = () => {
    setOpenDropdown(null);
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
      {/* ---------- LEFT: LOGO ---------- */}
      <div style={{ fontWeight: "bold", fontSize: "1.6rem" }}>
        {/* 3. Use HashLink for the logo to go to top of home page */}
        <HashLink 
          to="/#top" 
          onClick={handleLinkClick}
          style={{ textDecoration: "none", color: "white" }}
        >
          🌾 Krishi Mithra
        </HashLink>
      </div>

      {/* ---------- CENTER: NAV LINKS ---------- */}
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
              {/* 4. Use HashLink for scrolling links */}
              <HashLink
                to="/#ai-chatbot"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🤖 AI Chatbot
              </HashLink>
              <HashLink
                to="/#schemes"
                onClick={handleLinkClick}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#2e7d32",
                  fontWeight: 500,
                }}
              >
                🧾 Government Schemes
              </HashLink>
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
              {/* 5. Use regular Link for page navigation */}
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
              {/* 6. Use HashLink for scrolling links */}
              <HashLink
                to="/#soil"
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
              </HashLink>
              <HashLink
                to="/#crops"
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
              </HashLink>
            </div>
          )}
        </div>

        {/* Static Links */}
        <HashLink
          to="/#about"
          onClick={handleLinkClick}
          style={{
            textDecoration: "none",
            color: "white",
            fontWeight: 500,
          }}
        >
          About Us
        </HashLink>
        <HashLink
          to="/#contact"
          onClick={handleLinkClick}
          style={{
            textDecoration: "none",
            color: "white",
            fontWeight: 500,
          }}
        >
          Contact
        </HashLink>
      </div>

      {/* ---------- RIGHT: LOGIN/SIGNUP ---------- */}
      <div>
        <Link
          to="/login"
          onClick={handleLinkClick}
          style={{
            color: "white",
            textDecoration: "none",
            marginRight: "15px",
            fontWeight: 500,
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
      </div>
    </nav>
  );
}

export default Navbar;

