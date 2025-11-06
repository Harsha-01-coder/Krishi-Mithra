import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Forum.css'; // Reuse CSS

function CreatePost() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both title and body.");
      return;
    }

    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/forum/create-post',
        { title: title, body: body },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Go to the new post's page
      navigate(`/forum/post/${res.data.post_id}`);
    } catch (err) {
      setError("Failed to create post. Please try again.");
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
            value={body}
            onChange={(e) => setBody(e.target.value)}
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