const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
    totalTests: Number,
    passed: Number,
    failed: Number,
    executionTime: Number,
    memoryUsage: Number
    // We can add detailed cases if needed, but keeping it light for now
});

const SolutionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    roomId: { type: String }, // Optional, can link to Room model if we use ObjectIds for rooms
    teamChallengeId: { type: String }, // Optional
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['Passed', 'Failed', 'Error'], required: true },
    testResults: TestResultSchema,
    aiVerification: { type: mongoose.Schema.Types.Mixed }, // Flexible for AI JSON output
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Solution', SolutionSchema);
