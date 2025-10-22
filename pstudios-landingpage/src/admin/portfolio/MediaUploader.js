import React, { useState } from 'react';
import '../../styles/Admin.css';
import API_BASE_URL from '../../config/api';

function MediaUploader({ itemId, onUploadSuccess, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    console.log('Starting file upload:', file.name, 'to item:', itemId);
    setUploading(true);
    setError('');

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
