const User = require('../models/User');

// Sanitize error messages — never expose internal details in production
const errMsg = (error) =>
  process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message;

// @desc    Get all users except current user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
        $or: [
          { username: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id }
    }).select('-password');

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fix 7: Check username uniqueness before updating
    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (taken) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    user.username = username || user.username;
    user.bio = bio !== undefined ? bio : user.bio;
    user.avatar = avatar || user.avatar;

    const updatedUser = await user.save();

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: errMsg(error) });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile
};
