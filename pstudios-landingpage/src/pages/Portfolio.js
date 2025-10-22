import React, { useEffect, useState } from 'react';
import '../styles/Page.css';
import API_BASE_URL from '../config/api';

function PortfolioDetail({ item }) {
  const images = item?.media?.images || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasImage = images.length > 0;

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard events for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'Escape') {
          setIsFullscreen(false);
        } else if (e.key === 'ArrowLeft' && images.length > 1) {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        } else if (e.key === 'ArrowRight' && images.length > 1) {
          setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images.length]);

  return (
    <>
      <div className="portfolio-detail">
      <aside className="portfolio-info">
        <h2 className="portfolio-info-title">{item.title}</h2>
        {item.type && <div className="portfolio-type">{item.type}</div>}

        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="portfolio-tags">
            {item.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}

        <div className="portfolio-metrics">
          <dl>
            {item.meta?.role && (<><dt>Role</dt><dd>{item.meta.role}</dd></>)}
            {item.meta?.year && (<><dt>Year</dt><dd>{item.meta.year}</dd></>)}
            {item.meta?.engine && (<><dt>Engine</dt><dd>{item.meta.engine}</dd></>)}
            {item.meta?.software && (
              <>
                <dt>Software</dt>
                <dd>{Array.isArray(item.meta.software) ? item.meta.software.join(', ') : item.meta.software}</dd>
              </>
            )}
            {item.type === '3d-asset' && item.meta?.polycount && (<><dt>Polycount</dt><dd>{item.meta.polycount}</dd></>)}
            {item.type === '3d-asset' && item.meta?.maps && (<><dt>Maps</dt><dd>{Array.isArray(item.meta.maps) ? item.meta.maps.join(', ') : item.meta.maps}</dd></>)}
            {item.type === '3d-asset' && item.meta?.texelDensity && (<><dt>Texel Density</dt><dd>{item.meta.texelDensity}</dd></>)}
            {item.meta?.fileTypes && (<><dt>Files</dt><dd>{Array.isArray(item.meta.fileTypes) ? item.meta.fileTypes.join(', ') : item.meta.fileTypes}</dd></>)}
          </dl>
        </div>

        {(item.links?.live || item.links?.download || item.links?.repo) && (
          <div className="portfolio-actions">
            {item.links?.live && <a className="btn" href={item.links.live} target="_blank" rel="noreferrer">View</a>}
            {item.links?.download && <a className="btn btn-secondary" href={item.links.download}>Download</a>}
            {item.links?.repo && <a className="btn" href={item.links.repo} target="_blank" rel="noreferrer">Repo</a>}
          </div>
        )}
      </aside>

      <section className="portfolio-media">
        <div 
          className="media-viewer" 
          onClick={toggleFullscreen}
          style={{ cursor: hasImage ? 'pointer' : 'default' }}
          title={hasImage ? "Click to view fullscreen" : ""}
        >
          {hasImage ? (
            <img src={images[activeIndex].src} alt={images[activeIndex].alt || item.title} />
          ) : (
            <div className="media-placeholder">No media available</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="media-thumbs" role="listbox" aria-label="Media thumbnails">
            {images.map((m, i) => (
              <button
                key={m.src || i}
                className={`thumb ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-selected={i === activeIndex}
              >
                <img src={m.src} alt={m.alt || `${item.title} ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>

    {/* Full-screen overlay */}
    {isFullscreen && (
      <div className="media-fullscreen-overlay" onClick={toggleFullscreen}>
        <button 
          className="fullscreen-close" 
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          aria-label="Close fullscreen"
        >
          ×
        </button>
        
        <div className="fullscreen-media" onClick={(e) => e.stopPropagation()}>
          {hasImage && (
            <img 
              src={images[activeIndex].src} 
              alt={images[activeIndex].alt || item.title}
              className="fullscreen-image"
            />
          )}
          
          {images.length > 1 && (
            <>
              <button 
                className="fullscreen-nav fullscreen-prev"
                onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button 
                className="fullscreen-nav fullscreen-next"
                onClick={() => setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                aria-label="Next image"
              >
                ›
              </button>
              
              <div className="fullscreen-thumbs">
                {images.map((m, i) => (
                  <button
                    key={m.src || i}
                    className={`fullscreen-thumb ${i === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                    aria-selected={i === activeIndex}
                  >
                    <img src={m.src} alt={m.alt || `${item.title} ${i + 1}`} />
                  </button>
                ))}
              </div>
              
              <div className="fullscreen-counter">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}

function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState(null);

  // API configuration is imported from config/api.js

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError('Failed to load portfolio items');
      }
    } catch (err) {
      console.error('Error fetching portfolio items:', err);
      // Fallback to demo data when API is not available
      const demoItems = Array.from({ length: 9 }, (_, i) => ({
        _id: i + 1,
        title: `Project ${i + 1}`,
        type: i % 2 === 0 ? '3d-asset' : 'branding',
        tags: i % 2 === 0 ? ['PBR', 'Realtime'] : ['Logo', 'Guidelines'],
        meta: i % 2 === 0
          ? {
              role: 'Modeling, Texturing',
              year: 2025,
              engine: 'Unity 2022 LTS',
              software: ['Blender', 'Substance 3D Painter'],
              polycount: '12,340 tris',
              maps: ['BaseColor', 'Normal', 'Roughness', 'AO'],
              texelDensity: '10.24 px/cm',
              fileTypes: ['FBX', 'GLB', 'PNG']
            }
          : {
              role: 'Identity, System',
              year: 2025,
              software: ['Illustrator', 'Photoshop'],
              fileTypes: ['SVG', 'PDF', 'PNG']
            },
        media: {
          images: []
        },
        links: {}
      }));
      setItems(demoItems);
      setError('API not available - showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setActiveItem(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (activeItem) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeItem]);

  if (loading) {
    return (
      <div className="page-container portfolio-page">
        <div className="loading">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container portfolio-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container portfolio-page">
      <div className="portfolio-grid">
        {items.map((item) => {
          const firstImage = item?.media?.images?.[0];
          return (
            <div
              key={item._id}
              className="portfolio-card"
              onClick={() => setActiveItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveItem(item);
              }}
              aria-label={`Open ${item.title}`}
            >
              {firstImage && (
                <img 
                  src={firstImage.src} 
                  alt={firstImage.alt || item.title}
                  className="portfolio-card-image"
                />
              )}
              <div className="portfolio-card-overlay">
                <span className="portfolio-card-title">{item.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {activeItem && (
        <div className="portfolio-modal" onClick={closeModal}>
          <div className="portfolio-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="portfolio-modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            <PortfolioDetail item={activeItem} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
