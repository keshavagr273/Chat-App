import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { getSocket } from '../utils/socket';
import { FiSend, FiPaperclip, FiSmile, FiImage, FiFile, FiX } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { selectedChat, replyingTo, setReplyingTo } = useChatStore();
  const socket = getSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachMenuRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  }, [selectedChat]);

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

  const handleSend = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !selectedFile) || !socket || !selectedChat) return;

    let fileUrl = '';
    let fileName = '';
    let messageType = 'text';

    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        fileUrl = data.data.fileUrl;
        fileName = data.data.fileName;
        messageType = data.data.mimetype.startsWith('image/') ? 'image' : 'file';
        
      } catch (error) {
        setIsUploading(false);
        toast.error('File upload failed');
        return;
      }
      setIsUploading(false);
    }

    // Stop typing
    socket.emit('stop_typing', { chatId: selectedChat._id });
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);

    // Send message
    socket.emit('send_message', {
      chatId: selectedChat._id,
      content: message.trim(),
      messageType,
      fileUrl,
      fileName,
      replyTo: replyingTo?._id || null
    });

    setMessage('');
    setSelectedFile(null);
    setReplyingTo(null);
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
    }
    e.target.value = '';
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="mx-4 md:mx-6 mb-4 md:mb-6 p-2 md:p-3 bg-[#1a1b1e]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.3)] z-10 flex flex-col gap-2 transition-all">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-black/40 border-l-4 border-primary rounded-lg flex justify-between items-start">
          <div className="flex flex-col overflow-hidden">
            <span className="text-primary text-xs font-bold">Reply to {replyingTo.sender?.username}</span>
            <span className="text-gray-300 text-sm truncate">{replyingTo.content || replyingTo.messageType}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white transition">
            <FiX />
          </button>
        </div>
      )}
      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-[#111] rounded-lg flex items-center justify-between">
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
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowEmojiPicker(false)}
              ></div>
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                />
              </div>
            </>
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
              <div className="absolute bottom-12 left-0 w-40 bg-[#111] border border-border rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => handleFileSelect('image')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiImage className="text-lg text-primary" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => handleFileSelect('file')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiFile className="text-lg text-primary" />
                  <span>File</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-1 flex items-center bg-[#25262b] rounded-full border border-white/5 focus-within:border-primary/50 focus-within:bg-[#2c2d33] transition-all px-2 shadow-inner">
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white px-4 py-3 md:py-3.5 focus:outline-none placeholder-gray-500 text-[15px]"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="bg-primary hover:bg-secondary text-black p-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend className="text-xl" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
