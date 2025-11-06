import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Forum.css'; // We will create this

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:5000/forum/posts');
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
          <p>Please <Link to="/login">login</Link> to create a post.</p>
        )}
      </div>

      <div className="post-list">
        {loading ? (
          <p>Loading posts...</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-summary" onClick={() => navigate(`/forum/post/${post.id}`)}>
              <h3>{post.title}</h3>
              <p>by <strong>{post.username}</strong> on {new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;