import { useEffect, useRef } from 'react';
import { isSameDay, format, isToday, isYesterday } from 'date-fns';
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
  }, [messages.length]);

  const isTyping = selectedChat && typingUsers[selectedChat._id];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-300">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => {
            const currentMessageDate = new Date(message.createdAt);
            const previousMessageDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
            
            const showDateSeparator = !previousMessageDate || !isSameDay(currentMessageDate, previousMessageDate);
            
            let dateLabel = '';
            if (showDateSeparator) {
              if (isToday(currentMessageDate)) {
                dateLabel = 'Today';
              } else if (isYesterday(currentMessageDate)) {
                dateLabel = 'Yesterday';
              } else {
                dateLabel = format(currentMessageDate, 'MMMM do, yyyy');
              }
            }

            return (
              <div key={message._id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6 sticky top-2 z-10">
                    <span className="bg-[#1a1b1e]/80 backdrop-blur-md border border-white/5 text-gray-300 text-xs font-medium px-4 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                      {dateLabel}
                    </span>
                  </div>
                )}
                <Message
                  message={message}
                  isOwn={message.sender._id === user._id}
                />
              </div>
            );
          })}

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
