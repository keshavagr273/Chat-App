const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice'],
      default: 'text'
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        emoji: {
          type: String
        }
      }
    ],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
