import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import Message from './Message';

const MessageList = () => {
  const { messages, selectedChat, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isTyping = selectedChat && typingUsers[selectedChat._id];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-300">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Message
              key={message._id}
              message={message}
              isOwn={message.sender._id === user._id}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">{isTyping.username} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
