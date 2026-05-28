const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || BACKEND_URL;

const config = {
    BACKEND_URL,
    SOCKET_URL,
};

console.log('✅ Config Loaded:', config);

export default config;
