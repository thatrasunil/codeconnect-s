const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
// If SOCKET_URL is missing or incorrectly set to Vercel while backend is on Render, align it.
let SOCKET_URL = process.env.REACT_APP_SOCKET_URL || BACKEND_URL;

if (SOCKET_URL.includes('vercel.app') && !BACKEND_URL.includes('vercel.app')) {
    console.warn('⚠️ Config: SOCKET_URL was pointing to Vercel while BACKEND_URL is elsewhere. Realigning...');
    SOCKET_URL = BACKEND_URL;
}

const config = {
    BACKEND_URL,
    SOCKET_URL,
};

console.log('✅ Config Loaded:', config);

export default config;
