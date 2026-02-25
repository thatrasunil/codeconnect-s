const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const User = require('../models/User');

// Routes don't need 'db' injection anymore since we import Mongoose models directly
// But we keep the function signature to avoid breaking server.js dynamic usage if passed

module.exports = (db) => {

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

    /**
     * POST /api/auth/firebase
     * Authenticate with Firebase token and create/get user in MongoDB
     */
    router.post('/firebase', async (req, res) => {
        try {
            const { uid, email, displayName } = req.body;

            if (!uid || !email) {
                return res.status(400).json({ error: 'UID and email are required' });
            }

            // Check if user exists
            let user = await User.findOne({ email });

            if (!user) {
                // Create new user if doesn't exist
                let username = displayName || email.split('@')[0];

                // Basic collision check/handling
                let existingUser = await User.findOne({ username });
                if (existingUser) {
                    username = `${username}_${Math.random().toString(36).substring(2, 7)}`;
                }

                const newUser = new User({
                    username,
                    email,
                    displayName: displayName || email.split('@')[0],
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || email}`,
                    firebaseUid: uid,
                    role: 'user',
                    provider: 'firebase'
                });
                user = await newUser.save();
            } else if (!user.firebaseUid) {
                // Link Firebase to existing user
                user.firebaseUid = uid;
                user.provider = 'firebase';
                user = await user.save();
            }

            res.json({
                success: true,
                user: {
                    uid: user._id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                    displayName: user.displayName
                }
            });
        } catch (error) {
            console.error('❌ Firebase auth error:', {
                message: error.message,
                stack: error.stack,
                body: req.body
            });
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * DELETE /api/auth/cleanup
     * DANGER: Delete all user data from MongoDB
     * This endpoint is for development/testing only
     */
    router.get('/cleanup', async (req, res) => {
        try {
            // Delete all users from the database
            const result = await User.deleteMany({});

            res.json({
                success: true,
                message: `Deleted ${result.deletedCount} users from database`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Cleanup error:', error);
            res.status(500).json({ error: error.message });
        }
    });


    return router;
};
