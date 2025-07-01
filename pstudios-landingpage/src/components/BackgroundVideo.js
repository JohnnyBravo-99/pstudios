import React, { useEffect, useState } from 'react';
import './BackgroundVideo.css';


function BackgroundVideo({isVideoActive, onBack}) {
    const [active, setActive] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleFadeout = () => {

        setIsFadingOut(true);

        setTimeout(() => {
            if(onBack) onBack();
        }, 1500);

    }

    useEffect(() => {
        const timeout = setTimeout(() =>{setActive(true);}, 50);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
    
        <div className={`video-container ${active ? 'active' : ''} ${isFadingOut ? 'fade-out' : ''}`}>
            
                <video 
                /*ref={videoRef}*/
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
            
                

                <div className="centered-div">

                        <div className="backWrapper">
                            <div className="backBtn" onClick={handleFadeout}> <h3>Home</h3> </div>
                        </div>

                    <h1>We Are Paradigm Studios</h1>
                    <p>
                            This isn’t the full site — but it’s not empty either. 
                            What you're seeing (and how you're seeing it) is part of what we do. 
                            Every frame, every detail — designed by us, with intention.

                    </p>
                    <p>
                            At Paradigm Studios, we focus on next-gen visuals for games, branding, and narrative design — 
                            blending form with function, aesthetics with strategy. 
                            The clips in the background are pieces of our process: real work in motion, not placeholders.

                    </p>
                    <p>
                            The rest is coming together, but if something here resonates — a detail, a direction, a feeling — reach out. 
                            We’re always interested in ideas that challenge, connect, or surprise.

                    </p>
                    <h2>Website launching soon.</h2>
                    <div className="email">
                       <div className="emailText"> 📩 Contact us at: <a href="mailto:jarnold@paradigmstudios.art" className="emailBadge">jarnold@paradigmstudios.art  </a></div>
                    </div>
                </div>
            </div>
            </>
            
    )
}

export default BackgroundVideo;