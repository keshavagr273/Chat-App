import { createPortal } from 'react-dom';
import { FiX, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import Avatar from './Avatar';

const ChatInfoModal = ({ isOpen, onClose, chat, currentUser, onlineUsers }) => {
  if (!isOpen || !chat) return null;

  const isGroup = chat.isGroupChat;
  
  // For 1-on-1 chat, get the other user
  const otherUser = !isGroup 
    ? chat.users.find((u) => u._id !== currentUser._id) 
    : null;

  const title = isGroup ? chat.chatName : otherUser?.username;
  const avatar = isGroup ? chat.groupAvatar : otherUser?.avatar;
  const isOnline = !isGroup && otherUser && onlineUsers.includes(otherUser._id);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-md bg-[#0c0c0c] border border-[#222] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <h2 className="text-lg font-semibold text-gray-100">Contact Info</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-dark-200"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar 
                src={avatar} 
                name={title} 
                className="w-24 h-24 shadow-xl" 
              />
              {!isGroup && isOnline && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary rounded-full border-4 border-[#0c0c0c]"></div>
              )}
            </div>
            <h3 className="text-2xl font-semibold text-white tracking-wide">{title}</h3>
            {!isGroup && (
              <p className={`text-sm mt-1 font-medium ${isOnline ? 'text-primary' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            )}
            {isGroup && (
              <p className="text-sm mt-1 text-gray-400">
                Group • {chat.users.length} participants
              </p>
            )}
          </div>

          {/* Details */}
          {!isGroup && otherUser && (
            <div className="space-y-4">
              <div className="bg-[#111] p-4 rounded-2xl border border-[#222]">
                <div className="flex items-center gap-3 text-gray-400 mb-1">
                  <FiMail className="text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider">Email</span>
                </div>
                <p className="text-gray-200 ml-7">{otherUser.email}</p>
              </div>

              {otherUser.bio && (
                <div className="bg-[#111] p-4 rounded-2xl border border-[#222]">
                  <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <FiUser className="text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wider">Bio</span>
                  </div>
                  <p className="text-gray-200 ml-7">{otherUser.bio}</p>
                </div>
              )}

              <div className="bg-[#111] p-4 rounded-2xl border border-[#222]">
                <div className="flex items-center gap-3 text-gray-400 mb-1">
                  <FiCalendar className="text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider">Joined</span>
                </div>
                <p className="text-gray-200 ml-7">
                  {otherUser.createdAt ? format(new Date(otherUser.createdAt), 'MMMM do, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          )}

          {/* Group Participants */}
          {isGroup && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Participants</h4>
              {chat.users.map((participant) => (
                <div key={participant._id} className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-[#222]">
                  <Avatar 
                    src={participant.avatar} 
                    name={participant.username} 
                    className="w-10 h-10" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-medium truncate">
                      {participant.username} {participant._id === currentUser._id && '(You)'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                  </div>
                  {chat.groupAdmin === participant._id && (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-md font-medium uppercase tracking-wide">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChatInfoModal;
