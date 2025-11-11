import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  // Use a placeholder if no image is provided
  const imageUrl = product.image_url || 'https://placehold.co/300x300/f0f0f0/666?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image-container">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="product-card-image" 
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x300/f0f0f0/666?text=No+Image' }}
          />
        </div>
        <div className="product-card-content">
          <p className="product-card-brand">{product.brand || 'Krishi Mitra'}</p>
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-price">₹{product.price.toFixed(2)}</p>
        </div>
      </Link>
      <button className="product-card-button">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;