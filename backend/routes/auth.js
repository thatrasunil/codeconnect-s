const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Routes don't need 'db' injection anymore since we import Mongoose models directly
// But we keep the function signature to avoid breaking server.js dynamic usage if passed
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

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username: username || email.split('@')[0] }]
            });

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email or username already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                displayName: displayName || username || "User",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || email}`,
                role: 'user',
                provider: 'local'
            });

            await newUser.save();

            // Generate Token
            const payload = {
                uid: newUser._id.toString(), // Standardize to uid for frontend compat
                _id: newUser._id.toString(),
                email: newUser.email,
                name: newUser.username
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key_change_me', { expiresIn: '7d' });

            res.status(201).json({
                success: true,
                access: token,
                user: {
                    uid: newUser._id,
                    email: newUser.email,
                    username: newUser.username,
                    avatar: newUser.avatar,
                    displayName: newUser.displayName
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

            // Find user
            const user = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify Password
            if (!user.password) {
                return res.status(400).json({ error: 'Please login with the method you signed up with (e.g., Google).' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate Token
            const payload = {
                uid: user._id.toString(),
                _id: user._id.toString(),
                email: user.email,
                name: user.username
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key_change_me', { expiresIn: '7d' });

            res.json({
                success: true,
                access: token,
                user: {
                    uid: user._id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                    displayName: user.displayName
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
            const userId = req.user.uid || req.user._id;

            const user = await User.findById(userId).select('-password');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                uid: user._id,
                ...user.toObject()
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
            const userId = req.user.uid || req.user._id;
            const { username, email, avatar } = req.body;

            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (avatar) updateData.avatar = avatar;

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select('-password');

            res.json({
                uid: user._id,
                ...user.toObject()
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
