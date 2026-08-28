import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import Avatar from './Avatar';

const ChatItem = ({ chat, isSelected, onClick, unreadCount = 0 }) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore();

  // Get chat name and avatar
  const getChatInfo = () => {
    if (chat.isGroupChat) {
      return {
        name: chat.chatName || 'Group Chat',
        avatar: chat.groupAvatar || 'https://ui-avatars.com/api/?background=171b26&color=4edea3&name=Group',
        isOnline: false
      };
    } else {
      const otherUser = chat.users.find(u => u._id !== user._id);
      return {
        name: otherUser?.username || 'Unknown',
        avatar: otherUser?.avatar,
        isOnline: onlineUsers.includes(otherUser?._id)
      };
    }
  };

  const { name, avatar, isOnline } = getChatInfo();
  const latestMessage = chat.latestMessage;

  return (
    <div
      onClick={onClick}
      className={`group px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 border ${
        isSelected
          ? 'bg-surface-container-highest border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
          : 'border-transparent hover:bg-surface-container-highest/60 hover:border-border-glass'
      }`}
    >
      {/* Avatar with presence */}
      <div className="relative shrink-0">
        <Avatar
          src={avatar}
          name={name}
          className="w-11 h-11"
          showStatus={!chat.isGroupChat}
          isOnline={isOnline}
        />
      </div>

      {/* Chat Meta & Latest Message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-display text-sm font-semibold truncate transition-colors ${
            isSelected ? 'text-primary' : 'text-on-surface group-hover:text-white'
          }`}>
            {name}
          </h4>
          {latestMessage && (
            <span className="text-[11px] text-text-muted font-medium shrink-0 ml-2">
              {format(new Date(latestMessage.createdAt), 'HH:mm')}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
            {latestMessage && latestMessage.sender === user._id && (
              <span className="text-text-muted shrink-0 text-xs">
                {latestMessage.readBy?.length > 0 ? (
                  <FiCheckCircle className="text-primary text-xs" />
                ) : (
                  <FiCheck className="text-xs" />
                )}
              </span>
            )}
            <p className="text-xs text-text-muted truncate">
              {latestMessage ? (
                latestMessage.isDeleted ? (
                  <span className="italic opacity-60">Message deleted</span>
                ) : (
                  latestMessage.content || (latestMessage.messageType === 'image' ? '📷 Photo' : '📎 Attachment')
                )
              ) : (
                <span className="italic opacity-60">No messages yet</span>
              )}
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
