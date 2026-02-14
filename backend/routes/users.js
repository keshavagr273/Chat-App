const express = require('express');
const { getUsers, getUserById, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);

module.exports = router;
