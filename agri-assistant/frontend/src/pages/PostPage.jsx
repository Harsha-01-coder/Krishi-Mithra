import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
import './Forum.css'; // We can reuse the same CSS

function PostPage() {
  const { id } = useParams(); // Gets the post ID from the URL
  // const { token } = useAuth();
  const token = localStorage.getItem("token"); // Get token from storage
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPostAndReplies = async () => {
    setLoading(true);
    try {
      // --- FIX 1: Changed URL to the correct API route ---
      const res = await axios.get(`http://127.0.0.1:5000/api/post/${id}`);
      setPost(res.data);
      setReplies(res.data.replies || []);
    } catch (err) {
      setError("Error fetching post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndReplies();
  }, [id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const res = await axios.post(
        // --- FIX 2: Changed URL to the correct API route ---
        `http://127.0.0.1:5000/api/post/${id}/reply`, 
        // --- FIX 3: Send 'content' to match API ---
        { content: newReply },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Add new reply to the list instantly
      setReplies([...replies, res.data]);
      setNewReply('');
    } catch (err) {
      setError("Failed to post reply. Please log in.");
    }
  };

  if (loading) return <p className="forum-container">Loading post...</p>;
  if (error) return <p className="forum-container">{error}</p>;

  return (
    <div className="forum-container">
      {post && (
        <div className="post-full">
          <h2>{post.title}</h2>
          {/* --- FIX 4: Use variable names from your API --- */}
          <p className="post-author">by <strong>{post.author_username}</strong> on {new Date(post.createdAt).toLocaleDateString()}</p>
          <div className="post-body">{post.content}</div>
        </div>
      )}

      <div className="replies-section">
        <h3>{replies.length} Replies</h3>
        {replies.map(reply => (
          <div key={reply._id} className="reply">
             {/* --- FIX 5: Use variable names from your API --- */}
            <p className="reply-body">{reply.content}</p>
            <p className="reply-author">by <strong>{reply.reply_author_username}</strong> on {new Date(reply.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {token ? (
        <form className="reply-form" onSubmit={handleReplySubmit}>
          <h3>Add Your Reply</h3>
          <textarea
            rows="5"
            placeholder="Write your answer..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          ></textarea>
          <button type="submit" className="btn-new-post">Post Reply</button>
        </form>
      ) : (
        <p>Please <Link to="/login">login</Link> to reply.</p>
      )}
    </div>
  );
}

export default PostPage;