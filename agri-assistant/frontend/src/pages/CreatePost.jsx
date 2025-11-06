import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useAuth } from '../context/AuthContext'; // Using localStorage for token
import './Forum.css'; // Reuse CSS

function CreatePost() {
  const [title, setTitle] = useState('');
  // --- FIX 1: Changed 'body' to 'content' to match your API ---
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  // const { token } = useAuth();
  const token = localStorage.getItem("token"); // Get token from storage
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and details.");
      return;
    }

    try {
      const res = await axios.post(
        // --- FIX 2: Changed URL to the correct API route ---
        'http://127.0.0.1:5000/api/create-post',
        // --- FIX 3: Send 'content' to match API ---
        { title: title, content: content },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // --- FIX 4: Use 'res.data._id' which your API sends ---
      navigate(`/forum/post/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post. Please try again.");
    }
  };

  return (
    <div className="forum-container">
      <form className="post-form" onSubmit={handleSubmit}>
        <h2>Create a New Post</h2>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="body">Question / Details</label>
          <textarea
            id="body"
            rows="10"
            value={content} // <-- Bind to 'content'
            onChange={(e) => setContent(e.target.value)} // <-- Update 'content'
            placeholder="Describe your issue or question in detail..."
          ></textarea>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn-new-post">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;