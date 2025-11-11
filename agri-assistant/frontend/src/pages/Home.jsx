import React from "react";
import { Link } from "react-router-dom";

function Home() {
  console.log("✅ Home: Final Guaranteed Version Rendering");

  const features = [
    {
      title: "🌦️ Weather Forecast",
      desc: "Get accurate, location-based forecasts to plan your irrigation and protect your crops.",
    },
    {
      title: "🧪 Soil Fertility",
      desc: "Analyze your soil health instantly and receive personalized fertilizer recommendations.",
    },
    {
      title: "🐞 Pest Detection",
      desc: "Use AI to identify crop diseases and pests from photos — fast and reliable.",
    },
    {
      title: "💹 Market Prices",
      desc: "Stay updated with real-time mandi prices and sell at the most profitable time.",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        background: "linear-gradient(to bottom, #e8f5e9, #ffffff)",
        padding: "6rem 1.5rem 4rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "visible", // ✅ ensures nothing gets clipped
      }}
    >
      {/* ✅ Hero Section */}
      <h1
        style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "2.8rem",
          color: "#1b5e20",
          fontWeight: "700",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        🌾 Welcome to Krishi Mithra
      </h1>

      <p
        style={{
          color: "#333",
          fontSize: "1.2rem",
          maxWidth: "700px",
          marginBottom: "2.5rem",
          textAlign: "center",
          lineHeight: "1.6",
        }}
      >
        Empowering Indian farmers with AI insights, weather forecasts, and
        market data — all in one place.
      </p>

      {/* ✅ Action Buttons */}
      <div
        style={{
          marginBottom: "4rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            background: "#2e7d32",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          🚀 Explore Tools
        </Link>
        <Link
          to="/chatbot"
          style={{
            background: "#fff",
            color: "#2e7d32",
            border: "2px solid #2e7d32",
            padding: "12px 28px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          💬 Ask Our AI
        </Link>
      </div>

      {/* ✅ Features Grid */}
      <section
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2rem",
          justifyContent: "center",
          alignItems: "stretch",
          marginBottom: "4rem",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: "#ffffff",
              padding: "2rem 1.5rem",
              borderRadius: "15px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow =
                "0 12px 28px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(0,0,0,0.1)";
            }}
          >
            <h3
              style={{
                color: "#1b5e20",
                fontSize: "1.4rem",
                marginBottom: "0.8rem",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                color: "#555",
                lineHeight: "1.5",
                fontSize: "1rem",
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ✅ Footer Line */}
      <p
        style={{
          fontSize: "0.95rem",
          color: "#555",
          textAlign: "center",
          marginTop: "2rem",
        }}
      >
        🌱 Growing with innovation — powered by <strong>Krishi Mithra</strong>.
      </p>
    </div>
  );
}

export default Home;
