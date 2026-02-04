const mongoose = require('mongoose');

const CommandLineArgumentSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'int', 'string', 'array' etc.
    name: { type: String }
});

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    hidden: { type: Boolean, default: false }
});

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    category: { type: String },
    functionName: { type: String }, // For code generation
    inputFormat: [CommandLineArgumentSchema], // To help generate driver code
    outputFormat: { type: String },
    testCases: [TestCaseSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', ProblemSchema);
