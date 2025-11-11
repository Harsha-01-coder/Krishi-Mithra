import React from 'react';
// Assuming your PostDetail.css styles (like .reply-card, .reply-meta) cover this component's styling

// Helper function to safely format the date (copied for safety, but could also be imported from a utility file)
const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Date Unavailable';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    // Consistent date format across the application
    return date.toLocaleDateString();
  } catch (e) {
    return 'Date Error';
  }
};

/**
 * Displays a single, read-only reply within a post's detail view.
 * @param {object} reply - The reply object {id, content, username, created_at}
 */
function PostReply({ reply }) {
  const username = reply.username || 'Anonymous User';
  const displayDate = formatDisplayDate(reply.created_at);

  return (
    <div className="reply-card">
      <p className="reply-meta">
        Replied by <strong>{username}</strong> on {displayDate}
      </p>
      <p className="reply-content-text">{reply.content}</p>
    </div>
  );
}

export default PostReply;