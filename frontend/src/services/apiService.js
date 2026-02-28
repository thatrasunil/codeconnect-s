import config from '../config';

const BACKEND_URL = config.BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// --- Auth ---

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Login failed'); }
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Registration failed'); }
    return response.json();
};

export const getUserProfile = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders()
    });
    // Valid 401 means not logged in, not necessarily an error to throw
    if (response.status === 401) return null;
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to fetch profile'); }
    return response.json();
};

export const updateUserProfile = async (data) => {
    const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Profile update failed'); }
    return response.json();
};

// --- Rooms ---

export const createRoom = async (roomData) => {
    const response = await fetch(`${API_URL}/create-room`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(roomData) // Server expects minimal data to generate ID
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to create room'); }
    return response.json(); // returns { roomId }
};

export const getRoom = async (roomId) => {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
        headers: getHeaders()
    });
    if (!response.ok) {
        if (response.status === 404) return null;
        const e = await response.json(); throw new Error(e.message || e.error || `Failed to fetch room`);
    }
    return response.json();
};

export const verifyRoomAccess = async (roomId, password) => {
    const response = await fetch(`${API_URL}/rooms/${roomId}/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password })
    });
    if (!response.ok) {
        const e = await response.json();
        throw new Error(e.message || e.error || 'Invalid password');
    }
    return response.json();
};

export const joinRoom = async (roomId, user) => {
    // Only needed if we want to track join via REST, but Socket usually handles this.
    // For compatibility with old logic returning a memberId:
    return `${user.uid}_${roomId}`;
};

export const updateRoomCode = async (roomId, code, language) => {
    // Usually handled via Socket, but REST endpoint exists for redundancy
    const response = await fetch(`${API_URL}/rooms/${roomId}/code`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ content: code })
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to update code'); }
};

export const fetchUserRooms = async (userId) => {
    const response = await fetch(`${API_URL}/rooms/my-rooms`, {
        headers: getHeaders()
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to fetch rooms'); }
    return response.json();
};

// --- Stats & Leaderboard ---

export const getLeaderboard = async () => {
    const response = await fetch(`${API_URL}/leaderboard`, {
        headers: getHeaders()
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to fetch leaderboard'); }
    return response.json();
};

export const getDashboardStats = async () => {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: getHeaders()
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to fetch stats'); }
    return response.json();
};

// --- Problems ---

export const getProblems = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/problems?${query}`, {
        headers: getHeaders()
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to fetch problems'); }
    return response.json();
};

export const getProblem = async (problemId) => {
    const response = await fetch(`${API_URL}/problems/${problemId}`, {
        headers: getHeaders()
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Failed to fetch problem'); }
    return response.json();
};

export const submitSolution = async (problemId, data) => {
    const response = await fetch(`${API_URL}/problems/${problemId}/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || e.error || 'Solution submission failed'); }
    return response.json();
};

// --- Teams ---

export const createTeam = async (teamData) => {
    const response = await fetch(`${API_URL}/teams/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(teamData)
    });
    if (!response.ok) throw await response.json();
    return response.json();
};

export const getMyTeams = async (userId) => {
    const response = await fetch(`${API_URL}/teams/my-teams?userId=${userId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw await response.json();
    return response.json();
};

export const joinTeam = async (teamId, userId) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/join`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
    });
    if (!response.ok) throw await response.json();
    return response.json();
};

// --- Firebase User Sync ---

export const createUserInDB = async ({ uid, email, displayName }) => {
    try {
        const response = await fetch(`${API_URL}/auth/firebase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, email, displayName })
        });
        if (!response.ok) {
            console.warn('Backend sync failed:', response.status);
            return null;
        }
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Error in createUserInDB:', error);
        return null; // Return null instead of throwing to avoid blocking app init
    }
};

// --- Deprecated / Mapped for Compatibility ---

export const subscribeToRoom = (roomId, callback) => {
    // Socket.io should handle this in components.
    // This is a placeholder to prevent crashes if not refactored yet.
    console.warn("subscribeToRoom is deprecated. Use Socket.io events.");
    return () => { }; // No-op unsubscribe
};

export const subscribeToMessages = (roomId, callback) => {
    console.warn("subscribeToMessages is deprecated. Use Socket.io events.");
    return () => { };
};

export const subscribeToActiveUsers = (roomId, callback) => {
    return () => { };
};
