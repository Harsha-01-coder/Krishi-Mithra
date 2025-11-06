import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditPost.css'; // We will create this CSS file

function EditPost() {
    const { id } = useParams(); // Get post ID from URL
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // 1. Fetch the post's current data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:5000/api/post/${id}`);
                setTitle(res.data.title);
                setContent(res.data.content);
            } catch (err) {
                setError("Could not fetch post data.");
            }
        };
        fetchPost();
    }, [id]);

    // 2. Handle saving changes
    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const res = await axios.put(
                `http://127.0.0.1:5000/api/post/${id}`,
                { title, content },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setMessage(res.data.message);
            setTimeout(() => navigate('/dashboard'), 1500); // Go back to dashboard
        } catch (err) {
            setError(err.response?.data?.error || "Could not update post.");
        }
    };

    // 3. Handle deleting the post
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this post?")) {
            return;
        }
        
        try {
            await axios.delete(`http://127.0.0.1:5000/api/post/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate('/dashboard'); // Go back to dashboard
        } catch (err) {
            setError(err.response?.data?.error || "Could not delete post.");
        }
    };

    return (
        <div className="edit-post-container">
            <form className="edit-post-form" onSubmit={handleSave}>
                <h2>Edit Your Post</h2>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        rows="12"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
                
                {message && <div className="message-box success">{message}</div>}
                {error && <div className="message-box error">{error}</div>}

                <div className="form-actions">
                    <button type="button" className="delete-btn" onClick={handleDelete}>
                        Delete Post
                    </button>
                    <button type="submit" className="save-btn">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditPost;