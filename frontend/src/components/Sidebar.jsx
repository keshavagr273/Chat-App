import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import api from '../utils/api';
import { FiSearch, FiLogOut, FiMessageCircle } from 'react-icons/fi';
import ChatItem from './ChatItem';
import NewChatModal from './NewChatModal';

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
    <div className="w-80 bg-dark-200 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="text-white font-semibold">{user?.username}</h3>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 transition"
            title="Logout"
          >
            <FiLogOut className="text-xl" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => setShowNewChat(true)}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <FiMessageCircle />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FiMessageCircle className="text-5xl mb-2" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isSelected={selectedChat?._id === chat._id}
              onClick={() => setSelectedChat(chat)}
            />
          ))
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
