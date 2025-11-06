import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MarketPrices.css'; // This will hold all the CSS from your <style> tag

// --- API Configuration ---
const API_KEY = "579b464db66ec23bdd0000018d96f019a8534f75494375ed28255257";
const DATASET_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const API_URL = `https://api.data.gov.in/resource/${DATASET_ID}?api-key=${API_KEY}&format=json&limit=1000`;

function MarketPrices() {
    // --- State Variables ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Data state
    const [allPrices, setAllPrices] = useState([]); // Master list of all records
    const [filteredPrices, setFilteredPrices] = useState([]); // List to display in the table

    // Dropdown options state
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [stateDistrictMap, setStateDistrictMap] = useState({});

    // Selected filter values state
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedCommodity, setSelectedCommodity] = useState("");

    // --- Data Fetching ---
    const fetchPrices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_URL);
            if (!res.data.records || res.data.records.length === 0) {
                throw new Error("No records found from the API. Try again later.");
            }
            
            const records = res.data.records;
            setAllPrices(records);
            setFilteredPrices(records); // Show all data initially

            // --- Build Dropdown Data ---
            const stateSet = new Set();
            const commoditySet = new Set();
            const tempMap = {};

            records.forEach(item => {
                if (item.state) stateSet.add(item.state);
                if (item.commodity) commoditySet.add(item.commodity);
                
                if (item.state && item.district) {
                    if (!tempMap[item.state]) {
                        tempMap[item.state] = new Set();
                    }
                    tempMap[item.state].add(item.district);
                }
            });

            // Convert Sets to sorted Arrays for React
            setStates([...stateSet].sort());
            setCommodities([...commoditySet].sort());
            
            // Convert the map's Sets to sorted Arrays
            const finalMap = {};
            for (const state in tempMap) {
                finalMap[state] = [...tempMap[state]].sort();
            }
            setStateDistrictMap(finalMap);

        } catch (err) {
            setError(err.message || "Failed to fetch market prices.");
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback ensures this function doesn't change on re-renders

    // Run fetchPrices once on component mount
    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    // --- Event Handlers ---

    // Handles state selection, updates district dropdown
    const handleStateChange = (e) => {
        const state = e.target.value;
        setSelectedState(state);
        setSelectedDistrict(""); // Reset district
        
        if (state && stateDistrictMap[state]) {
            setDistricts(stateDistrictMap[state]);
        } else {
            setDistricts([]); // Clear districts if no state selected
        }
    };

    // Applies all selected filters to the master list
    const applyFilters = () => {
        const filtered = allPrices.filter(item =>
            (!selectedState || item.state === selectedState) &&
            (!selectedDistrict || item.district === selectedDistrict) &&
            (!selectedCommodity || item.commodity === selectedCommodity)
        );
        setFilteredPrices(filtered);
    };

    // --- Render JSX ---
    return (
        <div className="prices-container">
            <div className="prices-card">
                <h2>🌾 India Market Prices</h2>
                <p>Check latest <b>Agmarknet</b> commodity prices across Indian markets.</p>

                {/* --- Search Section --- */}
                <div className="search-section">
                    <select value={selectedState} onChange={handleStateChange}>
                        <option value="">-- Select State --</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    
                    <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                        <option value="">-- Select District --</option>
                        {districts.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>

                    <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)}>
                        <option value="">-- Select Commodity --</option>
                        {commodities.map(comm => (
                            <option key={comm} value={comm}>{comm}</option>
                        ))}
                    </select>
                    
                    <button onClick={applyFilters}>🔍 Search</button>
                    <button className="refresh-btn" onClick={fetchPrices}>🔄 Refresh</button>
                </div>

                {/* --- Status/Loader/Error --- */}
                {isLoading && <div className="loader">Loading prices...</div>}
                
                {error && <div className="error-box">❌ {error}</div>}
                
                {!isLoading && !error && (
                    <div id="status">
                        ✅ Displaying <b>{filteredPrices.length}</b> of <b>{allPrices.length}</b> records.
                    </div>
                )}

                {/* --- Data Table --- */}
                {!isLoading && !error && (
                    <table className="prices-table">
                        <thead>
                            <tr>
                                <th>Commodity</th>
                                <th>State</th>
                                <th>District</th>
                                <th>Market</th>
                                <th>Price (₹/Quintal)</th>
                                <th>Arrival Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: '#777' }}>
                                        No results found for the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredPrices.map((item, index) => (
                                    // Using a more robust key than just index
                                    <tr key={`${item.market}-${item.commodity}-${item.arrival_date}-${index}`}>
                                        <td>{item.commodity || "-"}</td>
                                        <td>{item.state || "-"}</td>
                                        <td>{item.district || "-"}</td>
                                        <td>{item.market || "-"}</td>
                                        <td className="price-cell">₹ {item.modal_price || "-"}</td>
                                        <td>{item.arrival_date || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default MarketPrices;