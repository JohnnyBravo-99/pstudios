import React, { useEffect, useState } from 'react';
import { useDataCache } from '../context/DataCacheContext';
import '../styles/Page.css';
import API_BASE_URL from '../config/api';
import { resolveMediaUrl } from '../utils/media';

function PortfolioDetail({ item }) {
  const { prefetchPortfolioItem, getPortfolioItem } = useDataCache();
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
    if (!item?.slug) return;
    
    // Check cache first
    const cached = getPortfolioItem(item.slug);
    if (cached) {
      setData(cached);
      return;
    }
    
    // Check if we need to fetch full details
    const missingDetails = !item?.meta || Object.keys(item.meta || {}).length === 0 || !item?.media || !Array.isArray(item.media.images);
    if (missingDetails) {
      // Prefetch and update when available
      prefetchPortfolioItem(item.slug).then(full => {
        if (full) {
          setData(full);
        } else {
          setData(item || {});
        }
      });
    } else {
      setData(item || {});
    }
  }, [item, prefetchPortfolioItem, getPortfolioItem]);

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
  const { getPortfolio, prefetchPortfolio, cache, prefetchPortfolioItem } = useDataCache();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    
    setLoading(true);
    
    // Try to get from cache first
    const cachedData = await getPortfolio();

    if (cachedData && cachedData.length > 0) {
      setItems(cachedData);
      setLoading(false);
      setError('');
      return;
    }

    // If cache miss or empty, fetch fresh data
    
    const freshData = await prefetchPortfolio(true);

    // Check if there's an actual API error
    const hasApiError = cache.portfolio.error && freshData === null;
    
    if (hasApiError) {
      
      setError(cache.portfolio.error || 'Failed to load portfolio items');
      // Fallback to demo data on error (show error message)
      loadDemoData(true);
    } else if (freshData && freshData.length > 0) {
      
      setItems(freshData);
      setError('');
    } else {
      
      // Empty array is valid - just means no items in database yet
      // Use demo data without showing error (pass false to loadDemoData)
      loadDemoData(false);
    }
    
    setLoading(false);
  };

  // Prefetch individual item on card hover
  const handleCardHover = (item) => {
    if (item?.slug) {
      prefetchPortfolioItem(item.slug);
    }
  };

  const loadDemoData = (showError = true) => {
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
    if (showError) {
      setError('API not available - showing demo data');
    } else {
      setError(''); // Clear error when API is working but returns empty
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
              loadPortfolioData();
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
              onMouseEnter={() => handleCardHover(item)}
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
