import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, Sun, Leaf, DollarSign, Timer } from "lucide-react";
import "./CropRecommender.css";

function CropRecommender() {
  const [soil, setSoil] = useState("");
  const [season, setSeason] = useState("");
  const [stateName, setStateName] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [temp, setTemp] = useState("");
  const [crops, setCrops] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🌿 Hover popup for AI summary
  const [hoveredCrop, setHoveredCrop] = useState(null);
  const [cropSummary, setCropSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const handleGetRecommendations = async () => {
    setError("");
    setCrops("");
    setAnalysis("");
    setIsLoading(true);

    if (!soil || !season || !rainfall || !temp || !stateName) {
      setError("Please fill in all 5 fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/detailed-recommendation", {
        soil,
        season,
        stateName,
        rainfall: parseFloat(rainfall),
        temp: parseFloat(temp),
      });
      setCrops(response.data.crops);
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || "Error connecting to the server.");
      console.error("Recommendation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧠 Fetch AI-generated crop summary
  const fetchCropSummary = async (name) => {
    try {
      setIsSummaryLoading(true);
      const res = await axios.post("http://127.0.0.1:5000/crop-summary", { crop: name });
      setCropSummary(res.data);
    } catch (err) {
      console.error("Error fetching crop summary:", err);
      setCropSummary({
        summary: "No summary available.",
        soil: "N/A",
        duration: "N/A",
        market: "N/A",
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <motion.div
      className="recommender-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="recommender-card">
        <div className="header">
          <h2>🌾 Crop Recommendation System</h2>
          <p>Find the best crops for your soil, season, and weather conditions.</p>
        </div>

        {/* --- FORM --- */}
        <div className="form-grid">
          <div className="input-group">
            <label>Soil Type</label>
            <select value={soil} onChange={(e) => setSoil(e.target.value)}>
              <option value="">Select soil type</option>
              <option value="alluvial">Alluvial</option>
              <option value="black">Black (Regur)</option>
              <option value="red">Red</option>
              <option value="laterite">Laterite</option>
              <option value="desert">Desert</option>
              <option value="mountain">Mountain</option>
            </select>
          </div>

          <div className="input-group">
            <label>Season</label>
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="">Select season</option>
              <option value="kharif">Kharif (Monsoon)</option>
              <option value="rabi">Rabi (Winter)</option>
              <option value="zaid">Zaid (Summer)</option>
            </select>
          </div>

          <div className="input-group full-width">
            <label>State</label>
            <input
              type="text"
              placeholder="e.g., Delhi, Maharashtra"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Average Rainfall (mm)</label>
            <input
              type="number"
              placeholder="e.g., 700"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Average Temperature (°C)</label>
            <input
              type="number"
              placeholder="e.g., 25"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleGetRecommendations}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Get Recommendations"}
        </button>

        {/* --- RESULTS --- */}
        <div className="results-area">
          {error && <p className="error-box">{error}</p>}
          {isLoading && (
  <div className="loader-container">
    <motion.div
      className="loader-ring"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
    />
    <p className="loader-text">
      🌿 Analyzing soil, season, and weather data...
    </p>
  </div>
)}


          {crops && (
            <motion.div
              className="results-box enhanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="section-title">🌱 Recommended Crops</h3>

              <div className="crop-cards-grid">
                {(() => {
                  const lines = crops
                    .split(/\n|\.|\*/g)
                    .map((line) => line.trim())
                    .filter((line) =>
                      /🌾|🌻|🌿|🥜|🌽|🖤|💚|🟢|⚫|🍅|🍆|🥒|🌶️|🍠|🍓|🍋/u.test(line)
                    );

                  return lines.map((line, i) => {
                    const emoji = line.match(/[\p{Emoji}\u200d]+/gu)?.[0] || "🌱";
                    const name = line
                      .replace(/[\p{Emoji}\u200d]+/gu, "")
                      .replace(/[:\-–].*/g, "")
                      .trim();

                    const IDEAL = {
                      rice: { temp: [25, 35], rain: [1000, 2000] },
                      wheat: { temp: [10, 25], rain: [400, 700] },
                      maize: { temp: [20, 32], rain: [500, 1000] },
                      sorghum: { temp: [25, 35], rain: [400, 800] },
                      bajra: { temp: [28, 38], rain: [300, 700] },
                      okra: { temp: [22, 35], rain: [600, 1000] },
                      cucumber: { temp: [20, 30], rain: [500, 1000] },
                      sunflower: { temp: [20, 30], rain: [500, 800] },
                      groundnut: { temp: [25, 35], rain: [500, 1000] },
                    };

                    const key = name.toLowerCase().split(" ")[0];
                    const ideal = IDEAL[key] || { temp: [20, 35], rain: [400, 1200] };

                    const tempMid = (ideal.temp[0] + ideal.temp[1]) / 2;
                    const rainMid = (ideal.rain[0] + ideal.rain[1]) / 2;

                    const tempDiff = Math.abs(temp - tempMid) / ((ideal.temp[1] - ideal.temp[0]) / 2);
                    const rainDiff = Math.abs(rainfall - rainMid) / ((ideal.rain[1] - ideal.rain[0]) / 2);

                    const tempScore = Math.max(0, 100 - tempDiff * 60);
                    const rainScore = Math.max(0, 100 - rainDiff * 40);
                    const suitability = Math.max(30, Math.min(100, (tempScore * 0.6 + rainScore * 0.4)));

                    const getColor = (val) =>
                      val < 50 ? "#ef5350" : val < 70 ? "#ffca28" : "#66bb6a";

                    return (
                      <motion.div
                        key={i}
                        className="crop-card-animated"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        onMouseEnter={() => {
                          setHoveredCrop(name);
                          fetchCropSummary(name);
                        }}
                        onMouseLeave={() => setHoveredCrop(null)}
                      >
                        <div className="crop-emoji">{emoji}</div>
                        <div className="crop-info">
                          <p className="crop-name">
                            {name} <Sparkles className="info-icon" size={16} />
                          </p>

                          <div className="suitability-bar">
                            <motion.div
                              className="suitability-fill"
                              style={{
                                width: `${suitability}%`,
                                backgroundColor: getColor(suitability),
                              }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            ></motion.div>
                          </div>
                          <p className="suitability-text">
                            Suitability: {suitability.toFixed(0)}%
                          </p>
                        </div>

                        {/* 🌿 Enhanced AI Crop Summary Card */}
                        {hoveredCrop === name && (
                          <motion.div
                            className="crop-popup"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isSummaryLoading ? (
                              <p>Fetching summary...</p>
                            ) : (
                              <>
                                <p className="popup-summary">
                                  {cropSummary?.summary || "No summary available."}
                                </p>
                                <div className="popup-details">
                                  <p><Leaf size={14} /> <strong>Soil:</strong> {cropSummary?.soil || "N/A"}</p>
                                  <p><Timer size={14} /> <strong>Duration:</strong> {cropSummary?.duration || "N/A"}</p>
                                  <p><DollarSign size={14} /> <strong>Market:</strong> {cropSummary?.market || "N/A"}</p>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}

          {/* --- Agronomic Analysis --- */}
          {analysis && (
            <motion.div
              className="results-box enhanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="section-title">📘 Detailed Agronomic Analysis</h3>
              <div className="markdown">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default CropRecommender;
