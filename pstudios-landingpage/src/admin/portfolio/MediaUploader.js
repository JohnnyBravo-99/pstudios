import React from 'react';

function MediaUploader({ itemId, onUploadSuccess, onUploadComplete }) {
  console.log('MediaUploader rendered with itemId:', itemId);
  
  return (
    <div className="media-uploader">
      <h3>Media Uploader</h3>
      <p>Item ID: {itemId}</p>
      <p>This is a simple test version of the MediaUploader component.</p>
    </div>
  );
}

export default MediaUploader;