import React, { useState } from 'react';
import axios from 'axios';
import './SoilFertility.css'; // We will create this new CSS file

// A new icon for this component
const ScienceIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="science-icon" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19.428 15.428a2 2 0 00-2.828-2.828l-3.572 3.572a2 2 0 00-2.828 2.828l3.572-3.572zM14.572 10.572l-3.572 3.572a2 2 0 002.828 2.828l3.572-3.572a2 2 0 00-2.828-2.828z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 21a9 9 0 100-18 9 9 0 000 18z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M10 11V6m0 8v.01" 
    />
  </svg>
);


function SoilFertility() {
  // --- State for new form inputs ---
  const [n, setN] = useState('');
  const [p, setP] = useState('');
  const [k, setK] = useState('');
  const [ph, setPh] = useState('');
  const [organicMatter, setOrganicMatter] = useState('');
  const [location, setLocation] = useState(''); // Use 'location' instead of 'city'

  // --- State for results ---
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Validate all fields
      if (!n || !p || !k || !ph || !organicMatter || !location) {
        throw new Error("Please fill in all 6 fields.");
      }

      // Send the data to a new Flask endpoint
      const res = await axios.post("http://127.0.0.1:5000/analyze-fertility", {
        n: parseFloat(n),
        p: parseFloat(p),
        k: parseFloat(k),
        ph: parseFloat(ph),
        organic_matter: parseFloat(organicMatter),
        location: location
      });
      
      setData(res.data);

    } catch (err) {
      setError(err.response ? err.response.data.error : err.message || "Error analyzing soil.");
      console.error("Soil analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fertility-card">
      <form onSubmit={handleAnalyze}>
        <div className="card-header">
          <ScienceIcon />
          <h2 className="card-title">Soil Fertility Analysis</h2>
          <p className="card-subtitle">
            Enter your soil parameters for detailed analysis
          </p>
        </div>

        {/* --- Form Grid --- */}
        <div className="form-grid-npk">
          {/* Nitrogen */}
          <div className="form-group">
            <label htmlFor="n" className="form-label">Nitrogen (kg/ha)</label>
            <input
              type="number" id="n" step="0.1"
              placeholder="e.g. 120"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="form-input"
            />
          </div>
          
          {/* Phosphorus */}
          <div className="form-group">
            <label htmlFor="p" className="form-label">Phosphorus (kg/ha)</label>
            <input
              type="number" id="p" step="0.1"
              placeholder="e.g. 50"
              value={p}
              onChange={(e) => setP(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Potassium */}
          <div className="form-group">
            <label htmlFor="k" className="form-label">Potassium (kg/ha)</label>
            <input
              type="number" id="k" step="0.1"
              placeholder="e.g. 75"
              value={k}
              onChange={(e) => setK(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* --- Second Grid for pH, OM, Location --- */}
        <div className="form-grid-secondary">
          <div className="form-group">
            <label htmlFor="ph" className="form-label">pH Level</label>
            <input
              type="number" id="ph" step="0.1"
              placeholder="e.g. 6.5"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="om" className="form-label">Organic Matter (%)</label>
            <input
              type="number" id="om" step="0.1"
              placeholder="e.g. 1.2"
              value={organicMatter}
              onChange={(e) => setOrganicMatter(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text" id="location"
              placeholder="e.g. Nagpur, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Analyzing..." : "Analyze Soil"}
        </button>
      </form>

      {/* --- Results Display --- */}
      <div className="results-container">
        {error && (
          <div className="error-box">
            <p className="error-title">Analysis Failed</p>
            <p className="error-message">{error}</p>
          </div>
        )}
        
        {/* The new API sends back a complex object */}
        {data && (
          <div className="results-box">
            <h3 className="results-title">Analysis Complete</h3>
            <p className="results-summary">
              Location: <strong>{data.location}</strong> | 
              Weather: <strong>{data.weather.temperature}°C, {data.weather.condition}</strong>
            </p>
            
            <ul className="results-list">
              <li>
                <strong>Nitrogen (N):</strong> 
                <span className={`level-${data.levels.n_level.toLowerCase()}`}>
                  {data.levels.n_level}
                </span> ({n} kg/ha)
              </li>
              <li>
                <strong>Phosphorus (P):</strong> 
                <span className={`level-${data.levels.p_level.toLowerCase()}`}>
                  {data.levels.p_level}
                </span> ({p} kg/ha)
              </li>
              <li>
                <strong>Potassium (K):</strong> 
                <span className={`level-${data.levels.k_level.toLowerCase()}`}>
                  {data.levels.k_level}
                </span> ({k} kg/ha)
              </li>
              <li>
                <strong>pH Level:</strong> 
                <span className={`level-${data.levels.ph_level.toLowerCase()}`}>
                  {data.levels.ph_level}
                </span> ({ph})
              </li>
            </ul>

            <h4 className="recommendation-title">Recommendations</h4>
            <ul className="recommendation-list">
              {data.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SoilFertility;