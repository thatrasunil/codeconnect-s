const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

dotenv.config();

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('🔥 Firebase Admin initialized successfully');
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
  }
} else {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found. Firebase token verification will be disabled.');
}

// Import routes
const problemsRouter = require('./routes/problems');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const verifyToken = require('./middleware/auth');
const teamsRouter = require('./routes/teams');

// Import Models
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);

// ===== CRITICAL: CORS Configuration for Vercel & Render =====
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3007',
  'https://codeconnect-s.vercel.app',
  'https://code-connect.vercel.app',
  'https://codeconnect-zeta-pied.vercel.app',
  'https://codeconnect-frontend.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback: allow for now to prevent deployment blocks
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'], // Ensure both are enabled
  pingTimeout: 60000,
  pingInterval: 25000
});

// CORS with credentials support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS: Origin rejected:', origin);
      // In production, we might want to be strict, but let's allow common patterns
      callback(null, true); // Fallback: allow for now to fix deployment blocks
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  maxAge: 3600,
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

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 3001;

// --- File Upload Configuration ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = process.env.RENDER || process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Return the URL to access the file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});


// --- Database Connection (MongoDB ONLY) ---
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
      // Don't exit process in Vercel/Production
    }
  } else {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    // Don't exit process, let logs catch it
  }
}

// Connect immediately
connectDB();

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), dbState: mongoose.connection.readyState });
});

// --- In-memory Stores (Fallback) ---
// Reserved for temp data if needed, but primary is now MongoDB
const localRooms = new Map();
const activeRooms = new Map();
const socketIdToUserId = new Map();

// --- Mount Routes ---
// CRITICAL: Invoke the router factories (passing null or db as they expect a db/connection)
app.use('/api/problems', problemsRouter(mongoose.connection));
app.use('/api/auth', authRouter(mongoose.connection));
app.use('/api/chat', chatRouter(mongoose.connection));
app.use('/api/teams', teamsRouter(mongoose.connection));

// --- API Routes ---
// --- API Routes ---
function generateRoomId() {
  const randomNum = crypto.randomBytes(4).readUInt32BE(0) % 90000000 + 10000000;
  return randomNum.toString();
}

app.post('/api/create-room', async (req, res) => {
  const roomId = generateRoomId();

  try {
    const newRoom = new Room({
      roomId,
      code: '',
      language: 'javascript',
      messages: [],
      users: []
    });

    await newRoom.save();
    res.json({ roomId });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET Dashboard Stats
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user._id; // Handle both JWT formats

    // Get rooms created by user
    // Note: Room model has ownerId as String for now, might need ObjectId conversion if schema changes
    const rooms = await Room.find({ ownerId: userId });

    const stats = {
      totalSessions: rooms.length,
      roomsCreated: rooms.length,
      languagesUsed: [...new Set(rooms.map(r => r.language).filter(Boolean))]
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Assuming User model is imported or we can fetch directly via mongoose
    // Note: We haven't imported User model in server.js properly yet, so let's require it locally or globally
    const User = require('./models/User');

    const leaderboard = await User.find({})
      .sort({ 'stats.points': -1 })
      .limit(10)
      .select('username displayName avatar stats'); // Select specific fields

    // Transform for frontend if needed
    const formattedLeaderboard = leaderboard.map(u => ({
      ...u.toObject(),
      points: u.stats?.points || 0
    }));

    res.json(formattedLeaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET My Rooms
app.get('/api/rooms/my-rooms', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user._id;
    const rooms = await Room.find({ ownerId: userId });
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching my rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({ roomId });

    if (room) {
      res.json(room);
    } else {
      // Return defaults if not found (or create on fly?)
      // Frontend expects code: '' if new
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
    const room = await Room.findOne({ roomId });
    res.json({ content: room ? room.code : '' });
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
    await Room.findOneAndUpdate(
      { roomId },
      { code: content },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
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
    const room = await Room.findOne({ roomId });
    res.json({ language: room ? room.language : 'javascript' });
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
    await Room.findOneAndUpdate(
      { roomId },
      { language },
      { upsert: true }
    );
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
    const room = await Room.findOne({ roomId });
    res.json(room ? room.messages : []);
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
    const newMessage = { ...message, timestamp: new Date() };

    await Room.findOneAndUpdate(
      { roomId },
      { $push: { messages: newMessage } }
    );

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
    const room = await Room.findOne({ roomId });
    res.json(room ? room.users : []);
  } catch (err) {
    console.error('Error fetching participants:', err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// POST Heartbeat (Update Presence)
app.post('/api/rooms/:roomId/heartbeat', async (req, res) => {
  // Can implement DB-based presence if needed, but Socket usually handles this
  res.json({ success: true });
});

// POST Typing Status
app.post('/api/rooms/:roomId/typing', async (req, res) => {
  // Broadcasting handled by Socket.IO
  res.json({ success: true });
});

// GET Active Typing Users
app.get('/api/rooms/:roomId/typing/active', async (req, res) => {
  res.json([]); // Placeholder
});

app.get('/api/rooms/:roomId/permissions', async (req, res) => {
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
// Note: Handled by global CORS

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
const { logEvent } = require('./utils/logger');

// Socket.io connection handling
io.on('connection', (socket) => {
  // console.log('User connected:', socket.id);
  logEvent('USER_CONNECT', { socketId: socket.id });

  socket.on('join-room', async ({ roomId, user }) => {
    socket.join(roomId);
    // console.log(`User ${user?.username || 'Guest'} joined room: ${roomId}`);

    // ✅ CRITICAL FIX: Generate consistent guest ID if not authenticated
    const userId = user?.uid || user?.id || `guest-${socket.id}`;  // Add socket.id fallback
    const username = user?.username || user?.displayName || `Guest-${socket.id.substring(0, 6).toUpperCase()}`;

    logEvent('USER_JOIN', {
      roomId,
      user: username,
      userId: userId
    });

    // ✅ Broadcast complete user object
    socket.to(roomId).emit('user-joined', {
      userId,
      username,
      uid: userId,
      displayName: username
    });

    socketIdToUserId.set(socket.id, userId);

    if (!activeRooms.has(roomId)) activeRooms.set(roomId, new Map());
    const roomUsers = activeRooms.get(roomId);

    if (!roomUsers.has(userId)) roomUsers.set(userId, 1);
    else roomUsers.set(userId, roomUsers.get(userId) + 1);

    // Update DB/Local user list
    try {
      // Find room and update user list if needed
      const room = await Room.findOne({ roomId });

      if (room) {
        const userExists = room.users.some(u => u.userId === userId);
        if (!userExists) {
          await Room.updateOne(
            { roomId },
            { $push: { users: { userId, username, joinedAt: new Date() } } }
          );
        }
      } else {
        // Create room if it doesn't exist (e.g., direct link join)
        const newRoom = new Room({
          roomId,
          code: '',
          language: 'javascript',
          messages: [],
          users: [{ userId, username, joinedAt: new Date() }]
        });
        await newRoom.save();
      }

    } catch (err) {
      console.error('Error updating room users in DB:', err);
    }

    // Fetch fresh room data for initial state
    const currentRoom = await Room.findOne({ roomId });

    // Send room state to the user who joined
    if (currentRoom) {
      socket.emit('room-joined', {
        roomId,
        code: currentRoom.code || '',
        language: currentRoom.language || 'javascript',
        messages: currentRoom.messages || []
      });
    }

    // Broadcast valid participant list
    // We can use activeRooms (memory) for real-time online status
    // Or fetch from DB. For "online now" memory is better.
    const activeParticipants = Array.from(roomUsers.keys());

    // Map activeParticipants to user objects (needs better state management, but for now...)
    const onlineUsers = [];
    // This part is tricky without fetching user details.
    // Ideally we broadcast the NEW user, and client appends.
    // Sending full list might require mapped details.

    if (roomUsers.get(userId) === 1) socket.to(roomId).emit('user-joined', userId);
    io.to(roomId).emit('user-count', roomUsers.size);
  });

  socket.on('code-change', async (data) => {
    const { roomId, code, language } = data;
    try {
      // Debounce or just fire and forget usually, but here we await
      await Room.updateOne({ roomId }, { code, language });
    } catch (e) {
      console.error('Code update failed', e);
    }
    socket.to(roomId).emit('code-update', { code, language });
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });

  socket.on('send-message', async (data) => {
    const { roomId, id, content, userId, type = 'text', senderName } = data;

    // ✅ CRITICAL FIX: Ensure message has complete sender info
    const newMessage = {
      // id: id, // Mongoose subdocs have _id by default, but we can keep id if frontend needs it
      userId: userId || socketIdToUserId.get(socket.id) || `guest-${socket.id}`,
      senderName: senderName || `Guest-${socket.id.substring(0, 6).toUpperCase()}`,
      content,
      type,
      timestamp: new Date()
    };

    try {
      await Room.updateOne(
        { roomId },
        { $push: { messages: newMessage } }
      );
    } catch (e) {
      console.error('Message update failed', e);
    }

    // ✅ Broadcast to all clients including sender
    // Note: If using Mongoose subdoc _id, we might want to return that. 
    // For now, let's assume frontend generates ID or doesn't strictly need DB ID immediately.
    io.to(roomId).emit('new-message', newMessage);
  });

  socket.on('cursor-update', (data) => socket.to(data.roomId).emit('cursor-update', data));

  socket.on('cursor-leave', (userId) => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) socket.to(roomId).emit('cursor-leave', userId);
    }
  });

  socket.on('end-room', async (roomId, userId) => {
    try {
      await Room.updateOne(
        { roomId },
        {
          code: '',
          language: 'javascript',
          messages: [],
          // endedAt: new Date() // Add to schema if needed
        }
      );
    } catch (e) {
      console.error('End room failed', e);
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

// Always listen on PORT for Render / Local
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
