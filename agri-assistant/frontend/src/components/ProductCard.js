import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

// Define your backend's base URL once
const BACKEND_URL = 'http://127.0.0.1:5000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300/f0f0f0/666?text=No+Image';

function ProductCard({ product }) {

  // 1. --- ENHANCEMENT ---
  // Check if product.image_url exists.
  // If it does, prepend the backend URL.
  // If not, use the placeholder.
  const imageUrl = product.image_url 
    ? `${BACKEND_URL}${product.image_url}` 
    : PLACEHOLDER_IMAGE;

  // 2. --- FIX ---
  // Convert price to a number and handle missing prices before calling .toFixed()
  const displayPrice = Number(product.price || 0).toFixed(2);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image-container">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="product-card-image" 
            // This onError is great for handling 404s if the file was deleted
            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE }}
          />
        </div>
        <div className="product-card-content">
          <p className="product-card-brand">{product.brand || 'Krishi Mitra'}</p>
          <h3 className="product-card-name">{product.name}</h3>
          {/* Use the safe displayPrice variable here */}
          <p className="product-card-price">₹{displayPrice}</p>
        </div>
      </Link>
      <button className="product-card-button">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;