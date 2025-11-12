import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

const BACKEND_URL = 'http://127.0.0.1:5000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/f0f0f0/666?text=No+Image';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { productId } = useParams(); // Gets the ID from the URL

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/product/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError('Could not load product. It may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <div className="detail-loading">Loading product...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!product) return null;

  const imageUrl = product.image_url 
    ? `${BACKEND_URL}${product.image_url}` 
    : PLACEHOLDER_IMAGE;

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        <div className="product-detail-image-container">
          <img 
            src={imageUrl} 
            alt={product.name}
            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE }}
          />
        </div>
        <div className="product-detail-content">
          <p className="product-detail-brand">{product.brand || 'Krishi Mitra'}</p>
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-seller">Sold by: {product.seller_username || 'Admin'}</p>
          
          <p className="product-detail-description">
            {product.description || 'No description provided for this product.'}
          </p>

          <div className="product-detail-tags">
            {product.tags && product.tags.map(tag => (
              <span key={tag} className="product-detail-tag">{tag}</span>
            ))}
          </div>
          
          <p className="product-detail-price">₹{Number(product.price || 0).toFixed(2)}</p>
          
          <button className="product-detail-button">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;