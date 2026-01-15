const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin'); // Firebase Admin
const { getFirestore } = require('firebase-admin/firestore');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

// Import routes
const problemsRouter = require('./routes/problems');
const authRouter = require('./routes/auth');
const verifyToken = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3007",
  process.env.FRONTEND_URL || "https://codeconnect.vercel.app",
  "https://codeconnect-zeta-pied.vercel.app",
  "https://codeconnect-frontend.vercel.app",
  "https://codeshare-production-b2f2.up.railway.app",
  "https://code-connect-beige-rho.vercel.app"  // New Vercel deployment
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  exposedHeaders: ["Access-Control-Allow-Origin"],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'CodeConnect Backend API is running' });
});

const PORT = process.env.PORT || 3001;

const mongoose = require('mongoose');

// --- Database Connection (MongoDB & Firestore) ---
let db;
let isFirestoreConnected = false;

// 1. Connect to MongoDB (Primary Auth DB)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,  // Reduce timeout to 5 seconds
    socketTimeoutMS: 45000,           // Socket timeout
    connectTimeoutMS: 10000,          // Connection timeout
    maxPoolSize: 10,                  // Connection pool
    retryWrites: true,
    w: 'majority'
  })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
      console.warn('⚠️ Running in limited mode without authentication');
    });
} else {
  console.warn('⚠️ MONGODB_URI not found in environment variables. Authentication will fail.');
  console.warn('📝 Please add MONGODB_URI to your Vercel environment variables');
}

// 2. Connect to Firestore (Chat & Rooms DB)
try {
  // Check for service account - normally provided via GOOGLE_APPLICATION_CREDENTIALS
  // or passed directly. For now, we'll try default app or warn.
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized with SERVICE_ACCOUNT env var");
    } else {
      // Attempt default initialization (works on GCP/Render if env vars set)
      admin.initializeApp();
      console.log("Firebase Admin initialized with default credentials");
    }
  }
  db = getFirestore();
  isFirestoreConnected = true;
  console.log('✅ Firestore connected successfully');
} catch (err) {
  console.warn('Firebase connection warning:', err.message);
  console.log('Server will start with IN-MEMORY storage only for Rooms/Chat.');
  console.log('To enable persistence, set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS');
}

// --- In-memory Stores (Fallback) ---
const localRooms = new Map();
const activeRooms = new Map(); // roomId -> Map<userId, connectionCount>
const socketIdToUserId = new Map(); // socket.id -> userId

// --- Mount Routes ---
// Pass db instance to problems router
app.use('/api/problems', problemsRouter(db));
app.use('/api/auth', authRouter(db));

// --- API Routes ---
function generateRoomId() {
  const randomNum = crypto.randomBytes(4).readUInt32BE(0) % 90000000 + 10000000;
  return randomNum.toString();
}

app.post('/api/create-room', async (req, res) => {
  const roomId = generateRoomId();

  const roomData = {
    roomId,
    code: '',
    language: 'javascript',
    messages: [],
    users: [],
    createdAt: new Date().toISOString() // Firestore prefers standard formats or Timestamps
  };

  try {
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).set(roomData);
    } else {
      console.log('Creating room in memory:', roomId);
      localRooms.set(roomId, roomData);
    }
    res.json({ roomId });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET Dashboard Stats
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    let stats = { totalSessions: 0, roomsCreated: 0, languagesUsed: [] };

    if (isFirestoreConnected) {
      // Get rooms created by user
      const roomsSnapshot = await db.collection('rooms').where('ownerId', '==', userId).get();
      stats.roomsCreated = roomsSnapshot.size;
      stats.totalSessions = stats.roomsCreated; // Using rooms count as sessions for now

      const languages = new Set();
      roomsSnapshot.forEach(doc => {
        const lang = doc.data().language;
        if (lang) languages.add(lang);
      });
      stats.languagesUsed = Array.from(languages);
    } else {
      // Local fallback
      const rooms = Array.from(localRooms.values()).filter(r => r.ownerId === userId);
      stats.roomsCreated = rooms.length;
      stats.totalSessions = rooms.length;
      stats.languagesUsed = [...new Set(rooms.map(r => r.language).filter(Boolean))];
    }
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    let leaderboard = [];
    if (isFirestoreConnected) {
      const snapshot = await db.collection('users')
        .orderBy('points', 'desc')
        .limit(10)
        .get();

      snapshot.forEach(doc => {
        leaderboard.push(doc.data());
      });
    } else {
      // Mock for local
      leaderboard = [];
    }
    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET My Rooms
app.get('/api/rooms/my-rooms', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    let rooms = [];
    if (isFirestoreConnected) {
      // Query rooms where ownerId matches userId
      const snapshot = await db.collection('rooms').where('ownerId', '==', userId).get();
      snapshot.forEach(doc => {
        rooms.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Fallback for in-memory
      rooms = Array.from(localRooms.values()).filter(r => r.ownerId === userId);
    }
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching my rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    let room;
    if (isFirestoreConnected) {
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) {
        room = doc.data();
      }
    } else {
      room = localRooms.get(roomId);
    }

    if (room) {
      res.json(room);
    } else {
      // Return defaults if not found
      res.json({ code: '', language: 'javascript', messages: [] });
    }
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// --- Missing Room Endpoints ---

// GET Room Code
app.get('/api/rooms/:roomId/code', async (req, res) => {
  const { roomId } = req.params;
  try {
    let code = '';
    if (isFirestoreConnected) {
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) code = doc.data().code || '';
    } else {
      const room = localRooms.get(roomId);
      code = room ? room.code : '';
    }
    res.json({ content: code });
  } catch (err) {
    console.error('Error fetching code:', err);
    res.status(500).json({ error: 'Failed to fetch code' });
  }
});

// PUT Room Code
app.put('/api/rooms/:roomId/code', async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;
  try {
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).set({ code: content }, { merge: true });
    } else {
      const room = localRooms.get(roomId) || { roomId, messages: [], users: [] };
      room.code = content;
      localRooms.set(roomId, room);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving code:', err);
    res.status(500).json({ error: 'Failed to save code' });
  }
});

// GET Room Metadata (Language)
app.get('/api/rooms/:roomId/metadata', async (req, res) => {
  const { roomId } = req.params;
  try {
    let language = 'javascript';
    if (isFirestoreConnected) {
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) language = doc.data().language || 'javascript';
    } else {
      const room = localRooms.get(roomId);
      language = room ? room.language : 'javascript';
    }
    res.json({ language });
  } catch (err) {
    console.error('Error fetching metadata:', err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// PUT Room Language
app.put('/api/rooms/:roomId/language', async (req, res) => {
  const { roomId } = req.params;
  const { language } = req.body;
  try {
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).set({ language }, { merge: true });
    } else {
      const room = localRooms.get(roomId) || { roomId, messages: [], users: [] };
      room.language = language;
      localRooms.set(roomId, room);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving language:', err);
    res.status(500).json({ error: 'Failed to save language' });
  }
});

// GET Room Messages
app.get('/api/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  try {
    let messages = [];
    if (isFirestoreConnected) {
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) messages = doc.data().messages || [];
    } else {
      const room = localRooms.get(roomId);
      messages = room ? room.messages : [];
    }
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST Room Message
app.post('/api/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  const message = req.body; // { userId, content, type, ... }
  try {
    const newMessage = { ...message, id: Date.now(), timestamp: new Date().toISOString() };
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).update({
        messages: admin.firestore.FieldValue.arrayUnion(newMessage)
      });
    } else {
      const room = localRooms.get(roomId) || { roomId, messages: [], users: [] };
      if (!room.messages) room.messages = [];
      room.messages.push(newMessage);
      localRooms.set(roomId, room);
    }
    res.json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET Participants
app.get('/api/rooms/:roomId/participants', async (req, res) => {
  const { roomId } = req.params;
  try {
    let users = [];
    if (isFirestoreConnected) {
      // In a real app, query 'roomMembers' collection or subcollection.
      // Here we used 'users' array in room doc in some places, or 'roomMembers' collection in others.
      // Let's try room doc 'users' for simplicity matching socket logic
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) users = doc.data().users || [];
    } else {
      const room = localRooms.get(roomId);
      users = room ? room.users : [];
    }
    res.json(users);
  } catch (err) {
    console.error('Error fetching participants:', err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// POST Heartbeat (Update Presence)
app.post('/api/rooms/:roomId/heartbeat', async (req, res) => {
  const { roomId } = req.params;
  const { userId, username } = req.body;
  try {
    // For simplicity, just return success.
    // Real logic would update 'lastActive' in DB.
    res.json({ success: true });
  } catch (err) {
    console.error('Heartbeat error:', err);
    res.status(500).json({ error: 'Heartbeat failed' });
  }
});

// POST Typing Status
app.post('/api/rooms/:roomId/typing', async (req, res) => {
  const { roomId } = req.params;
  const { userId, isTyping } = req.body;
  // Broadcasting handled by Socket.IO, endpoint just ack
  res.json({ success: true });
});

// GET Active Typing Users
app.get('/api/rooms/:roomId/typing/active', async (req, res) => {
  res.json([]); // Placeholder
});

app.get('/api/rooms/:roomId/permissions', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.query;
  // For now, allow everyone to edit. 
  // Future: Check if room is private/locked and if userId is owner or authorized.
  res.json({ canEdit: true, canView: true });
});

// --- AI Configuration (Groq API) ---
console.log("DEBUG: Loading AI Configuration");
console.log("DEBUG: GROQ_API_KEY:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + "..." : "undefined");
console.log("DEBUG: GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 10) + "..." : "undefined");

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GOOGLE_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroqAPI(messages) {
  if (!GROQ_API_KEY) {
    throw new Error('API Key is missing. Please set GROQ_API_KEY in environment variables.');
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API Error (${response.status}):`, errorText);
      throw new Error(`I am having trouble connecting to the AI service right now. (Status: ${response.status})`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Exception:', error);
    throw error;
  }
}

app.post('/api/ai/chat', async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const messages = [
      { role: 'system', content: 'You are CodeConnect AI, a helpful assistant for coding and debugging. Keep responses concise and relevant to programming.' }
    ];

    if (context) {
      messages.push({ role: 'user', content: `Context:\n${context}\n\nUser Question: ${prompt}` });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await callGroqAPI(messages);
    res.json({ response });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

app.post('/api/ai/explain', async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const messages = [
      { role: 'system', content: `You are an expert ${language || 'programming'} developer. Explain the code clearly and simply for a student.` },
      { role: 'user', content: `Please explain this ${language || 'code'}:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
    ];

    const response = await callGroqAPI(messages);
    res.json({ response });
  } catch (err) {
    console.error('AI Explain Error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

// --- Code Execution (Piston API Proxy) ---
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;

  // Map frontend languages to Piston languages
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rust': 'rust',
    'typescript': 'typescript'
  };

  const pistonLang = languageMap[language] || language;

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: pistonLang,
        version: '*', // Use latest available
        files: [
          {
            content: code
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Transform Piston output to match our frontend expectation
      // Frontend expects: { results: [ { actual: "output string", error: "error string" } ] }
      const result = {
        actual: data.run.stdout,
        error: data.run.stderr
      };
      res.json({ results: [result] });
    } else {
      console.error('Piston API Error:', data);
      res.status(response.status).json({ error: data.message || 'Execution failed' });
    }
  } catch (error) {
    console.error('Execution Server Error:', error);
    res.status(500).json({ error: 'Failed to connect to execution service' });
  }
});

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    socketIdToUserId.set(socket.id, userId);

    if (!activeRooms.has(roomId)) activeRooms.set(roomId, new Map());
    const roomUsers = activeRooms.get(roomId);

    if (!roomUsers.has(userId)) roomUsers.set(userId, 1);
    else roomUsers.set(userId, roomUsers.get(userId) + 1);

    // Update DB/Local user list
    let room;
    if (isFirestoreConnected) {
      const roomRef = db.collection('rooms').doc(roomId);
      const doc = await roomRef.get();
      if (doc.exists) {
        room = doc.data();
        // Add user if not present (simple check)
        const userExists = room.users && room.users.some(u => u.userId === userId);
        if (!userExists) {
          await roomRef.update({
            users: admin.firestore.FieldValue.arrayUnion({ userId, joinedAt: new Date().toISOString() })
          });
        }
      } else {
        // Upsert handled slightly differently in Firestore, usually create first but fallback here
        const newRoom = {
          roomId,
          code: '',
          language: 'javascript',
          messages: [],
          users: [{ userId, joinedAt: new Date().toISOString() }]
        };
        await roomRef.set(newRoom);
        room = newRoom;
      }
    } else {
      if (!localRooms.has(roomId)) localRooms.set(roomId, { roomId, code: '', language: 'javascript', messages: [], users: [] });
      room = localRooms.get(roomId);
      if (room && (!room.users || !room.users.find(u => u.userId === userId))) {
        if (!room.users) room.users = [];
        room.users.push({ userId });
      }
    }

    const activeCount = roomUsers.size;
    const activeParticipants = Array.from(roomUsers.keys());

    if (room) {
      socket.emit('room-joined', {
        roomId,
        code: room.code || '',
        language: room.language || 'javascript',
        messages: room.messages || [],
        participants: activeParticipants,
        users: activeCount
      });
    }

    if (roomUsers.get(userId) === 1) socket.to(roomId).emit('user-joined', userId);
    io.to(roomId).emit('user-count', activeCount);
  });

  socket.on('code-change', async (data) => {
    const { roomId, code, language } = data;
    if (isFirestoreConnected) {
      // Debounce or just fire and forget usually, but here we await
      await db.collection('rooms').doc(roomId).update({ code, language }).catch(e => console.error('Code update failed', e));
    } else {
      const room = localRooms.get(roomId);
      if (room) { room.code = code; room.language = language; }
    }
    socket.to(roomId).emit('code-update', { code, language });
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });

  socket.on('send-message', async (data) => {
    const { roomId, id, content, userId, type = 'text' } = data;
    const newMessage = { id, userId, content, type, timestamp: new Date().toISOString() };

    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).update({
        messages: admin.firestore.FieldValue.arrayUnion(newMessage)
      }).catch(e => console.error('Message update failed', e));
    } else {
      const room = localRooms.get(roomId);
      if (room) {
        if (!room.messages) room.messages = [];
        room.messages.push(newMessage);
      }
    }
    io.to(roomId).emit('new-message', newMessage);
  });

  socket.on('cursor-update', (data) => socket.to(data.roomId).emit('cursor-update', data));

  socket.on('cursor-leave', (userId) => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) socket.to(roomId).emit('cursor-leave', userId);
    }
  });

  socket.on('end-room', async (roomId, userId) => {
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).update({
        code: '',
        language: 'javascript',
        messages: [],
        endedAt: new Date().toISOString()
      }).catch(e => console.error('End room failed', e));
    } else {
      const room = localRooms.get(roomId);
      if (room) { room.code = ''; room.messages = []; room.endedAt = new Date(); }
    }
    io.to(roomId).emit('room-ended', { roomId, message: 'Room ended' });
    activeRooms.delete(roomId);
  });

  socket.on('disconnect', () => {
    const userId = socketIdToUserId.get(socket.id);
    if (!userId) return;

    for (const roomId of socket.rooms) {
      if (activeRooms.has(roomId) && roomId !== socket.id) {
        const roomUsers = activeRooms.get(roomId);
        if (roomUsers.has(userId)) {
          roomUsers.set(userId, roomUsers.get(userId) - 1);
          if (roomUsers.get(userId) === 0) {
            roomUsers.delete(userId);
            socket.to(roomId).emit('user-left', userId);
          }
          const newCount = roomUsers.size;
          io.to(roomId).emit('user-count', newCount);
          if (newCount === 0) activeRooms.delete(roomId);
        }
      }
    }
    socketIdToUserId.delete(socket.id);
  });
});

// 404 Handler - Must be last
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
