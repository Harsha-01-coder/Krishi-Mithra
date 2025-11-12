import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Good: Using context
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

function AddProduct() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("fertilizer");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stock, setStock] = useState(100);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Refinement: For the file input

  // Refinement: Handle auth redirect in useEffect
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // 📸 Handle File Upload (manual or drop)
  const handleImageChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl(""); // Clear URL if a file is uploaded
      setError("");
    } else if (file) {
      setError("Please select a valid image file (jpg, png, webp).");
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleFileInputChange = (e) => handleImageChange(e.target.files[0]);

  // 🟩 Drag-and-Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  // ❌ Remove Preview
  const removeImagePreview = (e) => {
    e.stopPropagation(); // Refinement: Stop click from bubbling up
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // 🧾 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean); // Filter out empty strings

      const formData = new FormData();
      formData.append("name", name);
      formData.append("brand", brand);
      formData.append("price", parseFloat(price));
      formData.append("category", category);
      formData.append("description", description);
      // Send tags as a JSON string, which the backend prefers
      formData.append("tags", JSON.stringify(tagsArray)); 
      formData.append("stock", parseInt(stock, 10));

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("image_url", imageUrl);
      }

      await axios.post("http://127.0.0.1:5000/api/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type" is set automatically by axios for FormData
        },
      });

      setMessage(`✅ Successfully added ${name}!`);
      // Clear all fields
      setName("");
      setBrand("");
      setPrice("");
      setCategory("fertilizer");
      setDescription("");
      setTags("");
      setImageUrl("");
      setStock(100);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

    } catch (err) {
      console.error("Add product error:", err);
      setError(err.response?.data?.error || "Could not add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <form onSubmit={handleSubmit} className="add-product-form">
        <h2>🛒 Add New Product</h2>
        <p>Fill out the form to add a new item to the marketplace.</p>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {/* --- BASIC FIELDS --- */}
        <div className="input-group">
          <label htmlFor="name">Product Name*</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Organic Neem Oil"
            required
          />
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Krishi Mitra Organics"
            />
          </div>
          <div className="input-group">
            <label htmlFor="price">Price (₹)*</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 450.00"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="fertilizer">🌾 Fertilizer</option>
              <option value="pesticide">🐛 Pesticide</option>
              <option value="seed">🌱 Seed</option>
              <option value="tool">⚙️ Tool</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description..."
          ></textarea>
        </div>

        <div className="input-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., neem, organic, pesticide, aphids"
          />
        </div>

        {/* 🌐 Image URL */}
        <div className="input-group">
          <label htmlFor="image_url">Image URL (or upload below)</label>
          <input
            type="text"
            id="image_url"
            value={imageUrl}
            onChange={(e) => {
              const url = e.target.value;
              setImageUrl(url);
              // Show preview from URL
              if (url) {
                setImagePreview(url);
                setImageFile(null); // Clear file if URL is typed
                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                }
              } else if (!imageFile) {
                setImagePreview(null);
              }
            }}
            placeholder="https://example.com/image.jpg"
            disabled={!!imageFile} // Disable if a file is already uploaded
          />
        </div>

        {/* 📁 Drag & Drop Upload */}
        <div className="input-group">
          <label>Upload Image (or use URL above)</label>
          <div
            className={`upload-box ${isDragging ? "drag-active" : ""} ${
              imageUrl ? "disabled" : ""
            }`}
            onClick={() => fileInputRef.current?.click()} // Refinement: Click ref
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!imagePreview ? (
              <>
                <input
                  type="file"
                  id="image_upload"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileInputChange}
                  ref={fileInputRef} // Refinement: Assign ref
                  disabled={!!imageUrl}
                />
                <p>📷 Click or drag & drop an image</p>
                {isDragging && (
                  <span className="drag-hint">Drop image here...</span>
                )}
              </>
            ) : (
              <div className="image-preview">
                <button
                  type="button"
                  className="remove-preview-btn"
                  onClick={removeImagePreview} // Refinement: StopPropagation is inside
                >
                  ✖
                </button>
                <img src={imagePreview} alt="Preview" />
                <small>Image Preview</small>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="btn-submit-product" disabled={loading}>
          {loading ? "Uploading Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;