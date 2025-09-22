import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import Weather from "../components/Weather";
import SoilSensor from "../components/SoilSensor";
import Chatbot from "../components/Chatbot";
import "./Home.css";

// ... other imports

function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const slides = [
    { img: "/images/farm1.jpg", caption: "Fresh Crops" },
    { img: "/images/farm2.jpg", caption: "Soil Fertility Tips" },
    { img: "/images/farm3.jpg", caption: "Weather Insights" },
  ];

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="home-container">
      <div className="header">
        <h1>🌾 Welcome to Agri Assistant 🌾</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="carousel">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="slide"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            <img src={slide.img} alt={slide.caption} />
            <div className="caption">{slide.caption}</div>
          </div>
        ))}
      </div>

      <div className="cards">
        <div className="card">
          <h2>Weather Forecast</h2>
          <Weather />
        </div>
        <div className="card">
          <h2>Soil Fertility</h2>
          <SoilSensor />
        </div>
        <div className="card">
          <h2>Chatbot</h2>
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

export default Home;
