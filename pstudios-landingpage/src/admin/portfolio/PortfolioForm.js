import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MediaUploader from './MediaUploader';
import '../../styles/Admin.css';
import API_BASE_URL from '../../config/api';

const PORTFOLIO_TYPES = [
  '3d-asset',
  'branding', 
  'ui-ux',
  'cinematic',
  'game',
  'web'
];

function PortfolioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    type: '3d-asset',
    tags: [],
    meta: {
      role: '',
      year: '',
      engine: '',
      software: [],
      polycount: '',
      maps: [],
      texelDensity: '',
      fileTypes: []
    },
    links: {
      live: '',
      download: '',
      repo: ''
    },
    order: 0,
    isPublished: false
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchItem();
    }
  }, [id, isEdit]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data);
        // Initialize uploaded media from the fetched item
        if (data.media && data.media.images) {
          setUploadedMedia(data.media.images);
        }
      } else {
        setError('Failed to fetch portfolio item');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('meta.')) {
      const metaField = name.replace('meta.', '');
      setFormData({
        ...formData,
        meta: {
          ...formData.meta,
          [metaField]: type === 'checkbox' ? checked : value
        }
      });
    } else if (name.startsWith('links.')) {
      const linkField = name.replace('links.', '');
      setFormData({
        ...formData,
        links: {
          ...formData.links,
          [linkField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleMediaUploadSuccess = (newMedia) => {
    console.log('Media upload success, adding to state:', newMedia);
    setUploadedMedia(prev => [...prev, newMedia]);
  };

  const refetchMedia = async () => {
    if (!isEdit) return;
    try {
      console.log('Refetching media for item:', id);
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Refetched data:', data);
        if (data.media && data.media.images) {
          setUploadedMedia(data.media.images);
          // Also update the formData to keep it in sync
          setFormData(prev => ({
            ...prev,
            media: data.media
          }));
        }
      }
    } catch (error) {
      console.error('Error refetching media:', error);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    console.log('Attempting to delete media with ID:', mediaId, 'from item:', id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${id}/media/${mediaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      console.log('Delete response status:', response.status);
      if (response.ok) {
        // Remove the media from the local state
        setUploadedMedia(prev => prev.filter(media => media._id !== mediaId));
        // Also refetch to ensure state is synchronized
        refetchMedia();
        console.log('Media deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        setError('Failed to delete media');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Network error while deleting media');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = isEdit ? `${API_BASE_URL}/api/admin/portfolio/${id}` : `${API_BASE_URL}/api/admin/portfolio`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isEdit) {
          // For edit mode, stay on the current page and show success message
          setError(''); // Clear any previous errors
          setSuccess('Portfolio item updated successfully!');
          console.log('Portfolio item updated successfully');
        } else {
          // For new items, redirect to edit mode to allow media upload
          const newItemId = data._id || data.id;
          if (newItemId) {
            setSuccess('Project created successfully! You can now upload media files.');
            // Small delay to show success message before redirect
            setTimeout(() => {
              navigate(`/admin/portfolio/${newItemId}`);
            }, 1500);
          } else {
            navigate('/admin/portfolio');
          }
        }
      } else {
        setError(data.error || 'Failed to save portfolio item');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderMetaFields = () => {
    const { type } = formData;
    
    switch (type) {
      case '3d-asset':
        return (
          <>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                name="meta.role"
                value={formData.meta.role}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Engine</label>
              <input
                type="text"
                name="meta.engine"
                value={formData.meta.engine}
                onChange={handleChange}
                placeholder="e.g., Unity 2022 LTS"
              />
            </div>
            <div className="form-group">
              <label>Software</label>
              <input
                type="text"
                name="meta.software"
                value={Array.isArray(formData.meta.software) ? formData.meta.software.join(', ') : (formData.meta.software || '')}
                onChange={(e) => {
                  // Store the raw string value, don't process it immediately
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, software: e.target.value }
                  });
                }}
                onBlur={(e) => {
                  // Process the software list when user finishes editing
                  const software = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, software }
                  });
                }}
                placeholder="e.g., Blender, Substance 3D Painter"
              />
            </div>
            <div className="form-group">
              <label>Polycount</label>
              <input
                type="text"
                name="meta.polycount"
                value={formData.meta.polycount}
                onChange={handleChange}
                placeholder="e.g., 12,340 tris"
              />
            </div>
            <div className="form-group">
              <label>Maps</label>
              <input
                type="text"
                name="meta.maps"
                value={Array.isArray(formData.meta.maps) ? formData.meta.maps.join(', ') : (formData.meta.maps || '')}
                onChange={(e) => {
                  // Store the raw string value, don't process it immediately
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, maps: e.target.value }
                  });
                }}
                onBlur={(e) => {
                  // Process the maps list when user finishes editing
                  const maps = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, maps }
                  });
                }}
                placeholder="e.g., BaseColor, Normal, Roughness"
              />
            </div>
          </>
        );
      
      case 'branding':
        return (
          <>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                name="meta.role"
                value={formData.meta.role}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Software</label>
              <input
                type="text"
                name="meta.software"
                value={Array.isArray(formData.meta.software) ? formData.meta.software.join(', ') : (formData.meta.software || '')}
                onChange={(e) => {
                  // Store the raw string value, don't process it immediately
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, software: e.target.value }
                  });
                }}
                onBlur={(e) => {
                  // Process the software list when user finishes editing
                  const software = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, software }
                  });
                }}
                placeholder="e.g., Illustrator, Photoshop"
              />
            </div>
          </>
        );
      
      default:
        return (
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="meta.role"
              value={formData.meta.role || ''}
              onChange={handleChange}
            />
          </div>
        );
    }
  };

  return (
    <div className="portfolio-form">
      <div className="form-header">
        <h1>{isEdit ? 'Edit Project' : 'Add New Project'}</h1>
        <button onClick={() => navigate('/admin/portfolio')} className="back-button">
          Back to Portfolio
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {PORTFOLIO_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
              />
              <button type="button" onClick={handleAddTag}>Add</button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="order">Display Order</label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
              />
              Published
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Project Details</h2>
          {renderMetaFields()}
        </div>

        <div className="form-section">
          <h2>Links</h2>
          
          <div className="form-group">
            <label htmlFor="links.live">Live URL</label>
            <input
              type="url"
              id="links.live"
              name="links.live"
              value={formData.links.live}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="links.download">Download URL</label>
            <input
              type="url"
              id="links.download"
              name="links.download"
              value={formData.links.download}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="links.repo">Repository URL</label>
            <input
              type="url"
              id="links.repo"
              name="links.repo"
              value={formData.links.repo}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/portfolio')}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="save-button">
            {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="form-section">
          <h2>Media</h2>
          <MediaUploader itemId={id} onUploadSuccess={handleMediaUploadSuccess} onUploadComplete={refetchMedia} />
          
          {/* Display uploaded media */}
          {uploadedMedia.length > 0 && (
            <div className="uploaded-media">
              <h3>Uploaded Media</h3>
              <div className="media-grid">
                {uploadedMedia.map((media, index) => (
                  <div key={media._id || index} className="media-item">
                    <img src={media.src} alt={media.alt} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                    <p>{media.alt}</p>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteMedia(media._id)}
                      className="delete-media-btn"
                      style={{ 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioForm;
