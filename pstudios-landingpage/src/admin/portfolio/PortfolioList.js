import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Admin.css';
import API_BASE_URL from '../../config/api';

function PortfolioList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError('Failed to fetch portfolio items');
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
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== id));
      } else {
        setError('Failed to delete item');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const togglePublished = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        setItems(items.map(item => 
          item._id === id 
            ? { ...item, isPublished: !currentStatus }
            : item
        ));
      } else {
        setError('Failed to update item');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  if (loading) {
    return <div className="loading">Loading portfolio items...</div>;
  }

  return (
    <div className="portfolio-list">
      <div className="list-header">
        <h1>Portfolio Management</h1>
        <Link to="/admin/portfolio/new" className="add-button">
          Add New Project
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-grid">
        {items.map((item) => (
          <div key={item._id} className="item-card">
            <div className="item-header">
              <h3>{item.title}</h3>
              <div className="item-status">
                <span className={`status-badge ${item.isPublished ? 'published' : 'draft'}`}>
                  {item.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="item-meta">
              <span className="item-type">{item.type}</span>
              <span className="item-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="item-tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="item-actions">
              <button
                onClick={() => togglePublished(item._id, item.isPublished)}
                className={`toggle-button ${item.isPublished ? 'unpublish' : 'publish'}`}
              >
                {item.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              
              <Link to={`/admin/portfolio/${item._id}/edit`} className="edit-button">
                Edit
              </Link>
              
              <button
                onClick={() => handleDelete(item._id, item.title)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <p>No portfolio items found.</p>
        </div>
      )}
    </div>
  );
}

export default PortfolioList;
