const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const { getSocketIO } = require('../socket/socketInstance');

// Sanitize error messages — never expose internal details in production
const errMsg = (error) =>
  process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message;

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
      return res.json({ success: true, data: chat[0] });
    }

    // Create new chat — chatName is empty for 1-1 chats (name is derived from the other user)
    const newChat = await Chat.create({
      chatName: '',
      isGroupChat: false,
      users: [req.user._id, userId]
    });

    const fullChat = await Chat.findById(newChat._id).populate('users', '-password');

    res.status(201).json({ success: true, data: fullChat });
  } catch (error) {
    console.error('Access chat error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
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

    res.json({ success: true, data: populatedChats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
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

    // Fix 1: Safe-parse users — handle both string (JSON) and array inputs
    let usersArray;
    try {
      usersArray = typeof users === 'string' ? JSON.parse(users) : users;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid users format — expected a JSON array'
      });
    }

    if (!Array.isArray(usersArray) || usersArray.length < 2) {
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

    res.status(201).json({ success: true, data: fullGroupChat });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Rename group chat
// @route   PUT /api/chats/group/rename
// @access  Private (group admin only)
const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    // Fix 6: Fetch chat first to verify admin status
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ success: false, message: 'Not a group chat' });
    }

    // Only group admin can rename
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can rename the group'
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    console.error('Rename group error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Add user to group
// @route   PUT /api/chats/group/add
// @access  Private (group admin only)
const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    // Fix 6: Verify admin status before adding
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ success: false, message: 'Not a group chat' });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can add members'
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } }, // $addToSet prevents duplicates
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    console.error('Add to group error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Remove user from group
// @route   PUT /api/chats/group/remove
// @access  Private (group admin only)
const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    // Fix 6: Verify admin status before removing
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ success: false, message: 'Not a group chat' });
    }

    // Allow admin to remove others, or any member to remove themselves (leave group)
    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
    const isSelf = userId === req.user._id.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can remove members'
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    console.error('Remove from group error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

const clearMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId).populate('users', '_id username');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.users.find(u => u._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to clear messages in this chat'
      });
    }

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: null });

    const io = getSocketIO();
    if (io) {
      io.to(chatId).emit('chat_messages_cleared', {
        chatId,
        clearedBy: req.user._id
      });
    }

    res.json({ success: true, message: 'All messages cleared successfully' });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
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
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.users.find(u => u._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this chat'
      });
    }

    if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can delete the group'
      });
    }

    const userIds = chat.users.map(u => u._id.toString());

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    const io = getSocketIO();
    if (io) {
      io.to(chatId).emit('chat_deleted', {
        chatId,
        deletedBy: req.user._id,
        userIds
      });
    }

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
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