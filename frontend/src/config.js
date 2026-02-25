const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

const config = {
    BACKEND_URL,
};

console.log('✅ Config Loaded:', config);

export default config;
