import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
// Assuming you have a corresponding CSS file
import './MarketPrices.css'; 

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale
} from 'chart.js';
import { Bar, Line, PolarArea } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale
);

// --- MOCK FALLBACK DATA (Still used if backend data lacks 2 dates) ---
const MOCK_FALLBACK_RECORDS = [
    { "state": "Maharashtra", "district": "Pune", "market": "Pune (Mandi)", "commodity": "Onion", "modal_price": "2200", "arrival_date": "2025-11-04" },
    { "state": "Maharashtra", "district": "Pune", "market": "Pune (Mandi)", "commodity": "Potato", "modal_price": "1500", "arrival_date": "2025-11-04" },
    { "state": "Gujarat", "district": "Ahmedabad", "market": "Ahmedabad (Mandi)", "commodity": "Tomato", "modal_price": "1000", "arrival_date": "2025-11-04" },
    { "state": "Maharashtra", "district": "Pune", "market": "Pune (Mandi)", "commodity": "Onion", "modal_price": "2300", "arrival_date": "2025-11-06" },
    { "state": "Maharashtra", "district": "Pune", "market": "Pune (Mandi)", "commodity": "Potato", "modal_price": "1450", "arrival_date": "2025-11-06" },
    { "state": "Gujarat", "district": "Ahmedabad", "market": "Ahmedabad (Mandi)", "commodity": "Tomato", "modal_price": "1100", "arrival_date": "2025-11-06" },
];

// --- API_URL FIX ---
// Calling our own Flask backend
const API_URL = "http://127.0.0.1:5000/market-prices";

function MarketPrices() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('changes');
    const [comparisonError, setComparisonError] = useState(null);

    const [selectedChartType, setSelectedChartType] = useState('bar'); 

    const [allPrices, setAllPrices] = useState([]); 
    const [filteredPrices, setFilteredPrices] = useState([]); 
    
    const [comparisonData, setComparisonData] = useState([]);
    const [latestDate, setLatestDate] = useState(null);
    const [previousDate, setPreviousDate] = useState(null);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [stateDistrictMap, setStateDistrictMap] = useState({});

    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedCommodity, setSelectedCommodity] = useState("");
    
    // Wrapped in useCallback to prevent re-creation
    const processPriceChanges = useCallback((records) => {
        const allDates = [...new Set(records.map(r => r.arrival_date))].sort().reverse();
        const newLatestDate = allDates[0];
        const newPreviousDate = allDates[1];

        if (!newLatestDate || !newPreviousDate) {
            throw new Error("Not enough data to compare (need at least 2 days).");
        }

        setLatestDate(newLatestDate);
        setPreviousDate(newPreviousDate);

        const latestPrices = {};
        const previousPrices = {};
        
        records.forEach(r => {
            if (r.market && r.commodity && r.arrival_date) { 
                const key = `${r.market}-${r.commodity}`;
                if (r.arrival_date === newLatestDate) latestPrices[key] = parseFloat(r.modal_price);
                if (r.arrival_date === newPreviousDate) previousPrices[key] = parseFloat(r.modal_price);
            }
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
                    
                    const originalRecord = records.find(r => r.market === market && r.commodity === commodity);
                    
                    if (originalRecord) { 
                        comparisons.push({
                            key, market, commodity, latestPrice: latest, previousPrice: previous,
                            change: change, changePercent: parseFloat(changePercent.toFixed(2)),
                            ...originalRecord
                        });
                    }
                }
            }
        }
        setComparisonData(comparisons.sort((a, b) => b.changePercent - a.changePercent));
    }, []);

    // --- THIS FUNCTION IS NOW MORE ROBUST ---
    const fetchDropdownData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setComparisonError(null);
        
        let apiRecords = []; // Store API results here

        try {
            const res = await axios.get(API_URL); 
            
            if (res.data && res.data.length > 0) {
                 apiRecords = res.data.filter(r => r.modal_price && parseFloat(r.modal_price) > 0);
            }

        } catch (err) {
            // Set error, but don't return, proceed to fallback
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || "Failed to fetch market prices. Is the backend server running?");
            }
        } finally {
            
            let recordsToProcess = [];
            
            try {
                // Try to process API data first
                processPriceChanges(apiRecords);
                recordsToProcess = apiRecords; // API data is good
            } catch (e) {
                // API data is empty or insufficient, merge with mock
                console.warn("Live data empty or insufficient. Merging with mock data.");
                recordsToProcess = [...apiRecords, ...MOCK_FALLBACK_RECORDS];
                try {
                    // Process merged data
                    processPriceChanges(recordsToProcess);
                    // Only show warning if API was empty
                    if (apiRecords.length === 0) {
                         setComparisonError("⚠️ No market records found from API. Displaying sample data.");
                    } else {
                         setComparisonError("⚠️ Warning: Live data supplemented with sample data.");
                    }
                } catch (mergeErr) {
                    // This is bad, mock data is broken
                    setError("Fatal Error: Could not process fallback data. " + mergeErr.message);
                    setIsLoading(false);
                    return;
                }
            }

            // If we're here, recordsToProcess is valid (either API-only or merged)
            setAllPrices(recordsToProcess); 
            setFilteredPrices(recordsToProcess); 
            
            // Build Dropdown Data
            const stateSet = new Set();
            const commoditySet = new Set();
            const tempMap = {};
            recordsToProcess.forEach(item => {
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
            
            setIsLoading(false);
        }
    }, [processPriceChanges]);
    // --- END OF LOGIC FIX ---


    // This function now ONLY handles filtering
    const applyFilters = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setComparisonError(null);
        
        // Filter the *local* data using flexible `includes()` logic
        const filtered = allPrices.filter(item => {
            // Add safety checks for items that might not have a state/district/commodity
            const itemState = (item.state || "").toLowerCase();
            const itemDistrict = (item.district || "").toLowerCase();
            const itemCommodity = (item.commodity || "").toLowerCase();

            const filterState = selectedState.toLowerCase();
            const filterDistrict = selectedDistrict.toLowerCase();
            const filterCommodity = selectedCommodity.toLowerCase();

            return (
                (!selectedState || itemState.includes(filterState)) &&
                (!selectedDistrict || itemDistrict.includes(filterDistrict)) &&
                (!selectedCommodity || itemCommodity.includes(filterCommodity))
            );
        });
        
        setFilteredPrices(filtered); // <-- This sets the state for 'All Data' tab

        // Now, try to process *only* the filtered data
        try {
            processPriceChanges(filtered);
        } catch (e) {
            setComparisonError("Not enough filtered data to show price changes or graphs (need two distinct dates).");
            setComparisonData([]); // Clear comparison table
        }
        
        setIsLoading(false);

    }, [allPrices, selectedState, selectedDistrict, selectedCommodity, processPriceChanges]);

    // This useEffect now ONLY runs ONCE on mount
    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]); 

    // Input Handlers
    const handleStateInput = (value) => {
        setSelectedState(value);
        setSelectedDistrict(""); 
        const districtOptions = stateDistrictMap[value] || [];
        setDistricts(districtOptions);
    };

    const handleDistrictInput = (value) => {
        setSelectedDistrict(value);
    };

    const handleCommodityInput = (value) => {
        setSelectedCommodity(value);
    };

    // Memoized chart data
    const topMovers = useMemo(() => {
        const sorted = [...comparisonData].sort((a, b) => b.changePercent - a.changePercent);
        return sorted.slice(0, 10);
    }, [comparisonData]);

    const bottomMovers = useMemo(() => {
        const sorted = [...comparisonData].sort((a, b) => a.changePercent - b.changePercent);
        return sorted.slice(0, 10).filter(item => item.changePercent < 0);
    }, [comparisonData]);

    // --- Render JSX ---
    return (
        <div className="prices-container">
            <div className="prices-card">
                <h2>🌾 India Market Prices</h2>
                <p>Check latest <b>Agmarknet</b> commodity prices across Indian markets.</p>

                <div className="search-section">
                    <input 
                        list="state-list" 
                        value={selectedState} 
                        onChange={(e) => handleStateInput(e.target.value)}
                        placeholder="Type or select State"
                        className="search-input"
                    />
                    <datalist id="state-list">
                        {states.map(state => <option key={state} value={state} />)}
                    </datalist>

                    <input 
                        list="district-list" 
                        value={selectedDistrict} 
                        onChange={(e) => handleDistrictInput(e.target.value)}
                        placeholder="Type or select District"
                        className="search-input"
                        disabled={!selectedState || (stateDistrictMap[selectedState]?.length === 0)}
                    />
                    <datalist id="district-list">
                        {districts.map(dist => <option key={dist} value={dist} />)}
                    </datalist>
                    
                    <input 
                        list="commodity-list" 
                        value={selectedCommodity} 
                        onChange={(e) => handleCommodityInput(e.target.value)}
                        placeholder="Type or select Commodity"
                        className="search-input"
                    />
                    <datalist id="commodity-list">
                        {commodities.map(comm => <option key={comm} value={comm} />)}
                    </datalist>

                    {/* Search button now calls the fixed applyFilters */}
                    <button onClick={applyFilters}>🔍 Search</button>
                    <button className="refresh-btn" onClick={() => {
                        // Reset filters and re-run the *local* filter
                        setSelectedState("");
                        setSelectedDistrict("");
                        setSelectedCommodity("");
                        setFilteredPrices(allPrices); // Reset view to all data
                        try {
                            processPriceChanges(allPrices); // Re-process all data
                            setComparisonError(null);
                        } catch (e) {
                           setComparisonError("Not enough data to compare.");
                           setComparisonData([]);
                        }
                    }}>🔄 Refresh</button>
                </div>

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

                {isLoading && <div className="loader">Loading prices...</div>}
                
                {error && <div className="error-box">❌ {error}</div>}
                
                {!isLoading && !error && latestDate && (
                    <div id="status">
                        Comparing data from <b>{latestDate}</b> (Latest) vs. <b>{previousDate}</b> (Previous).
                    </div>
                )}
                
                {!isLoading && comparisonError && (
                    <div className="warning-box">{comparisonError}</div>
                )}

                {/* --- Conditional Rendering --- */}

                {activeView === 'changes' && !isLoading && !error && (
                    <PriceChangeTable data={comparisonData} /> 
                )}

                {activeView === 'graphs' && !isLoading && !error && (
                    comparisonData.length > 0 ? (
                        <div className="charts-view">
                            <div className="chart-selector">
                                <label htmlFor="chartType">Select Chart Type:</label>
                                <select 
                                    id="chartType" 
                                    value={selectedChartType} 
                                    onChange={(e) => setSelectedChartType(e.target.value)}
                                >
                                    <option value="bar">Bar Chart (Horizontal)</option>
                                    <option value="line">Line Chart</option>
                                    <option value="polar">Polar Area Chart</option>
                                </select>
                            </div>

                            <div className="charts-container">
                                <MoversChart 
                                    title="Top 10 Price Risers (%)" 
                                    data={topMovers} 
                                    color="#28a745" 
                                    type={selectedChartType}
                                />
                                <MoversChart 
                                    title="Top 10 Price Fallers (%)" 
                                    data={bottomMovers.reverse()} 
                                    color="#dc3545" 
                                    type={selectedChartType}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="loader"> 
                            {/* Show nothing if comparisonError is already shown */}
                            {!comparisonError && "No data to display graphs."}
                        </div>
                    )
                )}

                {/* This table now correctly uses the filteredPrices state */}
                {activeView === 'all' && !isLoading && !error && (
                    <AllPricesTable data={filteredPrices} />
                )}
            </div>
        </div>
    );
}

// --- Helper Components ---

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
        <table className="prices-table all-data-table">
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
                        <td data-label="Commodity">{item.commodity || "-"}</td>
                        <td data-label="State">{item.state || "-"}</td>
                        <td data-label="District">{item.district || "-"}</td>
                        <td data-label="Market">{item.market || "-"}</td>
                        <td data-label="Price (₹/Quintal)" className="price-cell">₹ {item.modal_price || "-"}</td>
                        <td data-label="Arrival Date">{item.arrival_date || "-"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function MoversChart({ title, data, color, type }) {
    const isPolar = type === 'polar';
    const isBar = type === 'bar'; // <-- This line was fixed
    const chartLabels = data.map(item => `${item.commodity} (${item.market})`);
    
    const backgroundColors = isPolar 
        ? data.map((_, i) => `hsl(${i * 45}, 70%, 50%)`) 
        : color;

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'Change (%)',
            data: data.map(item => item.changePercent),
            backgroundColor: backgroundColors,
            borderColor: isPolar ? 'white' : color,
            borderWidth: 1,
            tension: type === 'line' ? 0.4 : 0,
            fill: false,
        }],
    };
    
    let options = {
        responsive: true,
        plugins: {
            legend: { display: isPolar ? true : false },
            title: { display: true, text: title, font: { size: 16 }, color: '#333' },
            tooltip: {
                callbacks: {
                    // Tooltip logic (fixed)
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        let value = null;
                        if (context.parsed.r !== undefined) {
                            value = context.parsed.r; // For Polar
                        } else if (context.parsed.x !== undefined && options.indexAxis === 'y') {
                            value = context.parsed.x; // For Horizontal Bar
                        } else if (context.parsed.y !== undefined) {
                            value = context.parsed.y; // For Line / Vertical Bar
                        }
                        
                        if (value !== null && !isNaN(value)) {
                            label += value.toFixed(2) + '%';
                        }
                        return label;
                    }
                }
            }
        },
    };

    if (isBar) {
        options.indexAxis = 'y'; // Horizontal bar chart
    } else if (type === 'line') {
        options.scales = {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
        };
    } else if (isPolar) {
        options.scales = {
            r: {
                beginAtZero: true,
                suggestedMin: 0,
                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                angleLines: { color: 'rgba(0, 0, 0, 0.1)' }
            }
        };
    }

    if (type === 'line') {
        return (
            <div className="chart-wrapper">
                 <Line data={chartData} options={options} />
            </div>
        );
    } else if (type === 'polar') {
        return (
            <div className="chart-wrapper">
                <PolarArea data={chartData} options={options} />
            </div>
        );
    }
    return (
        <div className="chart-wrapper">
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default MarketPrices;