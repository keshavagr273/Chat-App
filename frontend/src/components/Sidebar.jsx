import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import api from '../utils/api';
import { FiSearch, FiLogOut, FiMessageCircle } from 'react-icons/fi';
import ChatItem from './ChatItem';
import NewChatModal from './NewChatModal';
import Avatar from './Avatar';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { chats, selectedChat, setSelectedChat } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroupChat
      ? chat.chatName
      : chat.users.find(u => u._id !== user._id)?.username || '';
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-80 bg-dark-200 border-r border-border flex flex-col h-full shrink-0 shadow-lg relative z-10">
      {/* Profile Header */}
      <div className="p-5 flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.username} className="w-10 h-10 shadow-sm" />
          <div className="flex flex-col justify-center">
            <h3 className="text-gray-100 font-semibold text-sm leading-tight tracking-wide">{user?.username}</h3>
            <p className="text-[11px] text-emerald-500 font-medium mt-0.5">Online</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-gray-500 hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/5"
          title="Logout"
        >
          <FiLogOut className="text-[18px]" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-5 pb-4">
        <div className="relative group">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-secondary transition-colors" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111] border border-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-5 pb-5 border-b border-border">
        <button
          onClick={() => setShowNewChat(true)}
          className="w-full bg-primary hover:bg-secondary text-black font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
        >
          <FiMessageCircle className="text-[18px]" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-200">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6 text-center mt-[-20%]">
            <FiMessageCircle className="text-[40px] mb-3 opacity-40 stroke-[1.5]" />
            <p className="text-[13px] font-medium text-gray-400">No chats yet</p>
            <p className="text-[12px] opacity-70 mt-1 text-gray-500">Start a new conversation!</p>
          </div>
        ) : (
          <div className="py-2 space-y-0.5">
            {filteredChats.map(chat => (
              <div className="px-3" key={chat._id}>
                <ChatItem
                  chat={chat}
                  isSelected={selectedChat?._id === chat._id}
                  onClick={() => setSelectedChat(chat)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} />
      )}
    </div>
  );
};

export default Sidebar;
