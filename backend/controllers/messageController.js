const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Sanitize error messages — never expose internal details in production
const errMsg = (error) =>
  process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message;

// @desc    Send message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { content, chatId, messageType, fileUrl, fileName, replyTo } = req.body;

    if ((!content && !fileUrl) || !chatId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    const newMessage = {
      sender: req.user._id,
      content: content || '',
      chat: chatId,
      messageType: messageType || 'text',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      replyTo: replyTo || null
    };

    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'username avatar');
    message = await message.populate('chat');
    message = await message.populate({
      path: 'replyTo',
      select: 'content sender messageType fileUrl fileName isDeleted',
      populate: { path: 'sender', select: 'username' }
    });
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'username avatar email'
    });

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
  try {
    // Authorization: verify the requesting user is a member of this chat
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    const isMember = chat.users.some(u => u.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({
      chat: req.params.chatId,
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
    })
      .populate('sender', 'username avatar email')
      .populate('chat')
      .populate('reactions.user', 'username avatar')
      .populate('readBy.user', 'username avatar')
      .populate({
        path: 'replyTo',
        select: 'content sender messageType fileUrl fileName isDeleted',
        populate: { path: 'sender', select: 'username' }
      });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Edit message
// @route   PUT /api/messages/:messageId
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = Date.now();

    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    message.isDeleted = true;
    message.deletedAt = Date.now();
    message.content = 'This message was deleted';

    await message.save();

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Add reaction to message
// @route   POST /api/messages/:messageId/react
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  addReaction
};
