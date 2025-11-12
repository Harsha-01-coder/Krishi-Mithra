import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../App.css"; // Ensures .page-container and .content-wrap styles are applied

function Layout() {
  return (
    <div className="page-container">
      {/* 🌿 Navbar always visible */}
      <Navbar />

      {/* 📄 Main content for all routed pages */}
      <main className="content-wrap">
        <Outlet />
      </main>

      {/* 🌱 Footer always visible */}
      <Footer />
    </div>
  );
}

export default Layout;
