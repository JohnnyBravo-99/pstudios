import React, { useState } from 'react';
import '../../styles/Admin.css';
import API_BASE_URL from '../../config/api';

function MediaUploader({ itemId, onUploadSuccess, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'video/mp4',
      'model/gltf-binary', 'application/octet-stream' // GLB files
    ];
    
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.glb')) {
      return 'File type not supported. Please use JPEG, PNG, WebP, MP4, or GLB files.';
    }
    
    return null;
  };

  const handleFileUpload = async (file) => {
    console.log('Starting file upload:', file.name, 'to item:', itemId);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('media', file);
    formData.append('alt', file.name);

    try {
      console.log('Sending request to:', `${API_BASE_URL}/api/admin/portfolio/${itemId}/media`);
      const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${itemId}/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setUploadProgress(100);
        // Call the success callback instead of reloading
        if (onUploadSuccess) {
          onUploadSuccess(data.media);
        }
        // Call the complete callback to refetch media
        if (onUploadComplete) {
          onUploadComplete();
        }
        setError(''); // Clear any previous errors
        console.log('Upload successful');
        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } else {
        setError(data.error || 'Upload failed');
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="media-uploader">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h3>Upload Media</h3>
          <p>Drag and drop files here, or click to select</p>
          <input
            type="file"
            accept="image/*,video/*,.glb"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
            id="media-upload"
          />
          <label htmlFor="media-upload" className="upload-button">
            {uploading ? 'Uploading...' : 'Choose File'}
          </label>
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span>{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-info">
        <h4>Supported file types:</h4>
        <ul>
          <li>Images: JPEG, PNG, WebP</li>
          <li>Videos: MP4</li>
          <li>3D Models: GLB</li>
        </ul>
        <p>Maximum file size: 50MB</p>
      </div>
    </div>
  );
}

export default MediaUploader;