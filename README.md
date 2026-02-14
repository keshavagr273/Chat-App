# 🚀 Real-Time Chat Application

A full-stack real-time chat application built with modern technologies, featuring WebSocket communication, JWT authentication, and a beautiful UI.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How WebSockets Work](#how-websockets-work)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Real-Time Features Explained](#real-time-features-explained)

## ✨ Features

### Core Features
- ✅ **Real-time messaging** - Instant message delivery using WebSockets
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **One-to-one chat** - Private conversations
- ✅ **Group chat** - Create and manage group conversations
- ✅ **Online/Offline status** - See who's online in real-time
- ✅ **Typing indicators** - See when someone is typing
- ✅ **Read receipts** - Know when messages are delivered and read
- ✅ **Message reactions** - React to messages with emojis
- ✅ **Edit/Delete messages** - Modify or remove sent messages
- ✅ **User search** - Find and start conversations
- ✅ **Message status** - Sent, delivered, and seen indicators
- ✅ **Emoji picker** - Express yourself with emojis
- ✅ **Auto-reconnect** - Handles connection drops automatically

### UI/UX Features
- 🎨 Modern, clean design
- 🌙 Dark theme
- 📱 Responsive layout
- ⚡ Smooth animations
- 💬 WhatsApp/Discord-inspired interface

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - WebSocket library
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.IO Client** - WebSocket client
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library
- **date-fns** - Date formatting
- **React Hot Toast** - Notifications
- **Emoji Picker React** - Emoji picker

## 🧠 How WebSockets Work

### Traditional HTTP vs WebSockets

#### ❌ Traditional HTTP (Request-Response)
```
Client → Request → Server
       ← Response ←
(Connection closes)

Problem: Client must keep asking "Any new messages?"
```

#### ✅ WebSockets (Persistent Connection)
```
Client ⟷ Server (Always connected)

Server can push data anytime!
Client can send data anytime!
```

### Why WebSockets for Chat?

1. **Real-time Updates**: Server pushes messages instantly
2. **Less Overhead**: No repeated HTTP requests
3. **Bi-directional**: Both client and server can initiate communication
4. **Efficient**: Single persistent connection instead of many requests

### WebSocket Flow in This App

```
┌─────────────┐                           ┌─────────────┐
│   Client A  │                           │   Client B  │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │  1. Connect (with JWT token)           │
       ├────────────────┐                       │
       │                ├───────────────────────┤
       │                │      Server           │
       │                │   (Socket.IO)         │
       │                └───────────────────────┤
       │  2. Join chat room (chatId)            │
       ├────────────────┐                       │
       │                │                       │
       │  3. Send message                       │
       ├────────────────►                       │
       │                │  4. Server receives   │
       │                │  5. Save to DB        │
       │                │  6. Emit to room      │
       │                │                       │
       │  7. Receive ◄──┼──────────────────►  8. Receive
       │                │                       │
```

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── chatController.js        # Chat management
│   │   ├── messageController.js     # Message operations
│   │   └── userController.js        # User operations
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   └── validate.js              # Input validation
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Chat.js                  # Chat schema
│   │   └── Message.js               # Message schema
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── chats.js                 # Chat routes
│   │   ├── messages.js              # Message routes
│   │   └── users.js                 # User routes
│   ├── socket/
│   │   └── socketHandler.js         # ⚡ WebSocket logic (IMPORTANT!)
│   ├── utils/
│   │   └── jwt.js                   # JWT utilities
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── server.js                    # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/              # React components
    │   │   ├── ChatBox.jsx          # Chat container
    │   │   ├── ChatHeader.jsx       # Chat header
    │   │   ├── ChatItem.jsx         # Sidebar chat item
    │   │   ├── Message.jsx          # Message bubble
    │   │   ├── MessageInput.jsx     # Input field
    │   │   ├── MessageList.jsx      # Messages container
    │   │   ├── NewChatModal.jsx     # New chat modal
    │   │   ├── Sidebar.jsx          # Chat list sidebar
    │   │   └── Welcome.jsx          # Welcome screen
    │   ├── hooks/
    │   │   └── useSocket.js         # ⚡ Socket.IO hook (IMPORTANT!)
    │   ├── pages/
    │   │   ├── Chat.jsx             # Main chat page
    │   │   ├── Login.jsx            # Login page
    │   │   └── Register.jsx         # Register page
    │   ├── store/
    │   │   ├── authStore.js         # Auth state management
    │   │   └── chatStore.js         # Chat state management
    │   ├── utils/
    │   │   ├── api.js               # Axios configuration
    │   │   └── socket.js            # Socket.IO setup
    │   ├── App.jsx                  # Main app component
    │   ├── main.jsx                 # Entry point
    │   └── index.css                # Global styles
    ├── package.json
    └── vite.config.js
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the Repository
```bash
cd d:\chat-app
```

### Step 2: Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start MongoDB (if running locally):
```bash
mongod
```

Start the backend server:
```bash
npm run dev
```

### Step 3: Setup Frontend

Open a new terminal:
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

### Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
POST   /api/auth/logout        - Logout user
```

### Users
```
GET    /api/users              - Get all users (search)
GET    /api/users/:id          - Get user by ID
PUT    /api/users/profile      - Update profile
```

### Chats
```
POST   /api/chats              - Create/access one-to-one chat
GET    /api/chats              - Get all user chats
POST   /api/chats/group        - Create group chat
PUT    /api/chats/group/rename - Rename group
PUT    /api/chats/group/add    - Add user to group
PUT    /api/chats/group/remove - Remove user from group
```

### Messages
```
POST   /api/messages           - Send message
GET    /api/messages/:chatId   - Get all messages for a chat
PUT    /api/messages/:id       - Edit message
DELETE /api/messages/:id       - Delete message
POST   /api/messages/:id/react - Add reaction to message
```

## ⚡ WebSocket Events

### Client → Server

#### Connection & Authentication
```javascript
socket.emit('connect', { token: 'JWT_TOKEN' })
```

#### Messaging
```javascript
socket.emit('send_message', {
  chatId: 'chat_id',
  content: 'Hello!',
  messageType: 'text'
})
```

#### Typing Indicators
```javascript
socket.emit('typing', { chatId: 'chat_id', username: 'John' })
socket.emit('stop_typing', { chatId: 'chat_id' })
```

#### Read Receipts
```javascript
socket.emit('message_seen', { messageId: 'msg_id', chatId: 'chat_id' })
socket.emit('mark_chat_read', { chatId: 'chat_id' })
```

#### Reactions
```javascript
socket.emit('add_reaction', { messageId: 'msg_id', emoji: '❤️', chatId: 'chat_id' })
socket.emit('remove_reaction', { messageId: 'msg_id', chatId: 'chat_id' })
```

#### Message Operations
```javascript
socket.emit('edit_message', { messageId: 'msg_id', content: 'Updated text', chatId: 'chat_id' })
socket.emit('delete_message', { messageId: 'msg_id', chatId: 'chat_id' })
```

#### Room Management
```javascript
socket.emit('join_chat', 'chat_id')
socket.emit('leave_chat', 'chat_id')
```

### Server → Client

#### Connection Events
```javascript
socket.on('connect', () => console.log('Connected'))
socket.on('disconnect', () => console.log('Disconnected'))
```

#### Online Status
```javascript
socket.on('online_users', (userIds) => { })
socket.on('user_online', ({ userId, username }) => { })
socket.on('user_offline', ({ userId, username, lastSeen }) => { })
```

#### Messaging
```javascript
socket.on('receive_message', (message) => { })
socket.on('message_delivered', ({ messageId, deliveredTo }) => { })
socket.on('message_read', ({ messageId, userId, readAt }) => { })
```

#### Typing
```javascript
socket.on('typing', ({ chatId, username, userId }) => { })
socket.on('stop_typing', ({ chatId, userId }) => { })
```

#### Reactions
```javascript
socket.on('reaction_added', ({ messageId, userId, emoji, username }) => { })
socket.on('reaction_removed', ({ messageId, userId }) => { })
```

#### Message Updates
```javascript
socket.on('message_edited', ({ messageId, content, editedAt }) => { })
socket.on('message_deleted', ({ messageId, deletedAt }) => { })
```

#### Errors
```javascript
socket.on('error', (error) => { })
```

## 🔥 Real-Time Features Explained

### 1️⃣ Real-Time Messaging

**How it works:**

1. User A types and sends a message
2. Frontend emits `send_message` event to server
3. Server saves message to MongoDB
4. Server emits `receive_message` to the chat room
5. All users in that room receive the message instantly
6. UI updates automatically

**Code Flow:**

```javascript
// Client sends
socket.emit('send_message', { chatId, content: 'Hi!' })

// Server receives, saves, and broadcasts
socket.on('send_message', async (data) => {
  const message = await Message.create(data)
  io.to(chatId).emit('receive_message', message)
})

// All clients in room receive
socket.on('receive_message', (message) => {
  addMessageToUI(message)
})
```

### 2️⃣ Typing Indicators

**How it works:**

1. User starts typing → Emit `typing` event
2. Server forwards to other users in the chat
3. Show "User is typing..." indicator
4. After 2 seconds of no typing → Emit `stop_typing`
5. Hide indicator

**Code:**

```javascript
// Start typing
const handleTyping = () => {
  socket.emit('typing', { chatId, username })
  
  // Auto-stop after 2 seconds
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { chatId })
  }, 2000)
}
```

### 3️⃣ Online/Offline Status

**How it works:**

1. User connects → Server adds to `onlineUsers` map
2. Server emits `user_online` to all clients
3. Update UI to show green dot
4. User disconnects → Server removes from map
5. Server emits `user_offline` with last seen time

**Code:**

```javascript
// Backend tracks online users
const onlineUsers = new Map()

socket.on('connection', (socket) => {
  onlineUsers.set(userId, socketId)
  io.emit('user_online', { userId })
})

socket.on('disconnect', () => {
  onlineUsers.delete(userId)
  io.emit('user_offline', { userId, lastSeen: Date.now() })
})
```

### 4️⃣ Read Receipts

**How it works:**

1. User opens a chat
2. Frontend emits `mark_chat_read` event
3. Server updates all unread messages
4. Server emits `message_read` to sender
5. Sender sees blue checkmarks (✓✓)

**States:**
- ✓ (gray) - Sent
- ✓✓ (gray) - Delivered
- ✓✓ (blue) - Read

### 5️⃣ Message Reactions

**How it works:**

1. User clicks on emoji picker → Select emoji
2. Frontend emits `add_reaction` event
3. Server updates message in database
4. Server broadcasts `reaction_added` to chat room
5. All users see the reaction appear

### 6️⃣ Rooms (Chat Isolation)

**How it works:**

Rooms ensure messages only go to users in that specific chat.

```javascript
// User joins a chat room
socket.join(chatId)

// Send message only to that room
io.to(chatId).emit('receive_message', message)

// Leave room when switching chats
socket.leave(chatId)
```

**Without rooms:** Everyone gets all messages ❌  
**With rooms:** Only chat participants get messages ✅

## 🔐 Security Features

- JWT authentication for API and WebSocket
- Password hashing with bcrypt
- Protected routes and socket events
- Input validation
- CORS configuration
- Token expiration

## 🎯 Best Practices Implemented

1. **Separate concerns** - Controllers, routes, models, socket logic
2. **State management** - Zustand for clean state handling
3. **Custom hooks** - `useSocket` for socket logic
4. **Clean UI structure** - Componentized UI
5. **Error handling** - Try-catch blocks and error messages
6. **Real-time sync** - DB + Socket.IO for consistency
7. **Auto-reconnect** - Handles connection drops
8. **Optimistic updates** - UI updates immediately

## 🚀 Production Deployment

### Backend
1. Set environment variables
2. Use process manager (PM2)
3. Enable HTTPS
4. Use MongoDB Atlas
5. Implement rate limiting
6. Add Redis for scaling (optional)

### Frontend
1. Build for production: `npm run build`
2. Deploy to Vercel/Netlify
3. Update API URLs

## 📝 Key Takeaways

### What Makes This App Real-Time?

1. **Persistent WebSocket Connection** - Always open
2. **Server-Push Capability** - Server sends data without request
3. **Event-Driven Architecture** - React to events instantly
4. **Rooms** - Efficient message routing
5. **State Synchronization** - DB + Socket.IO

### Why Socket.IO over Native WebSockets?

- ✅ Auto-reconnection
- ✅ Built-in rooms
- ✅ Event-based API
- ✅ Fallback options
- ✅ Broadcasting helpers

## 🎓 Learning Resources

- Socket.IO Documentation: https://socket.io/docs/
- React Hooks: https://react.dev/
- MongoDB: https://www.mongodb.com/docs/
- JWT: https://jwt.io/

## 📄 License

MIT License

---

**Built with ❤️ using modern web technologies**

For questions or issues, please open an issue on GitHub.
