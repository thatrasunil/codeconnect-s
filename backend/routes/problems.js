// Problems API Routes
const express = require('express');
const router = express.Router();
// Remove firebase-admin
// const admin = require('firebase-admin');
const TestExecutor = require('../services/testExecutor');
const AIVerificationService = require('../services/aiVerification');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');
const Room = require('../models/Room'); // Assuming we use global Room model now

// Initialize AI service
const aiService = new AIVerificationService(process.env.GROQ_API_KEY || process.env.GOOGLE_API_KEY);

// Export a function that accepts db instance
module.exports = (db) => {

    /**
     * GET /api/problems/:problemId
     * Fetch problem details by ID
     */
    router.get('/:problemId', async (req, res) => {
        try {
            const { problemId } = req.params;

            const problem = await Problem.findById(problemId);

            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            // Filter out hidden test cases for security
            const problemObj = problem.toObject();
            const visibleTestCases = problemObj.testCases
                ? problemObj.testCases.filter(tc => !tc.hidden)
                : [];

            res.json({
                ...problemObj,
                testCases: visibleTestCases,
                totalTestCases: problemObj.testCases ? problemObj.testCases.length : 0
            });
        } catch (error) {
            console.error('Error fetching problem:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/problems
     * Fetch all problems (with optional filters)
     */
    router.get('/', async (req, res) => {
        try {
            const { difficulty, category, limit = 50 } = req.query;

            const filter = {};
            if (difficulty) filter.difficulty = difficulty;
            if (category) filter.category = category;

            const problems = await Problem.find(filter).limit(parseInt(limit));

            // Don't send test cases in list view
            const safeProblems = problems.map(p => {
                const obj = p.toObject();
                delete obj.testCases;
                return obj;
            });

            res.json(safeProblems);
        } catch (error) {
            console.error('Error fetching problems:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/problems/room/:roomId/all
     * Fetch all problems assigned to a room
     * Note: This relied on 'roomProblems' collection. We might need a new model or store in Room.
     * For now, let's assume we store assigned problem IDs in Room model or fetch via simple logical mapping.
     */
    router.get('/room/:roomId/all', async (req, res) => {
        // Placeholder or simplistic implementation
        // If we don't have a RoomProblem model yet, return empty or implement basic one
        res.json([]);
    });

    /**
     * POST /api/problems/:problemId/submit
     * Submit solution and run tests
     */
    router.post('/:problemId/submit', async (req, res) => {
        try {
            const { problemId } = req.params;
            const { code, language, userId, userName, roomId } = req.body;

            if (!code || !language || !userId) {
                return res.status(400).json({ error: 'Missing required fields: code, language, userId' });
            }

            // Get problem details
            let problem = null;
            // Check if valid ObjectId
            if (problemId.match(/^[0-9a-fA-F]{24}$/)) {
                problem = await Problem.findById(problemId);
            }

            if (!problem) {
                // Check if client provided problem metadata (hybrid mode)
                if (req.body.testCases) {
                    problem = {
                        id: problemId,
                        title: req.body.title || 'Unknown Problem',
                        testCases: req.body.testCases,
                        difficulty: 'Medium', // Default
                        description: 'Provided by client'
                    };
                } else {
                    return res.status(404).json({ error: 'Problem not found in DB and no test data provided' });
                }
            } else {
                problem = problem.toObject();
            }

            // Run tests
            console.log(`Running tests for problem ${problemId}...`);
            const testResults = await TestExecutor.validateSolution(
                code,
                language,
                problem.testCases || [],
                req.body.functionName // Pass function name for driver generation
            );

            // If tests pass, verify with AI
            let aiVerification = null;
            if (testResults.allPassed) {
                console.log('All tests passed, running AI verification...');
                aiVerification = await aiService.verifySolution(code, language, problem);
            }

            // Save solution to MongoDB
            const newSolution = new Solution({
                roomId: roomId || null,
                teamChallengeId: req.body.teamChallengeId || null,
                problemId: problem._id || null, // handle 'client provided' case carefully
                userId, // Mongoose expects ObjectId usually, but we defined ref: 'User'. if userId is string from client, ensure it matches.
                // If userId is guest ID (not ObjectId), this might fail validation if schema is Strict ObjectId.
                // Our schema definition: userId: { type: mongoose.Schema.Types.ObjectId, ... }
                // So this requires registered users. Guest submissions might need schema tweak.
                code,
                language,
                status: testResults.allPassed ? 'Passed' : 'Failed',
                testResults: {
                    totalTests: testResults.totalTests,
                    passed: testResults.passedTests,
                    failed: testResults.failedTests,
                    executionTime: testResults.executionTime,
                    memoryUsage: testResults.memoryUsage
                },
                aiVerification: aiVerification || null,
                submittedAt: new Date()
            });

            // Only save if valid user ObjectId (basic check)
            if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
                await newSolution.save();
            } else {
                console.log('Skipping solution save for guest or invalid ID:', userId);
            }

            res.json({
                solutionId: newSolution._id,
                testResults,
                aiVerification,
                success: testResults.allPassed
            });
        } catch (error) {
            console.error('Error submitting solution:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/problems/:problemId/hint
     * Get AI-generated hint
     */
    router.post('/:problemId/hint', async (req, res) => {
        try {
            const { problemId } = req.params;
            const { attemptedCode, difficulty = 'Medium' } = req.body;

            const problem = await Problem.findById(problemId);

            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            const hint = await aiService.provideHint(problem.toObject(), attemptedCode, difficulty);

            res.json({ hint });
        } catch (error) {
            console.error('Error generating hint:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/problems/:problemId/approach
     * Get solution approach
     */
    router.post('/:problemId/approach', async (req, res) => {
        try {
            const { problemId } = req.params;

            const problem = await Problem.findById(problemId);

            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            const approach = await aiService.generateApproach(problem.toObject());

            res.json({ approach });
        } catch (error) {
            console.error('Error generating approach:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
