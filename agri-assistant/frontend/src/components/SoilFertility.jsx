import React, { useState } from "react";
import axios from "axios";
import "./SoilFertility.css";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Sprout,
  MapPin,
  Beaker,
  Loader2,
  CheckCircle,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function SoilFertility() {
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [ph, setPh] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      if (!n || !p || !k || !ph || !organicMatter || !location) {
        throw new Error("⚠️ Please fill in all 6 fields.");
      }

      const res = await axios.post("http://127.0.0.1:5000/analyze-fertility", {
        n: parseFloat(n),
        p: parseFloat(p),
        k: parseFloat(k),
        ph: parseFloat(ph),
        organic_matter: parseFloat(organicMatter),
        location: location.trim(),
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error analyzing soil.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Color mapping based on nutrient levels ---
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "#e74c3c"; // Red
      case "medium":
        return "#f39c12"; // Orange
      case "high":
        return "#27ae60"; // Green
      default:
        return "#00a86b";
    }
  };

  // --- Generate chart data dynamically ---
  const chartData = data
    ? [
        {
          nutrient: "Nitrogen",
          value: parseFloat(n) || 0,
          level: data.levels.n_level,
          color: getLevelColor(data.levels.n_level),
          tip: "⚠️ Low Nitrogen — add urea or ammonium nitrate for healthy leaf growth.",
        },
        {
          nutrient: "Phosphorus",
          value: parseFloat(p) || 0,
          level: data.levels.p_level,
          color: getLevelColor(data.levels.p_level),
          tip: "⚠️ Low Phosphorus — use DAP or bone meal for better root development.",
        },
        {
          nutrient: "Potassium",
          value: parseFloat(k) || 0,
          level: data.levels.k_level,
          color: getLevelColor(data.levels.k_level),
          tip: "⚠️ Low Potassium — apply muriate of potash for disease resistance.",
        },
        {
          nutrient: "pH",
          value: parseFloat(ph) || 0,
          level: data.levels.ph_level,
          color: getLevelColor(data.levels.ph_level),
          tip: "⚠️ Imbalanced pH — apply lime for acidic soil or gypsum for alkaline soil.",
        },
        {
          nutrient: "Organic Matter",
          value: parseFloat(organicMatter) || 0,
          level: "medium",
          color: "#00a86b",
          tip: "Increase organic matter using compost or green manure.",
        },
      ]
    : [];

  // Determine overall soil health
  const overallColor =
    data &&
    (Object.values(data.levels).includes("Low")
      ? "#e74c3c"
      : Object.values(data.levels).includes("Medium")
      ? "#f39c12"
      : "#27ae60");

  // --- Custom Tooltip for radar chart ---
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const nutrient = payload[0].payload;
      return (
        <div className="tooltip-box">
          <strong>{nutrient.nutrient}</strong> — {nutrient.level}
          {nutrient.level.toLowerCase() === "low" && (
            <p className="tooltip-warning">{nutrient.tip}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fertility-wrapper">
      <motion.div
        className="fertility-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header">
          <FlaskConical className="icon" />
          <h2>Soil Fertility Analysis</h2>
          <p>Enter your soil parameters for detailed AI analysis</p>
        </div>

        {/* --- Form --- */}
        <form onSubmit={handleAnalyze} className="form-grid">
          <div className="form-group">
            <label><Beaker /> Nitrogen (kg/ha)</label>
            <input type="number" value={n} onChange={(e) => setN(e.target.value)} placeholder="e.g. 120" />
          </div>
          <div className="form-group">
            <label><Beaker /> Phosphorus (kg/ha)</label>
            <input type="number" value={p} onChange={(e) => setP(e.target.value)} placeholder="e.g. 50" />
          </div>
          <div className="form-group">
            <label><Beaker /> Potassium (kg/ha)</label>
            <input type="number" value={k} onChange={(e) => setK(e.target.value)} placeholder="e.g. 75" />
          </div>
          <div className="form-group">
            <label><FlaskConical /> pH Level</label>
            <input type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="e.g. 6.5" />
          </div>
          <div className="form-group">
            <label><Sprout /> Organic Matter (%)</label>
            <input type="number" step="0.1" value={organicMatter} onChange={(e) => setOrganicMatter(e.target.value)} placeholder="e.g. 1.2" />
          </div>
          <div className="form-group">
            <label><MapPin /> Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nagpur, India" />
          </div>

          <motion.button
            type="submit"
            className="submit-btn"
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="spin" /> Analyzing...
              </>
            ) : (
              "Analyze Soil"
            )}
          </motion.button>
        </form>

        {error && <div className="error-box">{error}</div>}

        {data && (
          <motion.div className="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3>🌿 Analysis Complete</h3>
            <p className="summary">
              <strong>{data.location}</strong> — {data.weather.temperature}°C, {data.weather.condition}
            </p>

            <div className="levels-grid">
              {["n", "p", "k", "ph"].map((key) => (
                <div className="level-card" key={key}>
                  <p><strong>{key.toUpperCase()}:</strong></p>
                  <span className={`level-tag level-${data.levels[`${key}_level`].toLowerCase()}`}>
                    {data.levels[`${key}_level`]}
                  </span>
                </div>
              ))}
            </div>

            {/* --- Interactive Radar Chart --- */}
            <div className="chart-section">
              <h4><BarChart3 /> Soil Nutrient Balance</h4>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={overallColor} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={overallColor} stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="nutrient" />
                  <PolarRadiusAxis angle={30} />
                  <Radar
                    name="Soil Levels"
                    dataKey="value"
                    stroke={overallColor}
                    fill="url(#balanceGradient)"
                    fillOpacity={0.6}
                    animationBegin={200}
                    animationDuration={1200}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>

              {/* Pulsing alerts for low nutrients */}
              {chartData
                .filter((item) => item.level.toLowerCase() === "low")
                .map((item, i) => (
                  <motion.div
                    key={i}
                    className="pulse-alert"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  >
                    <AlertTriangle className="pulse-icon" /> {item.nutrient} Deficiency
                  </motion.div>
                ))}
            </div>

            <h4>Recommendations</h4>
            <ul className="recommendations">
              {data.recommendations.map((rec, i) => (
                <li key={i}>
                  <CheckCircle className="check-icon" /> {rec}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default SoilFertility;
