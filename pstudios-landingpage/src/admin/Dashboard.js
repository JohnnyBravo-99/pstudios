import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';
import API_BASE_URL from '../config/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    fetchPortfolioCount();
    fetchBlogCount();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      window.location.href = '/login';
    }
  };

  const fetchPortfolioCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setPortfolioCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching portfolio count:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching blog count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Portfolio Items</h3>
            <div className="stat-number">{portfolioCount}</div>
            <Link to="/admin/portfolio" className="stat-link">
              Manage Portfolio
            </Link>
          </div>
          <div className="stat-card">
            <h3>Blog Posts</h3>
            <div className="stat-number">{blogCount}</div>
            <Link to="/admin/blog" className="stat-link">
              Manage Blogs
            </Link>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/portfolio/new" className="action-button primary">
              Add New Project
            </Link>
            <Link to="/admin/portfolio" className="action-button secondary">
              View All Projects
            </Link>
            <Link to="/admin/blog/new" className="action-button primary">
              Add New Blog Post
            </Link>
            <Link to="/admin/blog" className="action-button secondary">
              View All Blog Posts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
