// Problems API Routes
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const TestExecutor = require('../services/testExecutor');
const AIVerificationService = require('../services/aiVerification');

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

            const doc = await db.collection('problems').doc(problemId).get();

            if (!doc.exists) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            const problemData = doc.data();

            // Filter out hidden test cases for security
            const visibleTestCases = problemData.testCases
                ? problemData.testCases.filter(tc => !tc.hidden)
                : [];

            res.json({
                id: doc.id,
                ...problemData,
                testCases: visibleTestCases,
                totalTestCases: problemData.testCases ? problemData.testCases.length : 0
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

            let query = db.collection('problems');

            if (difficulty) {
                query = query.where('difficulty', '==', difficulty);
            }

            if (category) {
                query = query.where('category', '==', category);
            }

            query = query.limit(parseInt(limit));

            const snapshot = await query.get();

            const problems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Don't send test cases in list view
                testCases: undefined
            }));

            res.json(problems);
        } catch (error) {
            console.error('Error fetching problems:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/problems/room/:roomId/all
     * Fetch all problems assigned to a room
     */
    router.get('/room/:roomId/all', async (req, res) => {
        try {
            const { roomId } = req.params;

            // Get room problems
            const roomProblemsSnapshot = await db.collection('roomProblems')
                .where('roomId', '==', roomId)
                .get();

            if (roomProblemsSnapshot.empty) {
                return res.json([]);
            }

            // Fetch full problem details
            const problemIds = roomProblemsSnapshot.docs.map(doc => doc.data().problemId);
            const problems = await Promise.all(
                problemIds.map(async (problemId) => {
                    const problemDoc = await db.collection('problems').doc(problemId).get();
                    if (problemDoc.exists) {
                        return { id: problemDoc.id, ...problemDoc.data() };
                    }
                    return null;
                })
            );

            res.json(problems.filter(p => p !== null));
        } catch (error) {
            console.error('Error fetching room problems:', error);
            res.status(500).json({ error: error.message });
        }
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
            const problemDoc = await db.collection('problems').doc(problemId).get();

            if (problemDoc.exists) {
                problem = problemDoc.data();
            } else {
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

            // Save solution to Firestore
            const solutionData = {
                roomId: roomId || null,
                problemId,
                userId,
                userName: userName || 'Anonymous',
                code,
                language,
                status: testResults.allPassed ? 'Passed' : 'Failed',
                testResults: {
                    totalTests: testResults.totalTests,
                    passed: testResults.passedTests,
                    failed: testResults.failedTests,
                    executionTime: testResults.executionTime,
                    memoryUsage: testResults.memoryUsage,
                    cases: testResults.cases
                },
                aiVerification: aiVerification || null,
                submittedAt: admin.firestore.FieldValue.serverTimestamp(),
                revisedCount: 0
            };

            const solutionRef = await db.collection('solutions').add(solutionData);

            // Update room problem stats if roomId provided
            if (roomId) {
                const roomProblemRef = db.collection('roomProblems').doc(`${roomId}_${problemId}`);
                const roomProblemDoc = await roomProblemRef.get();

                if (roomProblemDoc.exists) {
                    await roomProblemRef.update({
                        [`participants.${userId}.submitted`]: testResults.allPassed,
                        [`participants.${userId}.solutionCount`]: admin.firestore.FieldValue.increment(1),
                        [`participants.${userId}.bestScore`]: aiVerification ? Math.max(aiVerification.score || 0, roomProblemDoc.data().participants?.[userId]?.bestScore || 0) : 0
                    });
                } else {
                    // Create room problem entry
                    await roomProblemRef.set({
                        roomId,
                        problemId,
                        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
                        status: 'In Progress',
                        participants: {
                            [userId]: {
                                submitted: testResults.allPassed,
                                solutionCount: 1,
                                bestScore: aiVerification?.score || 0
                            }
                        }
                    });
                }
            }

            res.json({
                solutionId: solutionRef.id,
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

            const problemDoc = await db.collection('problems').doc(problemId).get();

            if (!problemDoc.exists) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            const problem = problemDoc.data();
            const hint = await aiService.provideHint(problem, attemptedCode, difficulty);

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

            const problemDoc = await db.collection('problems').doc(problemId).get();

            if (!problemDoc.exists) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            const problem = problemDoc.data();
            const approach = await aiService.generateApproach(problem);

            res.json({ approach });
        } catch (error) {
            console.error('Error generating approach:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/problems/:problemId/discussion
     * Save team discussion
     */
    router.post('/:problemId/discussion', async (req, res) => {
        try {
            const { problemId } = req.params;
            const { roomId, type, content, userId, userName, userAvatar } = req.body;

            if (!roomId || !type || !content || !userId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const discussionData = {
                roomId,
                problemId,
                type, // 'Hint' | 'Discussion' | 'Solution Approach'
                author: {
                    userId,
                    userName: userName || 'Anonymous',
                    avatar: userAvatar || null
                },
                content,
                likes: 0,
                likedBy: [],
                replies: [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('problemDiscussions').add(discussionData);

            res.json({ id: docRef.id, success: true });
        } catch (error) {
            console.error('Error saving discussion:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/problems/:problemId/discussions
     * Fetch discussions for a problem
     */
    router.get('/:problemId/discussions', async (req, res) => {
        try {
            const { problemId } = req.params;
            const { roomId, type } = req.query;

            let query = db.collection('problemDiscussions')
                .where('problemId', '==', problemId);

            if (roomId) {
                query = query.where('roomId', '==', roomId);
            }

            if (type) {
                query = query.where('type', '==', type);
            }

            query = query.orderBy('createdAt', 'desc');

            const snapshot = await query.get();

            const discussions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            res.json(discussions);
        } catch (error) {
            console.error('Error fetching discussions:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/problems/:problemId/submissions
     * Get submission history
     */
    router.get('/:problemId/submissions', async (req, res) => {
        try {
            const { problemId } = req.params;
            const { userId, roomId, limit = 10 } = req.query;

            let query = db.collection('solutions')
                .where('problemId', '==', problemId);

            if (userId) {
                query = query.where('userId', '==', userId);
            }

            if (roomId) {
                query = query.where('roomId', '==', roomId);
            }

            query = query.orderBy('submittedAt', 'desc').limit(parseInt(limit));

            const snapshot = await query.get();

            const submissions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            res.json(submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/problems/:problemId/assign-to-room
     * Assign problem to a room
     */
    router.post('/:problemId/assign-to-room', async (req, res) => {
        try {
            const { problemId } = req.params;
            const { roomId } = req.body;

            if (!roomId) {
                return res.status(400).json({ error: 'roomId is required' });
            }

            // Check if problem exists
            const problemDoc = await db.collection('problems').doc(problemId).get();
            if (!problemDoc.exists) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            // Create or update room problem
            const roomProblemRef = db.collection('roomProblems').doc(`${roomId}_${problemId}`);

            await roomProblemRef.set({
                roomId,
                problemId,
                assignedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'In Progress',
                participants: {}
            }, { merge: true });

            res.json({ success: true, message: 'Problem assigned to room' });
        } catch (error) {
            console.error('Error assigning problem:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
