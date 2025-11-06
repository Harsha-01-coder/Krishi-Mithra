import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Forum.css'; // We can reuse the same CSS

function PostPage() {
  const { id } = useParams(); // Gets the post ID from the URL
  const { token } = useAuth();
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPostAndReplies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/forum/post/${id}`);
      setPost(res.data.post);
      setReplies(res.data.replies);
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
      await axios.post(
        `http://127.0.0.1:5000/forum/create-reply/${id}`, 
        { body: newReply },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNewReply('');
      fetchPostAndReplies(); // Refresh replies after posting
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
          <p className="post-author">by <strong>{post.username}</strong> on {new Date(post.created_at).toLocaleDateString()}</p>
          <div className="post-body">{post.body}</div>
        </div>
      )}

      <div className="replies-section">
        <h3>Replies</h3>
        {replies.map(reply => (
          <div key={reply.id} className="reply">
            <p className="reply-body">{reply.body}</p>
            <p className="reply-author">by <strong>{reply.username}</strong> on {new Date(reply.created_at).toLocaleDateString()}</p>
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