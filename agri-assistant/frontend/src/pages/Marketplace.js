import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Marketplace.css';

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🧭 Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data.products) {
        setProducts(res.data.products);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('⚠️ Could not load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>🛒 Marketplace</h1>
        <p>Discover and trade verified agricultural products at fair prices.</p>
      </div>

      {/* 📊 Status */}
      {loading && <p className="loading-text">⏳ Loading products...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* 🧾 Product Grid */}
      {!loading && !error && (
        <div className="product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              // --- THIS LINE IS UPDATED ---
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="empty-state">
              <h3>😔 No Products Yet</h3>
              <p>
                Looks like the marketplace is empty. Be the first to{' '}
                <a href="admin/add-product" className="add-link">
                  add your product!
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Marketplace;