import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import ProductCard from '../components/ProductCard'; // <-- 1. IMPORT
import './PestId.css'; // <-- CSS to match your original design

// ... (Your original BugIcon component) ...
const BugIcon = () => (
    <svg className="bug-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 18.001c-1.387-1.387-2.34-3.13-2.34-5.001 0-1.87 0.953-3.613 2.34-5.001m8 10.002c1.387-1.387 2.34-3.13 2.34-5.001s-0.953-3.613-2.34-5.001M21 12H3m16 4.001c-1.387 1.387-3.13 2.34-5.001 2.34s-3.613-0.953-5.001-2.34M3 12a9 9 0 1116 0" />
    </svg>
);

function PestId() {
    // --- States from your original file ---
    const [crop, setCrop] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [image, setImage] = useState(null); 
    const [preview, setPreview] = useState(null); 
    
    const [identification, setIdentification] = useState('');
    const [treatment, setTreatment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 2. ADD NEW STATE ---
    const [suggestedProducts, setSuggestedProducts] = useState([]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!crop || !image) {
            setError("Please add a crop type and an image.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setIdentification('');
        setTreatment('');
        setSuggestedProducts([]); // <-- 3. RESET STATE

        const formData = new FormData();
        formData.append('image', image);
        formData.append('crop', crop);
        formData.append('symptoms', symptoms);

        try {
            const res = await axios.post("http://127.0.0.1:5000/identify-pest", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            setIdentification(res.data.identification);
            setTreatment(res.data.treatment);
            // --- 4. SET SUGGESTED PRODUCTS ---
            setSuggestedProducts(res.data.suggested_products || []);

        } catch (err) {
            setError(err.response?.data?.error || "Error connecting to the server.");
            console.error("Pest ID error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pest-id-container">
            <div className="pest-card">
                <form onSubmit={handleSubmit}>
                    {/* --- This is your original header --- */}
                    <div className="card-header">
                        <BugIcon />
                        <h2 className="card-title">Pest & Disease Identification</h2>
                        <p className="card-subtitle">
                            Upload a photo to identify crop issues
                        </p>
                    </div>

                    {/* --- This is your original form structure --- */}
                    <div className="form-group">
                        <label htmlFor="crop" className="form-label">Crop Type</label>
                        <input
                            type="text" id="crop"
                            placeholder="e.g., Rice, Dhaan, Tomato"
                            value={crop}
                            onChange={(e) => setCrop(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image" className="form-label">Upload Image</label>
                        <input
                            type="file" id="image"
                            accept="image/png, image/jpeg" 
                            onChange={handleImageChange}
                            className="form-input"
                            required
                        />
                    </div>
                    
                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Your upload" />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="symptoms" className="form-label">Symptoms (Optional)</label>
                        <textarea
                            id="symptoms"
                            rows="3"
                            placeholder="e.g., Yellow spots, white powder on stems..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="submit-button">
                        {isLoading ? "Analyzing..." : "Identify Pest/Disease"}
                    </button>
                </form>

                {/* --- This is your original results container --- */}
                <div className="results-container">
                    {error && (
                        <div className="error-box">
                            <p className="error-title">Identification Failed</p>
                            <p className="error-message">{error}</p>
                        </div>
                    )}
                    
                    {identification && (
                        <div className="results-wrapper">
                            <h3>Identification Results</h3>
                            <div className="results-box">
                                <h4>Pest/Disease:</h4>
                                {/* --- FIX: Wrapped in div --- */}
                                <div className="results-text">
                                    <ReactMarkdown>{identification}</ReactMarkdown>
                                </div>
                            </div>
                            <div className="results-box">
                                <h4>Treatment:</h4>
                                {/* --- FIX: Wrapped in div --- */}
                                <div className="results-text">
                                    <ReactMarkdown>{treatment}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 5. NEW UI SECTION (STYLED TO MATCH) --- */}
                    {suggestedProducts.length > 0 && (
                        <div className="results-wrapper">
                            <h3>Recommended Solutions</h3>
                            <p>Based on the analysis, here are some products that can help:</p>
                            <div className="product-grid-mini">
                                {suggestedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PestId;