const config = {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001',
};

console.log('✅ Config Loaded:', config);

export default config;
