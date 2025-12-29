import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Admin.css';
import API_BASE_URL from '../../config/api';

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError('Failed to fetch blog posts');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== id));
      } else {
        setError('Failed to delete post');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const togglePublished = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post._id === id 
            ? { ...post, isPublished: !currentStatus }
            : post
        ));
      } else {
        setError('Failed to update post');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  if (loading) {
    return <div className="loading">Loading blog posts...</div>;
  }

  return (
    <div className="portfolio-list">
      <div className="list-header">
        <h1>Blog/Advertisement Management</h1>
        <Link to="/admin/blog/new" className="add-button">
          Add New Blog Post
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-grid">
        {posts.map((post) => (
          <div key={post._id} className="item-card">
            <div className="item-header">
              <h3>{post.title}</h3>
              <div className="item-status">
                <span className={`status-badge ${post.isPublished ? 'published' : 'draft'}`}>
                  {post.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="item-meta">
              <span className="item-type">{post.subject}</span>
              <span className="item-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="item-body-preview" style={{
              marginTop: '0.5rem',
              color: '#666',
              fontSize: '0.9rem',
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {post.body?.substring(0, 100)}...
            </div>

            <div className="item-actions">
              <button
                onClick={() => togglePublished(post._id, post.isPublished)}
                className={`toggle-button ${post.isPublished ? 'unpublish' : 'publish'}`}
              >
                {post.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              
              <Link to={`/admin/blog/${post._id}/edit`} className="edit-button">
                Edit
              </Link>
              
              <button
                onClick={() => handleDelete(post._id, post.title)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="empty-state">
          <p>No blog posts found.</p>
        </div>
      )}
    </div>
  );
}

export default BlogList;

