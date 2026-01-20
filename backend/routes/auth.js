const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (db) => {

    // Helper to get users collection reference
    // We handle check inside routes to avoid crashes if db is not connected yet
    const getUsers = () => db.collection('users');

    /**
     * POST /api/auth/signup
     * Register a new user
     */
    router.post('/signup', async (req, res) => {
        try {
            const { email, password, username, displayName } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            if (!db) {
                return res.status(503).json({ error: 'Database service unavailable' });
            }

            // Check if user already exists (by email or username)
            const usersRef = getUsers();

            // Firestore OR queries are limited, so we might need two queries or a compound one if setup.
            // Simplest correct way without complex indexes: Check Email, then Check Username.

            const emailQuery = await usersRef.where('email', '==', email).get();
            if (!emailQuery.empty) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            if (username) {
                const usernameQuery = await usersRef.where('username', '==', username).get();
                if (!usernameQuery.empty) {
                    return res.status(400).json({ error: 'User with this username already exists' });
                }
            }

            // Hash password (since we lost Mongoose middleware)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                displayName: displayName || username || "User",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || email}`,
                role: 'user',
                createdAt: new Date().toISOString(),
                provider: 'local'
            };

            // Add to Firestore
            const docRef = await usersRef.add(newUser);
            const userId = docRef.id;

            // Generate Token
            const payload = {
                uid: userId,
                email: newUser.email,
                name: newUser.username
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key_change_me', { expiresIn: '7d' });

            res.status(201).json({
                success: true,
                access: token,
                user: {
                    uid: userId,
                    email: newUser.email,
                    username: newUser.username,
                    avatar: newUser.avatar
                }
            });

        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/auth/login
     * Login user
     */
    router.post('/login', async (req, res) => {
        try {
            const { email, username, password } = req.body;

            if ((!email && !username) || !password) {
                return res.status(400).json({ error: 'Email/Username and password are required' });
            }

            if (!db) {
                return res.status(503).json({ error: 'Database service unavailable' });
            }

            const usersRef = getUsers();
            let userDoc = null;
            let userData = null;

            // Find user by email OR username
            if (email) {
                const q = await usersRef.where('email', '==', email).limit(1).get();
                if (!q.empty) {
                    userDoc = q.docs[0];
                    userData = userDoc.data();
                }
            }

            if (!userData && username) {
                const q = await usersRef.where('username', '==', username).limit(1).get();
                if (!q.empty) {
                    userDoc = q.docs[0];
                    userData = userDoc.data();
                }
            }

            if (!userData) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify Password
            if (!userData.password) {
                return res.status(400).json({ error: 'Please login with Google or the method you signed up with.' });
            }

            const isMatch = await bcrypt.compare(password, userData.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate Token
            const payload = {
                uid: userDoc.id,
                email: userData.email,
                name: userData.username
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key_change_me', { expiresIn: '7d' });

            res.json({
                success: true,
                access: token,
                user: {
                    uid: userDoc.id,
                    email: userData.email,
                    username: userData.username,
                    avatar: userData.avatar
                }
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/auth/me
     * Get current user profile
     */
    router.get('/me', verifyToken, async (req, res) => {
        try {
            const userId = req.user.uid || req.user.user_id;

            if (!db) {
                // Fallback if DB not ready but we have token info
                return res.json({
                    uid: userId,
                    email: req.user.email,
                    username: req.user.name || "User",
                    avatar: req.user.picture || null,
                    isTemporary: true
                });
            }

            const userRef = db.collection('users').doc(userId);
            const docSnap = await userRef.get();

            if (!docSnap.exists) {
                return res.json({
                    uid: userId,
                    email: req.user.email,
                    username: req.user.name || req.user.email?.split('@')[0] || "User",
                    avatar: req.user.picture || null,
                    isTemporary: true
                });
            }

            const userData = docSnap.data();
            // Remove sensitive data
            delete userData.password;

            res.json({
                uid: docSnap.id,
                ...userData
            });

        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * PATCH /api/auth/me
     * Update user profile
     */
    router.patch('/me', verifyToken, async (req, res) => {
        try {
            const userId = req.user.uid || req.user.user_id;
            const { username, email, avatar } = req.body;

            if (!db) {
                return res.status(503).json({ error: 'Database service unavailable' });
            }

            const userRef = db.collection('users').doc(userId);
            const docSnap = await userRef.get();

            let userData = {};
            if (docSnap.exists) {
                userData = docSnap.data();
            } else {
                // If user doesn't exist (e.g. firebase auth user not yet in our db), create them
                userData = {
                    email: req.user.email,
                    username: username || req.user.name || "User",
                    createdAt: new Date().toISOString(),
                    role: 'user',
                    provider: 'firebase'
                };
            }

            // Update fields
            if (username) userData.username = username;
            if (email) userData.email = email;
            if (avatar) userData.avatar = avatar;

            // Save (Set with merge true acts like upset/patch)
            await userRef.set(userData, { merge: true });

            res.json({
                uid: userId,
                ...userData,
                password: undefined
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
