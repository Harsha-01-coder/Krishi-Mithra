import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  return (
    // Use the className from App.css for the sticky footer layout
    <div className="page-container">
      <Navbar />

      {/* Use the className from App.css to wrap the main content */}
      <main className="content-wrap">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;