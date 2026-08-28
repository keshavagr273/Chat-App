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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative z-10">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary mb-3 border border-border-glass shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="material-symbols-outlined text-2xl">waving_hand</span>
          </div>
          <p className="font-display font-medium text-sm text-on-surface">No messages yet</p>
          <p className="text-xs text-text-muted mt-1">Send a message or wave to start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-w-4xl mx-auto">
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
                  <div className="flex justify-center my-5 sticky top-2 z-10">
                    <span className="bg-surface-container-high/90 backdrop-blur-md border border-border-glass text-text-muted text-[11px] font-label font-medium px-3.5 py-1 rounded-full shadow-md">
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

          {/* Live Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-surface-container-low/70 border border-border-glass-light w-fit backdrop-blur-sm animate-fade-in-up">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
              <span className="text-xs font-label text-text-muted">
                <strong className="text-on-surface font-semibold">{isTyping.username}</strong> is typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
