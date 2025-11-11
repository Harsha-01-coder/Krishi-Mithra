import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './PostDetail.css'; // You will need to create this CSS file

function PostDetail() {
  // Get the postId from the URL path
  const { postId } = useParams();
  const { token, user } = useAuth(); // Assuming useAuth provides the token and logged-in user info
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/post/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Could not load post. It may have been deleted or the ID is invalid.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!token) {
      alert("Please log in to submit a reply.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/post/${postId}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add the new reply to the post state immediately
      setPost(prevPost => ({
        ...prevPost,
        replies: [...prevPost.replies, res.data],
      }));

      setReplyContent(''); // Clear the input field
    } catch (err) {
      console.error("Error submitting reply:", err);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to safely format the date
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Date Unavailable';
    try {
      const date = new Date(dateString);
      // Check if the date is valid (a common check for Invalid Date issues)
      if (isNaN(date)) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (e) {
      return 'Date Error';
    }
  };

  if (loading) {
    return <div className="post-detail-container">Loading post details...</div>;
  }

  if (error) {
    return <div className="post-detail-container error-message">❌ {error}</div>;
  }

  if (!post) {
    return <div className="post-detail-container error-message">Post not found.</div>;
  }

  return (
    <div className="post-detail-container">
      
      {/* Post Header and Content */}
      <div className="main-post-card">
        <h1>{post.title}</h1>
        <p className="post-meta">
          Posted by <strong>{post.username}</strong> on {formatDisplayDate(post.created_at)}
        </p>
        <hr />
        <p className="post-content">{post.content}</p>
      </div>

      {/* Reply Section */}
      <div className="replies-section">
        <h2>Replies ({post.replies.length})</h2>

        {/* Reply Submission Form */}
        {token ? (
          <form onSubmit={handleSubmitReply} className="reply-form">
            <h3>Post a Reply</h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your advice or question..."
              rows="4"
              required
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting || !replyContent.trim()}>
              {isSubmitting ? 'Posting...' : 'Submit Reply'}
            </button>
          </form>
        ) : (
          <p className="login-prompt">
            Please <Link to="/login">log in</Link> to post a reply.
          </p>
        )}

        {/* Display Replies */}
        <div className="reply-list">
          {post.replies.length === 0 ? (
            <p>No replies yet. Be the first to respond!</p>
          ) : (
            post.replies.map((reply, index) => (
              <div key={reply.id || index} className="reply-card">
                <p className="reply-meta">
                  Replied by <strong>{reply.username || 'Anonymous'}</strong> on {formatDisplayDate(reply.created_at)}
                </p>
                <p>{reply.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;