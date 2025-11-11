import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"; // <-- ADDED THIS IMPORT

// --- Styles (Copied from your code) ---
const footerStyle = {
  background: "#2e7d32",
  color: "#e8f5e9",
  padding: "40px 50px",
  marginTop: "50px", // This pushes the footer away from content
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
  borderTop: "3px solid #4caf50",
};
const logoStyle = {
  fontWeight: "bold",
  fontSize: "1.8rem",
  color: "white",
  textDecoration: "none",
};
const linksContainerStyle = { display: "flex", gap: "25px" };
const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "1rem",
  fontWeight: 500,
};
const copyrightStyle = { color: "#e8f5e9", fontSize: "0.9rem" };

// --- Component ---

function Footer() {
  return (
    // You can add className="footer-slide-up" here to use your CSS
    <footer style={footerStyle} className="footer-slide-up">
      {/* 1. Logo (links to Home) */}
      <Link to="/" style={logoStyle}>
        🌾 Krishi Mithra
      </Link>

      {/* 2. Quick Links */}
      <div style={linksContainerStyle}>
        {/* 2. Use <Link> and correct 'to' paths */}
        <Link to="/about" style={linkStyle}>
          About
        </Link>
        <Link to="/contact" style={linkStyle}>
          Contact
        </Link>
        <Link to="/forum" style={linkStyle}>
          Forum
        </Link>
      </div>

      {/* 3. Copyright */}
      <div style={copyrightStyle}>
        © {new Date().getFullYear()} Krishi Mithra. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;