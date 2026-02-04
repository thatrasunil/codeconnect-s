const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT Token (Custom Only)
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify Custom JWT
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_change_me');
            req.user = decoded; // { uid: ..., email: ... }
            next();
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
