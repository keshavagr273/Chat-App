const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { verifyToken } = require('../utils/jwt');
const { setSocketIO } = require('./socketInstance');

// Store online users: { userId: socketId }
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Store io instance for use in controllers
  setSocketIO(io);

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return next(new Error('Authentication error'));
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // Add user to online users map
    onlineUsers.set(socket.userId, socket.id);

    // Update user status in database
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: Date.now()
    });

    // Notify all users that this user is online
    io.emit('user_online', {
      userId: socket.userId,
      username: socket.user.username
    });

    // Send list of online users to the newly connected user
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit('online_users', onlineUserIds);

    // Join user's chat rooms
    const userChats = await Chat.find({ users: socket.userId });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // ==================== MESSAGING EVENTS ====================

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType, fileUrl, fileName } = data;

        // Check if chat still exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', {
            message: 'This chat no longer exists. It may have been deleted.',
            type: 'chat_not_found'
          });
          return;
        }

        // Check if user is still part of the chat
        if (!chat.users.includes(socket.userId)) {
          socket.emit('error', {
            message: 'You are no longer part of this chat.',
            type: 'not_in_chat'
          });
          return;
        }

        // Create message in database
        let message = await Message.create({
          sender: socket.userId,
          content: content || '',
          chat: chatId,
          messageType: messageType || 'text',
          fileUrl: fileUrl || '',
          fileName: fileName || ''
        });

        // Populate message fields
        message = await message.populate('sender', 'username avatar');
        message = await message.populate('chat');
        message = await User.populate(message, {
          path: 'chat.users',
          select: 'username avatar email'
        });

        // Update latest message in chat
        await Chat.findByIdAndUpdate(chatId, {
          latestMessage: message._id
        });

        // Send message to all users in the chat room
        io.to(chatId).emit('receive_message', message);

        // Mark as delivered to online users
        const deliveredTo = [];

        chat.users.forEach(userId => {
          if (userId.toString() !== socket.userId && onlineUsers.has(userId.toString())) {
            deliveredTo.push(userId);
          }
        });

        if (deliveredTo.length > 0) {
          await Message.findByIdAndUpdate(message._id, {
            $addToSet: { deliveredTo: { $each: deliveredTo } }
          });

          io.to(chatId).emit('message_delivered', {
            messageId: message._id,
            deliveredTo
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ==================== TYPING INDICATORS ====================

    socket.on('typing', (data) => {
      const { chatId, username } = data;
      socket.to(chatId).emit('typing', { chatId, username, userId: socket.userId });
    });

    socket.on('stop_typing', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('stop_typing', { chatId, userId: socket.userId });
    });

    // ==================== READ RECEIPTS ====================

    socket.on('message_seen', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);

        if (!message) return;

        // Check if user already read the message
        const alreadyRead = message.readBy.some(
          read => read.user.toString() === socket.userId
        );

        if (!alreadyRead) {
          message.readBy.push({
            user: socket.userId,
            readAt: Date.now()
          });
          await message.save();
        }

        // Notify sender that message was read
        io.to(chatId).emit('message_read', {
          messageId,
          userId: socket.userId,
          readAt: Date.now()
        });
      } catch (error) {
        console.error('Message seen error:', error);
      }
    });

    // Mark all messages in chat as read
    socket.on('mark_chat_read', async (data) => {
      try {
        const { chatId } = data;

        const messages = await Message.find({
          chat: chatId,
          sender: { $ne: socket.userId }
        });

        for (const message of messages) {
          const alreadyRead = message.readBy.some(
            read => read.user.toString() === socket.userId
          );

          if (!alreadyRead) {
            message.readBy.push({
              user: socket.userId,
              readAt: Date.now()
            });
            await message.save();
          }
        }

        io.to(chatId).emit('chat_read', {
          chatId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Mark chat read error:', error);
      }
    });

    // ==================== MESSAGE REACTIONS ====================

    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji, chatId } = data;

        const message = await Message.findById(messageId);

        if (!message) return;

        // Remove existing reaction from this user
        message.reactions = message.reactions.filter(
          r => r.user.toString() !== socket.userId
        );

        // Add new reaction
        message.reactions.push({
          user: socket.userId,
          emoji
        });

        await message.save();

        // Broadcast to chat
        io.to(chatId).emit('reaction_added', {
          messageId,
          userId: socket.userId,
          emoji,
          username: socket.user.username
        });
      } catch (error) {
        console.error('Add reaction error:', error);
      }
    });

    socket.on('remove_reaction', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);

        if (!message) return;

        message.reactions = message.reactions.filter(
          r => r.user.toString() !== socket.userId
        );

        await message.save();

        io.to(chatId).emit('reaction_removed', {
          messageId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Remove reaction error:', error);
      }
    });

    // ==================== MESSAGE EDIT/DELETE ====================

    socket.on('edit_message', async (data) => {
      try {
        const { messageId, content, chatId } = data;

        const message = await Message.findById(messageId);

        if (!message || message.sender.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Cannot edit this message' });
        }

        message.content = content;
        message.isEdited = true;
        message.editedAt = Date.now();
        await message.save();

        io.to(chatId).emit('message_edited', {
          messageId,
          content,
          editedAt: message.editedAt
        });
      } catch (error) {
        console.error('Edit message error:', error);
      }
    });

    socket.on('delete_message', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);

        if (!message || message.sender.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Cannot delete this message' });
        }

        message.isDeleted = true;
        message.deletedAt = Date.now();
        message.content = 'This message was deleted';
        await message.save();

        io.to(chatId).emit('message_deleted', {
          messageId,
          deletedAt: message.deletedAt
        });
      } catch (error) {
        console.error('Delete message error:', error);
      }
    });

    // ==================== CHAT EVENTS ====================

    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.username} joined chat: ${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.user.username} left chat: ${chatId}`);
    });

    // ==================== CALL SIGNALING ====================

    // Initiate call
    socket.on('initiate_call', async ({ to, callType, offer }) => {
      try {
        const recipientSocketId = onlineUsers.get(to);

        if (!recipientSocketId) {
          socket.emit('error', { message: 'User is offline' });
          return;
        }

        // Check if recipient is already in a call (optional - implement call status tracking)

        // Send call request to recipient
        io.to(recipientSocketId).emit('incoming_call', {
          caller: {
            _id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          callType,
          offer
        });

        console.log(`📞 ${socket.user.username} is calling ${to} (${callType})`);
      } catch (error) {
        console.error('Initiate call error:', error);
        socket.emit('error', { message: 'Failed to initiate call' });
      }
    });

    // Accept call
    socket.on('call_accepted', async ({ to, answer }) => {
      try {
        const callerSocketId = onlineUsers.get(to);

        if (callerSocketId) {
          io.to(callerSocketId).emit('call_accepted', {
            answer,
            user: {
              _id: socket.userId,
              username: socket.user.username,
              avatar: socket.user.avatar
            }
          });
          console.log(`✅ Call accepted between ${to} and ${socket.userId}`);
        }
      } catch (error) {
        console.error('Accept call error:', error);
      }
    });

    // Call answer (WebRTC answer)
    socket.on('call_answer', ({ to, answer }) => {
      try {
        const recipientSocketId = onlineUsers.get(to);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('call_answer', {
            answer,
            from: socket.userId
          });
        }
      } catch (error) {
        console.error('Call answer error:', error);
      }
    });

    // Reject call
    socket.on('call_rejected', ({ to }) => {
      try {
        const callerSocketId = onlineUsers.get(to);

        if (callerSocketId) {
          io.to(callerSocketId).emit('call_rejected', {
            user: {
              _id: socket.userId,
              username: socket.user.username
            }
          });
          console.log(`❌ Call rejected by ${socket.user.username}`);
        }
      } catch (error) {
        console.error('Reject call error:', error);
      }
    });

    // End call
    socket.on('call_ended', ({ to }) => {
      try {
        const recipientSocketId = onlineUsers.get(to);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('call_ended', {
            user: {
              _id: socket.userId,
              username: socket.user.username
            }
          });
          console.log(`📵 Call ended between ${socket.userId} and ${to}`);
        }
      } catch (error) {
        console.error('End call error:', error);
      }
    });

    // ICE candidate exchange
    socket.on('ice_candidate', ({ to, candidate }) => {
      try {
        const recipientSocketId = onlineUsers.get(to);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('ice_candidate', {
            candidate,
            from: socket.userId
          });
        }
      } catch (error) {
        console.error('ICE candidate error:', error);
      }
    });

    // ==================== DISCONNECT ====================

    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username}`);

      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Update user status in database
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: Date.now(),
        socketId: null
      });

      // Notify all users that this user is offline
      io.emit('user_offline', {
        userId: socket.userId,
        username: socket.user.username,
        lastSeen: Date.now()
      });
    });
  });

  console.log('🔌 Socket.IO initialized');
};

module.exports = { initializeSocket };
