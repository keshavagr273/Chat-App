# 💬 Real-Time Chat Application

A modern full-stack chat application with real-time messaging, video/voice calls, and WebRTC support.

## ✨ Features

- 🔐 JWT Authentication
- 💬 Real-time messaging with Socket.IO
- 👥 One-to-one and group chats
- 📞 Video & voice calls (WebRTC)
- 🟢 Online/offline status
- ✍️ Typing indicators
- ✅ Read receipts
- 😊 Message reactions & emoji picker
- ✏️ Edit/delete messages
- 🔍 User search
- 📱 Responsive design
- 🌙 Dark theme

## 🛠 Tech Stack

**Backend:** Node.js, Express, Socket.IO, MongoDB, JWT  
**Frontend:** React 18, Vite, Tailwind CSS, Zustand, Socket.IO Client

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB

### Installation

1. **Clone and navigate to project**
```bash
cd d:\chat-app
```

2. **Backend setup**
```bash
cd backend
npm install
```

Create `.env` file in backend:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start backend:
```bash
npm start
```

3. **Frontend setup** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create one-to-one chat
- `POST /api/chats/group` - Create group chat

### Messages
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users` - Search users

## 🔌 WebSocket Events

**Client → Server:**
- `send_message` - Send message
- `typing` / `stop_typing` - Typing indicators
- `message_seen` - Mark message as read
- `initiate_call` - Start video/voice call
- `call_accepted` / `call_rejected` - Call responses
- `ice_candidate` - WebRTC signaling

**Server → Client:**
- `receive_message` - New message
- `typing` / `stop_typing` - Typing status
- `message_read` - Read receipt
- `incoming_call` - Incoming call notification
- `user_online` / `user_offline` - Status updates

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── controllers/    # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── socket/        # Socket.IO handlers
│   └── server.js      # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/ # React components
    │   ├── pages/      # Page components
    │   ├── store/      # Zustand stores
    │   ├── hooks/      # Custom hooks
    │   └── utils/      # Socket & API config
    └── vite.config.js
```

## 🔐 Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

MIT License
