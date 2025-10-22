import React, { useEffect, useState } from 'react';
import '../styles/BackgroundVideo.css';

function BackgroundVideo({ isVideoActive = true }) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (isVideoActive) {
            const timeout = setTimeout(() => { 
                setActive(true); 
                console.log('BackgroundVideo activated');
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [isVideoActive]);

    if (!isVideoActive) return null;

    return (
        <div className={`video-container ${active ? 'active' : ''}`}>
            <video 
                className="bg-video"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                draggable={false}
                onLoadedData={() => console.log('Video loaded successfully')}
                onError={(e) => console.error('Video error:', e)}
            >
                <source src="/bg-video.mp4" type="video/mp4" />
                Your browser does not support HTML5 video
            </video>
        </div>
    );
}

export default BackgroundVideo;
