import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './NewPost.css'; // Create this CSS file next

function NewPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    if (!token) {
      setError("Authentication failed. Please log in.");
      // Redirect to login page if token is missing
      navigate('/login'); 
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/create-post`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // On successful creation, navigate to the newly created post's detail page
      const newPostId = res.data.id;
      navigate(`/forum/post/${newPostId}`);
      
    } catch (err) {
      console.error("Error creating new post:", err);
      // Display specific error if available, otherwise a generic one
      const errMsg = err.response?.data?.error || "Failed to create post. Server error.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-post-container">
      <div className="new-post-card">
        <h1>Start a New Discussion</h1>
        <p>Ask a question or share valuable agricultural insights.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Post Title (Brief Summary)</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Best irrigation method for corn in summer"
              required
              disabled={loading}
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Post Content (Details)</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your situation, question, or knowledge in detail."
              rows="10"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading || !title.trim() || !content.trim()}>
            {loading ? 'Submitting...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewPost;