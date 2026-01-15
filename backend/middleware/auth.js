const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID Token
 */
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify Firebase ID Token or Custom JWT
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // 1. Try Firebase Token
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            return next();
        } catch (firebaseError) {
            // Not a Firebase token, try Custom JWT
        }

        // 2. Try Custom JWT
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_change_me');
            req.user = decoded; // { uid: ..., email: ... }
            return next();
        } catch (jwtError) {
            console.error('Token verification failed:', jwtError);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = verifyToken;
