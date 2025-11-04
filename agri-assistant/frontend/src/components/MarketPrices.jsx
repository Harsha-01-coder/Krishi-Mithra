import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarketPrices.css'; // We will create this

function MarketPrices() {
    const [prices, setPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data when the component loads
        const fetchPrices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Call your Flask backend, not the gov API directly
                const res = await axios.get("http://127.0.0.1:5000/market-prices");
                setPrices(res.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch market prices.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrices();
    }, []); // The empty array [] means this runs once on load

    return (
        <div className="prices-container">
            <div className="prices-card">
                <h2>Market Prices</h2>
                <p>Current commodity prices across Indian markets</p>

                {isLoading && <div className="loader">Loading prices...</div>}
                
                {error && <div className="error-box">{error}</div>}

                {!isLoading && !error && (
                    <table className="prices-table">
                        <thead>
                            <tr>
                                <th>Commodity</th>
                                <th>State</th>
                                <th>Market</th>
                                <th>Price (₹/Quintal)</th>
                                <th>Arrival Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prices.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.commodity}</td>
                                    <td>{item.state}</td>
                                    <td>{item.market}</td>
                                    <td className="price-cell">₹ {item.price}</td>
                                    <td>{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default MarketPrices;