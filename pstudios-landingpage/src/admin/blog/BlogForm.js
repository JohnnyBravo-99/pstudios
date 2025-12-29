import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MediaUploader from '../../components/MediaUploader';
import ImagePositioningEditor from './ImagePositioningEditor';
import { resolveMediaUrl } from '../../utils/media';
import '../../styles/Admin.css';
import API_BASE_URL from '../../config/api';

function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    body: '',
    order: 0,
    isPublished: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [positionedImages, setPositionedImages] = useState([]);
  const [showPositioningEditor, setShowPositioningEditor] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchPost();
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

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          subject: data.subject || '',
          body: data.body || '',
          order: data.order || 0,
          isPublished: data.isPublished || false
        });
        // Initialize uploaded media from the fetched post
        if (data.media) {
          setUploadedMedia(data.media);
        }
        // Initialize positioned images
        if (data.positionedImages && Array.isArray(data.positionedImages)) {
          setPositionedImages(data.positionedImages);
        } else {
          setPositionedImages([]);
        }
      } else {
        setError('Failed to fetch blog post');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMediaUploadSuccess = (newMedia) => {
    console.log('Media upload success:', newMedia);
    refetchMedia();
  };

  const refetchMedia = async () => {
    if (!isEdit) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.media) {
          setUploadedMedia(data.media);
          setFormData(prev => ({
            ...prev,
            media: data.media
          }));
        }
        // Refetch positioned images
        if (data.positionedImages && Array.isArray(data.positionedImages)) {
          setPositionedImages(data.positionedImages);
        } else {
          setPositionedImages([]);
        }
      }
    } catch (error) {
      console.error('Error refetching media:', error);
    }
  };

  const handleDeleteMedia = async () => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${id}/media`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setUploadedMedia(null);
        refetchMedia();
      } else {
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
      const url = isEdit ? `${API_BASE_URL}/api/admin/blog/${id}` : `${API_BASE_URL}/api/admin/blog`;
      const method = isEdit ? 'PATCH' : 'POST';

      // Exclude 'media' field from request body - backend schema doesn't allow it
      const { media, ...submitData } = formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isEdit) {
          setError('');
          setSuccess('Blog post updated successfully!');
        } else {
          const newPostId = data._id || data.id;
          if (newPostId) {
            setSuccess('Blog post created successfully! You can now upload media files.');
            setTimeout(() => {
              navigate(`/admin/blog/${newPostId}/edit`);
            }, 1500);
          } else {
            navigate('/admin/blog');
          }
        }
      } else {
        setError(data.error || 'Failed to save blog post');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-form">
      <div className="form-header">
        <h1>{isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
        <button onClick={() => navigate('/admin/blog')} className="back-button">
          Back to Blog
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter blog post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Enter subject/category"
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Body *</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Enter blog post content"
          />
        </div>

        <div className="form-group">
          <label htmlFor="order">Order</label>
          <input
            type="number"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            placeholder="Display order (lower numbers appear first)"
          />
        </div>

        <div className="form-group">
          <label className="form-label-flex">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            Published
          </label>
        </div>

        {isEdit && (
          <div className="form-section">
            <h2>Media</h2>
            <MediaUploader
              itemId={id}
              type="blog"
              multiple={false}
              onUploadSuccess={handleMediaUploadSuccess}
              onUploadComplete={refetchMedia}
            />

            {uploadedMedia && (
              <div className="uploaded-media">
                <h3>Current Media</h3>
                {uploadedMedia.image && (
                  <div className="media-preview">
                    <p><strong>Image:</strong></p>
                    <img
                      src={resolveMediaUrl(uploadedMedia.image.src)}
                      alt={uploadedMedia.image.alt || 'Blog image'}
                    />
                    <button
                      type="button"
                      onClick={handleDeleteMedia}
                      className="delete-button"
                    >
                      Delete Image
                    </button>
                  </div>
                )}
                {uploadedMedia.video && (
                  <div className="media-preview">
                    <p><strong>Video:</strong></p>
                    <video
                      src={resolveMediaUrl(uploadedMedia.video.src)}
                      controls
                    />
                    <button
                      type="button"
                      onClick={handleDeleteMedia}
                      className="delete-button"
                    >
                      Delete Video
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isEdit && (
          <div className="form-section">
            <h2>Positioned Images</h2>
            <p className="positioned-images-info">
              Place images anywhere on the viewport and anchor them to this blog post.
            </p>

            {positionedImages.length > 0 && (
              <div className="positioned-images-list">
                <h3>Current Positioned Images ({positionedImages.length})</h3>
                <div className="positioned-images-grid">
                  {positionedImages.map((img, index) => (
                    <div key={img._id || index} className="positioned-image-item">
                      <img
                        src={resolveMediaUrl(img.src)}
                        alt={img.alt || 'Positioned image'}
                      />
                      <p>
                        Z-Index: {img.zIndex} | Scale: {(img.scale || 1.0).toFixed(2)}x
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPositioningEditor(true)}
              className="submit-button submit-button-spaced"
            >
              {positionedImages.length > 0 ? 'Edit Positioned Images' : 'Add Positioned Images'}
            </button>

            {showPositioningEditor && (
              <div className="modal-overlay">
                <div className="modal-content-wrapper">
                  <ImagePositioningEditor
                    postId={id}
                    availableImages={uploadedMedia?.image ? [
                      {
                        src: uploadedMedia.image.src,
                        alt: uploadedMedia.image.alt || 'Blog image'
                      }
                    ] : []}
                    positionedImages={positionedImages}
                    onSave={() => {
                      refetchMedia();
                      setShowPositioningEditor(false);
                    }}
                    onClose={() => setShowPositioningEditor(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : (isEdit ? 'Update Blog Post' : 'Create Blog Post')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BlogForm;

