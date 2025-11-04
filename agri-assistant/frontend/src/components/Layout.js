import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Chatbot from "./Chatbot"; // ✅ Import here

function Layout() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <Navbar />
      <main
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          overflow: "visible",
        }}
      >
        <Outlet />
        <Chatbot /> {/* ✅ Chatbot available on all pages */}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
