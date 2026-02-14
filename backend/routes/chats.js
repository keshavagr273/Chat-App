const express = require('express');
const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  clearMessages,
  deleteChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, accessChat);
router.get('/', protect, getChats);
router.post('/group', protect, createGroupChat);
router.put('/group/rename', protect, renameGroup);
router.put('/group/add', protect, addToGroup);
router.put('/group/remove', protect, removeFromGroup);
router.delete('/:chatId/messages', protect, clearMessages);
router.delete('/:chatId', protect, deleteChat);
module.exports = router;