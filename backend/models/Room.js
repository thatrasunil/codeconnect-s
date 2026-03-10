const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Could be ObjectId or guest ID
    username: String,
    content: { type: String, required: true },
    type: { type: String, default: 'text' }, // 'text', 'code', 'system'
    timestamp: { type: Date, default: Date.now }
});

const RoomUserSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: String,
    joinedAt: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true }, // Public ID like '123456'
    ownerId: { type: String }, // Optional
    isPublic: { type: Boolean, default: true },
    password: { type: String, default: '' },
    code: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    messages: [MessageSchema],
    users: [RoomUserSchema],
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for frequent ownership-based sorting
RoomSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('Room', RoomSchema);
