# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies

Open terminal in the `backend` folder:
```powershell
cd d:\chat-app\backend
npm install
```

Open another terminal in the `frontend` folder:
```powershell
cd d:\chat-app\frontend
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
```powershell
# Start MongoDB service
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` file

### Step 3: Configure Environment

The `.env` file is already created in `backend` folder with default values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Start Backend Server

In the `backend` terminal:
```powershell
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
📡 WebSocket server ready
🔌 Socket.IO initialized
```

### Step 5: Start Frontend

In the `frontend` terminal:
```powershell
npm run dev
```

You should see:
```
VITE ready in 500 ms
➜ Local:   http://localhost:3000/
```

### Step 6: Open Application

1. Open browser: http://localhost:3000
2. Click "Sign up" to create account
3. Register with:
   - Username: john
   - Email: john@example.com
   - Password: 123456

4. Open another browser (or incognito):
   - Register another user: jane / jane@example.com / 123456

5. Start chatting! 🎉

## 🧪 Testing Real-Time Features

### Test Typing Indicators
1. User 1: Start typing in message input
2. User 2: See "User 1 is typing..." appear
3. User 1: Stop typing for 2 seconds
4. User 2: See indicator disappear

### Test Online Status
1. User 1: Login
2. User 2: See User 1 with green dot (online)
3. User 1: Close browser
4. User 2: Green dot disappears (offline)

### Test Read Receipts
1. User 1: Send message
2. User 1: See gray check (✓) - Sent
3. User 2: Message arrives
4. User 1: See gray double check (✓✓) - Delivered
5. User 2: Open the chat
6. User 1: See blue double check (✓✓) - Read

### Test Message Reactions
1. User 1: Send message
2. User 2: Hover over message
3. User 2: Click emoji
4. Both see reaction appear instantly

## 📁 Project Structure Overview

```
chat-app/
├── backend/           ← Node.js + Express + Socket.IO
│   ├── controllers/   ← Business logic
│   ├── models/        ← MongoDB schemas  
│   ├── routes/        ← API endpoints
│   ├── socket/        ← ⚡ WebSocket logic
│   └── server.js      ← Entry point
│
└── frontend/          ← React + Vite + Tailwind
    ├── src/
    │   ├── components/ ← UI components
    │   ├── pages/     ← Routes
    │   ├── store/     ← State management
    │   └── utils/     ← Socket & API
    └── package.json
```

## 🔥 Key Files to Understand

### Backend
- `server.js` - Main server setup
- `socket/socketHandler.js` - **⚡ ALL WebSocket logic here**
- `models/Message.js` - Message schema with reactions, read receipts
- `middleware/auth.js` - JWT authentication

### Frontend
- `hooks/useSocket.js` - **⚡ Socket event listeners**
- `utils/socket.js` - Socket connection setup
- `store/chatStore.js` - Chat state management
- `components/MessageInput.jsx` - Typing indicators
- `components/Message.jsx` - Message bubble with reactions

## ⚙️ Common Issues

### Port Already in Use
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify connection string in `.env`
- Try MongoDB Atlas (cloud) instead

### Socket Connection Failed
- Backend must be running first
- Check CLIENT_URL in backend `.env`
- Check API URL in frontend

### Module Not Found
```powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

## 📖 Next Steps

1. **Read README.md** - Complete documentation
2. **Read WEBSOCKETS_EXPLAINED.md** - Deep dive into WebSockets
3. **Explore the code** - Start with `socketHandler.js`
4. **Add features** - Voice messages, file uploads, etc.
5. **Deploy** - Follow production deployment guide

## 🎓 Learning Path

### Beginner
1. Understand REST API endpoints (`routes/` folder)
2. Learn Socket.IO basics (connect, emit, on)
3. Study message flow in `socketHandler.js`

### Intermediate
4. Understand rooms concept
5. Learn typing indicators implementation
6. Study read receipts logic

### Advanced
7. Implement rate limiting
8. Add Redis for scaling
9. Add voice/video calls
10. Deploy to production

## 🆘 Get Help

- Check documentation: `README.md`
- Read WebSocket guide: `WEBSOCKETS_EXPLAINED.md`
- Review code comments
- Open GitHub issue

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can register new user
- [ ] Can login
- [ ] Can see other users
- [ ] Can start chat
- [ ] Messages send instantly
- [ ] Typing indicator works
- [ ] Online status shows
- [ ] Read receipts appear

If all checked ✅ - **Congratulations! You're ready to build!** 🎉

---

**Happy coding! 🚀**
