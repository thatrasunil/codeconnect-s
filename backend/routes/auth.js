const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

module.exports = (db) => {

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

            // check if user exists in firestore
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).get();

            if (!snapshot.empty) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user doc
            // We use a random ID or email hash as UID since we aren't using Firebase Auth for this user
            const uid = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);

            const newUser = {
                uid,
                email,
                username: username || email.split('@')[0],
                displayName: displayName || username || "User",
                password: hashedPassword, // Store hashed!
                createdAt: new Date().toISOString(),
                provider: 'local'
            };

            await usersRef.doc(uid).set(newUser);

            // Generate Token
            const jwt = require('jsonwebtoken');
            const payload = {
                uid: newUser.uid,
                email: newUser.email,
                name: newUser.displayName
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key_change_me', { expiresIn: '7d' });

            res.status(201).json({
                success: true,
                access: token,
                user: { uid: newUser.uid, email: newUser.email, username: newUser.username }
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
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).get();

            if (snapshot.empty) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();

            // Verify Password
            const bcrypt = require('bcryptjs');
            // If user signed up with Google/Firebase, they might not have a password field here
            if (!userData.password) {
                return res.status(400).json({ error: 'Invalid authentication method. Try Google login.' });
            }

            const isMatch = await bcrypt.compare(password, userData.password);

            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate Token
            const jwt = require('jsonwebtoken');
            const payload = {
                uid: userData.uid,
                email: userData.email,
                name: userData.username || userData.displayName
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key_change_me', { expiresIn: '7d' });

            res.json({
                success: true,
                access: token,
                user: { uid: userData.uid, email: userData.email, username: userData.username }
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
            const userId = req.user.uid;

            // Try to get user from 'users' collection first
            let userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists) {
                // If not found, return basic info from token
                return res.json({
                    uid: userId,
                    email: req.user.email,
                    username: req.user.name || req.user.email.split('@')[0],
                    avatar: req.user.picture || null
                });
            }

            res.json({ id: userId, ...userDoc.data() });
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
            const userId = req.user.uid;
            const { username, email, avatar } = req.body;

            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (avatar) updateData.avatar = avatar;
            updateData.updatedAt = new Date().toISOString();

            const userRef = db.collection('users').doc(userId);

            // Use set with merge: true to create if not exists
            await userRef.set(updateData, { merge: true });

            const updatedDoc = await userRef.get();
            res.json({ id: userId, ...updatedDoc.data() });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
