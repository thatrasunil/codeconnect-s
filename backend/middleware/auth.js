const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

/**
 * Middleware to verify auth tokens (Firebase ID Tokens or Custom JWT)
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // 1. Try Firebase Verification (if admin is initialized)
        if (admin.apps.length > 0) {
            try {
                const decodedFirebase = await admin.auth().verifyIdToken(token);
                req.user = decodedFirebase; // { uid: ..., email: ..., name: ... }
                return next();
            } catch (firebaseErr) {
                // Not a valid Firebase token, try custom JWT below
                // console.log('DEBUG: Not a Firebase token, trying custom JWT...');
            }
        }

        // 2. Try Custom JWT Verification
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cosmic_secret_key_123');
            req.user = decoded; // { uid: ..., email: ... }
            next();
        } catch (jwtError) {
            console.error('🚫 Token verification failed:', jwtError.message);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

    } catch (error) {
        console.error('🔥 Auth middleware error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = verifyToken;
