// Problem Service - API client for problem-related operations
import config from '../config';
import { QUESTIONS_DATA } from '../data/problemsData';

class ProblemService {
    /**
     * Fetch problem details by ID
     */
    static async fetchProblem(problemId) {
        try {
            // If ID doesn't look like a mongoID (24 hex chars) or integer DB ID, checks static first?
            // Actually, let's try API and fall back.
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}`);
            if (!response.ok) {
                // 404 or other error
                const staticProblem = QUESTIONS_DATA.find(q => q.id === problemId);
                if (staticProblem) return staticProblem;
                throw new Error('Failed to fetch problem');
            }
            return await response.json();
        } catch (error) {
            console.warn('Backend unavailable or problem not found, checking static data:', error);
            const staticProblem = QUESTIONS_DATA.find(q => q.id === problemId);
            if (staticProblem) return staticProblem;
            throw error;
        }
    }

    /**
     * Fetch all problems with optional filters
     */
    static async fetchAllProblems(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.category) params.append('category', filters.category);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await fetch(`${config.BACKEND_URL}/api/problems?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch problems from API');
            }
            const data = await response.json();

            // If API returns empty, valid but empty, fallback? 
            // Or mostly if it errors.
            if (data && data.length > 0) return data;

            // If API returns empty list, maybe we want static data? 
            // Let's assume user prefers static if API is empty/error.
            console.warn('API returned no problems, using static fallback.');
            return QUESTIONS_DATA;
        } catch (error) {
            console.warn('Backend unavailable, using static problem data:', error);
            // Filter static data if needed based on filters
            let data = [...QUESTIONS_DATA];
            if (filters.difficulty) {
                data = data.filter(p => p.difficulty === filters.difficulty);
            }
            return data;
        }
    }

    /**
     * Submit solution for verification
     * @param {Object} submission - { problemId, code, language, userId, ... }
     */
    static async submitSolution(submission) {
        try {
            // Augment submission with static data if available
            // This ensures backend has test cases even if DB is empty
            const problem = QUESTIONS_DATA.find(q => q.id === submission.problemId);
            const enrichedSubmission = {
                ...submission,
                testCases: problem?.testCases || [],
                functionName: problem?.functionName || null
            };

            const response = await fetch(`${config.BACKEND_URL}/api/problems/${submission.problemId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enrichedSubmission)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting solution:', error);
            // Optional: Fallback to client-side verification if backend fails?
            // For now, simple throw.
            throw error;
        }
    }

    /**
     * Fetch problems assigned to a room
     */
    static async fetchRoomProblems(roomId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/room/${roomId}/all`);
            if (!response.ok) {
                throw new Error('Failed to fetch room problems');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching room problems:', error);
            throw error;
        }
    }



    /**
     * Get AI-generated hint
     */
    static async getHint(problemId, attemptedCode = null, difficulty = 'Medium') {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    attemptedCode,
                    difficulty
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get hint');
            }

            const data = await response.json();
            return data.hint;
        } catch (error) {
            console.error('Error getting hint:', error);
            throw error;
        }
    }

    /**
     * Get solution approach
     */
    static async getApproach(problemId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/approach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get approach');
            }

            const data = await response.json();
            return data.approach;
        } catch (error) {
            console.error('Error getting approach:', error);
            throw error;
        }
    }

    /**
     * Save team discussion
     */
    static async saveDiscussion(problemId, roomId, type, content, userId, userName, userAvatar = null) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/discussion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId,
                    type,
                    content,
                    userId,
                    userName,
                    userAvatar
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save discussion');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving discussion:', error);
            throw error;
        }
    }

    /**
     * Fetch discussions for a problem
     */
    static async fetchDiscussions(problemId, roomId = null, type = null) {
        try {
            const params = new URLSearchParams();
            if (roomId) params.append('roomId', roomId);
            if (type) params.append('type', type);

            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/discussions?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch discussions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching discussions:', error);
            throw error;
        }
    }

    /**
     * Fetch submission history
     */
    static async fetchSubmissions(problemId, userId = null, roomId = null, limit = 10) {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (roomId) params.append('roomId', roomId);
            params.append('limit', limit);

            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/submissions?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching submissions:', error);
            throw error;
        }
    }

    /**
     * Assign problem to a room
     */
    static async assignProblemToRoom(problemId, roomId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/assign-to-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId })
            });

            if (!response.ok) {
                throw new Error('Failed to assign problem to room');
            }

            return await response.json();
        } catch (error) {
            console.error('Error assigning problem:', error);
            throw error;
        }
    }
}

export default ProblemService;
