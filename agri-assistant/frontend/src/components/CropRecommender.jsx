import React, { useState } from 'react';
import './CropRecommender.css'; // This imports the CSS you just provided

// --- THIS IS YOUR CROP DATABASE ---
// This logic matches your form inputs.
const cropDatabase = [
    {
        name: "Rice (Paddy)",
        soil: ["alluvial", "red", "clayey"],
        season: ["kharif"],
        minTemp: 20, maxTemp: 35,
        minRainfall: 1500, maxRainfall: 3000
    },
    {
        name: "Wheat",
        soil: ["alluvial", "black", "loamy"],
        season: ["rabi"],
        minTemp: 10, maxTemp: 25,
        minRainfall: 500, maxRainfall: 750
    },
    {
        name: "Cotton",
        soil: ["black", "red", "alluvial"],
        season: ["kharif"],
        minTemp: 21, maxTemp: 30,
        minRainfall: 500, maxRainfall: 1000
    },
    {
        name: "Sugarcane",
        soil: ["alluvial", "black", "red", "loamy"],
        season: ["kharif", "zaid"], // Can be a 12-18 month crop
        minTemp: 20, maxTemp: 32,
        minRainfall: 1500, maxRainfall: 2500
    },
    {
        name: "Maize (Corn)",
        soil: ["alluvial", "red", "laterite", "loamy"],
        season: ["kharif", "rabi"], // Grown in both seasons in different regions
        minTemp: 21, maxTemp: 27,
        minRainfall: 500, maxRainfall: 800
    },
    {
        name: "Watermelon",
        soil: ["alluvial", "desert", "sandy"],
        season: ["zaid"],
        minTemp: 25, maxTemp: 35,
        minRainfall: 400, maxRainfall: 600
    },
    {
        name: "Mustard",
        soil: ["alluvial", "loamy"],
        season: ["rabi"],
        minTemp: 10, maxTemp: 25,
        minRainfall: 300, maxRainfall: 500
    },
    {
        name: "Groundnut (Peanut)",
        soil: ["sandy", "loamy", "red", "black"],
        season: ["kharif", "rabi"],
        minTemp: 25, maxTemp: 30,
        minRainfall: 500, maxRainfall: 750
    },
    {
        name: "Soybean",
        soil: ["black", "loamy", "alluvial"],
        season: ["kharif"],
        minTemp: 20, maxTemp: 30,
        minRainfall: 600, maxRainfall: 1000
    },
    {
        name: "Chickpea (Gram)",
        soil: ["loamy", "sandy", "black"],
        season: ["rabi"],
        minTemp: 15, maxTemp: 25,
        minRainfall: 400, maxRainfall: 600
    },
    {
        name: "Potato",
        soil: ["sandy", "loamy", "alluvial"],
        season: ["rabi"],
        minTemp: 15, maxTemp: 25,
        minRainfall: 500, maxRainfall: 700
    },
    {
        name: "Onion",
        soil: ["loamy", "red", "alluvial"],
        season: ["rabi", "kharif"],
        minTemp: 15, maxTemp: 30,
        minRainfall: 600, maxRainfall: 800
    },
    {
        name: "Tomato",
        soil: ["sandy", "loamy", "red", "black"],
        season: ["rabi", "zaid"],
        minTemp: 20, maxTemp: 30,
        minRainfall: 600, maxRainfall: 800
    },
    {
        name: "Jowar (Sorghum)",
        soil: ["sandy", "loamy", "black", "red"],
        season: ["kharif", "rabi"],
        minTemp: 25, maxTemp: 32,
        minRainfall: 400, maxRainfall: 600
    },
    {
        name: "Bajra (Pearl Millet)",
        soil: ["sandy", "loamy", "desert"],
        season: ["kharif"],
        minTemp: 25, maxTemp: 35,
        minRainfall: 300, maxRainfall: 500
    },
    {
        name: "Moong Dal (Green Gram)",
        soil: ["sandy", "loamy", "red"],
        season: ["kharif", "zaid"],
        minTemp: 25, maxTemp: 35,
        minRainfall: 400, maxRainfall: 600
    },
    {
        name: "Masoor Dal (Lentil)",
        soil: ["alluvial", "loamy", "black"],
        season: ["rabi"],
        minTemp: 15, maxTemp: 25,
        minRainfall: 300, maxRainfall: 450
    },
    {
        name: "Brinjal (Eggplant)",
        soil: ["loamy", "alluvial", "red"],
        season: ["kharif", "rabi", "zaid"], // Can be grown year-round
        minTemp: 20, maxTemp: 32,
        minRainfall: 600, maxRainfall: 900
    },
    {
        name: "Tea",
        soil: ["loamy", "laterite", "mountain"], // Needs acidic soil
        season: ["kharif"], // Main growing season
        minTemp: 20, maxTemp: 30,
        minRainfall: 1500, maxRainfall: 2500
    },
    {
        name: "Coffee",
        soil: ["loamy", "red", "laterite", "mountain"], // Needs acidic soil
        season: ["kharif"], // Main growing season
        minTemp: 20, maxTemp: 28,
        minRainfall: 1500, maxRainfall: 2000
    }
];


function CropRecommender() {
    // --- State for form inputs ---
    const [soil, setSoil] = useState('');
    const [season, setSeason] = useState('');
    const [stateName, setStateName] = useState('');
    const [rainfall, setRainfall] = useState('');
    const [temp, setTemp] = useState('');

    // --- State for results ---
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState('');

    const handleGetRecommendations = () => {
        // 1. Clear previous results
        setError('');
        setRecommendations([]);

        // 2. Validate inputs
        if (!soil || !season || !rainfall || !temp) {
            setError("Please fill in all fields.");
            return;
        }

        // 3. Parse numbers
        const rain = parseFloat(rainfall);
        const temperature = parseFloat(temp);

        // 4. Filter the database based on the inputs
        const results = cropDatabase.filter(crop => {
            const soilMatch = crop.soil.includes(soil);
            const seasonMatch = crop.season.includes(season);
            const rainMatch = rain >= crop.minRainfall && rain <= crop.maxRainfall;
            const tempMatch = temperature >= crop.minTemp && temperature <= crop.maxTemp;
            
            // All conditions must be true
            return soilMatch && seasonMatch && rainMatch && tempMatch;
        });

        // 5. Display the results
        if (results.length === 0) {
            setError("No crops match your exact conditions. Try adjusting the values.");
        } else {
            setRecommendations(results);
        }
    };

    return (
        <div className="recommender-container">
            <h2>Crop Recommendation System</h2>
            <p>Find the best crops for your conditions</p>

            {/* --- THIS IS THE NEW GRID WRAPPER --- */}
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
                
                {/* --- This class makes the State input span 2 columns --- */}
                <div className="input-group grid-col-span-2">
                    <label htmlFor="state">State</label>
                    <input 
                        type="text" 
                        id="state" 
                        placeholder="e.g., Maharashtra, Punjab" 
                        value={stateName}
                        onChange={e => setStateName(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="rainfall">Average Rainfall (mm)</label>
                    <input 
                        type="number" 
                        id="rainfall" 
                        placeholder="e.g., 700" 
                        value={rainfall}
                        onChange={e => setRainfall(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="temperature">Average Temperature (°C)</label>
                    <input 
                        type="number" 
                        id="temperature" 
                        placeholder="e.g., 25" 
                        value={temp}
                        onChange={e => setTemp(e.target.value)}
                    />
                </div>
            </div>
            {/* --- END OF GRID WRAPPER --- */}


            {/* This button uses the new class from your CSS */}
            <button onClick={handleGetRecommendations} className="btn-full-width">
                Get Recommendations
            </button>

            <div id="results">
                {/* --- Display Errors --- */}
                {error && <p className="error-message">{error}</p>}

                {/* --- Display Results --- */}
                {recommendations.length > 0 && (
                    <>
                        <h3>Recommended Crops:</h3>
                        <ul>
                            {recommendations.map(crop => (
                                <li key={crop.name}>{crop.name}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

export default CropRecommender;