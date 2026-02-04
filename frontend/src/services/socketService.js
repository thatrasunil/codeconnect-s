import io from 'socket.io-client';
import config from '../config';

class SocketService {
    constructor() {
        this.socket = null;
        this.url = config.BACKEND_URL || 'http://localhost:5000';
    }

    connect(token) {
        if (this.socket) return this.socket;

        this.socket = io(this.url, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server', this.socket.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Room Events
    joinRoom(roomId, user) {
        if (!this.socket) return;
        this.socket.emit('join-room', { roomId, user });
    }

    leaveRoom(roomId) {
        if (!this.socket) return;
        this.socket.emit('leave-room', roomId);
    }

    // Code Events
    sendCodeChange(roomId, code) {
        if (!this.socket) return;
        this.socket.emit('code-change', { roomId, code });
    }

    onCodeChange(callback) {
        if (!this.socket) return;
        this.socket.on('code-change', callback);
    }

    // Chat Events
    sendMessage(roomId, messageData) {
        if (!this.socket) return;
        this.socket.emit('send-message', { roomId, ...messageData });
    }

    onMessageReceived(callback) {
        if (!this.socket) return;
        this.socket.on('receive-message', callback);
    }

    // Typing Events
    sendTyping(roomId, isTyping) {
        if (!this.socket) return;
        this.socket.emit('typing', { roomId, isTyping });
    }

    onTyping(callback) {
        if (!this.socket) return;
        this.socket.on('typing', callback);
    }

    // Whiteboard Events
    sendDraw(roomId, data) {
        if (!this.socket) return;
        this.socket.emit('draw', { roomId, data });
    }

    onDraw(callback) {
        if (!this.socket) return;
        this.socket.on('draw', callback);
    }

    // Room State
    onRoomState(callback) {
        if (!this.socket) return;
        this.socket.on('room-state', callback);
    }
}

const socketService = new SocketService();
export default socketService;
