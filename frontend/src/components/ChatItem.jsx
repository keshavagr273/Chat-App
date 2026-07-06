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
        name: chat.chatName,
        avatar: chat.groupAvatar || 'https://ui-avatars.com/api/?background=random&name=Group'
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
      className={`p-4 border-b border-border cursor-pointer transition ${isSelected ? 'bg-dark-100' : 'hover:bg-dark-100'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar
            src={avatar}
            name={name}
            className="w-12 h-12"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-dark-200"></div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-semibold truncate">{name}</h4>
            <div className="flex flex-col items-end gap-1">
              {latestMessage && (
                <span className="text-xs text-gray-400 font-medium">
                  {format(new Date(latestMessage.createdAt), 'HH:mm')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {latestMessage && (
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                {latestMessage.sender === user._id && (
                  <span className="text-gray-400 shrink-0">
                    {latestMessage.readBy?.length > 0 ? (
                      <FiCheckCircle className="text-primary" />
                    ) : (
                      <FiCheck />
                    )}
                  </span>
                )}
                <p className="text-sm text-gray-400 truncate">
                  {latestMessage.isDeleted
                    ? <em>Message deleted</em>
                    : latestMessage.content || latestMessage.messageType
                  }
                </p>
              </div>
            )}
            
            {unreadCount > 0 && (
              <div className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
