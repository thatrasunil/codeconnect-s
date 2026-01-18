const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

module.exports = (db) => {

    /**
     * POST /api/teams/create
     * Create a new team
     */
    router.post('/create', async (req, res) => {
        try {
            const { name, ownerId, description, isPublic } = req.body;

            if (!name || !ownerId) {
                return res.status(400).json({ error: 'Team name and ownerId are required' });
            }

            const teamData = {
                name,
                ownerId,
                description: description || '',
                isPublic: isPublic !== false, // Default to true
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                // Map for details (roles, join date)
                members: {
                    [ownerId]: {
                        role: 'owner',
                        joinedAt: new Date().toISOString()
                    }
                },
                // Array for efficient querying "My Teams"
                memberIds: [ownerId],
                memberCount: 1
            };

            const teamRef = await db.collection('teams').add(teamData);

            res.json({ id: teamRef.id, ...teamData });
        } catch (error) {
            console.error('Error creating team:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/teams/:teamId/join
     * Join a team
     */
    router.post('/:teamId/join', async (req, res) => {
        try {
            const { teamId } = req.params;
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const teamRef = db.collection('teams').doc(teamId);

            await db.runTransaction(async (transaction) => {
                const teamDoc = await transaction.get(teamRef);
                if (!teamDoc.exists) {
                    throw new Error('Team not found');
                }

                const teamData = teamDoc.data();
                if (teamData.members && teamData.members[userId]) {
                    throw new Error('User already in team');
                }

                transaction.update(teamRef, {
                    [`members.${userId}`]: {
                        role: 'member',
                        joinedAt: new Date().toISOString()
                    },
                    memberIds: admin.firestore.FieldValue.arrayUnion(userId),
                    memberCount: admin.firestore.FieldValue.increment(1)
                });
            });

            res.json({ success: true, message: 'Joined team successfully' });
        } catch (error) {
            console.error('Error joining team:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/teams/my-teams
     * Get teams for a user (Owned + Joined)
     */
    router.get('/my-teams', async (req, res) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            // Efficient query using array-contains
            const snapshot = await db.collection('teams')
                .where('memberIds', 'array-contains', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            res.json(teams);
        } catch (error) {
            console.error('Error fetching user teams:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/teams/:teamId
     * Get team details
     */
    router.get('/:teamId', async (req, res) => {
        try {
            const { teamId } = req.params;
            const doc = await db.collection('teams').doc(teamId).get();

            if (!doc.exists) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error('Error fetching team:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/teams/:teamId/challenges
     * Create a team challenge
     */
    router.post('/:teamId/challenges', async (req, res) => {
        try {
            const { teamId } = req.params;
            const { title, problemIds, startTime, endTime } = req.body;

            if (!title || !problemIds || problemIds.length === 0) {
                return res.status(400).json({ error: 'Title and at least one problem are required' });
            }

            const challengeData = {
                teamId,
                title,
                problemIds,
                startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
                endTime: endTime ? new Date(endTime).toISOString() : null, // Null means endless
                status: 'active',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const challengeRef = await db.collection('teamChallenges').add(challengeData);

            res.json({ id: challengeRef.id, ...challengeData });
        } catch (error) {
            console.error('Error creating challenge:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/teams/:teamId/challenges
     * List challenges
     */
    router.get('/:teamId/challenges', async (req, res) => {
        try {
            const { teamId } = req.params;
            const snapshot = await db.collection('teamChallenges')
                .where('teamId', '==', teamId)
                .orderBy('createdAt', 'desc')
                .get();

            const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json(challenges);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/teams/challenges/:challengeId/leaderboard
     * Get leaderboard for a challenge
     */
    router.get('/challenges/:challengeId/leaderboard', async (req, res) => {
        try {
            const { challengeId } = req.params;

            // Fetch challenge to know problems
            const challengeDoc = await db.collection('teamChallenges').doc(challengeId).get();
            if (!challengeDoc.exists) return res.status(404).json({ error: 'Challenge not found' });

            const challenge = challengeDoc.data();
            const problemIds = challenge.problemIds || [];

            // We need to aggregate scores.
            // Design Choice: Should we query 'solutions' on the fly or read a cached 'teamChallengeScores' doc?
            // For MVP/small scale, on-the-fly aggregation from 'solutions' collection filter by challengeId is cleaner.
            // Provided `solutions` have `teamChallengeId` (which we will add in problems.js).

            const solutionsSnapshot = await db.collection('solutions')
                .where('teamChallengeId', '==', challengeId)
                .get();

            const leaderboard = {}; // { userId: { score: 0, problemsSolved: [], totalTime: 0, userName: '' } }

            solutionsSnapshot.forEach(doc => {
                const sol = doc.data();
                if (sol.status !== 'Passed') return;

                if (!leaderboard[sol.userId]) {
                    leaderboard[sol.userId] = {
                        userId: sol.userId,
                        userName: sol.userName,
                        score: 0,
                        problemsSolved: new Set(),
                        lastSubmissionTime: 0 // rough tie-breaker
                    };
                }

                const userEntry = leaderboard[sol.userId];
                // Only count unique problems
                if (!userEntry.problemsSolved.has(sol.problemId)) {
                    userEntry.problemsSolved.add(sol.problemId);
                    userEntry.score += 100; // Fixed 100 points per problem for now

                    // Update last sub time
                    const subTime = sol.submittedAt ? sol.submittedAt.toDate().getTime() : Date.now();
                    if (subTime > userEntry.lastSubmissionTime) {
                        userEntry.lastSubmissionTime = subTime;
                    }
                }
            });

            // Convert map to array and sort
            const ranked = Object.values(leaderboard).map(entry => ({
                ...entry,
                problemsSolved: entry.problemsSolved.size // Convert Set to count
            }));

            // Sort by Score (Desc) then Time (Asc - wait, earlier is better? No, standard contest: higher score wins, ties broken by penalty. 
            // Simplified: Higher score wins. If score equal, earlier finish wins.)
            ranked.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.lastSubmissionTime - b.lastSubmissionTime;
            });

            res.json(ranked);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
