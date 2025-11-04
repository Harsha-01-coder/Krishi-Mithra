import React, { useState } from 'react';
import axios from 'axios';
import './PestId.css'; // We will update this file next

// ... (keep your BugIcon component) ...
const BugIcon = () => (
    <svg className="bug-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 18.001c-1.387-1.387-2.34-3.13-2.34-5.001 0-1.87 0.953-3.613 2.34-5.001m8 10.002c1.387-1.387 2.34-3.13 2.34-5.001s-0.953-3.613-2.34-5.001M21 12H3m16 4.001c-1.387 1.387-3.13 2.34-5.001 2.34s-3.613-0.953-5.001-2.34M3 12a9 9 0 1116 0" />
    </svg>
);

function PestId() {
    const [crop, setCrop] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [image, setImage] = useState(null); // <-- NEW: State for the image file
    const [preview, setPreview] = useState(null); // <-- NEW: State for image preview
    
    const [identification, setIdentification] = useState('');
    const [treatment, setTreatment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- NEW: Handle file selection ---
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Create a temporary URL for preview
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

        // --- NEW: Use FormData to send a file ---
        // We can't use JSON when sending a file.
        const formData = new FormData();
        formData.append('image', image);
        formData.append('crop', crop);
        formData.append('symptoms', symptoms);

        try {
            const res = await axios.post("http://127.0.0.1:5000/identify-pest", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important header
                }
            });
            
            setIdentification(res.data.identification);
            setTreatment(res.data.treatment);

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
                    <div className="card-header">
                        <BugIcon />
                        <h2 className="card-title">Pest & Disease Identification</h2>
                        <p className="card-subtitle">
                            Upload a photo to identify crop issues
                        </p>
                    </div>

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

                    {/* --- NEW: Image Upload Field --- */}
                    <div className="form-group">
                        <label htmlFor="image" className="form-label">Upload Image</label>
                        <input
                            type="file" id="image"
                            accept="image/png, image/jpeg" // Only accept images
                            onChange={handleImageChange}
                            className="form-input"
                            required
                        />
                    </div>
                    
                    {/* --- NEW: Image Preview --- */}
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

                {/* --- Results Display (No changes needed here) --- */}
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
                                <p className="results-text">{identification}</p>
                            </div>
                            <div className="results-box">
                                <h4>Treatment:</h4>
                                <p className="results-text">{treatment}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PestId;