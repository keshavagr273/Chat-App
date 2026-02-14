import { useState, useEffect } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { useChatStore } from '../store/chatStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

const NewChatModal = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { createChat, setSelectedChat } = useChatStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const chat = await createChat(userId);
      setSelectedChat(chat);
      onClose();
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No users found</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleStartChat(user._id)}
                  className="flex items-center gap-3 p-3 hover:bg-dark-300 rounded-lg cursor-pointer transition"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{user.username}</h4>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
