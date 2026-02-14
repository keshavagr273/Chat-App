import { useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { getSocket } from '../utils/socket';
import { FiSend, FiPaperclip, FiSmile, FiImage, FiFile, FiX } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { selectedChat } = useChatStore();
  const socket = getSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleTyping = (value) => {
    setMessage(value);

    if (!socket || !selectedChat) return;

    // Start typing
    if (value && !isTypingRef.current) {
      socket.emit('typing', { chatId: selectedChat._id });
      isTypingRef.current = true;
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selectedChat) {
        socket.emit('stop_typing', { chatId: selectedChat._id });
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!message.trim() || !socket || !selectedChat) return;

    // Stop typing
    socket.emit('stop_typing', { chatId: selectedChat._id });
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);

    // Send message
    socket.emit('send_message', {
      chatId: selectedChat._id,
      content: message.trim(),
      messageType: 'text'
    });

    setMessage('');
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (type) => {
    setShowAttachMenu(false);
    if (type === 'image') {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
      // TODO: Implement file upload functionality
      toast('File upload feature coming soon! 📎', {
        icon: '🚀',
        duration: 3000
      });
    }
    e.target.value = '';
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="bg-dark-200 border-t border-gray-700 p-4">
      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-dark-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiFile className="text-primary text-xl" />
            <div>
              <p className="text-white text-sm">{selectedFile.name}</p>
              <p className="text-gray-400 text-xs">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={removeSelectedFile}
            className="text-gray-400 hover:text-red-400 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-3">
        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        {/* Emoji Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-white transition"
          >
            <FiSmile className="text-2xl" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
              />
            </div>
          )}
        </div>

        {/* Attachment */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="text-gray-400 hover:text-white transition"
            title="Attach File"
          >
            <FiPaperclip className="text-2xl" />
          </button>

          {/* Attachment Menu */}
          {showAttachMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAttachMenu(false)}
              ></div>
              <div className="absolute bottom-12 left-0 w-40 bg-dark-300 border border-gray-700 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => handleFileSelect('image')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiImage className="text-lg text-green-400" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => handleFileSelect('file')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiFile className="text-lg text-blue-400" />
                  <span>File</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-dark-300 border border-gray-700 rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSend className="text-xl" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
