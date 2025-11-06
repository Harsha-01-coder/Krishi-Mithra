import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './MarketPrices.css'; // This will hold all the CSS from your <style> tag

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- API Configuration (Keep the larger limit) ---
const API_KEY = "579b464db66ec23bdd0000018d96f019a8534f75494375ed28255257";
const DATASET_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const API_URL = `https://api.data.gov.in/resource/${DATASET_ID}?api-key=${API_KEY}&format=json&limit=5000`;

function MarketPrices() {
    // --- State Variables ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // For a total fetch failure
    const [activeView, setActiveView] = useState('changes');

    // --- NEW: Specific error for the comparison feature ---
    const [comparisonError, setComparisonError] = useState(null);

    // Data state
    const [allPrices, setAllPrices] = useState([]);
    const [filteredPrices, setFilteredPrices] = useState([]);
    
    const [comparisonData, setComparisonData] = useState([]);
    const [latestDate, setLatestDate] = useState(null);
    const [previousDate, setPreviousDate] = useState(null);

    // Dropdown options state
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [stateDistrictMap, setStateDistrictMap] = useState({});

    // Selected filter values state
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedCommodity, setSelectedCommodity] = useState("");

    // --- Data Processing Function (Same as before) ---
    const processPriceChanges = (records) => {
        const allDates = [...new Set(records.map(r => r.arrival_date))].sort().reverse();
        const newLatestDate = allDates[0];
        const newPreviousDate = allDates[1];

        if (!newLatestDate || !newPreviousDate) {
            // This will be caught and set as the comparisonError
            throw new Error("Not enough data to compare (need at least 2 days).");
        }

        setLatestDate(newLatestDate);
        setPreviousDate(newPreviousDate);

        const latestPrices = {};
        const previousPrices = {};
        records.forEach(r => {
            const key = `${r.market}-${r.commodity}`;
            if (r.arrival_date === newLatestDate) latestPrices[key] = parseFloat(r.modal_price);
            if (r.arrival_date === newPreviousDate) previousPrices[key] = parseFloat(r.modal_price);
        });

        const comparisons = [];
        for (const key in latestPrices) {
            if (key in previousPrices) {
                const latest = latestPrices[key];
                const previous = previousPrices[key];
                
                if (latest > 0 && previous > 0) {
                    const change = latest - previous;
                    const changePercent = (change / previous) * 100;
                    const [market, commodity] = key.split('-');
                    
                    comparisons.push({
                        key, market, commodity, latestPrice: latest, previousPrice: previous,
                        change: change, changePercent: parseFloat(changePercent.toFixed(2)),
                        ...records.find(r => `${r.market}-${r.commodity}` === key)
                    });
                }
            }
        }
        setComparisonData(comparisons.sort((a, b) => b.changePercent - a.changePercent));
    };

    // --- Data Fetching (HEAVILY MODIFIED) ---
    const fetchPrices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setComparisonError(null); // Reset errors
        try {
            const res = await axios.get(API_URL);
            if (!res.data.records || res.data.records.length === 0) {
                throw new Error("No records found from the API. Try again later.");
            }
            
            const records = res.data.records.filter(r => r.modal_price && r.modal_price > 0);
            setAllPrices(records);
            setFilteredPrices(records); // Set data for "All Data" tab

            // --- FIX: Build Dropdown Data *IMMEDIATELY* ---
            // This code now runs *before* the price comparison
            const stateSet = new Set();
            const commoditySet = new Set();
            const tempMap = {};
            records.forEach(item => {
                if (item.state) stateSet.add(item.state);
                if (item.commodity) commoditySet.add(item.commodity);
                if (item.state && item.district) {
                    if (!tempMap[item.state]) tempMap[item.state] = new Set();
                    tempMap[item.state].add(item.district);
                }
            });

            setStates([...stateSet].sort());
            setCommodities([...commoditySet].sort());
            
            const finalMap = {};
            for (const state in tempMap) {
                finalMap[state] = [...tempMap[state]].sort();
            }
            setStateDistrictMap(finalMap);
            // --- END OF DROPDOWN FIX ---

            // --- NEW: Process data for changes in its *own* try/catch ---
            try {
                processPriceChanges(records);
            } catch (comparisonErr) {
                // If this fails, it only sets the comparison error.
                // The dropdowns and "All Data" tab will still work.
                setComparisonError(comparisonErr.message); 
            }

        } catch (err) {
            // This catches *only* major fetching errors
            setError(err.message || "Failed to fetch market prices.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Run fetchPrices once on component mount
    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    // --- Event Handlers (Same as before) ---
    const handleStateChange = (e) => {
        const state = e.target.value;
        setSelectedState(state);
        setSelectedDistrict(""); 
        setDistricts(state ? (stateDistrictMap[state] || []) : []);
    };

    const applyFilters = () => {
        const regularFilter = allPrices.filter(item =>
            (!selectedState || item.state === selectedState) &&
            (!selectedDistrict || item.district === selectedDistrict) &&
            (!selectedCommodity || item.commodity === selectedCommodity)
        );
        setFilteredPrices(regularFilter);

        const comparisonFilter = comparisonData.filter(item =>
            (!selectedState || item.state === selectedState) &&
            (!selectedDistrict || item.district === selectedDistrict) &&
            (!selectedCommodity || item.commodity === selectedCommodity)
        );
        setComparisonData(comparisonFilter);
    };
    
    // --- Memoized chart data (Same as before) ---
    const topMovers = useMemo(() => {
        const sorted = [...comparisonData].sort((a, b) => b.changePercent - a.changePercent);
        return sorted.slice(0, 10);
    }, [comparisonData]);

    const bottomMovers = useMemo(() => {
        const sorted = [...comparisonData].sort((a, b) => a.changePercent - b.changePercent);
        return sorted.slice(0, 10).filter(item => item.changePercent < 0);
    }, [comparisonData]);

    // --- Render JSX (MODIFIED Error Handling) ---
    return (
        <div className="prices-container">
            <div className="prices-card">
                <h2>🌾 India Market Prices</h2>
                <p>Check latest <b>Agmarknet</b> commodity prices across Indian markets.</p>

                {/* --- Search Section (Works now) --- */}
                <div className="search-section">
                    <select value={selectedState} onChange={handleStateChange}>
                        <option value="">-- Select State --</option>
                        {states.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                    <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                        <option value="">-- Select District --</option>
                        {districts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                    </select>
                    <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)}>
                        <option value="">-- Select Commodity --</option>
                        {commodities.map(comm => <option key={comm} value={comm}>{comm}</option>)}
                    </select>
                    <button onClick={applyFilters}>🔍 Search</button>
                    <button className="refresh-btn" onClick={fetchPrices}>🔄 Refresh</button>
                </div>

                {/* --- View Toggle Buttons (Same) --- */}
                <div className="view-toggle-buttons">
                    <button 
                        className={activeView === 'changes' ? 'active' : ''} 
                        onClick={() => setActiveView('changes')}
                    >
                        📈 Price Changes
                    </button>
                    <button 
                        className={activeView === 'graphs' ? 'active' : ''} 
                        onClick={() => setActiveView('graphs')}
                    >
                        📊 Graphs
                    </button>
                    <button 
                        className={activeView === 'all' ? 'active' : ''} 
                        onClick={() => setActiveView('all')}
                    >
                        🗃️ All Data
                    </button>
                </div>

                {/* --- Status/Loader/Error (MODIFIED) --- */}
                {isLoading && <div className="loader">Loading prices...</div>}
                
                {/* This error is for a total API failure */}
                {error && <div className="error-box">❌ {error}</div>}
                
                {!isLoading && !error && latestDate && (
                    <div id="status">
                        Comparing data from <b>{latestDate}</b> (Latest) vs. <b>{previousDate}</b> (Previous).
                    </div>
                )}
                
                {/* This error is ONLY for the comparison tabs */}
                {!isLoading && comparisonError && (activeView === 'changes' || activeView === 'graphs') && (
                     <div className="error-box">❌ {comparisonError}</div>
                )}

                {/* --- Conditional Rendering --- */}

                {/* View 1: Price Changes (Shows error if comparisonError exists) */}
                {activeView === 'changes' && !isLoading && !error && !comparisonError && (
                    <PriceChangeTable data={comparisonData} />
                )}

                {/* View 2: Graphs (Shows error if comparisonError exists) */}
                {activeView === 'graphs' && !isLoading && !error && !comparisonError && (
                    <div className="charts-container">
                        <MoversChart title="Top 10 Price Risers (%)" data={topMovers} color="#28a745" />
                        <MoversChart title="Top 10 Price Fallers (%)" data={bottomMovers.reverse()} color="#dc3545" />
                    </div>
                )}

                {/* View 3: All Data (Will always work if fetch was successful) */}
                {activeView === 'all' && !isLoading && !error && (
                    <AllPricesTable data={filteredPrices} />
                )}
            </div>
        </div>
    );
}

// --- Helper Components (Same as before) ---

function PriceChangeTable({ data }) {
    if (data.length === 0) {
        return <div className="loader">No comparison data found for the selected filters.</div>;
    }
    return (
        <table className="prices-table">
            <thead>
                <tr>
                    <th>Commodity</th>
                    <th>Market</th>
                    <th>State</th>
                    <th>Latest (₹)</th>
                    <th>Previous (₹)</th>
                    <th>Change (₹)</th>
                    <th>Change (%)</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.key}>
                        <td>{item.commodity}</td>
                        <td>{item.market}</td>
                        <td>{item.state}</td>
                        <td className="price-cell latest">{item.latestPrice}</td>
                        <td className="price-cell previous">{item.previousPrice}</td>
                        <td className={`price-cell change ${item.change > 0 ? 'positive' : 'negative'}`}>
                            {item.change.toFixed(2)}
                        </td>
                        <td className={`price-cell change-percent ${item.changePercent > 0 ? 'positive' : 'negative'}`}>
                            {item.changePercent > 0 ? '▲' : '▼'} {item.changePercent}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function AllPricesTable({ data }) {
    if (data.length === 0) {
        return <div className="loader">No results found for the selected filters.</div>;
    }
    return (
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
                {data.map((item, index) => (
                    <tr key={`${item.market}-${item.commodity}-${item.arrival_date}-${index}`}>
                        <td>{item.commodity || "-"}</td>
                        <td>{item.state || "-"}</td>
                        <td>{item.district || "-"}</td>
                        <td>{item.market || "-"}</td>
                        <td className="price-cell">₹ {item.modal_price || "-"}</td>
                        <td>{item.arrival_date || "-"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function MoversChart({ title, data, color }) {
    const chartData = {
        labels: data.map(item => `${item.commodity} (${item.market})`),
        datasets: [{
            label: 'Change (%)',
            data: data.map(item => item.changePercent),
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
        }],
    };
    const options = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 16 }, color: '#333' },
        },
    };
    return <Bar data={chartData} options={options} />;
}

export default MarketPrices;