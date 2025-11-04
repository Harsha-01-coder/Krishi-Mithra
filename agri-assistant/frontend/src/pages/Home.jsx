import React, { useState, useEffect } from "react";
import "./Home.css";

function Home() {
  const slides = [
    {
      image:
        "https://img.freepik.com/premium-photo/corn-field-maize-field-agriculture-farm-morning-sunrise_1235831-96792.jpg",
      caption: "Empowering Indian Farmers 🌾",
    },
    {
      image:
        "https://www.dimolanka.com/wp-content/uploads/2023/01/Agriculture-1200x630-1.jpg",
      caption: "Smarter Agriculture through Technology 🚜",
    },
    {
      image:
        "https://images.rawpixel.com/image_social_landscape/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTEwL3Jhd3BpeGVsb2ZmaWNlNV93aWRlX3Nob3RfcGhvdG9ncmFwaF9fZHJvbmVfdmlld19hX3RyYWN0b3Jfd29ya184MzE3Y2Y5OS05YTliLTRmNmYtODU2Yi1lOTBiOGRkYmYwN2NfMi5qcGc.jpg",
      caption: "Sustainable Farming for the Future 🌱",
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="home-container">
      {/* --- Image Slideshow --- */}
      <div className="slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="caption">{slide.caption}</div>
          </div>
        ))}
      </div>

      {/* --- Hero Section --- */}
      <section className="hero">
        <h1>🌾 Welcome to Krishi Mithra</h1>
        <p>
          Your trusted digital companion for modern agriculture — combining AI,
          soil intelligence, and weather insights to help farmers thrive.
        </p>

        <div className="hero-buttons">
          <a href="#about" className="btn-primary">
            Learn More
          </a>
          <a href="/signup" className="btn-outline">
            Get Started
          </a>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="about">
        <h2>About Krishi Mithra</h2>
        <p>
          <strong>Krishi Mithra</strong> empowers farmers with AI-based insights
          and real-time assistance. Our mission is to simplify farming decisions
          using technology, data, and sustainability.
        </p>
      </section>

      {/* --- Mission Section --- */}
      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          We aim to bridge the gap between technology and agriculture by
          providing tools that make farming smarter, sustainable, and more
          profitable for every farmer across India.
        </p>
      </section>

      {/* --- Why Choose Us --- */}
      <section className="why-choose">
        <h2>Why Choose Krishi Mithra?</h2>
        <div className="features">
          <div className="feature-card">
            <h3>🌱 AI-Powered Farming</h3>
            <p>Get personalized insights to boost yield and efficiency.</p>
          </div>
          <div className="feature-card">
            <h3>🌦️ Accurate Weather Updates</h3>
            <p>Stay informed and plan your activities based on forecasts.</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Farmer-Friendly Interface</h3>
            <p>Simple, easy-to-use platform built for everyone.</p>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="cta">
        <h2>Join us in transforming Indian agriculture 🌾</h2>
        <a href="/signup" className="btn-primary">
          Get Started
        </a>
      </section>
    </div>
  );
}

export default Home;
