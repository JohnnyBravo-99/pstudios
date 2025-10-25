import React, { useEffect, useState } from 'react';
import '../styles/Page.css';
import API_BASE_URL from '../config/api';
import { resolveMediaUrl } from '../utils/media';

function PortfolioDetail({ item }) {
  const [data, setData] = useState(item || {});
  const images = data?.media?.images || [];
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

  // Fetch full item by slug if list payload was minimal
  useEffect(() => {
    let isMounted = true;
    async function fetchFull() {
      if (!item?.slug) return;
      const missingDetails = !item?.meta || Object.keys(item.meta || {}).length === 0 || !item?.media || !Array.isArray(item.media.images);
      if (!missingDetails) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/portfolio/${item.slug}`);
        if (res.ok) {
          const full = await res.json();
          if (isMounted) setData(full);
        }
      } catch (_) {}
    }
    setData(item || {});
    fetchFull();
    return () => { isMounted = false; };
  }, [item]);

  return (
    <>
      <div className="portfolio-detail">
      <aside className="portfolio-info">
        <h2 className="portfolio-info-title">{data.title}</h2>
        {data.type && <div className="portfolio-type">{data.type}</div>}

        {Array.isArray(data.tags) && data.tags.length > 0 && (
          <div className="portfolio-tags">
            {data.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}

        <div className="portfolio-metrics">
          <dl>
            {data.meta?.role && (<><dt>Role</dt><dd>{data.meta.role}</dd></>)}
            {data.meta?.year && (<><dt>Year</dt><dd>{data.meta.year}</dd></>)}
            {data.meta?.engine && (<><dt>Engine</dt><dd>{data.meta.engine}</dd></>)}
            {data.meta?.software && (
              <>
                <dt>Software</dt>
                <dd>{Array.isArray(data.meta.software) ? data.meta.software.join(', ') : data.meta.software}</dd>
              </>
            )}
            {data.type === '3d-asset' && data.meta?.polycount && (<><dt>Polycount</dt><dd>{data.meta.polycount}</dd></>)}
            {data.type === '3d-asset' && data.meta?.maps && (<><dt>Maps</dt><dd>{Array.isArray(data.meta.maps) ? data.meta.maps.join(', ') : data.meta.maps}</dd></>)}
            {data.type === '3d-asset' && data.meta?.texelDensity && (<><dt>Texel Density</dt><dd>{data.meta.texelDensity}</dd></>)}
            {data.meta?.fileTypes && (<><dt>Files</dt><dd>{Array.isArray(data.meta.fileTypes) ? data.meta.fileTypes.join(', ') : data.meta.fileTypes}</dd></>)}
          </dl>
        </div>

        {(data.links?.live || data.links?.download || data.links?.repo) && (
          <div className="portfolio-actions">
            {data.links?.live && <a className="btn" href={data.links.live} target="_blank" rel="noreferrer">View</a>}
            {data.links?.download && <a className="btn btn-secondary" href={data.links.download}>Download</a>}
            {data.links?.repo && <a className="btn" href={data.links.repo} target="_blank" rel="noreferrer">Repo</a>}
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
            <img src={resolveMediaUrl(images[activeIndex].src)} alt={images[activeIndex].alt || data.title} />
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
                <img src={resolveMediaUrl(m.src)} alt={m.alt || `${data.title} ${i + 1}`} />
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
              src={resolveMediaUrl(images[activeIndex].src)} 
              alt={images[activeIndex].alt || data.title}
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
                    <img src={resolveMediaUrl(m.src)} alt={m.alt || `${data.title} ${i + 1}`} />
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
      // Enhanced fetch with mobile-specific configurations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        // Mobile-specific configurations
        cache: 'no-cache',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setError(''); // Clear any previous errors
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        setError(`Failed to load portfolio items (${response.status})`);
        // Try without credentials for mobile fallback
        await fetchPortfolioItemsWithoutCredentials();
      }
    } catch (err) {
      console.error('Error fetching portfolio items:', err);
      
      // Check if it's a network error (common on mobile)
      if (err.name === 'AbortError') {
        setError('Request timed out - please check your connection');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error - please check your connection');
        // Try without credentials as fallback
        await fetchPortfolioItemsWithoutCredentials();
      } else {
        setError('Failed to load portfolio items');
        // Fallback to demo data
        loadDemoData();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioItemsWithoutCredentials = async () => {
    try {
      console.log('Trying without credentials for mobile compatibility...');
      const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setError(''); // Clear error on success
        console.log('Successfully loaded portfolio without credentials');
      } else {
        console.log('Fallback also failed, loading demo data');
        loadDemoData();
      }
    } catch (err) {
      console.log('Fallback request failed:', err);
      loadDemoData();
    }
  };

  const loadDemoData = () => {
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
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
          <p className="loading-subtitle">This may take a moment on mobile devices</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container portfolio-page">
        <div className="error-message">
          <h3>Unable to Load Portfolio</h3>
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => {
              setLoading(true);
              setError('');
              fetchPortfolioItems();
            }}
          >
            Try Again
          </button>
          <p className="error-help">
            If this persists, please check your internet connection or try refreshing the page.
          </p>
        </div>
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
                  src={resolveMediaUrl(firstImage.src)} 
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
