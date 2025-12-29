import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../../styles/ImagePositioning.css';

function PositioningGizmo({ 
  image, 
  onPositionChange, 
  onSizeChange, 
  containerRef,
  isActive = false 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const gizmoRef = useRef(null);
  
  // Use refs to access latest state in event handlers
  const stateRef = useRef({ isDragging, isResizing, resizeHandle, startPos, startSize, image });
  
  useEffect(() => {
    stateRef.current = { isDragging, isResizing, resizeHandle, startPos, startSize, image };
  }, [isDragging, isResizing, resizeHandle, startPos, startSize, image]);

  const handleSize = 10; // Size of corner handles in pixels
  const cornerThreshold = 15; // Distance from corner to trigger resize mode

  // Calculate corner positions
  const getCorners = () => {
    if (!image || !image.position || !image.size) return [];
    
    const { x, y } = image.position;
    const { width, height } = image.size;
    const scale = image.scale || 1.0;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    return [
      { x: x, y: y, name: 'top-left' },
      { x: x + scaledWidth, y: y, name: 'top-right' },
      { x: x, y: y + scaledHeight, name: 'bottom-left' },
      { x: x + scaledWidth, y: y + scaledHeight, name: 'bottom-right' },
      { x: x + scaledWidth / 2, y: y, name: 'top-center' },
      { x: x + scaledWidth / 2, y: y + scaledHeight, name: 'bottom-center' },
      { x: x, y: y + scaledHeight / 2, name: 'left-center' },
      { x: x + scaledWidth, y: y + scaledHeight / 2, name: 'right-center' }
    ];
  };

  // Check if point is near a corner
  const getHandleAtPoint = (x, y) => {
    const corners = getCorners();
    for (const corner of corners) {
      const distance = Math.sqrt(
        Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2)
      );
      if (distance < cornerThreshold) {
        return corner.name;
      }
    }
    return null;
  };

  // Check if point is in main area (not near corners)
  const isInMainArea = (x, y) => {
    if (!image || !image.position || !image.size) return false;
    
    const { x: imgX, y: imgY } = image.position;
    const { width, height } = image.size;
    const scale = image.scale || 1.0;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    // Check if point is within image bounds but not near corners
    const inBounds = x >= imgX && x <= imgX + scaledWidth &&
                     y >= imgY && y <= imgY + scaledHeight;
    
    if (!inBounds) return false;

    // Check if not near any corner
    return getHandleAtPoint(x, y) === null;
  };

  const handleMouseDown = (e) => {
    if (!isActive || !containerRef?.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getHandleAtPoint(x, y);
    
    if (handle) {
      // Start resizing
      setIsResizing(true);
      setResizeHandle(handle);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartSize({
        width: image.size.width * (image.scale || 1.0),
        height: image.size.height * (image.scale || 1.0)
      });
    } else if (isInMainArea(x, y)) {
      // Start dragging
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };


  useEffect(() => {
    if (!isActive) return;

    const handleMove = (e) => {
      const state = stateRef.current;
      if (!state.image || !containerRef?.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (state.isResizing && state.resizeHandle) {
        const deltaX = e.clientX - state.startPos.x;
        const deltaY = e.clientY - state.startPos.y;
        
        let newWidth = state.startSize.width;
        let newHeight = state.startSize.height;
        let newX = state.image.position.x;
        let newY = state.image.position.y;

        switch (state.resizeHandle) {
          case 'top-left':
            newWidth = Math.max(20, state.startSize.width - deltaX);
            newHeight = Math.max(20, state.startSize.height - deltaY);
            newX = state.image.position.x + (state.startSize.width - newWidth);
            newY = state.image.position.y + (state.startSize.height - newHeight);
            break;
          case 'top-right':
            newWidth = Math.max(20, state.startSize.width + deltaX);
            newHeight = Math.max(20, state.startSize.height - deltaY);
            newY = state.image.position.y + (state.startSize.height - newHeight);
            break;
          case 'bottom-left':
            newWidth = Math.max(20, state.startSize.width - deltaX);
            newHeight = Math.max(20, state.startSize.height + deltaY);
            newX = state.image.position.x + (state.startSize.width - newWidth);
            break;
          case 'bottom-right':
            newWidth = Math.max(20, state.startSize.width + deltaX);
            newHeight = Math.max(20, state.startSize.height + deltaY);
            break;
          case 'top-center':
            newHeight = Math.max(20, state.startSize.height - deltaY);
            newY = state.image.position.y + (state.startSize.height - newHeight);
            break;
          case 'bottom-center':
            newHeight = Math.max(20, state.startSize.height + deltaY);
            break;
          case 'left-center':
            newWidth = Math.max(20, state.startSize.width - deltaX);
            newX = state.image.position.x + (state.startSize.width - newWidth);
            break;
          case 'right-center':
            newWidth = Math.max(20, state.startSize.width + deltaX);
            break;
        }

        const maxX = rect.width;
        const maxY = rect.height;
        newX = Math.max(0, Math.min(newX, maxX - newWidth));
        newY = Math.max(0, Math.min(newY, maxY - newHeight));

        const originalWidth = state.image.size.width;
        const originalHeight = state.image.size.height;
        const scaleX = newWidth / originalWidth;
        const scaleY = newHeight / originalHeight;
        const newScale = Math.min(scaleX, scaleY);

        if (onSizeChange) {
          onSizeChange({
            ...state.image,
            position: { ...state.image.position, x: newX, y: newY },
            scale: newScale
          });
        }
      } else if (state.isDragging) {
        const deltaX = e.clientX - state.startPos.x;
        const deltaY = e.clientY - state.startPos.y;

        const newX = state.image.position.x + deltaX;
        const newY = state.image.position.y + deltaY;

        const { width, height } = state.image.size;
        const scale = state.image.scale || 1.0;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        const maxX = rect.width - scaledWidth;
        const maxY = rect.height - scaledHeight;

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        if (onPositionChange) {
          onPositionChange({
            ...state.image,
            position: { ...state.image.position, x: constrainedX, y: constrainedY }
          });
        }

        setStartPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      if (containerRef?.current) {
        containerRef.current.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isActive, onPositionChange, onSizeChange, containerRef]);

  if (!image || !image.position || !image.size || !isActive) {
    return null;
  }

  const { x, y } = image.position;
  const { width, height } = image.size;
  const scale = image.scale || 1.0;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  const corners = getCorners();

  return (
    <div
      ref={gizmoRef}
      className="positioning-gizmo"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: scaledWidth,
        height: scaledHeight,
        pointerEvents: 'all',
        zIndex: 1000
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Wireframe border */}
      <div className="gizmo-wireframe" />
      
      {/* Corner handles */}
      {corners.map((corner, index) => (
        <div
          key={index}
          className={`gizmo-handle gizmo-handle-${corner.name}`}
          style={{
            position: 'absolute',
            left: corner.x - x - handleSize / 2,
            top: corner.y - y - handleSize / 2,
            width: handleSize,
            height: handleSize
          }}
        />
      ))}
    </div>
  );
}

export default PositioningGizmo;



















