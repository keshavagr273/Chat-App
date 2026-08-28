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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in-up">
      {/* Modal Container */}
      <div className="w-full max-w-md bento-card border border-border-glass shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-glass">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <h2 className="font-display text-base font-bold text-on-surface">Conversation Info</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container-highest"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <Avatar 
                src={avatar} 
                name={title} 
                className="w-20 h-20 shadow-xl border-2 border-primary/40" 
                showStatus={!isGroup}
                isOnline={isOnline}
              />
            </div>
            <h3 className="font-display text-xl font-bold text-on-surface tracking-tight">{title}</h3>
            {!isGroup && (
              <p className={`text-xs mt-1 font-label font-medium flex items-center gap-1 ${
                isOnline ? 'text-primary' : 'text-text-muted'
              }`}>
                {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                {isOnline ? 'Active Now' : 'Offline'}
              </p>
            )}
            {isGroup && (
              <p className="text-xs mt-1 font-label text-text-muted">
                Group • {chat.users.length} members
              </p>
            )}
          </div>

          {/* Details */}
          {!isGroup && otherUser && (
            <div className="space-y-2.5">
              <div className="bg-surface-container-lowest/80 p-3.5 rounded-xl border border-border-glass">
                <div className="flex items-center gap-2 text-text-muted mb-1">
                  <FiMail className="text-primary text-sm" />
                  <span className="text-[10px] font-label uppercase tracking-wider font-semibold">Email</span>
                </div>
                <p className="text-xs text-on-surface ml-5 font-sans">{otherUser.email}</p>
              </div>

              {otherUser.bio && (
                <div className="bg-surface-container-lowest/80 p-3.5 rounded-xl border border-border-glass">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                    <FiUser className="text-primary text-sm" />
                    <span className="text-[10px] font-label uppercase tracking-wider font-semibold">Bio</span>
                  </div>
                  <p className="text-xs text-on-surface ml-5 font-sans">{otherUser.bio}</p>
                </div>
              )}

              <div className="bg-surface-container-lowest/80 p-3.5 rounded-xl border border-border-glass">
                <div className="flex items-center gap-2 text-text-muted mb-1">
                  <FiCalendar className="text-primary text-sm" />
                  <span className="text-[10px] font-label uppercase tracking-wider font-semibold">Joined</span>
                </div>
                <p className="text-xs text-on-surface ml-5 font-sans">
                  {otherUser.createdAt ? format(new Date(otherUser.createdAt), 'MMMM do, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          )}

          {/* Group Participants */}
          {isGroup && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-label font-semibold text-text-muted uppercase tracking-wider mb-2">
                Participants ({chat.users.length})
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {chat.users.map((participant) => (
                  <div key={participant._id} className="flex items-center gap-3 p-2.5 bg-surface-container-lowest/80 rounded-xl border border-border-glass">
                    <Avatar 
                      src={participant.avatar} 
                      name={participant.username} 
                      className="w-9 h-9 border border-border-glass" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-xs text-on-surface truncate">
                        {participant.username} {participant._id === currentUser._id && '(You)'}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">{participant.email}</p>
                    </div>
                    {chat.groupAdmin === participant._id && (
                      <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-md font-label font-bold uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChatInfoModal;
