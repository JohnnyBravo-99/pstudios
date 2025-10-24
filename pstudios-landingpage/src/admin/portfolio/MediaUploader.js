import React, { useState, useRef } from 'react';
import API_BASE_URL from '../../config/api';

function MediaUploader({ itemId, onUploadSuccess, onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!itemId) {
      setError('No portfolio item selected');
      return;
    }

    const fileList = Array.isArray(files) ? files : Array.from(files || []);
    if (!fileList.length) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'model/gltf-binary',
      'application/octet-stream'
    ];

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      for (const file of fileList) {
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.glb')) {
          setError('Invalid file type. Please upload images, videos, or 3D models (.glb)');
          continue;
        }
        if (file.size > 50 * 1024 * 1024) {
          setError('File size too large. Maximum size is 50MB');
          continue;
        }

        const formData = new FormData();
        formData.append('media', file);
        formData.append('alt', file.name);

        const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${itemId}/media`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          let mediaItem = result.media;
          if (!mediaItem && result.file) {
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

  return (
    <div className="media-uploader">
      <h3>Media Uploader</h3>

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
          multiple
          onChange={handleFileInput}
          accept="image/*,video/*,.glb,.gltf"
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
              {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Supported: Images (JPG, PNG, WebP), Videos (MP4), 3D Models (.glb)
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Max file size: 50MB
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p><strong>Portfolio Item ID:</strong> {itemId}</p>
        <p>Files will be uploaded to: /media/portfolio/{itemId}/</p>
      </div>
    </div>
  );
}

export default MediaUploader;