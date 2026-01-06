import React, { useState, useEffect, useRef } from 'react';
import PositioningGizmo from './PositioningGizmo';
import API_BASE_URL from '../../config/api';
import { resolveMediaUrl } from '../../utils/media';
import '../../styles/ImagePositioning.css';

function ImagePositioningEditor({ 
  postId, 
  availableImages = [], 
  positionedImages = [], 
  onSave,
  onClose 
}) {
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    fetchBlogPosts();
    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  const updateViewportSize = () => {
    if (containerRef.current) {
      setViewportSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  const handleAddImage = (imageSrc, imageAlt) => {
    const newImage = {
      imageId: Date.now().toString(),
      src: imageSrc,
      alt: imageAlt || 'Positioned image',
      position: { x: 100, y: 100, unit: 'px' },
      size: { width: 200, height: 200 },
      zIndex: 0,
      anchorPostId: postId,
      scale: 1.0
    };
    setEditingImage(newImage);
    setSelectedImage(newImage);
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    setEditingImage({ ...image });
  };

  const handlePositionChange = (updatedImage) => {
    setEditingImage(updatedImage);
  };

  const handleSizeChange = (updatedImage) => {
    setEditingImage(updatedImage);
  };

  const handleZIndexToggle = () => {
    if (editingImage) {
      const newZIndex = editingImage.zIndex >= 0 ? -1 : 1;
      setEditingImage({ ...editingImage, zIndex: newZIndex });
    }
  };

  const handleScaleChange = (e) => {
    if (editingImage) {
      const newScale = parseFloat(e.target.value) || 1.0;
      setEditingImage({ ...editingImage, scale: newScale });
    }
  };

  const handleSave = async () => {
    if (!editingImage) return;

    try {
      const url = editingImage._id
        ? `${API_BASE_URL}/api/admin/blog/${postId}/positioned-images/${editingImage._id}`
        : `${API_BASE_URL}/api/admin/blog/${postId}/positioned-images`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingImage),
      });

      if (response.ok) {
        if (onSave) onSave();
        setSelectedImage(null);
        setEditingImage(null);
      } else {
        console.error('Failed to save positioned image');
      }
    } catch (error) {
      console.error('Error saving positioned image:', error);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this positioned image?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/blog/${postId}/positioned-images/${imageId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        if (onSave) onSave();
        setSelectedImage(null);
        setEditingImage(null);
      }
    } catch (error) {
      console.error('Error deleting positioned image:', error);
    }
  };

  return (
    <div className="image-positioning-editor">
      <div className="editor-header">
        <h2>Image Positioning Editor</h2>
        <button onClick={onClose} className="close-button">Close</button>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Available Images</h3>
            <div className="available-images-list">
              {availableImages.map((img, index) => (
                <div key={index} className="available-image-item">
                  <img
                    src={resolveMediaUrl(img.src || img)}
                    alt={img.alt || `Image ${index + 1}`}
                    onClick={() => handleAddImage(img.src || img, img.alt)}
                  />
                  <button
                    onClick={() => handleAddImage(img.src || img, img.alt)}
                    className="add-image-button"
                  >
                    Add to Viewport
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Positioned Images</h3>
            <div className="positioned-images-list">
              {positionedImages.map((img, index) => (
                <div
                  key={img._id || index}
                  className={`positioned-image-item ${selectedImage === img ? 'selected' : ''}`}
                  onClick={() => handleSelectImage(img)}
                >
                  <img src={resolveMediaUrl(img.src)} alt={img.alt} />
                  <div className="image-info">
                    <p>Z-Index: {img.zIndex}</p>
                    <p>Scale: {(img.scale || 1.0).toFixed(2)}x</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(img._id);
                    }}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-main">
          <div className="viewport-container" ref={containerRef}>
            <div className="viewport-preview">
              {/* Render blog posts in order */}
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="blog-post-preview"
                  style={{
                    position: 'absolute',
                    top: (post.order || 0) * 120 + 20,
                    left: 20,
                    width: 'calc(100% - 40px)',
                    minHeight: 100,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px dashed rgba(255, 255, 255, 0.3)',
                    padding: '10px',
                    borderRadius: '4px'
                  }}
                >
                  <h4>{post.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {post.subject} • Order: {post.order || 0}
                  </p>
                </div>
              ))}

              {/* Render positioned images */}
              {positionedImages.map((img, index) => {
                if (img === selectedImage) return null; // Don't render selected image here, gizmo will handle it
                const { x, y } = img.position || { x: 0, y: 0 };
                const { width, height } = img.size || { width: 200, height: 200 };
                const scale = img.scale || 1.0;
                return (
                  <img
                    key={img._id || index}
                    src={resolveMediaUrl(img.src)}
                    alt={img.alt}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      width: width * scale,
                      height: height * scale,
                      objectFit: 'contain',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      opacity: 0.5,
                      pointerEvents: 'none',
                      zIndex: img.zIndex || 0
                    }}
                  />
                );
              })}

              {/* Gizmo for selected image */}
              {editingImage && (
                <>
                  <img
                    src={resolveMediaUrl(editingImage.src)}
                    alt={editingImage.alt}
                    style={{
                      position: 'absolute',
                      left: editingImage.position.x,
                      top: editingImage.position.y,
                      width: editingImage.size.width * (editingImage.scale || 1.0),
                      height: editingImage.size.height * (editingImage.scale || 1.0),
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      zIndex: editingImage.zIndex || 0
                    }}
                  />
                  <PositioningGizmo
                    image={editingImage}
                    onPositionChange={handlePositionChange}
                    onSizeChange={handleSizeChange}
                    containerRef={containerRef}
                    isActive={true}
                  />
                </>
              )}
            </div>
          </div>

          {editingImage && (
            <div className="editor-controls">
              <div className="control-group">
                <label>Position</label>
                <div className="position-inputs">
                  <input
                    type="number"
                    value={Math.round(editingImage.position.x)}
                    onChange={(e) => {
                      const newX = parseFloat(e.target.value) || 0;
                      setEditingImage({
                        ...editingImage,
                        position: { ...editingImage.position, x: newX }
                      });
                    }}
                  />
                  <input
                    type="number"
                    value={Math.round(editingImage.position.y)}
                    onChange={(e) => {
                      const newY = parseFloat(e.target.value) || 0;
                      setEditingImage({
                        ...editingImage,
                        position: { ...editingImage.position, y: newY }
                      });
                    }}
                  />
                </div>
              </div>

              <div className="control-group">
                <label>Scale</label>
                <input
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={editingImage.scale || 1.0}
                  onChange={handleScaleChange}
                />
              </div>

              <div className="control-group">
                <label>Z-Index</label>
                <button onClick={handleZIndexToggle} className="z-index-toggle">
                  {editingImage.zIndex >= 0 ? 'Front of Post' : 'Behind Post'}
                </button>
                <span className="z-index-value">({editingImage.zIndex})</span>
              </div>

              <div className="control-actions">
                <button onClick={handleSave} className="save-button">
                  Save Position
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setEditingImage(null);
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImagePositioningEditor;





























