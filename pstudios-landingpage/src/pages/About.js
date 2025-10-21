import React from 'react';
import './Page.css';

// Import all branding pages in numerical order
import CoverPage from '../assets/branding-pages/1coverPage.webp';
import TableOfContents from '../assets/branding-pages/2tableOfContents.webp';
import OurMission from '../assets/branding-pages/3our Mission.webp';
import OurApproach from '../assets/branding-pages/4our Approach.webp';
import Manifesto from '../assets/branding-pages/5Manifesto.webp';
import Personality from '../assets/branding-pages/6personality.webp';
import Rules001 from '../assets/branding-pages/7rules_001.webp';
import Rules002 from '../assets/branding-pages/8rules_002.webp';
import Rules003 from '../assets/branding-pages/9rules_003.webp';
import StyleCoverPage from '../assets/branding-pages/10ourStyleCoverPage.webp';
import Artboard9Copy3 from '../assets/branding-pages/11Artboard 9 copy 3.webp';
import OurLogo from '../assets/branding-pages/12ourLogo.webp';
import Artboard16 from '../assets/branding-pages/13Artboard 16.webp';
import Artboard16Copy from '../assets/branding-pages/14Artboard 16 copy.webp';
import Artboard9Copy4 from '../assets/branding-pages/15Artboard 9 copy 4.webp';
import Artboard9Copy5 from '../assets/branding-pages/16Artboard 9 copy 5.webp';
import Artboard9Copy6 from '../assets/branding-pages/17Artboard 9 copy 6.webp';

function About() {
  // Array of branding pages in order
  const brandingPages = [
    { src: CoverPage, alt: 'Cover Page' },
    { src: TableOfContents, alt: 'Table of Contents' },
    { src: OurMission, alt: 'Our Mission' },
    { src: OurApproach, alt: 'Our Approach' },
    { src: Manifesto, alt: 'Manifesto' },
    { src: Personality, alt: 'Personality' },
    { src: Rules001, alt: 'Rules 001' },
    { src: Rules002, alt: 'Rules 002' },
    { src: Rules003, alt: 'Rules 003' },
    { src: StyleCoverPage, alt: 'Style Cover Page' },
    { src: Artboard9Copy3, alt: 'Artboard 9 Copy 3' },
    { src: OurLogo, alt: 'Our Logo' },
    { src: Artboard16, alt: 'Artboard 16' },
    { src: Artboard16Copy, alt: 'Artboard 16 Copy' },
    { src: Artboard9Copy4, alt: 'Artboard 9 Copy 4' },
    { src: Artboard9Copy5, alt: 'Artboard 9 Copy 5' },
    { src: Artboard9Copy6, alt: 'Artboard 9 Copy 6' }
  ];

  return (
    <div className="page-container about-page">
      <div className="branding-images-section">
        {brandingPages.map((page, index) => (
          <img
            key={index}
            src={page.src}
            alt={page.alt}
            className="branding-image"
          />
        ))}
      </div>
    </div>
  );
}

export default About;
