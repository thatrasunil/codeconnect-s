import socketio
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
import json
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, delete
import uvicorn
import os
import random
from datetime import datetime
from database import engine, Base, get_db
from models import Room, Message, RoomParticipant

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Firebase Admin
firebase_service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
if firebase_service_account:
    try:
        service_account_info = json.loads(firebase_service_account)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        print("🔥 Firebase Admin initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase Admin: {e}")
else:
    print("⚠️ FIREBASE_SERVICE_ACCOUNT not found. Auth verification will be disabled.")

PORT = int(os.getenv("PORT", 3001))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Setup FastAPI
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3007",
    FRONTEND_URL,
    "https://codeconnect.vercel.app",
    "https://codeconnect-zeta-pied.vercel.app",
    "https://codeconnect-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Socket.IO
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=origins
)
socket_app = socketio.ASGIApp(sio, app)

# Startup Event
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- Auth Middleware ---
security = HTTPBearer()

async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    token = res.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}"
        )

# --- Helper Functions ---
def generate_room_id():
    return str(random.randint(100000, 999999))

# --- API Routes ---

@app.get("/")
async def root():
    return {"message": "CodeConnect Backend API is running (Python)"}

@app.post("/api/create-room")
async def create_room(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    room_id = generate_room_id()
    # Use room_id as the primary key id as well
    # Link to user if possible (requires schema update, but for now we just verify auth)
    new_room = Room(id=room_id, room_id=room_id)
    db.add(new_room)
    try:
        await db.commit()
        await db.refresh(new_room)
        return {"roomId": room_id}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create room: {str(e)}")

@app.get("/api/room/{room_id}")
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    # Fetch room with messages
    result = await db.execute(select(Room).where(Room.room_id == room_id))
    room = result.scalars().first()

    if room:
        # We need to fetch messages explicitly or eagerly load them
        # For simplicity in async, separate query or select options
        msg_result = await db.execute(select(Message).where(Message.room_id == room.id))
        messages = msg_result.scalars().all()
        
        # Format messages
        formatted_msgs = [
            {
                "userId": m.user_id,
                "content": m.content,
                "type": m.type,
                "timestamp": m.timestamp
            } for m in messages
        ]

        return {
            "roomId": room.room_id,
            "code": room.code,
            "language": room.language,
            "messages": formatted_msgs,
            # Users list logic differs slightly in SQL, we can fetch active participants via socket state or DB
            # For this API, returning empty users list is often fine as socket handles real-time list
            "users": [] 
        }
    else:
         # Loose behavior for testing/compatibility
        return {"code": "", "language": "javascript", "messages": []}

@app.get("/api/rooms/{room_id}/code/")
async def get_room_code(room_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).where(Room.room_id == room_id))
    room = result.scalars().first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"content": room.code}

@app.put("/api/rooms/{room_id}/code/")
async def update_room_code(room_id: str, payload: dict, db: AsyncSession = Depends(get_db)):
    content = payload.get("content")
    await db.execute(update(Room).where(Room.room_id == room_id).values(code=content))
    await db.commit()
    return {"message": "Code updated"}

@app.get("/api/rooms/{room_id}/metadata/")
async def get_room_metadata(room_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).where(Room.room_id == room_id))
    room = result.scalars().first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"roomId": room.room_id, "language": room.language}

@app.put("/api/rooms/{room_id}/language/")
async def update_room_language(room_id: str, payload: dict, db: AsyncSession = Depends(get_db)):
    language = payload.get("language")
    await db.execute(update(Room).where(Room.room_id == room_id).values(language=language))
    await db.commit()
    return {"message": "Language updated"}

# --- Socket.IO Events ---

# Map socket_sid -> user_id
socket_id_to_user_id = {}

@sio.event
async def connect(sid, environ):
    print(f"User connected: {sid}")

@sio.event
async def disconnect(sid):
    user_id = socket_id_to_user_id.get(sid)
    if not user_id:
        return
    
    # We need to find which rooms this user was in. 
    # SIO rooms are managed by SIO, but we can't iterate them easily in 'disconnect' generic handler without tracking
    # Actually, SIO automatically removes from rooms, but we need to notify others.
    # We'll rely on our own tracking or 'leaving' logic if possible, 
    # but strictly speaking we need to know the rooms.
    # We can iterate all rooms in DB or keep local tracking. 
    # Existing server.js kept activeRooms Map. We can replicate that.
    
    # For robust python implementation without global variable issues in multi-worker (though we use 1 worker):
    # We will just depend on 'rooms' the socket was in.
    # But socket.rooms is not available after disconnect usually in some versions.
    # Let's use a global map for this simple server implementation
    pass # Logic implemented in specific event or tracked via global

active_rooms = {} # roomId -> { userId: count }

@sio.on("join-room")
async def join_room(sid, roomId, userData, password=None):
    await sio.enter_room(sid, roomId)
    
    # Handle legacy string format or object format
    if isinstance(userData, dict):
        userId = userData.get('userId')
        userName = userData.get('name', 'Anonymous')
    else:
        userId = userData
        userName = userId # Legacy fallback

    socket_id_to_user_id[sid] = userId
    
    if roomId not in active_rooms:
        active_rooms[roomId] = {}
    
    room_users = active_rooms[roomId]
    
    # Store rich user data if possible, but map expects count? 
    # The existing logic seemed to count instances of a user (tabs).
    # Let's keep it simple: Map<UserId, Count>
    if userId not in room_users:
        room_users[userId] = 0
    room_users[userId] += 1
    
    # DB Update (Room creation if not exists)
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Room).where(Room.room_id == roomId))
        room = result.scalars().first()
        
        if not room:
            room = Room(id=roomId, room_id=roomId, code='', language='javascript')
            db.add(room)
            await db.commit()
            await db.refresh(room)
        
        # Add participant record
        # Note: This might duplicate if user joins form multiple tabs, but DB should handle uniquely by (room_id, user_id)
        # We check existence first.
        p_result = await db.execute(select(RoomParticipant).where(
            RoomParticipant.room_id == room.id,
            RoomParticipant.user_id == userId
        ))
        participant = p_result.scalars().first()
        if not participant:
            participant = RoomParticipant(room_id=room.id, user_id=userId)
            db.add(participant)
            await db.commit()
        
        # Fetch messages for initial state
        msg_result = await db.execute(select(Message).where(Message.room_id == room.id))
        messages = msg_result.scalars().all()
        formatted_msgs = [
            {
                "userId": m.user_id,
                "content": m.content,
                "type": m.type,
                "timestamp": m.timestamp.isoformat()
            } for m in messages
        ]
        
        # Prepare participants list for frontend
        # We can construct it from active_rooms keys. 
        # Ideally we want names, but we only have userId in keys. 
        # If we want names, we might need a separate 'active_participants_details' map.
        # For now, let's use the object passed in 'userData' to at least broadcast to others.
        
        active_count = len(room_users)
        active_participants = list(room_users.keys())
        
        await sio.emit('room-joined', {
            "roomId": roomId,
            "code": room.code,
            "language": room.language,
            "messages": formatted_msgs,
            "participants": active_participants, 
            "users": active_count
        }, to=sid)
        
        # Broadcast user joined
        # If we have the rich object, emit that.
        user_info = userData if isinstance(userData, dict) else {"userId": userId, "name": userId}
        
        if room_users[userId] == 1:
            await sio.emit('user-joined', user_info, room=roomId)
        
        # Always emit count update
        await sio.emit('user-count', {"count": active_count, "participants": active_participants}, room=roomId)
        # Also emit participants-update for redundancy as requested/observed in some frontends
        await sio.emit('participants-update', active_participants, room=roomId)

@sio.on("code-change")
async def code_change(sid, data):
    roomId = data.get("roomId")
    code = data.get("code")
    language = data.get("language")
    
    async with AsyncSessionLocal() as db:
         await db.execute(
             update(Room).where(Room.room_id == roomId).values(code=code, language=language)
         )
         await db.commit()
    
    # Broadcast to everyone in room request (skip_sid can be used but sometimes nice to confirm)
    # The user request said "code changes are NOT being broadcast".
    # Using 'room=roomId' should work. 
    await sio.emit('code-update', {"code": code, "language": language}, room=roomId, skip_sid=sid)

@sio.on("typing")
async def typing(sid, data):
    await sio.emit('user-typing', data, room=data.get("roomId"), skip_sid=sid)

@sio.on("send-message")
async def send_message(sid, data):
    roomId = data.get("roomId")
    # userId = data.get("userId") # Trust data or usage socket map? user map is safer but data is fine for now
    userId = data.get("userId") 
    content = data.get("content")
    type_ = data.get("type", "text")
    msg_id = data.get("id")
    
    timestamp = datetime.utcnow()
    
    new_message = {
        "id": msg_id,
        "userId": userId,
        "content": content,
        "type": type_,
        "timestamp": timestamp.isoformat()
    }
    
    async with AsyncSessionLocal() as db:
        # Find room id
        result = await db.execute(select(Room).where(Room.room_id == roomId))
        room = result.scalars().first()
        if room:
            msg = Message(room_id=room.id, user_id=userId, content=content, type=type_, timestamp=timestamp)
            db.add(msg)
            await db.commit()
            
    # CRITICAL FIX: Broadcast to room
    await sio.emit('new-message', new_message, room=roomId)

@sio.on("cursor-update")
async def cursor_update(sid, data):
    await sio.emit('cursor-update', data, room=data.get("roomId"), skip_sid=sid)

@sio.on("cursor-leave")
async def cursor_leave(sid, roomId, userId):
    # Frontend sends roomId and userId
    # Broadcast to all in the room
    await sio.emit('cursor-leave', userId, room=roomId, skip_sid=sid)

@sio.on("end-room")
async def end_room(sid, roomId, userId):
    async with AsyncSessionLocal() as db:
        timestamp = datetime.utcnow()
        await db.execute(
            update(Room).where(Room.room_id == roomId).values(
                code='', 
                language='javascript', 
                ended_at=timestamp
            )
        )
        # TODO: Clear messages? Server.js did: messages: []
        # We can delete from messages table
        result = await db.execute(select(Room).where(Room.room_id == roomId))
        room = result.scalars().first()
        if room:
            await db.execute(delete(Message).where(Message.room_id == room.id))
        await db.commit()
        
    await sio.emit('room-ended', {"roomId": roomId, "message": "Room ended"}, room=roomId)
    if roomId in active_rooms:
        del active_rooms[roomId]

@sio.on("disconnect")
async def on_disconnect(sid):
    # We need to replicate logic: remove user from maps, notify others.
    # This handler overrides the previous generic 'disconnect' decorator if duplicate.
    # Let's combine them or use this one.
    
    userId = socket_id_to_user_id.get(sid)
    if not userId:
        return
        
    # We don't have easy access to 'which rooms' tracked by SIO after disconnect in some versions
    # But we can iterate our active_rooms global map
    
    rooms_to_remove = []
    
    for roomId, users in active_rooms.items():
        if userId in users:
            users[userId] -= 1
            if users[userId] <= 0:
                del users[userId]
                await sio.emit('user-left', userId, room=roomId)
            
            new_count = len(users)
            await sio.emit('user-count', new_count, room=roomId)
            
            if new_count == 0:
                rooms_to_remove.append(roomId)
    
    for rid in rooms_to_remove:
        if rid in active_rooms:
            del active_rooms[rid]
            
    if sid in socket_id_to_user_id:
        del socket_id_to_user_id[sid]

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=PORT, reload=True)
