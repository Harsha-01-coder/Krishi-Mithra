import React from "react";
// import { Link } from "react-router-dom"; // <-- 1. REMOVED react-router-dom
// import "./Footer.css"; // <-- 1. IMPORT REMOVED TO FIX COMPILATION ERROR

// --- Styles ---
// (All your style objects are unchanged)
const footerStyle = {
  background: "#2e7d32", 
  color: "#e8f5e9",
  padding: "40px 50px",
  marginTop: "50px", 
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

const linksContainerStyle = {
  display: "flex",
  gap: "25px",
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "1rem",
  fontWeight: 500,
};

const copyrightStyle = {
  color: "#e8f5e9",
  fontSize: "0.9rem",
};

// --- Component ---

function Footer() {
  return (
    // 2. REMOVED the 'className' to rely only on inline styles
    <footer style={footerStyle}>
      {/* 1. Logo (links to Home) */}
      {/* 2. Replaced 'Link' with 'a' tag and 'to' with 'href' to fix context error */}
      <a href="/" style={logoStyle}>
        🌾 Krishi Mithra
      </a>

      {/* 2. Quick Links */}
      <div style={linksContainerStyle}>
        {/* 2. Replaced 'Link' with 'a' tag and 'to' with 'href' */}
        <a href="/#about" style={linkStyle}>
          About
        </a>
        {/* 2. Replaced 'Link' with 'a' tag and 'to' with 'href' */}
        <a href="/#contact" style={linkStyle}>
          Contact
        </a>
        {/* REMOVED the Weather Link */}
      </div>

      {/* 3. Copyright */}
      <div style={copyrightStyle}>
        © {new Date().getFullYear()} Krishi Mithra. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;

