// backend/services/signalingService.js

class VideoSignalingService {
    constructor(io) {
        this.io = io;
        this.videoRooms = new Map(); // roomId -> Set of socket IDs
        this.userConnections = new Map(); // socketId -> user info
    }

    registerHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // 1. User joins video room
            socket.on('video:join-room', (data) => {
                const { roomId, userId, userName, userAvatar } = data;

                // Track user connection
                this.userConnections.set(socket.id, {
                    socketId: socket.id,
                    userId,
                    userName,
                    userAvatar,
                    roomId,
                    joinedAt: new Date()
                });

                // Add to room
                socket.join(`video-room-${roomId}`);

                if (!this.videoRooms.has(roomId)) {
                    this.videoRooms.set(roomId, new Set());
                }
                this.videoRooms.get(roomId).add(socket.id);

                // Get list of existing participants
                const existingParticipants = Array.from(
                    this.videoRooms.get(roomId)
                ).map(sid => this.userConnections.get(sid)).filter(u => u);

                // Notify newcomer about existing participants
                socket.emit('video:participants-list', {
                    participants: existingParticipants.filter(p => p.socketId !== socket.id)
                });

                // Notify others about new participant
                socket.broadcast.to(`video-room-${roomId}`).emit('video:participant-joined', {
                    socketId: socket.id,
                    userId,
                    userName,
                    userAvatar,
                    joinedAt: new Date()
                });
            });

            // 2. Relay WebRTC Offer
            socket.on('video:offer', (data) => {
                const { to, offer, roomId } = data;
                this.io.to(to).emit('video:offer-received', {
                    from: socket.id,
                    offer,
                    roomId
                });
            });

            // 3. Relay WebRTC Answer
            socket.on('video:answer', (data) => {
                const { to, answer, roomId } = data;
                this.io.to(to).emit('video:answer-received', {
                    from: socket.id,
                    answer,
                    roomId
                });
            });

            // 4. Relay ICE Candidates
            socket.on('video:ice-candidate', (data) => {
                const { to, candidate, roomId } = data;
                this.io.to(to).emit('video:ice-candidate-received', {
                    from: socket.id,
                    candidate,
                    roomId
                });
            });

            // 5. User toggles camera
            socket.on('video:camera-toggled', (data) => {
                const { roomId, enabled } = data;
                this.io.to(`video-room-${roomId}`).emit('video:camera-status', {
                    userId: socket.id,
                    enabled
                });
            });

            // 6. User toggles microphone
            socket.on('video:microphone-toggled', (data) => {
                const { roomId, enabled } = data;
                this.io.to(`video-room-${roomId}`).emit('video:microphone-status', {
                    userId: socket.id,
                    enabled
                });
            });

            // 7. User leaves video call
            socket.on('video:leave-room', (data) => {
                const { roomId } = data;
                const userInfo = this.userConnections.get(socket.id);

                socket.leave(`video-room-${roomId}`);

                if (this.videoRooms.has(roomId)) {
                    this.videoRooms.get(roomId).delete(socket.id);
                }

                this.io.to(`video-room-${roomId}`).emit('video:participant-left', {
                    socketId: socket.id,
                    userName: userInfo?.userName
                });
            });

            // 8. User disconnects
            socket.on('disconnect', () => {
                const userInfo = this.userConnections.get(socket.id);
                if (userInfo) {
                    const { roomId } = userInfo;

                    if (this.videoRooms.has(roomId)) {
                        this.videoRooms.get(roomId).delete(socket.id);
                    }

                    this.io.to(`video-room-${roomId}`).emit('video:participant-disconnected', {
                        socketId: socket.id,
                        userName: userInfo.userName
                    });
                }

                this.userConnections.delete(socket.id);
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }

    // Get active participants in room
    getParticipants(roomId) {
        const participants = Array.from(this.videoRooms.get(roomId) || [])
            .map(sid => this.userConnections.get(sid))
            .filter(u => u);
        return participants;
    }
}

module.exports = VideoSignalingService;
