import React, { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Info,
  Droplets,
  Leaf,
  FlaskConical,
  Sparkles,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./FertilizerCalculator.css";

function FertilizerCalculator() {
  const [mode, setMode] = useState("soil");
  const [crop, setCrop] = useState("");
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [yieldTarget, setYieldTarget] = useState(20);
  const [irrigation, setIrrigation] = useState("irrigated");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resultRef = useRef(null);

  const cropHints = {
    rice: "High N demand, sensitive to standing water.",
    wheat: "Needs N in 3 splits, prefers neutral pH.",
    maize: "High nutrient user, split N in 3–4 doses.",
    sugarcane: "Very high N & K requirement.",
    cotton: "Prefers 110:15:35 NPK under irrigated.",
    potato: "Requires high K for tuber quality.",
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const payload =
        mode === "soil"
          ? {
              n: parseFloat(n),
              p: parseFloat(p),
              k: parseFloat(k),
              crop: crop.toLowerCase(),
            }
          : {
              crop: crop.toLowerCase(),
              yield_target: yieldTarget,
              irrigation,
            };

      const res = await axios.post(
        "http://127.0.0.1:5000/smart-fertilizer",
        payload
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error calculating fertilizer.");
    } finally {
      setIsLoading(false);
    }
  };

  /* 🧾 PDF Download Function */
  const handleDownloadPDF = async () => {
    const element = resultRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("🌿 Krishi-Mithra Fertilizer Report", 14, 20);

    const date = new Date().toLocaleString();
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${date}`, 14, 26);

    pdf.addImage(imgData, "PNG", 10, 32, pageWidth - 20, pageHeight);
    pdf.save(`Fertilizer_Report_${crop || "Field"}.pdf`);
  };

  return (
    <motion.div
      className="calc-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="calc-card">
        <div className="card-header">
          <h2>🌾 Fertilizer Calculator</h2>
          <p>Smartly calculate fertilizer need (kg/ha) for your field</p>
        </div>

        {/* MODE TOGGLE */}
        <div className="mode-toggle">
          <button
            className={mode === "soil" ? "active" : ""}
            onClick={() => setMode("soil")}
          >
            Soil Test Mode
          </button>
          <button
            className={mode === "smart" ? "active" : ""}
            onClick={() => setMode("smart")}
          >
            Smart Mode (No Soil Test)
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleCalculate}>
          <div className="form-group">
            <label htmlFor="crop">Target Crop</label>
            <input
              type="text"
              id="crop"
              placeholder="Type your crop (e.g., Tomato, Onion, Groundnut)"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              required
            />
            {crop && cropHints[crop.toLowerCase()] && (
              <p className="crop-tip">
                <Info size={14} /> {cropHints[crop.toLowerCase()]}
              </p>
            )}
          </div>

          {mode === "soil" && (
            <div className="form-grid">
              {[
                {
                  label: "Soil Nitrogen (kg/ha)",
                  value: n,
                  setter: setN,
                  placeholder: "e.g. 50",
                },
                {
                  label: "Soil Phosphorus (kg/ha)",
                  value: p,
                  setter: setP,
                  placeholder: "e.g. 25",
                },
                {
                  label: "Soil Potassium (kg/ha)",
                  value: k,
                  setter: setK,
                  placeholder: "e.g. 40",
                },
              ].map((input, i) => (
                <div className="form-group" key={i}>
                  <label>{input.label}</label>
                  <input
                    type="number"
                    placeholder={input.placeholder}
                    value={input.value}
                    onChange={(e) => input.setter(e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "smart" && (
            <div className="smart-mode-inputs">
              <div className="form-group">
                <label>Yield Target (q/ha)</label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={yieldTarget}
                  onChange={(e) => setYieldTarget(e.target.value)}
                />
                <p>{yieldTarget} quintals/ha</p>
              </div>

              <div className="form-group">
                <label>Irrigation Type</label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                >
                  <option value="irrigated">Irrigated</option>
                  <option value="rainfed">Rainfed</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
        </form>

        {/* RESULTS */}
        {(error || result) && (
          <div className="results-container" ref={resultRef}>
            {error && <div className="error-box">{error}</div>}

            {result && (
              <motion.div
                className="results-box enhanced"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="results-title fancy-title">
                  📊 Fertilizer Recommendation (per Hectare)
                </h3>

                {/* FERTILIZER RESULTS */}
                <div className="fertilizer-results">
                  {[
                    {
                      label: "Urea (46% N)",
                      value: result.urea_kg,
                      icon: <Droplets className="icon" />,
                    },
                    {
                      label: "DAP (18% N, 46% P)",
                      value: result.dap_kg,
                      icon: <Leaf className="icon" />,
                    },
                    {
                      label: "MOP (60% K)",
                      value: result.mop_kg,
                      icon: <FlaskConical className="icon" />,
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="fertilizer-item animated"
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                    >
                      <div className="fert-icon">{item.icon}</div>
                      <div className="fert-details">
                        <strong>{item.label}</strong>
                        <span className="fert-value">
                          {item.value} kg{" "}
                          <small>({(item.value / 50).toFixed(1)} bags)</small>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 💰 COST SECTION */}
                <div className="cost-section">
                  <h4 className="cost-title">
                    💰 Estimated Fertilizer Cost (per Hectare)
                  </h4>
                  {(() => {
                    const rates = { urea: 6, dap: 25, mop: 20 };
                    const ureaCost = (result.urea_kg * rates.urea).toFixed(0);
                    const dapCost = (result.dap_kg * rates.dap).toFixed(0);
                    const mopCost = (result.mop_kg * rates.mop).toFixed(0);
                    const total = (
                      +ureaCost +
                      +dapCost +
                      +mopCost
                    ).toLocaleString();

                    return (
                      <>
                        <div className="cost-breakdown">
                          <div className="cost-item">
                            <span>🌿 Urea:</span> ₹{ureaCost}
                          </div>
                          <div className="cost-item">
                            <span>🧪 DAP:</span> ₹{dapCost}
                          </div>
                          <div className="cost-item">
                            <span>🧂 MOP:</span> ₹{mopCost}
                          </div>
                        </div>
                        <div className="cost-total">
                          <strong>Total Estimated Cost:</strong> ₹{total} / ha
                        </div>
                        <p className="cost-note">
                          *Rates assumed: ₹6/kg Urea, ₹25/kg DAP, ₹20/kg MOP.
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* 💾 DOWNLOAD BUTTON */}
                <motion.button
                  className="download-pdf-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPDF}
                >
                  <FileDown size={18} /> Download PDF Report
                </motion.button>

                {/* RECOMMENDATIONS */}
                <div className="recommendations-section">
                  <h4 className="recommendation-title">
                    💡 Expert Recommendations
                  </h4>
                  <ul className="recommendation-list pretty">
                    {result.recommendations?.map((rec, index) => (
                      <motion.li
                        key={index}
                        className="rec-line"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <Sparkles className="spark" /> {rec}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default FertilizerCalculator;
