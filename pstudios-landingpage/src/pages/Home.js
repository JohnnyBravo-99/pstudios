import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo-submark-marks-iconography/lp_logo.svg';
import API_BASE_URL from '../config/api';
import { resolveMediaUrl } from '../utils/media';
import PositionedImageRenderer from '../components/PositionedImageRenderer';
import '../styles/Page.css';

const STORAGE_KEY = 'paradigmStudios_hasVisited';

function Home() {
  const location = useLocation();
  const [showLanding, setShowLanding] = useState(false);
  const [fadeOutLogo, setFadeOutLogo] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // Fetch blog posts
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Determine if intro should be shown - ONLY if user has NEVER visited
  useEffect(() => {
    const hasVisited = localStorage.getItem(STORAGE_KEY) === 'true';
    
    // Show intro ONLY if user has never visited before
    if (!hasVisited) {
      setShowLanding(true);
      
      // Mark as visited after showing intro
      localStorage.setItem(STORAGE_KEY, 'true');
      
      // Start fade-out after 2.5 seconds
      const fadeOutTimer = setTimeout(() => {
        setFadeOutLogo(true);
      }, 2500);

      // Complete transition after fade-out (2.5s + 1.5s = 4s total)
      const transitionTimer = setTimeout(() => {
        setShowLanding(false);
      }, 4000);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(transitionTimer);
      };
    } else {
      // Skip intro if user has visited
      setShowLanding(false);
    }
  }, []);

  // Allow clicking logo to skip ahead
  const handleLogoClick = () => {
    if (showLanding) {
      setFadeOutLogo(true);
      setTimeout(() => {
        setShowLanding(false);
      }, 1500);
    }
  };

  if (showLanding) {
    return (
      <div className="landing-container">
        <div className={`landing-logo ${fadeOutLogo ? 'fade-out-logo' : ''}`}>
          <img 
            src={logo} 
            className="App-logo" 
            alt="Paradigm Studios Logo" 
            onClick={handleLogoClick}
          />
        </div>
      </div>
    );
  }

  // Collect all positioned images from all posts
  const allPositionedImages = [];
  if (!loadingBlogs && blogPosts.length > 0) {
    blogPosts.forEach((post) => {
      // Handle missing positionedImages gracefully (Discord bot compatibility)
      const positionedImages = post.positionedImages || [];
      if (Array.isArray(positionedImages) && positionedImages.length > 0) {
        positionedImages.forEach((img) => {
          // Only include images anchored to this post
          if (img.anchorPostId === post._id || !img.anchorPostId) {
            allPositionedImages.push({
              ...img,
              anchorPostId: img.anchorPostId || post._id
            });
          }
        });
      }
    });
  }

  return (
    <div className="home-blog-container">
      {/* Render positioned images first (they use fixed positioning) */}
      {allPositionedImages.map((img, index) => (
        <PositionedImageRenderer
          key={img._id || img.imageId || index}
          image={img}
        />
      ))}

      {/* Blog Posts Feed - Centered in viewport, positioned under header */}
      {!loadingBlogs && blogPosts.length > 0 && (
        <div className="blog-feed">
          <div className="blog-posts-list">
            {blogPosts.map((post) => (
              <article key={post._id} className="blog-post-card">
                {post.media?.image && (
                  <div className="blog-post-image">
                    <img
                      src={resolveMediaUrl(post.media.image.src)}
                      alt={post.media.image.alt || post.title}
                    />
                  </div>
                )}
                {post.media?.video && (
                  <div className="blog-post-video">
                    <video
                      src={resolveMediaUrl(post.media.video.src)}
                      controls
                    />
                  </div>
                )}
                <div className="blog-post-meta">
                  <span className="blog-post-subject">
                    {post.subject}
                  </span>
                  {' • '}
                  <span className="blog-post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="blog-post-title">
                  {post.title}
                </h3>
                <div className="blog-post-body">
                  {post.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
