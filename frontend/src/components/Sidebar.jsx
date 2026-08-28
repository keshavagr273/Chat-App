import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { FiSearch, FiLogOut, FiPlus } from 'react-icons/fi';
import ChatItem from './ChatItem';
import NewChatModal from './NewChatModal';
import Avatar from './Avatar';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { chats, selectedChat, setSelectedChat, unreadCounts } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'direct', 'groups'

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredChats = chats.filter(chat => {
    // Tab filter
    if (activeTab === 'direct' && chat.isGroupChat) return false;
    if (activeTab === 'groups' && !chat.isGroupChat) return false;

    // Search filter
    const chatName = chat.isGroupChat
      ? chat.chatName
      : chat.users.find(u => u._id !== user._id)?.username || '';
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <aside className="w-80 md:w-[300px] bg-surface-container border-r border-border-glass backdrop-blur-xl flex flex-col h-full shrink-0 z-20 relative select-none">
      {/* Header / User Profile */}
      <div className="px-5 pt-5 pb-4 border-b border-border-glass flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={user?.avatar}
              name={user?.username}
              className="w-10 h-10 border border-primary/40 shadow-sm"
              showStatus={true}
              isOnline={true}
            />
          </div>
          <div>
            <h2 className="font-display font-semibold text-on-surface text-sm leading-snug">
              {user?.username}
            </h2>
            <p className="text-[11px] font-label text-primary font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-text-muted hover:text-red-400 p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            logout
          </span>
        </button>
      </div>

      {/* Search Bar & New Chat CTA */}
      <div className="px-4 py-3 border-b border-border-glass/40">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-highest/80 border border-border-glass rounded-xl py-2 pl-9 pr-3 text-xs font-sans text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>

        <button
          onClick={() => setShowNewChat(true)}
          className="w-full mt-3 primary-gradient-btn text-on-primary font-display font-medium rounded-xl py-2 px-4 flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-glow active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-base">chat</span>
          <span>New Conversation</span>
        </button>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="px-4 pt-3 pb-1 flex gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-display font-medium rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-container-highest/40'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`flex-1 py-1.5 text-xs font-display font-medium rounded-lg transition-all ${
            activeTab === 'direct'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-container-highest/40'
          }`}
        >
          Direct
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-1.5 text-xs font-display font-medium rounded-lg transition-all ${
            activeTab === 'groups'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-container-highest/40'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Recent Chats Section Title */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-label font-semibold text-text-muted uppercase tracking-wider">
          Recent Chats
        </span>
        <span className="text-[10px] text-text-muted font-medium bg-surface-container-highest px-1.5 py-0.5 rounded">
          {filteredChats.length}
        </span>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-text-muted mb-2 border border-border-glass">
              <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
            </div>
            <p className="text-xs font-medium text-on-surface">No conversations found</p>
            <p className="text-[11px] text-text-muted mt-1">Start a new chat to connect</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isSelected={selectedChat?._id === chat._id}
              unreadCount={unreadCounts[chat._id] || 0}
              onClick={() => setSelectedChat(chat)}
            />
          ))
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="p-3 border-t border-border-glass/40 bg-surface-container-low/50 flex items-center justify-between text-xs text-text-muted px-4">
        <span className="flex items-center gap-1.5 text-primary font-display font-medium">
          <span className="material-symbols-outlined text-sm">shield</span>
          ChatSphere End-to-End
        </span>
        <span className="text-[10px] font-mono opacity-50">v2.0</span>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} />
      )}
    </aside>
  );
};

export default Sidebar;
