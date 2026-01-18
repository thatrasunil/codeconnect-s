import config from '../config';

const API_URL = config.BACKEND_URL;

export const teamService = {
    /**
     * Create a new team
     * @param {string} name - Team name
     * @param {string} ownerId - User ID of the creator
     * @param {boolean} isPublic - Visibility
     */
    createTeam: async (name, ownerId, isPublic = true) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, ownerId, isPublic })
            });
            if (!response.ok) throw new Error('Failed to create team');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Join a team
     * @param {string} teamId 
     * @param {string} userId 
     */
    joinTeam: async (teamId, userId) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/${teamId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!response.ok) throw new Error('Failed to join team');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Get user's teams
     * @param {string} userId 
     */
    getMyTeams: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/my-teams?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch teams');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    /**
     * Get team details
     * @param {string} teamId 
     */
    getTeamDetails: async (teamId) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/${teamId}`);
            if (!response.ok) throw new Error('Failed to fetch team details');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Create a challenge
     * @param {string} teamId 
     * @param {object} challengeData { title, problemIds, startTime, endTime }
     */
    createChallenge: async (teamId, challengeData) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/${teamId}/challenges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(challengeData)
            });
            if (!response.ok) throw new Error('Failed to create challenge');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Get team challenges
     * @param {string} teamId 
     */
    getChallenges: async (teamId) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/${teamId}/challenges`);
            if (!response.ok) throw new Error('Failed to fetch challenges');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    /**
     * Get leaderboard for a challenge
     * @param {string} challengeId 
     */
    getLeaderboard: async (challengeId) => {
        try {
            const response = await fetch(`${API_URL}/api/teams/challenges/${challengeId}/leaderboard`);
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};
