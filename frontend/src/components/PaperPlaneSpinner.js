import React from 'react';
import './PaperPlaneSpinner.css';

const PaperPlaneSpinner = ({ size = "medium", text = "Loading...", fullScreen = false }) => {
    // Map size prop to pixel dimensions
    const containerSize = size === "small" ? 100 : size === "large" ? 300 : 200;
    const planeSize = size === "small" ? 40 : size === "large" ? 120 : 80;

    const containerStyle = fullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#0f172a', // Match app background
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column' // Ensure text is below if needed, though PaperPlaneContainer is flex too
    } : { width: containerSize, height: containerSize };

    return (
        <div
            className={`paper-plane-container ${fullScreen ? 'full-screen' : ''}`}
            style={containerStyle}
        >
            {/* Cloud 1 (Top Right) */}
            <div className="cloud cloud-1">
                <svg viewBox="0 0 24 24" className="cloud-svg">
                    <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.105,0.005-0.209,0.014-0.312C10.881,14.062,9.757,14.5,8.5,14.5c-2.485,0-4.5-2.015-4.5-4.5s2.015-4.5,4.5-4.5c0.686,0,1.336,0.155,1.916,0.432C11.523,3.75,13.585,2.5,16,2.5c3.59,0,6.5,2.91,6.5,6.5c0,0.117-0.003,0.233-0.009,0.348C23.366,10.082,24,11.206,24,12.5C24,16.09,21.09,19,17.5,19z" />
                </svg>
            </div>

            {/* Cloud 2 (Bottom Left) */}
            <div className="cloud cloud-2">
                <svg viewBox="0 0 24 24" className="cloud-svg">
                    <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.105,0.005-0.209,0.014-0.312C10.881,14.062,9.757,14.5,8.5,14.5c-2.485,0-4.5-2.015-4.5-4.5s2.015-4.5,4.5-4.5c0.686,0,1.336,0.155,1.916,0.432C11.523,3.75,13.585,2.5,16,2.5c3.59,0,6.5,2.91,6.5,6.5c0,0.117-0.003,0.233-0.009,0.348C23.366,10.082,24,11.206,24,12.5C24,16.09,21.09,19,17.5,19z" />
                </svg>
            </div>

            {/* Cloud 3 (Small distant) */}
            <div className="cloud cloud-3">
                <svg viewBox="0 0 24 24" className="cloud-svg">
                    <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.105,0.005-0.209,0.014-0.312C10.881,14.062,9.757,14.5,8.5,14.5c-2.485,0-4.5-2.015-4.5-4.5s2.015-4.5,4.5-4.5c0.686,0,1.336,0.155,1.916,0.432C11.523,3.75,13.585,2.5,16,2.5c3.59,0,6.5,2.91,6.5,6.5c0,0.117-0.003,0.233-0.009,0.348C23.366,10.082,24,11.206,24,12.5C24,16.09,21.09,19,17.5,19z" />
                </svg>
            </div>

            {/* The Paper Plane SVG */}
            <svg
                className="plane-svg"
                viewBox="0 0 24 24"
                style={{ width: planeSize, height: planeSize }}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Main Body */}
                <path
                    d="M2 12L22 2L15 22L11 13L2 12Z"
                    fill="#4F46E5"
                    stroke="#4338CA"
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
                {/* Fold/Shadow Detail */}
                <path
                    d="M11 13L22 2"
                    stroke="#818CF8"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
            </svg>
            {text && <div style={{ position: 'absolute', bottom: '10px', fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{text}</div>}
        </div>
    );
};

export default PaperPlaneSpinner;
