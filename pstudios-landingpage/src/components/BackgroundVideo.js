import React, { useEffect, useState } from 'react';
import './BackgroundVideo.css';

function BackgroundVideo({ isVideoActive }) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => { setActive(true); }, 50);
        return () => clearTimeout(timeout);
    }, []);

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
            >
                <source src="/bg-video.mp4" type="video/mp4" />
                Your browser does not support HTML5 video
            </video>
        </div>
    );
}

export default BackgroundVideo;
