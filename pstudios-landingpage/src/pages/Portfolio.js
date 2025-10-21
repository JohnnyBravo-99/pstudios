import React, { useEffect, useState } from 'react';
import './Page.css';

function PortfolioDetail({ item }) {
  const images = item?.media?.images || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImage = images.length > 0;

  return (
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
        <div className="media-viewer">
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
  );
}

function Portfolio() {
  const items = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
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
  const [activeItem, setActiveItem] = useState(null);

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

  return (
    <div className="page-container portfolio-page">
      <div className="portfolio-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="portfolio-card"
            onClick={() => setActiveItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveItem(item);
            }}
            aria-label={`Open ${item.title}`}
          >
            {/* Intentionally no overlay text to keep cards clean */}
          </div>
        ))}
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
