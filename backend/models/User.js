const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
    displayName: String,
    avatar: String,
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    provider: { type: String, default: 'local' }, // 'local', 'google', etc.
    stats: {
        problemsSolved: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        rank: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
