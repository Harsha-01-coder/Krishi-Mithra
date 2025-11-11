import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To protect the page
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

function AddProduct() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('fertilizer');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState(100);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in (basic protection)
  if (!token) {
    navigate('/login');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Split tags string into an array, trim whitespace
      const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());

      const productData = {
        name,
        brand,
        price: parseFloat(price),
        category,
        description,
        tags: tagsArray,
        image_url: imageUrl,
        stock: parseInt(stock, 10),
      };

      await axios.post('http://127.0.0.1:5000/api/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}` // Assuming you protect this route
        }
      });

      setMessage(`Successfully added ${name}!`);
      // Clear form
      setName('');
      setBrand('');
      setPrice('');
      setCategory('fertilizer');
      setDescription('');
      setTags('');
      setImageUrl('');
      setStock(100);

    } catch (err) {
      setError(err.response?.data?.error || 'Could not add product.');
      console.error("Add product error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <form onSubmit={handleSubmit} className="add-product-form">
        <h2>Add New Product</h2>
        <p>Fill out the form to add a new item to the marketplace.</p>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label htmlFor="name">Product Name</label>
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
            <label htmlFor="price">Price (₹)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 450.00"
              required
            />
          </div>
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="fertilizer">Fertilizer</option>
              <option value="pesticide">Pesticide</option>
              <option value="seed">Seed</option>
              <option value="tool">Tool</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
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

        <div className="input-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="text"
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button type="submit" className="btn-submit-product" disabled={loading}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;