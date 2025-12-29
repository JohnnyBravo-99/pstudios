import React, { useState, useRef } from 'react';
import API_BASE_URL from '../config/api';

/**
 * Unified Media Uploader Component
 * Supports portfolio items, blog posts, and future content types
 * 
 * @param {string} itemId - The ID of the item (portfolio item or blog post)
 * @param {string} type - Content type: 'portfolio' | 'blog' (default: 'portfolio')
 * @param {boolean} multiple - Allow multiple file uploads (default: true for portfolio, false for blog)
 * @param {function} onUploadSuccess - Callback when a file uploads successfully
 * @param {function} onUploadComplete - Callback when all uploads complete
 * @param {string} label - Custom label for the uploader (optional)
 */
function MediaUploader({ 
  itemId, 
  type = 'portfolio', 
  multiple = null, // null means auto-detect based on type
  onUploadSuccess, 
  onUploadComplete,
  label = null
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-detect multiple based on type if not explicitly set
  const allowMultiple = multiple !== null ? multiple : (type === 'portfolio');

  // Define allowed file types based on content type
  const getAllowedTypes = () => {
    const baseTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (type === 'portfolio') {
      return [
        ...baseTypes,
        'image/gif',
        'video/mp4',
        'model/gltf-binary',
        'application/octet-stream' // for .glb files
      ];
    } else if (type === 'blog') {
      return [
        ...baseTypes,
        'video/mp4'
      ];
    }
    
    // Default: allow all base types
    return baseTypes;
  };

  const getAllowedExtensions = () => {
    if (type === 'portfolio') {
      return '.glb,.gltf';
    }
    return '';
  };

  const getAcceptString = () => {
    if (type === 'portfolio') {
      return 'image/*,video/*,.glb,.gltf';
    } else {
      return 'image/*,video/mp4';
    }
  };

  const getSupportedTypesText = () => {
    if (type === 'portfolio') {
      return 'Supported: Images (JPG, PNG, WebP), Videos (MP4), 3D Models (.glb)';
    } else {
      return 'Supported: Images (JPG, PNG, WebP) or Videos (MP4)';
    }
  };

  const getUploadPath = () => {
    return type === 'portfolio' 
      ? `/api/admin/portfolio/${itemId}/media`
      : `/api/admin/blog/${itemId}/media`;
  };

  const getMediaPath = () => {
    return type === 'portfolio'
      ? `/media/portfolio/${itemId}/`
      : `/media/blog/${itemId}/`;
  };

  const getItemTypeLabel = () => {
    return type === 'portfolio' ? 'Portfolio Item' : 'Blog Post';
  };

  const handleFileUpload = async (files) => {
    if (!itemId) {
      setError(`No ${getItemTypeLabel().toLowerCase()} selected`);
      return;
    }

    const fileList = Array.isArray(files) ? files : Array.from(files || []);
    if (!fileList.length) return;

    // If single file mode and multiple files selected, only use first
    const filesToUpload = allowMultiple ? fileList : [fileList[0]];

    const allowedTypes = getAllowedTypes();
    const allowedExtensions = getAllowedExtensions();

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      for (const file of filesToUpload) {
        // Check file type
        const isValidType = allowedTypes.includes(file.type) || 
          (allowedExtensions && allowedExtensions.split(',').some(ext => 
            file.name.toLowerCase().endsWith(ext.trim())
          ));
        
        if (!isValidType) {
          setError(`Invalid file type: ${file.name}. ${getSupportedTypesText()}`);
          continue;
        }

        // Check file size
        if (file.size > 50 * 1024 * 1024) {
          setError('File size too large. Maximum size is 50MB');
          continue;
        }

        const formData = new FormData();
        formData.append('media', file);
        formData.append('alt', file.name);

        const response = await fetch(`${API_BASE_URL}${getUploadPath()}`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          // Handle different response formats
          let mediaItem = result.media || result.file;
          
          // Portfolio-specific: handle legacy response format
          if (type === 'portfolio' && !mediaItem && result.file) {
            mediaItem = {
              _id: result.file.id || undefined,
              src: result.file.url,
              alt: file.name
            };
          }

          if (mediaItem && onUploadSuccess) {
            onUploadSuccess(mediaItem);
          }
        } else {
          setError(result.error || 'Upload failed');
        }
      }

      setSuccess('Upload complete');
      if (onUploadComplete) onUploadComplete();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    handleFileUpload(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
    // Reset file input
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayLabel = label || getItemTypeLabel();

  return (
    <div className="media-uploader">
      <h3>{label || 'Media Uploader'}</h3>

      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          padding: '0.5rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          color: '#155724',
          backgroundColor: '#d4edda',
          padding: '0.5rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: dragOver ? '#f0f8ff' : '#fafafa',
          transition: 'all 0.3s ease',
          opacity: isUploading ? 0.6 : 1
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          onChange={handleFileInput}
          accept={getAcceptString()}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {isUploading ? (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Uploading...</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              {dragOver ? '📁' : '⬆️'}
            </div>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {dragOver 
                ? (allowMultiple ? 'Drop files here' : 'Drop file here')
                : (allowMultiple ? 'Click to upload or drag and drop' : 'Click to upload or drag and drop')
              }
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {getSupportedTypesText()}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Max file size: 50MB
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p><strong>{displayLabel} ID:</strong> {itemId}</p>
        <p>Files will be uploaded to: {getMediaPath()}</p>
      </div>
    </div>
  );
}

export default MediaUploader;

