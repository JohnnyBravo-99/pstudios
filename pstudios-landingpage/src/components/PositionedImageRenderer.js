import React from 'react';
import { resolveMediaUrl } from '../utils/media';

function PositionedImageRenderer({ image, viewportWidth, viewportHeight }) {
  if (!image || !image.position || !image.size) {
    return null;
  }

  const { x, y, unit } = image.position;
  const { width, height } = image.size;
  const scale = image.scale || 1.0;
  const zIndex = image.zIndex !== undefined ? image.zIndex : 0;

  // Calculate position based on unit
  let left, top;
  if (unit === '%') {
    left = `${x}%`;
    top = `${y}%`;
  } else {
    // For px, use viewport-relative positioning
    left = `${x}px`;
    top = `${y}px`;
  }

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <img
      src={resolveMediaUrl(image.src)}
      alt={image.alt || 'Positioned image'}
      style={{
        position: 'fixed',
        left,
        top,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        objectFit: 'contain',
        pointerEvents: 'none',
        zIndex: zIndex,
        userSelect: 'none'
      }}
      loading="lazy"
    />
  );
}

export default PositionedImageRenderer;





























