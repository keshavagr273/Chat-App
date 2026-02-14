import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  onlineUsers: [],
  loading: false,
  typingUsers: {},

  setChats: (chats) => set({ chats }),

  setSelectedChat: (chat) => {
    const currentChat = get().selectedChat;
    // Only clear messages if switching to a different chat
    if (currentChat?._id !== chat?._id) {
      set({ selectedChat: chat, messages: [] });
    } else {
      // Same chat clicked - don't clear messages
      set({ selectedChat: chat });
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  updateMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      )
    }));
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, isDeleted: true, content: 'This message was deleted' }
          : msg
      )
    }));
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userId) => {
    set((state) => ({
      onlineUsers: [...new Set([...state.onlineUsers, userId])]
    }));
  },

  removeOnlineUser: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter(id => id !== userId)
    }));
  },

  setTyping: (chatId, userId, username) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: { userId, username }
      }
    }));
  },

  removeTyping: (chatId) => {
    set((state) => {
      const newTypingUsers = { ...state.typingUsers };
      delete newTypingUsers[chatId];
      return { typingUsers: newTypingUsers };
    });
  },

  fetchChats: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/chats');
      set({ chats: data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Fetch chats error:', error);
      toast.error('Failed to load chats');
    }
  },

  fetchMessages: async (chatId) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/messages/${chatId}`);
      set({ messages: data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Fetch messages error:', error);
      toast.error('Failed to load messages');
    }
  },

  createChat: async (userId) => {
    try {
      const { data } = await api.post('/chats', { userId });
      set((state) => {
        const chatExists = state.chats.find(c => c._id === data.data._id);
        return {
          chats: chatExists ? state.chats : [data.data, ...state.chats],
          selectedChat: data.data
        };
      });
      return data.data;
    } catch (error) {
      console.error('Create chat error:', error);
      toast.error('Failed to create chat');
      throw error;
    }
  },

  updateLatestMessage: (chatId, message) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === chatId
          ? { ...chat, latestMessage: message, updatedAt: new Date() }
          : chat
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    }));
  },

  clearMessages: async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}/messages`);
      set({ messages: [] });

      // Update chat to remove latest message
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId
            ? { ...chat, latestMessage: null }
            : chat
        )
      }));

      toast.success('All messages cleared');
    } catch (error) {
      console.error('Clear messages error:', error);
      toast.error('Failed to clear messages');
      throw error;
    }
  },

  deleteChat: async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);

      // Remove chat from list and clear selection if deleted
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== chatId),
        selectedChat: state.selectedChat?._id === chatId ? null : state.selectedChat,
        messages: state.selectedChat?._id === chatId ? [] : state.messages
      }));

      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Delete chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete chat');
      throw error;
    }
  },

  // Remove chat (for socket events)
  removeChat: (chatId) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat._id !== chatId),
      selectedChat: state.selectedChat?._id === chatId ? null : state.selectedChat,
      messages: state.selectedChat?._id === chatId ? [] : state.messages
    }));
  },

  // Clear chat messages (for socket events)
  clearChatMessages: (chatId) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, latestMessage: null } : chat
      );

      return {
        chats: updatedChats,
        messages: state.selectedChat?._id === chatId ? [] : state.messages
      };
    });
  }
}));