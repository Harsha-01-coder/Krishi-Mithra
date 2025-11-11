import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Forum.css'; // We will update this file next

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/posts');
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  // --- NEW JSX STRUCTURE ---
  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Ask questions and share your knowledge with other farmers</p>

        {token ? (
          <Link to="/forum/new-post" className="btn-new-post">
            + Start a New Post
          </Link>
        ) : (
          <p className="forum-login-prompt">
            Please <Link to="/login">login</Link> to create a post.
          </p>
        )}
      </div>

      <div className="post-list">
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="no-posts-card">
            <p>No posts found. Be the first to start a discussion!</p>
          </div>
        ) : (
          // We now map to a "post-card" with an avatar
          posts.map(post => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/forum/post/${post.id}`)}
            >
              {/* --- AVATAR --- */}
              <div className="post-avatar">
                <span>{post.username[0].toUpperCase()}</span>
              </div>

              {/* --- POST CONTENT --- */}
              <div className="post-card-main">
                <h3>{post.title}</h3>
                <p className="post-card-meta">
                  Posted by <strong>{post.username}</strong>
                  <span className="post-card-time">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>

              {/* --- POST STATS (WITH ICON) --- */}
              <div className="post-card-stats">
                <span className="post-card-icon">💬</span>
                <span>{post.replies.length}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;