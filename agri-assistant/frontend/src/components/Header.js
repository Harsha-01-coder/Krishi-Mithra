import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* --- Logo --- */}
        <Link to="/" className="logo">
          Krishi Mithra
        </Link>

        {/* --- Navigation Links --- */}
        <nav className="nav-links">
          {/* NavLink adds an 'active' class to the link for the current page */}
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/forum">Forum</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        {/* --- Auth Buttons --- */}
        <div className="auth-buttons">
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <Link to="/signup" className="btn-signup">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;