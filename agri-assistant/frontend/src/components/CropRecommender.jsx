import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // <-- This is correct
import './CropRecommender.css'; 

function CropRecommender() {
    // --- State for form inputs (unchanged) ---
    const [soil, setSoil] = useState('');
    const [season, setSeason] = useState('');
    const [stateName, setStateName] = useState('');
    const [rainfall, setRainfall] = useState('');
    const [temp, setTemp] = useState('');

    // --- State for results (unchanged) ---
    const [crops, setCrops] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- handleGetRecommendations function is unchanged ---
    const handleGetRecommendations = async () => {
        setError('');
        setCrops('');
        setAnalysis('');
        setIsLoading(true);

        if (!soil || !season || !rainfall || !temp || !stateName) {
            setError("Please fill in all 5 fields.");
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.post("http://127.0.0.1:5000/detailed-recommendation", {
                soil: soil,
                season: season,
                stateName: stateName,
                rainfall: parseFloat(rainfall),
                temp: parseFloat(temp)
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

    return (
        <div className="recommender-container">
            <h2>Crop Recommendation System</h2>
            <p>Find the best crops for your conditions</p>

            {/* --- Form grid is unchanged --- */}
            <div className="form-grid">
                <div className="input-group">
                    <label htmlFor="soil-type">Soil Type</label>
                    <select id="soil-type" value={soil} onChange={e => setSoil(e.target.value)}>
                        <option value="" disabled>Select soil type</option>
                        <option value="alluvial">Alluvial</option>
                        <option value="black">Black (Regur)</option>
                        <option value="red">Red</option>
                        <option value="laterite">Laterite</option>
                        <option value="desert">Desert</option>
                        <option value="mountain">Mountain</option>
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="season">Season</label>
                    <select id="season" value={season} onChange={e => setSeason(e.target.value)}>
                        <option value="" disabled>Select season</option>
                        <option value="kharif">Kharif (Monsoon)</option>
                        <option value="rabi">Rabi (Winter)</option>
                        <option value="zaid">Zaid (Summer)</option>
                    </select>
                </div>
                <div className="input-group grid-col-span-2">
                    <label htmlFor="state">State</label>
                    <input 
                        type="text" id="state" placeholder="e.g., Maharashtra, Punjab" 
                        value={stateName} onChange={e => setStateName(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="rainfall">Average Rainfall (mm)</label>
                    <input 
                        type="number" id="rainfall" placeholder="e.g., 700" 
                        value={rainfall} onChange={e => setRainfall(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="temperature">Average Temperature (°C)</label>
                    <input 
                        type="number" id="temperature" placeholder="e.g., 25" 
                        value={temp} onChange={e => setTemp(e.target.value)}
                    />
                </div>
            </div>
            
            <button onClick={handleGetRecommendations} className="btn-full-width" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Get Recommendations'}
            </button>


            <div id="results">
                {error && <p className="error-message">{error}</p>}
                {isLoading && <div className="loader">Analyzing conditions...</div>}

                {crops && (
                    <div className="results-box">
                        <h3 className="results-title">Recommended Crops</h3>
                        {/* --- FIX 1: Wrap in a div with the class --- */}
                        <div className="crops-list">
                            <ReactMarkdown>{crops}</ReactMarkdown>
                        </div>
                    </div>
                )}
                
                {analysis && (
                    <div className="results-box">
                        {/* --- FIX 2: Wrap in a div with the class --- */}
                        <div className="detailed-analysis">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CropRecommender;