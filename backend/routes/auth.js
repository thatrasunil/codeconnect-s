const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

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
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email or username already exists' });
            }

            const newUser = new User({
                username: username || email.split('@')[0],
                email,
                password, // Will be hashed by model pre-save hook
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'User'}`,
                role: 'user'
            });

            await newUser.save();

            // Generate Token
            const payload = {
                uid: newUser._id.toString(), // Mongoose ID
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

            // Find user
            const user = await User.findOne({ $or: [{ email }, { username }] }); if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify Password
            if (!user.password) {
                return res.status(400).json({ error: 'Please login with Google.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate Token
            const payload = {
                uid: user._id.toString(),
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
                    avatar: user.avatar
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

            let user = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                user = await User.findById(userId).select('-password');
            } else if (req.user.email) {
                user = await User.findOne({ email: req.user.email }).select('-password');
            }

            if (!user) {
                return res.json({
                    uid: userId,
                    email: req.user.email,
                    username: req.user.name || req.user.email?.split('@')[0] || "User",
                    avatar: req.user.picture || null,
                    isTemporary: true
                });
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
            const userId = req.user.uid || req.user.user_id;
            const { username, email, avatar } = req.body;

            let user = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                user = await User.findById(userId);
            } else if (req.user.email) {
                user = await User.findOne({ email: req.user.email });
            }

            if (!user) {
                // If user not found in DB but token is valid (middleware passed), create them now.
                // This happens for Firebase users who haven't been synced to Mongo yet.
                console.log(`User ${userId} not found in MongoDB. Creating on the fly...`);

                user = new User({
                    _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined, // Let Mongo generate if not valid, but usually we want to map? 
                    // Actually, if we are here, req.user has data.
                    // If req.user.uid is a valid MongoID, use it. If it's a Firebase UID string, we might have issues if Schema expects ObjectId default.
                    // But our User schema likely relies on default _id. 
                    // Let's rely on finding by email or username if not found by ID.

                    email: req.user.email,
                    username: username || req.user.name || req.user.email?.split('@')[0] || "User",
                    avatar: avatar || req.user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.email}`,
                    role: 'user',
                    password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password to satisfy required field
                    provider: 'firebase' // Assume firebase/external if not in DB
                });

                // If we have an email, ensure we don't duplicate if findOne failed above (race condition check not strictly needed for MVP)
            } else {
                // Only update fields if provided
                if (username) user.username = username;
                if (email) user.email = email;
                if (avatar) user.avatar = avatar;
            }

            await user.save();

            res.json({
                uid: user._id,
                ...user.toObject(),
                password: undefined
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
