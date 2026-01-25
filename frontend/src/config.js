const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const config = {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || (isLocal ? 'http://localhost:3001' : 'https://codeconnect-backend-red.vercel.app'),
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || (isLocal ? 'http://localhost:3001' : 'https://codeconnect-backend-red.vercel.app'),
};

console.log('✅ Config Loaded:', config);

export default config;
