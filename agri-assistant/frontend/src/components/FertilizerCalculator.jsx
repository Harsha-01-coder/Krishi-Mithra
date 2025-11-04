import React, { useState } from 'react';
import axios from 'axios';
import './FertilizerCalculator.css'; // We will create this

function FertilizerCalculator() {
  const [n, setN] = useState('');
  const [p, setP] = useState('');
  const [k, setK] = useState('');
  const [crop, setCrop] = useState('');
  
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // This list *must* match the keys in your CROP_DATA in app.py
  const cropOptions = ["rice", "wheat", "maize", "sugarcane", "cotton", "potato"];

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("http://127.0.0.1:5000/calculate-fertilizer", {
        n: parseFloat(n),
        p: parseFloat(p),
        k: parseFloat(k),
        crop: crop
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error calculating fertilizer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="calc-container">
      <div className="calc-card">
        <form onSubmit={handleCalculate}>
          <div className="card-header">
            <h2>Fertilizer Calculator</h2>
            <p>Calculate exact fertilizer needed (in kg/hectare)</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="n">Soil Nitrogen (kg/ha)</label>
              <input
                type="number" id="n" step="0.1"
                placeholder="e.g. 50"
                value={n}
                onChange={(e) => setN(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="p">Soil Phosphorus (kg/ha)</label>
              <input
                type="number" id="p" step="0.1"
                placeholder="e.g. 25"
                value={p}
                onChange={(e) => setP(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="k">Soil Potassium (kg/ha)</label>
              <input
                type="number" id="k" step="0.1"
                placeholder="e.g. 40"
                value={k}
                onChange={(e) => setK(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="crop">Target Crop</label>
            <select id="crop" value={crop} onChange={e => setCrop(e.target.value)} required>
              <option value="" disabled>Select your crop</option>
              {cropOptions.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
        </form>

        <div className="results-container">
          {error && <div className="error-box">{error}</div>}
          
          {result && (
            <div className="results-box">
              <h3 className="results-title">Fertilizer Required (per Hectare)</h3>
              <ul className="results-list">
                <li><strong>Urea (46% N):</strong> <span>{result.urea_kg} kg</span></li>
                <li><strong>DAP (18% N, 46% P):</strong> <span>{result.dap_kg} kg</span></li>
                <li><strong>MOP (60% K):</strong> <span>{result.mop_kg} kg</span></li>
              </ul>
              <h4 className="recommendation-title">Notes</h4>
              <ul className="recommendation-list">
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FertilizerCalculator;