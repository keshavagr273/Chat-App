const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const { getSocketIO } = require('../socket/socketInstance');

// @desc    Create or fetch one-to-one chat
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId not provided'
      });
    }

    // Check if chat already exists
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate('users', '-password')
      .populate('latestMessage');

    chat = await User.populate(chat, {
      path: 'latestMessage.sender',
      select: 'username avatar email'
    });

    if (chat.length > 0) {
      return res.json({
        success: true,
        data: chat[0]
      });
    }

    // Create new chat
    const newChat = await Chat.create({
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId]
    });

    const fullChat = await Chat.findById(newChat._id).populate('users', '-password');

    res.status(201).json({
      success: true,
      data: fullChat
    });
  } catch (error) {
    console.error('Access chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar email'
    });

    res.json({
      success: true,
      data: populatedChats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const { users, chatName } = req.body;

    if (!users || !chatName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide chat name and users'
      });
    }

    const usersArray = JSON.parse(users);

    if (usersArray.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group chat requires at least 2 users'
      });
    }

    // Add current user to group
    usersArray.push(req.user._id);

    const groupChat = await Chat.create({
      chatName,
      users: usersArray,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json({
      success: true,
      data: fullGroupChat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Rename group chat
// @route   PUT /api/chats/group/rename
// @access  Private
const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: updatedChat
    });
  } catch (error) {
    console.error('Rename group error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add user to group
// @route   PUT /api/chats/group/add
// @access  Private
const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Add to group error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove user from group
// @route   PUT /api/chats/group/remove
// @access  Private
const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Remove from group error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const clearMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if chat exists and user is a participant
    const chat = await Chat.findById(chatId).populate('users', '_id username');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of the chat
    if (!chat.users.find(u => u._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to clear messages in this chat'
      });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Clear latest message reference
    await Chat.findByIdAndUpdate(chatId, { latestMessage: null });

    // Emit socket event to all users in the chat
    const io = getSocketIO();
    if (io) {
      io.to(chatId).emit('chat_messages_cleared', {
        chatId,
        clearedBy: req.user._id
      });
    }

    res.json({
      success: true,
      message: 'All messages cleared successfully'
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chats/:chatId
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId).populate('users', '_id username');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of the chat
    if (!chat.users.find(u => u._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this chat'
      });
    }

    // For group chats, only admin can delete
    if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can delete the group'
      });
    }

    // Get user IDs before deleting
    const userIds = chat.users.map(u => u._id.toString());

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    // Emit socket event to all users in the chat
    const io = getSocketIO();
    if (io) {
      io.to(chatId).emit('chat_deleted', {
        chatId,
        deletedBy: req.user._id,
        userIds
      });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  clearMessages,
  deleteChat
};