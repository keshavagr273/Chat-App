import { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUsers, FiUser, FiCheck } from 'react-icons/fi';
import { useChatStore } from '../store/chatStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

const NewChatModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'group'
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Group state
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  const { createChat, setSelectedChat, setChats, chats } = useChatStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDirectChat = async (userId) => {
    try {
      const chat = await createChat(userId);
      setSelectedChat(chat);
      onClose();
    } catch (error) {
      // Toast already shown in store
    }
  };

  const handleToggleGroupUser = (userId) => {
    if (selectedGroupUsers.includes(userId)) {
      setSelectedGroupUsers(selectedGroupUsers.filter(id => id !== userId));
    } else {
      setSelectedGroupUsers([...selectedGroupUsers, userId]);
    }
  };

  const handleCreateGroupChat = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (selectedGroupUsers.length < 2) {
      toast.error('Please select at least 2 members for the group');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/chats/group', {
        chatName: groupName.trim(),
        users: selectedGroupUsers
      });

      if (data.success && data.data) {
        setChats([data.data, ...chats]);
        setSelectedChat(data.data);
        toast.success('Group created successfully!');
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in-up">
      <div className="w-full max-w-md bento-card p-6 border border-border-glass shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-glass">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg">chat_add_on</span>
            </div>
            <h2 className="font-display font-bold text-lg text-on-surface">New Conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 mb-4 p-1 bg-surface-container-lowest/80 rounded-xl border border-border-glass-light">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'direct'
                ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            <FiUser className="text-sm" />
            <span>Direct Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'group'
                ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            <FiUsers className="text-sm" />
            <span>Group Chat</span>
          </button>
        </div>

        {/* Tab 1: Direct Message */}
        {activeTab === 'direct' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface-container-lowest/90 border border-border-glass rounded-xl text-xs text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 max-h-72">
              {loading ? (
                <p className="text-text-muted text-xs text-center py-8">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-text-muted">No users found matching your search</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartDirectChat(u._id)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-border-glass hover:bg-surface-container-highest/60 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} name={u.username} className="w-10 h-10 border border-border-glass" />
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                          {u.username}
                        </h4>
                        <p className="text-[11px] text-text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary text-xl transition-colors">
                      chat
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Group Chat */}
        {activeTab === 'group' && (
          <form onSubmit={handleCreateGroupChat} className="flex flex-col flex-1 min-h-0">
            {/* Group Name Input */}
            <div className="mb-3">
              <label className="block text-[11px] font-label uppercase tracking-wider text-text-muted mb-1 font-semibold">
                Group Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering Squad, Weekend Trip"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-container-lowest/90 border border-border-glass rounded-xl text-xs text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all font-sans"
                required
              />
            </div>

            {/* Member Selection Label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-label uppercase tracking-wider text-text-muted font-semibold">
                Select Members ({selectedGroupUsers.length} selected)
              </span>
            </div>

            {/* Users List for Group */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1 max-h-56 mb-4">
              {filteredUsers.map((u) => {
                const isSelected = selectedGroupUsers.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => handleToggleGroupUser(u._id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/15 border-primary/40'
                        : 'border-transparent hover:border-border-glass hover:bg-surface-container-highest/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} name={u.username} className="w-9 h-9 border border-border-glass" />
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-xs text-on-surface truncate">
                          {u.username}
                        </h4>
                        <p className="text-[10px] text-text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-primary border-primary text-on-primary' : 'border-border-glass bg-surface-container-lowest'
                    }`}>
                      {isSelected && <FiCheck className="text-xs font-bold stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create Group Button */}
            <button
              type="submit"
              disabled={submitting || selectedGroupUsers.length < 2 || !groupName.trim()}
              className="primary-gradient-btn text-on-primary font-display font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Creating Group...' : 'Create Group Chat'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;
