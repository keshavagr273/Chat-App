const express = require('express');
const {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  addReaction
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, getMessages);
router.put('/:messageId', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);
router.post('/:messageId/react', protect, addReaction);

module.exports = router;
