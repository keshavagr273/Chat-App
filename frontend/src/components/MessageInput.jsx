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
    <div className="mx-4 md:mx-6 mb-4 md:mb-5 p-2 bg-surface-container/90 backdrop-blur-xl border border-border-glass rounded-2xl shadow-glass z-20 flex flex-col gap-1.5 transition-all">
      {/* Reply Quote Preview */}
      {replyingTo && (
        <div className="px-3.5 py-2 bg-surface-container-highest/80 border-l-2 border-primary rounded-xl flex justify-between items-center animate-fade-in-up">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-primary text-[11px] font-display font-semibold">
              Replying to {replyingTo.sender?.username}
            </span>
            <span className="text-text-muted text-xs truncate">
              {replyingTo.content || replyingTo.messageType}
            </span>
          </div>
          <button 
            onClick={() => setReplyingTo(null)} 
            className="text-text-muted hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>
      )}

      {/* Selected File Attachment Preview */}
      {selectedFile && (
        <div className="p-2.5 bg-surface-container-highest/80 border border-border-glass rounded-xl flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <FiFile className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xs font-semibold text-on-surface truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-text-muted font-label">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={removeSelectedFile}
            className="text-text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-surface-container transition"
          >
            <FiX className="text-base" />
          </button>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
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

        {/* Attachment Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}
            className="p-2 text-text-muted hover:text-primary hover:bg-surface-container-highest rounded-xl transition-all"
            title="Attach Media"
          >
            <span className="material-symbols-outlined text-xl">attach_file</span>
          </button>

          {/* Attachment Menu Popup */}
          {showAttachMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowAttachMenu(false)}
              ></div>
              <div className="absolute bottom-12 left-0 w-36 bento-card p-1.5 shadow-2xl z-30 animate-fade-in-up">
                <button
                  type="button"
                  onClick={() => handleFileSelect('image')}
                  className="w-full px-3 py-2 text-left text-xs font-display font-medium text-on-surface hover:bg-surface-container-highest rounded-lg flex items-center gap-2.5 transition"
                >
                  <FiImage className="text-sm text-primary" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFileSelect('file')}
                  className="w-full px-3 py-2 text-left text-xs font-display font-medium text-on-surface hover:bg-surface-container-highest rounded-lg flex items-center gap-2.5 transition"
                >
                  <FiFile className="text-sm text-secondary-light" />
                  <span>Document</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Emoji Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}
            className="p-2 text-text-muted hover:text-yellow-400 hover:bg-surface-container-highest rounded-xl transition-all"
            title="Add Emoji"
          >
            <span className="material-symbols-outlined text-xl">mood</span>
          </button>
          {showEmojiPicker && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowEmojiPicker(false)}
              ></div>
              <div className="absolute bottom-12 left-0 z-30 shadow-2xl rounded-2xl overflow-hidden border border-border-glass">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  width={300}
                  height={380}
                />
              </div>
            </>
          )}
        </div>

        {/* Text Input */}
        <div className="flex-1 flex items-center bg-surface-container-highest/60 rounded-xl border border-border-glass focus-within:border-primary/60 focus-within:bg-surface-container-highest focus-within:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all px-3 py-1">
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-on-surface placeholder-text-muted/60 focus:outline-none text-xs sm:text-sm font-sans py-2"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="primary-gradient-btn text-on-primary w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-glow shrink-0 active:scale-95"
          title="Send message"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
